import { Experience } from 'soundworks/server';
import fs from 'fs';

export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.audioBufferManager = this.require('audio-buffer-manager');
  }

  start() {}

  enter(client) {
    super.enter(client);
    // send a 'hello' message to all the other clients of the same type
    this.broadcast(client.type, client, 'hello');

    const modelPath = './public/exports/models/';
    const models = {};
    fs.readdir(modelPath, (err, files) => {
      if (!files) {
        this.send(client, 'models', null);
        return;
      }
      
      files.forEach(file => {
        if (file !== '.DS_Store' && file !== 'Thumbs.db') {
          const modelName = file.split('Model.json')[0];
          models[modelName] = JSON.parse(fs.readFileSync(modelPath + file));
        }
      });
      this.send(client, 'models', models);
    });
  }

  exit(client) {
    super.exit(client);
    // send a 'goodbye' message to all the other clients of the same type
    this.broadcast(client.type, client, 'goodbye');
  }
}
