import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';
import logger from './shared/errorLogger';

class PlayerExperience extends Experience {
  constructor(clientType, socketPipe) {
    super(clientType);

    this.socketPipe = socketPipe;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.projectChooser = this.require('project-chooser');
    this.sharedParams = this.require('shared-params');

    this.rawSocket = this.require('raw-socket', {
      protocol: { channel: 'sensors', type: 'Float32' },
    });
  }

  start() {
    super.start();

    this._updateProject = this._updateProject.bind(this);
    this.projectChooser.setChooseProjectCallback(this._updateProject);

    appStore.addListener('set-client-param', (project, client) => {
      const players = appStore.getProjectPlayers(project);

      if (players.has(client))
        this.send(client, 'params:update', client.params);
    });

    appStore.addListener('set-project-model', (project) => {
      const clients = appStore.getProjectPlayers(project);
      const { config } = appStore.getProjectTrainingData(project);
      const model = appStore.getProjectModel(project);

      clients.forEach(client => this.send(client, 'model:update', {
        projectName: project.name,
        model: model,
        config: config,
        notification: true,
      }));
    });
  }

  enter(client) {
    super.enter(client);

    this._updateProject(client);

    this.receive(client, 'param:update', this._onParamUpdate(client));
    this.receive(client, 'error:input-data', this._onBadInputData(client));

    this.rawSocket.receive(client, 'sensors', data => {
      this.socketPipe.emit('sensors', data);
    });
  }

  exit(client) {
    super.exit(client);
  }

  _onParamUpdate(client) {
    return (paramName, value) => {
      appStore.setClientParam(client, paramName, value);
    }
  }

  _updateProject(client) {
    const project = client.project;
    const model = appStore.getProjectModel(project);
    const { config } = appStore.getProjectTrainingData(project);

    this.send(client, 'model:update', {
      projectName: project.name,
      model: model,
      config: config,
      notification: false,
    });

    this.send(client, 'params:update', client.params);
  }

  _onBadInputData(client) {
    return data => {
      logger.append('Input data bad format', data, client);
    }
  }
}

export default PlayerExperience;
