import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

class PlayerExperience extends Experience {
  constructor(clientType, config, comm) {
    super(clientType);

    this.config = config;
    this.comm = comm;

    // this.rawSocket = this.require('raw-socket', {
    //   protocol: { channel: 'sensors', type: 'Float32' },
    // });
  }

  start() {

  }

  enter(client) {
    super.enter(client);


  }

  exit(client) {
    super.exit(client);


  }
}

export default ControllerExperience;
