import { Experience } from 'soundworks/server';

class AmbienceExperience extends Experience {
  constructor(clientType, comm) {
    super(clientType);
    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }

}

export default AmbienceExperience;
