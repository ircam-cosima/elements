import { audioContext } from 'soundworks/client';
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
    const now = audioContext.currentTime;
    this.node.gain.linearRampToValueAtTime(value, now + 0.005);
  }

  reset() {
    const now = audioContext.currentTime;
    this.node.gain.linearRampToValueAtTime(this.params.gain, now + 0.005);
  }

  connect(output) {
    this.node.connect(output);
  }

  disconnect() {
    this.node.disconnect();
  }
}

export default Gain;
