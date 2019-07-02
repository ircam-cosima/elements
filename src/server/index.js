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

if (process.env && process.env.PORT) {
  config.port = process.env.PORT;
}

// configure express environment ('production' enables cache systems)
process.env.NODE_ENV = config.env;


// application presets
const applicationName = process.env.APPLICATION || config.application || 'default';
let applicationMetas = null;
let clientPresets = null;
let projectPresets = null;

try {
  applicationMetas = require(path.join(process.cwd(), `applications/${applicationName}/metas.json`));
} catch(err) {
  console.info(`No "./applications/${applicationName}/metas.json" found`);
}

// get transpiled files in dist folder
try {
  clientPresets = require(`../applications/${applicationName}-client-presets.js`).default;
} catch(err) {
  console.error(`Invalid "${applicationName}" client presests, file "./applications/${applicationName}/client-presets.js" not found`);
  process.exit(1);
}

try {
  const presets = require(`../applications/${applicationName}-project-presets.js`).default;
  projectPresets = {};
  for (let id in presets) {
    projectPresets[id] = {};
    projectPresets[id].mappings = presets[id].mappings.map(m => m.id);
  }
} catch(err) {
  console.error(`Invalid "${applicationName}" project presets, file "./applications/${applicationName}/client-presets.js" not found`);
  process.exit(1);
}

appStore.init(applicationName, projectPresets)
  .then(() => {

    server.init(config);
    server.router.use(fileUpload());

    const appDirectory = path.join('applications', applicationName);
    const directoryWatcher = server.require('directory-watcher', {
      publicDirectory: appDirectory,
      watchedDirectory: 'audio',
    });

    const comm = new EventEmitter();

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
        .createProject(json.params.name, json.params.preset, json.params)
        .then(() => res.send('project restored'))
        .catch(err => res.status(500).send(err))
    });

    server.start().then(() => {
      const appDisplayName = (applicationMetas && applicationMetas.name) ? applicationMetas.name : config.appName;

      // init application audio files and watch for updates
      appStore.updateAudioFiles(directoryWatcher.getList())
        .catch(err => console.error(err.stack));
      // define the configuration object to be passed to the `.ejs` template
      // `directoryWatcher` is ready after server starts
      server.setClientConfigDefinition((clientType, config, httpRequest) => {
        return {
          clientType: clientType,
          env: config.env,
          applicationName: applicationName,
          appName: appDisplayName,
          websockets: config.websockets,
          version: config.version,
          defaultType: config.defaultClient,
          assetsDomain: config.assetsDomain,
          audioFiles: appStore.audioFiles,
        };
      });

      directoryWatcher.addListener('update', list => {
        appStore.updateAudioFiles(list)
          .catch(err => console.error(err.stack));
      });

      // bind osc controls
      const osc = server.require('osc');

      osc.receive('/project-list-request', () => {
        const projectList = JSON.stringify(appStore.projects.overview());
        osc.send('/project-list', projectList);
      });

      osc.receive('/player-list-request', () => {
        const playerList = JSON.stringify(appStore.players.overview());
        osc.send('/player-list', playerList);
      });

      osc.receive('/add-player-to-project', (playerUuid, projectUuid) => {
        const player = appStore.players.get(playerUuid);
        const project = appStore.projects.get(projectUuid);

        if (player && project) {
          appStore.removePlayerFromProject(player, project);
          appStore.addPlayerToProject(player, project);
        }
      });

      osc.receive('/update-player-param', (playerUuid, name, value) => {
        switch (name) {
          case 'audioRendering.mute':
            value = !!parseInt(value);
            break;
          case 'audioRendering.volume':
            value = parseInt(value);
            break;
        }

        const player = appStore.players.get(playerUuid);

        if (player) {
          appStore.updatePlayerParam(player, name, value);
        }
      });
      // now listen for appStore

      osc.receive('/move-all-players-to-project', (projectUuid) => {
        const project = appStore.projects.get(projectUuid);

        if (project) {
          appStore.moveAllPlayersToProject(project);
        }
      });

      osc.receive('/override-sensors-start', playerIndex => {
        const player = appStore.players.getByIndex(playerIndex);
        if (player) {
          player.overrideSensors = true;
        }
      });

      osc.receive('/override-sensors-stop', playerIndex => {
        const player = appStore.players.getByIndex(playerIndex);
        if (player) {
          player.overrideSensors = false;
        }
      });

      osc.receive('/override-sensors-data', (...data) => {
        const playerIndex = data[0];
        const player = appStore.players.getByIndex(playerIndex);

        if (player) {
          comm.emit('sensors', data);
        }
      });

      osc.receive('/decoding', (data) => {
        console.log(data);
        console.log(JSON.parse(data));
      });
    });
  })
  .catch(err => console.error(err.stack));
