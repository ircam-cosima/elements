import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.projectChooser = this.require('project-chooser');
    this.sharedParams = this.require('shared-params');

    // this._onModelsUpdate = this._onModelsUpdate.bind(this);
    this._updateProject = this._updateProject.bind(this);
  }

  start() {
    super.start();

    appStore.addListener('set-project-model', (project) => {
      const clients = appStore.getProjectPlayers(project);
      const model = appStore.getProjectModel(project);
      clients.forEach(client => this.send(client, 'model:update', model));
    });

  }

  enter(client) {
    super.enter(client);

    this.send(client, 'model', appStore.getProjectModel(client.project));
    // this.receive(client, 'update-project', this._updateProject(client));
  }

  exit(client) {
    super.exit(client);
  }

  // // should get the uuid of the updated designer
  // _onModelsUpdate() {
  //   const projects = appStore.getList();


  //   // this.broadcast('player', null, 'models', models);
  // }

  _updateProject(client) {
    return (uuid) => {
      const project = appStore.getByUuid(uuid);
      // project manager
      projectManager.addPlayer(project, client);
    }
  }
}

export default PlayerExperience;


// ProjectChooser ->
// connect -> envoie la liste des projects
