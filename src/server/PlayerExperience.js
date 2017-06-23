import { Experience } from 'soundworks/server';
import ModelsRetriever from './shared/ModelsRetriever';
// import fs from 'fs';

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

    ModelsRetriever.getModels((err, models) => {
      this.send(client, 'models', models);
    });
  }

  exit(client) {
    super.exit(client);
    // send a 'goodbye' message to all the other clients of the same type
    this.broadcast(client.type, client, 'goodbye');
  }
}
