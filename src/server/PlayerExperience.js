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

    appStore.addListener('set-client-param', (project, client) => {
      const players = appStore.getProjectPlayers(project);

      if (players.has(client))
        this.send(client, 'params:update', client.params);
    });

    appStore.addListener('set-project-model', (project) => {
      const clients = appStore.getProjectPlayers(project);
      const model = appStore.getProjectModel(project);

      clients.forEach(client => this.send(client, 'model:update', model));
    });
  }

  enter(client) {
    super.enter(client);

    const model = appStore.getProjectModel(client.project);

    this.send(client, 'model:update', model);
    this.send(client, 'params:update', client.params);

    this.receive(client, 'param:update', this._onParamUpdate(client))
    // this.receive(client, 'update-project', this._updateProject(client));
  }

  exit(client) {
    super.exit(client);
  }

  _onParamUpdate(client) {
    return (paramName, value) => {
      appStore.setClientParam(client, paramName, value);
    }
  }

  // this is broken...
  // _updateProject(client) {
  //   return uuid => {
  //     const project = appStore.getByUuid(uuid);
  //     // project manager
  //     projectManager.addPlayer(project, client);
  //   }
  // }
}

export default PlayerExperience;
