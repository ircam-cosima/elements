import { Experience } from 'soundworks/server';
import fs from 'fs';

export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.osc = this.require('osc');
  }

  // if anything needs to append when the experience starts
  start() {}

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);

    const modelPath = './public/exports/models/';
    const models = {};
    fs.readdir(modelPath, (err, files) => {
    	files.forEach(file => {
    		if (file !== '.DS_Store' && file !== 'Thumbs.db') {
 		   		const modelName = file.split('Model.json')[0];
    			models[modelName] = JSON.parse(fs.readFileSync(modelPath + file));
    		}
    	});
    	this.send(client, 'models', models);
    });

    this.receive(client, 'sendosc', this._sendOsc(client));
  }

  exit(client) {
    super.exit(client);
  }

  _sendOsc(client) {
  	return (args) => {
  		this.osc.send(args.url, args.values);
  	}
  }
}