import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

import ProjectChooserModule from './shared/modules/project-chooser/ProjectChooserModule';

class PlayerExperience extends Experience {
  constructor(clientType, config, comm) {
    super(clientType);

    this.config = config;
    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
    this.playerRegister = this.require('player-register');

    // this.rawSocket = this.require('raw-socket', {
    //   protocol: { channel: 'sensors', type: 'Float32' },
    // });

    this.modules = [
      new ProjectChooserModule(this),
    ];
  }

  start() {
    super.start();
  }

  enter(client) {
    super.enter(client);

    this.modules.forEach(module => module.enter(client));
  }

  exit(client) {
    super.exit(client);

    this.modules.forEach(module => module.exit(client));
  }
}

export default PlayerExperience;
