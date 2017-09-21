import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';
import logger from './shared/errorLogger';

const cwd = process.cwd();

// server-side 'designer' experience.
class DesignerExperience extends Experience {
  constructor(clientType, config, comm) {
    super(clientType);

    this.config = config;
    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.projectAdmin = this.require('project-admin');
    this.sharedParams = this.require('shared-params');

    this.rawSocket = this.require('raw-socket', {
      protocol: { channel: 'sensors', type: 'Float32' },
    });
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

      if (client.type === 'designer')
        this.send(client, 'command:trigger', cmd, ...args);
    });
  }

  enter(client) {
    super.enter(client);

    const project = client.project;
    const trainingData = appStore.getProjectTrainingData(project);

    this.send(client, 'init', trainingData);
    this.send(client, 'params:update', client.params);
    this.send(client, 'config:update', project.config);

    this.receive(client, 'param:update', this._onParamUpdate(client));
    this.receive(client, 'config:update', this._onConfigUpdate(client));
    this.receive(client, 'model:update', this._onModelUpdate(client));
    this.receive(client, 'error:input-data', this._onBadInputData(client));

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
    return (name, value) => {
      const project = client.project;
      appStore.setProjectConfig(project, name, value);
    }
  }

  _onBadInputData(client) {
    return data => {
      logger.append('Input data bad format', data, client);
    }
  }
}

export default DesignerExperience;
