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
    // this.projectAdmin = this.require('project-admin');
    this.projectManager = this.require('project-manager');
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
      // const designer = appStore.getProjectDesigner(project);
      // if (designer === client)
      //   this.send(client, 'params:update', client.params);

      // might be tricky ...
      appStore.getProjectClients(project).forEach(client => {
        this.send(client, 'params:update', client.params);
      });
    });

    appStore.addListener('set-project-config', project => {
      // const designer = appStore.getProjectDesigner(project);
      // if (designer !== null)
      //   this.send(designer, 'config:update', project.config);

      appStore.getProjectClients(project).forEach(client => {
        this.send(client, 'config:update', project.config);
      });
    });

    appStore.addListener('set-project-training-config', (project, config) => {
      // const client = appStore.getProjectDesigner(project);
      // if (client != null)
      //   this.send(client, 'training-config:update', config);

      appStore.getProjectClients(project).forEach(client => {
        this.send(client, 'training-config:update', config);
      });
    });

    // xmm model
    appStore.addListener('set-project-model', (project, model) => {
      // const client = appStore.getProjectDesigner(project);
      // if (client !== null)
      //   this.send(client, 'model:update', model);

      appStore.getProjectClients(project).forEach(client => {
        this.send(client, 'model:update', model);
      });
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
    // const trainingData = appStore.getProjectTrainingData(project);

    // if (!this.xmms.has(project)) {
    //   this.xmms.set(project, new xmm());
    // }

    this.send(client, 'init');
    this.send(client, 'params:update', client.params);
    this.send(client, 'config:update', project.config);

    this.receive(client, 'model:update-request', this._onModelUpdateRequest(client));
    this.receive(client, 'project:fetch-all', this._onProjectFetchAllRequest(client));

    this.receive(client, 'param:update', this._onParamUpdate(client));
    this.receive(client, 'config:update', this._onConfigUpdate(client));
    this.receive(client, 'training-config:update', this._onTrainingConfigUpdate(client));

    this.receive(client, 'phrase', this._onPhraseOperation(client));

    this.receive(client, 'error:input-data', this._onBadInputData(client));

    this.rawSocket.receive(client, 'sensors', data => {
      this.comm.emit('sensors', data);
    });
  }

  exit(client) {
    super.exit(client);
  }

  _onModelUpdateRequest(client) {
    return () => {
      const model = appStore.getProjectModel(client.project);
      this.send(client, 'model:update', model);
    }
  }

  _onProjectFetchAllRequest(client) {
    return () => {
      const project = client.project;
      const model = appStore.getProjectModel(project);
      this.send(client, 'model:update', model);
      const trainingConfig = appStore.getProjectTrainingConfig(project);
      this.send(client, 'training-config:update', trainingConfig);
      const config = project.config;
      this.send(client, 'config:update', config);
    }
  }

  _onParamUpdate(client) {
    return (name, value) => {
      appStore.setClientParam(client, name, value);
    }
  }

  _onConfigUpdate(client) {
    return (name, value) => {
      const project = client.project;
      appStore.setProjectConfig(project, name, value);
      // appStore.trainProject(project); // useless since config params are not ml params here
    }
  }

  _onTrainingConfigUpdate(client) {
    return config => {
      const project = client.project;
      appStore.setProjectTrainingConfig(project, config);
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
    }
  }
}

export default DesignerExperience;
