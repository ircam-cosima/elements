import 'source-map-support/register'; // enable sourcemaps in node
import { EventEmitter } from 'events';
import path from 'path';
import fileUpload from 'express-fileupload';
import * as soundworks from 'soundworks/server';

import appStore from './shared/appStore';
import ControllerExperience from './ControllerExperience';
import PlayerExperience from './PlayerExperience';

import projectDbMapper from './shared/utils/projectDbMapper';
import clientPresets from '../shared/config/client-presets';

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

// configure express environment
// 'production' enables express cache for static files
process.env.NODE_ENV = config.env;

if (process.env.PORT)
  config.port = process.env.PORT;

appStore.init()
  .then(() => {
    server.init(config);

    server.router.use(fileUpload());
    // define the configuration object to be passed to the `.ejs` template
    server.setClientConfigDefinition((clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        preset: clientPresets[clientType],
        presets: clientPresets,
        env: config.env,
        appName: config.appName,
        websockets: config.websockets,
        version: config.version,
        defaultType: config.defaultClient,
        assetsDomain: config.assetsDomain,
      };
    });

    const comm = new EventEmitter();
    const clientTypes = Object.keys(clientPresets);

    const player = new PlayerExperience(clientTypes, config, clientPresets, comm);
    const controller = new ControllerExperience('controller', config, clientPresets, comm);

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

    server.start();
  })
  .catch(err => console.error(err.stack));
