import * as soundworks from 'soundworks/server';
import chalk from 'chalk';


class VisualizerExperience extends soundworks.Experience {
  constructor(clientType, comm, oscConfig) {
    super(clientType);

    this.oscConfig = oscConfig;

    this.rawSocket = this.require('raw-socket', {
      protocol: [
        { channel: 'designer-sensors', type: 'Float32' },
        { channel: 'riot', type: 'Float32' },
      ],
    });

    this.osc = this.require('osc');
  }

  start() {
    // pipe designer sensors to visualizer and max
    // (TODO replace with the event emitter in appStore) :

    this.comm.addListener('designer-sensors', data => {
      this.rawSocket.broadcast('visualizer', null, 'designer-sensors', data);
      this.osc.send('/phone', Array.from(data));
    });

    // receive R-ioT from max
    this.osc.receive('/riot', (...args) => {
      const length = args.length;
      const buffer = new Float32Array(length);

      for (let i = 0; i < length; i++)
        buffer[i] = args[i];

      this.rawSocket.broadcast('visualizer', null, 'riot', buffer);
    });

    console.log(chalk.grey(`[OSC] Phone sent on port      ${this.oscConfig.sendPort}`));
    console.log(chalk.grey(`[OSC] R-ioT received on port  ${this.oscConfig.receivePort}`));
  }

  enter(client) {}
  exit(client) {}
}

export default VisualizerExperience;
