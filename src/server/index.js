import 'source-map-support/register'; // enable sourcemaps in node
import { EventEmitter } from 'events';
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import DesignerExperience from './DesignerExperience';
<<<<<<< HEAD
import { rapidMixToXmmTrainingSet, xmmToRapidMixModel } from 'iml-motion/common';
import xmm from 'xmm-node';
import bodyParser from 'body-parser';
=======
import VisualizerExperience from './VisualizerExperience';
>>>>>>> added visualizer, designer stream to visualizer, riot input

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
    appName: config.appName,
    websockets: config.websockets,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

const comm = new EventEmitter();

const designer = new DesignerExperience('designer', comm, config);
const player = new PlayerExperience('player', comm);

if (config.env !== 'production')
  const visualizer = new VisualizerExperience('visualizer', comm, config.osc);

server.start();

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
