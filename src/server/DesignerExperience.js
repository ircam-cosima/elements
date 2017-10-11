import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';
import logger from './shared/errorLogger';
import * as imlMotion from 'iml-motion/common';
// import xmm from 'xmm-node';

const cwd = process.cwd();

// server-side 'designer' experience.
class DesignerExperience extends Experience {
  constructor(clientType, config, comm) {
    super(clientType);

    // this.trainingData = new Map();
    // this.machineLearning = new Map();

    this.config = config;
    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.projectAdmin = this.require('project-admin');
    this.sharedParams = this.require('shared-params');

    this.rawSocket = this.require('raw-socket', {
      protocol: { channel: 'sensors', type: 'Float32' },
    });

    // we assume the api simulation will run on the localhost (see server/index.js)
    // this.trainer = new imlMotion.XmmProcessor({
    //   url: `http://localhost:${this.config.port}${this.config.trainUrl}`
    // })
  }

  start() {
    appStore.addListener('set-client-param', (project, client) => {
      const designer = appStore.getProjectDesigner(project);

      if (designer === client)
        this.send(client, 'params:update', client.params);
    });

    appStore.addListener('set-project-config', project => {
      const designer = appStore.getProjectDesigner(project);

      if (designer !== null)
        this.send(designer, 'config:update', project.config);
    });

    // xmm model
    appStore.addListener('set-project-model', (project, model) => {
      const client = appStore.getProjectDesigner(project);
      const { config } = appStore.getProjectTrainingData(project);

      if (client !== null)
        this.send(client, 'model:update', model, config);
    });

    this.comm.addListener('command:trigger', (uuid, cmd, ...args) => {
      const client = appStore.getClientByUuid(uuid);
      console.log(uuid + ' ' + client.type);

      if (client.type === 'designer')
        this.send(client, 'command:trigger', cmd, ...args);
    });
  }

  enter(client) {
    super.enter(client);

    const project = client.project;
    const trainingData = appStore.getProjectTrainingData(project);

    // if (!this.xmms.has(project)) {
    //   this.xmms.set(project, new xmm());
    // }

    this.send(client, 'init', trainingData);
    this.send(client, 'params:update', client.params);
    this.send(client, 'config:update', project.config);

    this.receive(client, 'param:update', this._onParamUpdate(client));
    this.receive(client, 'config:update', this._onConfigUpdate(client));
    this.receive(client, 'model:update', this._onModelUpdate(client));
    this.receive(client, 'error:input-data', this._onBadInputData(client));

    this.receive(client, 'phrase', this._onPhraseOperation(client));

    this.rawSocket.receive(client, 'sensors', data => {
      this.comm.emit('sensors', data);
    });
  }

  exit(client) {
    super.exit(client);
  }

  _onModelUpdate(client) {
    return data => {
      const project = client.project;

      appStore.setProjectTrainingData(project, {
        config: data.config,
        trainingSet: data.trainingSet,
      });

      appStore.setProjectModel(project, data.model);
    }
  }

  _onParamUpdate(client) {
    return (name, value) => {
      appStore.setClientParam(client, name, value);
    }
  }

  _onConfigUpdate(client) {
    // return (name, value) => {
    //   const project = client.project;
    //   appStore.setProjectConfig(project, name, value);

    //   this._trainProjectModel(project);
    // }
    return config => {
      const project = client.project;
      appStore.setProjectConfig(project, config);
    }
  }

  _onBadInputData(client) {
    return data => {
      logger.append('Input data bad format', data, client);
    }
  }

  _onPhraseOperation(client) {
    return args => {
      const project = client.project;
      // const trainingData = new imlMotion.TrainingData();
      // const data = appStore.getProjectTrainingData(project);
      // trainingData.setTrainingSet(data.trainingSet);

      switch (args.cmd) {
        case 'add':
          appStore.addPhraseToProject(project, args.data);
          // trainingData.addPhrase(args.data); // rapidmix phrase object
          break;
        case 'clear':
          appStore.removePhrasesFromProject(project, args.data);
          // trainingData.removeElementsByLabel(args.data); // label string
          break;
        case 'clearall':
          appStore.removeAllPhrasesFromProject(project);
          // trainingData.clear(); // no 2nd arg
          break;
        default: // never happens
          break;
      }

      // data.trainingSet = trainingData.getTrainingSet();
      // appStore.setProjectTrainingData(project, trainingData);

      // this._trainProjectModel(project);
    }
  }

  /*
  _trainProjectModel(project) {
    // const trainer = new imlMotion.XmmProcessor({ url: 'http://localhost:8000/train' });
    const data = appStore.getProjectTrainingData(project);
    console.log(data);
    this.trainer.setConfig(data.config)
    this.trainer.train(data.trainingSet)
      .then(response => {
        console.log('server side training');
        console.log(response);
        appStore.setProjectModel(project, response.model);
      })
      .catch(err => console.error(err.stack));
  }
  */
}

export default DesignerExperience;
