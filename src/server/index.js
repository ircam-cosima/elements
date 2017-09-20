import 'source-map-support/register'; // enable sourcemaps in node
import { EventEmitter } from 'events';
import path from 'path';
import * as soundworks from 'soundworks/server';
import { rapidMixToXmmTrainingSet, xmmToRapidMixModel } from 'iml-motion/common';
import xmm from 'xmm-node';
import bodyParser from 'body-parser';
import ControllerExperience from './ControllerExperience';
import DesignerExperience from './DesignerExperience';
import PlayerExperience from './PlayerExperience';
import VisualizerExperience from './VisualizerExperience';
// services
import ProjectAdmin from './shared/services/ProjectAdmin';
import ProjectChooser from './shared/services/ProjectChooser';
import ClientRegister from './shared/services/ClientRegister';
import appStore from './shared/appStore';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
const server = soundworks.server;
let config = null;

// rely on node `require` for synchronicity
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

// configure express environment ('production' enables cache systems)
process.env.NODE_ENV = config.env;
// initialize application with configuration options
server.init(config);

// define the configuration object to be passed to the `.ejs` template
server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    trainUrl: config.trainUrl,
    appName: config.appName,
    websockets: config.websockets,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

// const comm = new EventEmitter();

// @todo - move to master (controller)
const sharedParams = soundworks.server.require('shared-params');
sharedParams.addNumber('sensitivity', 'Sensitivity', 0, 2, 0.01, 1);
sharedParams.addNumber('intensityFeedback', 'Intensity feedback', 0, 0.99, 0.01, 0.8);
sharedParams.addNumber('intensityGain', 'Intensity gain', 0, 1, 0.01, 0.1);
sharedParams.addNumber('intensityPower', 'Intensity power', 0, 1, 0.01, 0.25);
sharedParams.addNumber('intensityLowClip', 'Intensity low clip', 0, 0.99, 0.01, 0.15);
sharedParams.addNumber('bandpassGain', 'Bandpass gain', 0, 2, 0.01, 1);

appStore.init();

// create the common server experience for both the soloists and the players
const designer = new DesignerExperience('designer', config);
const player = new PlayerExperience('player');
const controller = new ControllerExperience('controller');

// if (config.env !== 'production') {
//   const visualizer = new VisualizerExperience('visualizer', config.osc);
// }

server.start();

/* * * * * * * * * * * * * REST API SIMULATION * * * * * * * * * * * * * * * */

server.router.use(bodyParser.json({ limit: '50mb' }));
server.router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const gx = new xmm('gmm');
const hx = new xmm('hhmm');

server.router.post('/train', (req, res, next) => {
  const body = req.body;
  const config = body.configuration;
  const algo = config.target.name.split(':')[1];
  const trainingSet = rapidMixToXmmTrainingSet(body.trainingSet);
  let x = (algo === 'hhmm') ? hx : gx;

  x.setConfig(config.payload);
  x.setTrainingSet(trainingSet);
  x.train((err, model) => {
    if (err)
      console.error(err.stack);

    const rapidModel = xmmToRapidMixModel(model);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ model: rapidModel }));
  });
});
