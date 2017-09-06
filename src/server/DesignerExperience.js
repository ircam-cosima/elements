import { default as Xmm } from 'xmm-node';
import { Experience } from 'soundworks/server';
import SimpleLogin from './shared/services/SimpleLogin';
import xmmStore from './shared/xmmStore';
import designerStore from './shared/designerStore';

const cwd = process.cwd();

// server-side 'designer' experience.
class DesignerExperience extends Experience {
  constructor(clientType, comm) {
    super(clientType);

    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.login = this.require('simple-login');

    this.xmms = new Map(); // `set`, `get`, `delete`
  }

  start() {}

  enter(client) {
    super.enter(client);

    this._getModel(client);

    this.receive(client, 'training-data', this._onNewTrainingData(client));
    this.receive(client, 'persist-user', this._onPersistUser(client));
    this.receive(client, 'delete-user', this._onDeleteUser(client));
  }

  exit(client) {
    // @todo - define the expected behavior
    // const user = client.activities['service:login'].user;
    // designerStore.remove(user);
    // this.comm.emit('models-updated');

    this.xmms.delete(client);

    super.exit(client);
  }

  _getModel(client) {
    const user = client.activities['service:login'].user;
    const trainingSet = xmmStore.getTrainingSet(user);
    const config = xmmStore.getConfig(user);
    this.send(client, 'training-data', { config: config, trainingSet: trainingSet });
  }

  _onNewTrainingData(client) {
    return msg => {
      const user = client.activities['service:login'].user;
      xmmStore.persistConfig(user, msg.config);
      xmmStore.persistTrainingSet(user, msg.trainingSet);
      xmmStore.persistModel(user, msg.model);
    };
  }

  _onPersistUser(client) {
    return () => {
      const user = client.activities['service:login'].user;
      designerStore.persist(user);
    }
  }

  _onDeleteUser(client) {
    return () => {
      const user = client.activities['service:login'].user;
      console.log('delete');
      designerStore.delete(user);
      console.log('delete after');
    }
  }
}

export default DesignerExperience;
