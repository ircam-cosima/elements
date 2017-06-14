import { Experience } from 'soundworks/server';
import { Login } from './services/Login';
import ModelsRetriever from './shared/ModelsRetriever';
import xmm from 'xmm-node';
import fs from 'fs';

// server-side 'designer' experience.
export default class DesignerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.login = this.require('login');

    this.xmms = new Map();
  }

  start() {}

  enter(client) {
    super.enter(client);

    this._getModel(client);

    this.receive(client, 'configuration', this._onNewConfig(client));
    this.receive(client, 'phrase', this._onNewPhrase(client));
    this.receive(client, 'clear', this._onClearOperation(client));
  }

  exit(client) {
    super.exit(client);
  }

  _getModel(client) {
    const username = client.activities['service:login'].username;

    let set = {};
    try {
      set = JSON.parse(fs.readFileSync(
        `./public/exports/sets/${username}TrainingSet.json`,
        'utf-8'
      ));
    } catch (e) {
      if (e.code === 'ENOENT') {
        // no file found, do nothing (let _updateModelAndSet do its job)
      } else throw e;
    }

    let config = {};
    try {
      config = JSON.parse(fs.readFileSync(
        `./public/exports/configs/${username}ModelConfig.json`,
        'utf-8'
      ));
    } catch (e) {
      if (e.code === 'ENOENT') {
        // do nothing
      } else throw e;
    }

    this.xmms[client] = new xmm(config.states ? 'hhmm' : 'gmm', config)
    this.xmms[client].setTrainingSet(set);
    this._updateModelAndSet(client);
  }

  _onNewPhrase(client) {
    return (args) => {
      const phrase = args.data;
      this.xmms[client].addPhrase(phrase);
      this._updateModelAndSet(client);
    }
  }

  _onNewConfig(client) {
    return (args) => {
      const type = args.type;
      const config = args.config;
      const trainingSet = this.xmms[client].getTrainingSet();

      this.xmms[client] = new xmm(type, config);
      this.xmms[client].setTrainingSet(trainingSet);
      this._updateModelAndSet(client);
    };
  }

  _onClearOperation(client) {
    return (args) => {
      const cmd = args.cmd;

      switch (cmd) {
        case 'label': {
          this.xmms[client].removePhrasesOfLabel(args.data);
        }
        break;

        case 'model': {
          this.xmms[client].clearTrainingSet();
        }
        break;

        default:
        break;
      }

      this._updateModelAndSet(client);
    };
  }

  _updateModelAndSet(client) {
    const username = client.activities['service:login'].username;

    this.xmms[client].train((err, model) => {
      fs.writeFileSync(
       `./public/exports/sets/${username}TrainingSet.json`,
       JSON.stringify(this.xmms[client].getTrainingSet(), null, 2),
       'utf-8'
      );

      fs.writeFileSync(
       `./public/exports/configs/${username}ModelConfig.json`,
       JSON.stringify(this.xmms[client].getConfig(), null, 2),
       'utf-8'
      );

      fs.writeFileSync(
       `./public/exports/models/${username}Model.json`,
       JSON.stringify(this.xmms[client].getModel(), null, 2),
       'utf-8'
      );

      this.send(client, 'model', model);

      ModelsRetriever.getModels((err, models) => {
        this.broadcast('player', null, 'models', models);
      });
    });    
  }
}
