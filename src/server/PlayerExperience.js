import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.projectChooser = this.require('project-chooser');
    this.sharedParams = this.require('shared-params');
  }

  start() {
    super.start();

    this._updateProject = this._updateProject.bind(this);
    this.projectChooser.setChooseProjectCallback(this._updateProject);

    appStore.addListener('set-client-param', (project, client) => {
      this.send(client, 'params:update', client.params);
    });

    appStore.addListener('set-project-model', (project) => {
      const clients = appStore.getProjectPlayers(project);
      const model = appStore.getProjectModel(project);

      clients.forEach(client => this.send(client, 'model:update', {
        projectName: client.project.name,
        model: model,
        notification: true,
      }));
    });
  }

  enter(client) {
    super.enter(client);

    this._updateProject(client);

    this.receive(client, 'param:update', this._onParamUpdate(client))
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
    const model = appStore.getProjectModel(client.project);

    this.send(client, 'model:update', {
      projectName: client.project.name,
      model: model,
      notification: false,
    });

    this.send(client, 'params:update', client.params);
  }
}

export default PlayerExperience;
