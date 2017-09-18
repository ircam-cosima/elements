import { Experience } from 'soundworks/server';
import xmmStore from './shared/xmmStore';
import projectStore from './shared/projectStore';

class PlayerExperience extends Experience {
  constructor(clientType, comm) {
    super(clientType);

    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.sharedParams = this.require('shared-params');

    this._onModelsUpdate = this._onModelsUpdate.bind(this);
    this._updateProject = this._updateProject.bind(this);
  }

  start() {
    this.comm.addListener('models-updated', this._onModelsUpdate);
  }

  enter(client) {
    super.enter(client);

    const designers = projectStore.getList();
    const models = xmmStore.getModelByUsers(designers);

    this.send(client, 'models', models);
    this.receive(client, 'update-project', this._updateProject(client));
  }

  exit(client) {
    super.exit(client);
  }

  // should get the uuid of the updated designer
  _onModelsUpdate() {
    const designers = projectStore.getList();
    const models = xmmStore.getModelByUsers(designers);

    this.broadcast('player', null, 'models', models);
  }

  _updateProject(client) {
    return (uuid) => {
      const project = projectStore.getByUuid(uuid);
      // project manager
      projectManager.addPlayer(project, client);
    }
  }
}

export default PlayerExperience;
