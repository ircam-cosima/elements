import { audioContext } from 'soundworks/client';
import { setParam, rampParam } from './utils';
import Effect from './Effect';

const defaults = {
  gain: 1,
}

class Gain extends Effect {
  constructor(id, options) {
    super(id, defaults, options);

    this.node = audioContext.createGain();

    this.reset();
  }

  get input() {
    return this.node;
  }

  set gain(value) {
    rampParam(this.node.gain, value, 0.005);
  }

  reset() {
    setParam(this.node.gain, this.params.gain);
  }

  connect(output) {
    this.node.connect(output);
  }

  disconnect() {
    this.node.disconnect();
  }
}

export default Gain;
