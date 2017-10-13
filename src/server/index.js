import 'source-map-support/register'; // enable sourcemaps in node
import { EventEmitter } from 'events';
import path from 'path';
import * as soundworks from 'soundworks/server';

import { rapidMixToXmmTrainingSet, xmmToRapidMixModel } from 'iml-motion/common';
import xmm from 'xmm-node';
import bodyParser from 'body-parser';

import ControllerExperience from './ControllerExperience';
import ClientExperience from './ClientExperience';
// services
import ProjectManager from './shared/services/ProjectManager';
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
appStore.init();

// define the configuration object to be passed to the `.ejs` template
server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    port: config.port,
    trainUrl: config.trainUrl,
    defaultProjectConfig: config.defaultProjectConfig,
    appName: config.appName,
    websockets: config.websockets,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

const sharedParams = soundworks.server.require('shared-params');
sharedParams.addNumber('sensitivity', 'Sensitivity', 0, 2, 0.01, 1);
sharedParams.addNumber('intensityFeedback', 'Intensity feedback', 0, 0.99, 0.01, 0.8);
sharedParams.addNumber('intensityGain', 'Intensity gain', 0, 1, 0.01, 0.1);
sharedParams.addNumber('intensityPower', 'Intensity power', 0.01, 1, 0.01, 0.25);
sharedParams.addNumber('intensityLowClip', 'Intensity low clip', 0, 0.99, 0.01, 0.15);
sharedParams.addNumber('bandpassGain', 'Bandpass gain', 0, 2, 0.01, 1);

const comm = new EventEmitter();

const controller = new ControllerExperience('controller', comm, config.osc);
const client = new ClientExperience(['player', 'designer'], config, comm);

const parameters = new soundworks.ControllerExperience('parameters', { auth: true });

server.start();

// -------------------------------------------------------
// REST API SIMULATION
// -------------------------------------------------------

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
    // simulate RapidMix API JSON format
    res.end(JSON.stringify({ model: rapidModel }));
  });
});
