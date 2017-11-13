import 'source-map-support/register'; // enable sourcemaps in node
import { EventEmitter } from 'events';
import path from 'path';
import * as soundworks from 'soundworks/server';

import appStore from './shared/appStore';
import ControllerExperience from './ControllerExperience';
import PlayerExperience from './PlayerExperience';

import presets from '../shared/presets';

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
    // define the configuration object to be passed to the `.ejs` template
    server.setClientConfigDefinition((clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        preset: presets[clientType],
        presets: presets,
        env: config.env,
        appName: config.appName,
        websockets: config.websockets,
        version: config.version,
        defaultType: config.defaultClient,
        assetsDomain: config.assetsDomain,
      };
    });

    const comm = new EventEmitter();

    const clientTypes = Object.keys(presets);
    const player = new PlayerExperience(clientTypes, config, presets, comm);

    const controller = new ControllerExperience('controller', config, presets, comm);

    server.start();
  })
  .catch(err => console.error(err.stack));
