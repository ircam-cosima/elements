import 'source-map-support/register'; // enable sourcemaps in node
import { EventEmitter } from 'events';
import path from 'path';
import fileUpload from 'express-fileupload';
import serveStatic from 'serve-static';
import * as soundworks from 'soundworks/server';

import appStore from './shared/appStore';
import ControllerExperience from './ControllerExperience';
import PlayerExperience from './PlayerExperience';

import DirectoryWatcher from './shared/services/DirectoryWatcher';
import projectDbMapper from './shared/utils/projectDbMapper';

const server = soundworks.server;
// process config file
const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node `require` for synchronicity
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

// retrive client presets
const presetsName = process.env.PRESETS || config.presets || 'default';
let clientPresets = null;

try {
  clientPresets = require(`../applications/${presetsName}.js`).default;
} catch(err) {
  console.error(`Invalid presest "${presetsName}", file "./applications/${presetsName}/presets.js" not found`);
  process.exit(1);
}

if (process.env && process.env.PORT) {
  config.port = process.env.PORT;
}
// configure express environment ('production' enables cache systems)
process.env.NODE_ENV = config.env;

if (process.env.PORT)
  config.port = process.env.PORT;

appStore.init(presetsName)
  .then(() => {
    server.init(config);

    server.router.use(fileUpload());
    // define the configuration object to be passed to the `.ejs` template
    server.setClientConfigDefinition((clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        env: config.env,
        presetsName: presetsName,
        appName: config.appName,
        websockets: config.websockets,
        version: config.version,
        defaultType: config.defaultClient,
        assetsDomain: config.assetsDomain,
      };
    });

    const comm = new EventEmitter();

    const appDirectory = path.join('applications', presetsName);
    const directoryWatcher = server.require('directory-watcher', {
      publicDirectory: appDirectory,
      watchedDirectory: 'audio',
    });

    server.router.use('/audio', serveStatic(path.join(appDirectory, 'audio')));

    // remove functions (mapping) that are client-side oriented (need audioContext)
    const presets = JSON.parse(JSON.stringify(clientPresets));
    const clientTypes = Object.keys(presets);

    const player = new PlayerExperience(clientTypes, config, presets, comm);
    const controller = new ControllerExperience('controller', config, presets, comm);

    // updload and download files
    server.router.get('/download', (req, res) => {
      const uuid = req.query.uuid;
      const filename = projectDbMapper.getFilename(uuid);
      res.download(filename);
    });

    server.router.post('/upload', (req, res) => {
      if (!req.files)
        return res.status(400).send('No files were uploaded.');

      const file = req.files.project;
      let json = null;

      try {
        json = JSON.parse(file.data.toString());
      } catch(err) {
        return res.status(500).send(err);
      }

      appStore
        .createProject(json.params.name, json.params)
        .then(() => res.send('project restored'))
        .catch(err => res.status(500).send(err))
    });

    server.start().then(() => {
      // init
      appStore.updateAudioFiles(directoryWatcher.getList());
      // watch for updates
      directoryWatcher.addListener('update', list => appStore.updateAudioFiles(list));

    });
  })
  .catch(err => console.error(err.stack));
