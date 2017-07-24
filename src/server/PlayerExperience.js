import { Experience } from 'soundworks/server';
import xmmStore from './shared/xmmStore';
import designerStore from './shared/designerStore';

class PlayerExperience extends Experience {
  constructor(clientType, comm) {
    super(clientType);

    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');

    this._onModelsUpdate = this._onModelsUpdate.bind(this);
  }

  start() {
    this.comm.addListener('models-updated', this._onModelsUpdate);
  }

  enter(client) {
    super.enter(client);

    const designers = designerStore.getList();
    const models = xmmStore.getModelByUsers(designers);

    this.send(client, 'models', models);
  }

  exit(client) {
    super.exit(client);
  }

  _onModelsUpdate(designers) {
    const designers = designerStore.getList();
    const models = xmmStore.getModelByUsers(designers);

    this.broadcast('player', null, 'models', models);
  }
}

export default PlayerExperience;
