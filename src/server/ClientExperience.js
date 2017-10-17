import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';
import logger from './shared/errorLogger';
import * as mano from 'mano-js/common';

const cwd = process.cwd();

// server-side 'designer' experience.
class ClientExperience extends Experience {
  constructor(clientType, config, comm) {
    super(clientType);

    this.config = config;
    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.checkin = this.require('checkin');
    this.projectManager = this.require('project-manager');
    this.sharedParams = this.require('shared-params');

    this.rawSocket = this.require('raw-socket', {
      protocol: { channel: 'sensors', type: 'Float32' },
    });
  }

  start() {
    this.projectManager.setChooseProjectCallback(client => {
      this.send(client, 'init');
    });
    // appStore.addListener('add-client-to-project', (project, client) => {
    //   this.send(client, 'init');
    // });

    appStore.addListener('set-client-param', (project, client) => {
      this.send(client, 'params:update', client.params);
    });

    appStore.addListener('set-project-config', project => {
      const clients = appStore.getProjectClients(project);
      clients.forEach(client => this.send(client, 'config:update', project.config));
    });

    appStore.addListener('set-project-training-config', (project, config) => {
      const clients = appStore.getProjectClients(project);
      clients.forEach(client => this.send(client, 'training-config:update', config));
    });

    // xmm model
    appStore.addListener('set-project-model', (project, model) => {
      const clients = appStore.getProjectClients(project);
      clients.forEach(client => this.send(client, 'model:update', model));
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

    this.send(client, 'params:update', client.params);
    this.send(client, 'config:update', project.config);

    this.receive(client, 'updateProjectConfigRequest', this._updateProjectConfigRequest(client));
    this.receive(client, 'project:fetch-all-request', this._onProjectFetchAllRequest(client));

    this.receive(client, 'param:update', this._onParamUpdate(client));
    this.receive(client, 'training-config:update', this._onTrainingConfigUpdate(client));

    this.receive(client, 'example', this._onExampleOperation(client));

    this.receive(client, 'logFaultySensorData', this._logFaultySensorData(client));

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
      console.log(name, value);
      appStore.setClientParam(client, name, value);
    }
  }

  _updateProjectConfigRequest(client) {
    return (name, value) => {
      const project = client.project;
      appStore.setProjectConfig(project, name, value);
    }
  }

  _onTrainingConfigUpdate(client) {
    return config => {
      const project = client.project;
      appStore.setProjectTrainingConfig(project, config);
    }
  }

  _onExampleOperation(client) {
    return args => {
      const project = client.project;

      switch (args.cmd) {
        case 'add':
          const rapidMixExample = args.data;
          appStore.addExampleToProject(project, rapidMixExample);
          break;
        case 'clear':
          const label = args.data;
          appStore.removeExamplesFromProject(project, label);
          break;
        case 'clearall':
          appStore.removeAllExamplesFromProject(project);
          break;
      }
    }
  }

  _logFaultySensorData(client) {
    return data => logger.append('[Faulty sensor data]', data, client);
  }
}

export default ClientExperience;
