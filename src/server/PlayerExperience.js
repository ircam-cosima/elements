import { Experience } from 'soundworks/server';
import xmmStore from './shared/xmmStore';
import designerStore from './shared/designerStore';

class PlayerExperience extends Experience {
  constructor(clientType, comm) {
    super(clientType);

    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.sharedParams = this.require('shared-params');

    this._onModelsUpdate = this._onModelsUpdate.bind(this);
    this._updateDesigner = this._updateDesigner.bind(this);
  }

  start() {
    this.comm.addListener('models-updated', this._onModelsUpdate);
  }

  enter(client) {
    super.enter(client);

    const designers = designerStore.getList();
    const models = xmmStore.getModelByUsers(designers);

    this.send(client, 'models', models);

    this.receive(client, 'update-designer', this._updateDesigner(client));
  }

  exit(client) {
    super.exit(client);
  }

  // should get the uuid of the updated designer
  _onModelsUpdate() {
    const designers = designerStore.getList();
    const models = xmmStore.getModelByUsers(designers);

    this.broadcast('player', null, 'models', models);
  }

  _updateDesigner(client) {
    return (uuid) => {
      client.activities[this.id].group = uuid;
    }
  }
}

export default PlayerExperience;
