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

    designerStore.add(client.activities['service:login'].user);

    this._getModel(client);

    this.receive(client, 'configuration', this._onNewConfig(client));
    this.receive(client, 'phrase', this._onNewPhrase(client));
    this.receive(client, 'clear', this._onClearOperation(client));
  }

  exit(client) {
    // @todo - define the expected behavior
    // const user = client.activities['service:login'].user;
    // designerStore.delete(user);
    // this.comm.emit('models-updated');

    this.xmms.delete(client);

    super.exit(client);
  }

  _getModel(client) {
    const user = client.activities['service:login'].user;

    const trainingSet = xmmStore.getTrainingSet(user);
    const config = xmmStore.getConfig(user);

    const xmm = new Xmm(config.states ? 'hhmm' : 'gmm', config);
    xmm.setTrainingSet(trainingSet);

    this.xmms.set(client, xmm);
    this._updateModelAndSet(client, xmm);
  }

  _onNewPhrase(client) {
    return msg => {
      const xmm = this.xmms.get(client);
      const phrase = msg.data;

      xmm.addPhrase(phrase);
      this._updateModelAndSet(client, xmm);
    }
  }

  _onNewConfig(client) {
    return msg => {
      const type = msg.type;
      const config = msg.config;
      const oldXmm = this.xmms.get(client);
      const trainingSet = oldXmm.getTrainingSet();

      // as type may change we create a new xmm instance
      const newXmm = new Xmm(type, config);
      newXmm.setTraininSet(trainingSet);
      // replace old instance with new instance
      this.xmms.set(client, newXmm);

      this._updateModelAndSet(client, newXmm);
    };
  }

  _onClearOperation(client) {
    return msg => {
      const xmm = this.xmms.get(client);

      switch (msg.cmd) {
        case 'label':
          xmm.removePhrasesOfLabel(msg.data);
          break;
        case 'model':
          xmm.clearTrainingSet();
          break;
        default:
          break;
      }

      this._updateModelAndSet(client, xmm);
    };
  }

  _updateModelAndSet(client, xmm) {
    const user = client.activities['service:login'].user;

    xmm.train((err, trainedModel) => {
      if (err)
        console.error(err.stack);

      const trainingSet = xmm.getTrainingSet();
      const config = xmm.getConfig();
      const model = xmm.getModel();

      xmmStore.persistTrainingSet(user, trainingSet);
      xmmStore.persistConfig(user, config);
      xmmStore.persistModel(user, model);

      this.send(client, 'model', trainedModel);

      this.comm.emit('models-updated');
    });
  }
}

export default DesignerExperience;
