import 'source-map-support/register'; // enable sourcemaps in node
import * as soundworks from 'soundworks/server';
import appStore from './shared/appStore';
import path from 'path';
import PlayerExperience from './PlayerExperience';
import PlayerRegister from './shared/services/PlayerRegister';
import { EventEmitter } from 'events';

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

// configure express environment ('production' enables express cache for static files)
process.env.NODE_ENV = config.env;

if (process.env.PORT)
  config.port = process.env.PORT;

const server = soundworks.server;
// initialize application with configuration options
appStore.init()
  .then(() => {
    server.init(config);

    // define the configuration object to be passed to the `.ejs` template
    server.setClientConfigDefinition((clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        env: config.env,
        appName: config.appName,
        websockets: config.websockets,
        version: config.version,
        defaultType: config.defaultClient,
        assetsDomain: config.assetsDomain,
      };
    });

    const comm = new EventEmitter();

    const player = new PlayerExperience('player', config, comm);

    // start application
    server.start();
  })
  .catch(err => console.error(err.stack));


// import projectDbMapper from './shared/utils/projectDbMapper';
// import Project from './shared/entities/Project';

// const project = Project.create('testProject');

// project.setParam('clientDefaults.audio.intensity', true);

// const data = Project.toData(project);
// projectDbMapper.persist(data);

// const project = {
//   uuid: 'test-1',
//   name: 'test-1',
// };

// // projectDbMapper
// //   .getList()
// //   .then(res => {
// //     console.log('------------------------------');
// //     console.log(res);
// //   })
// //   .catch(err => console.error(err.stack));

// projectDbMapper
//   .delete(project)
//   .then(res => {
//     console.log('------------------------------');
//     console.log(res);
//   })
//   .catch(err => console.error(err.stack));
