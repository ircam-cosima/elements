import { Experience } from 'soundworks/server';
import { Login } from './services/Login';
import xmm from 'xmm-node';
import fs from 'fs';

// server-side 'designer' experience.
export default class DesignerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.login = this.require('login');
    this.osc = this.require('osc');
    this.xmms = new Map();
  }

  // if anything needs to append when the experience starts
  start() {}

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);

    this._sendClientsList();

    //this.xmms[client] = new xmm('hhmm');//'hhmm', {
    //   states: 3,
    //   relativeRegularization: 0.01,
    //   transitionMode: 'leftright'
    // });
    this._getModel(client);

    this.receive(client, 'configuration', this._onNewConfig(client));
    this.receive(client, 'phrase', this._onNewPhrase(client));
    this.receive(client, 'clear', this._onClearOperation(client));
  }

  exit(client) {
    super.exit(client);
    this._sendClientsList();
  }

  _getModel(client) {
    let set;
    try {
      set = JSON.parse(fs.readFileSync(
        `./public/exports/sets/${client.activities['service:login'].userName}TrainingSet.json`,
        'utf-8'
      ));
    } catch (e) {
      if (e.code === 'ENOENT') {
        set = fs.writeFileSync(
          `./public/exports/sets/${client.activities['service:login'].userName}TrainingSet.json`,
          JSON.stringify({}),
          'utf-8'
        );
      } else throw e;
    }

    let config;
    try {
      config = JSON.parse(fs.readFileSync(
        `./public/exports/configs/${client.activities['service:login'].userName}ModelConfig.json`,
        'utf-8'
      ));
    } catch (e) {
      if (e.code === 'ENOENT') {
        config = fs.writeFileSync(
          `./public/exports/configs/${client.activities['service:login'].userName}ModelConfig.json`,
          JSON.stringify({}),
          'utf-8'          
        );
      } else throw e;
    }

    if (!config) config = {};
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
      // console.log(args);
      const type = args.type;
      const config = args.config;
      const trainingSet = this.xmms[client].getTrainingSet();
      //console.log(config);
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

        default:
        break;
      }
      this._updateModelAndSet(client);
    };
  }

  _updateModelAndSet(client) {
    this.xmms[client].train((err, model) => {
      fs.writeFileSync(
       `./public/exports/sets/${client.activities['service:login'].userName}TrainingSet.json`,
       JSON.stringify(this.xmms[client].getTrainingSet(), null, 2),
       'utf-8'
      );

      fs.writeFileSync(
       `./public/exports/configs/${client.activities['service:login'].userName}ModelConfig.json`,
       JSON.stringify(this.xmms[client].getConfig(), null, 2),
       'utf-8'
      );

      fs.writeFileSync(
       `./public/exports/models/${client.activities['service:login'].userName}Model.json`,
       JSON.stringify(this.xmms[client].getModel(), null, 2),
       'utf-8'
      );

      this.send(client, 'model', model);
    });    
  }

  _sendClientsList() {
    const clientsList = [];
    for (let i = 0; i < this.clients.length; i++) {
      let c = this.clients[i];

      if (c.type === 'designer') {
        let c2 = {};
        for (let prop in c) {
          if (prop !== 'socket') {
            c2[prop] = c[prop];
          }
        }
        clientsList.push(c2);
      }
    }
    // console.log(clientsList);
    this.broadcast('hub', null, 'clients', clientsList);
  }
}
