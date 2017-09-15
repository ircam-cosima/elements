import { default as Xmm } from 'xmm-node';
import { Experience } from 'soundworks/server';
import SimpleLogin from './shared/services/SimpleLogin';
import xmmStore from './shared/xmmStore';
import designerStore from './shared/designerStore';

const cwd = process.cwd();

// server-side 'designer' experience.
class DesignerExperience extends Experience {
  constructor(clientType, comm, config) {
    super(clientType);

    this.comm = comm;
    this.config = config;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.login = this.require('simple-login');
    this.sharedParams = this.require('shared-params');

    if (config.env !== 'production') {
      this.rawSocket = this.require('raw-socket', {
        protocol: { channel: 'sensors', type: 'Float32' },
      });
    }

    this.xmms = new Map(); // `set`, `get`, `delete`
  }

  start() {}

  enter(client) {
    super.enter(client);

    this._getModel(client.user);

    this.receive(client, 'training-data', this._onNewTrainingData(client));

    // make the world know (master) about this new designer

    // listen for client sensor streaming, the client is using `#stream`
    // if (this.config.env !== 'production') {
    //   this.rawSocket.receive(client, 'sensors', data => {
    //     // send to visualizer experience
    //     this.comm.emit('designer-sensors', data);
    //   });
    // }
  }

  exit(client) {
    this.xmms.delete(client);

    super.exit(client);
  }

  _getModel(user) {
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
}

export default DesignerExperience;
