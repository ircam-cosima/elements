import { audioContext } from 'soundworks/client';
import Effect from './Effect';

// cf. https://www.w3.org/TR/2018/WD-webaudio-20180619/#BiquadFilterNode-attributes
const defaults = {
  type: 'lowpass',
  frequency: 350,
  Q: 1,
};

class Filter extends Effect {
  constructor(id, options) {
    super(id, defaults, options);

    this.node = audioContext.createBiquadFilter();
    this.node.type = this.params.type;

    this.reset();
  }

  get input() {
    return this.node;
  }

  set frequency(value) {
    const now = audioContext.currentTime;
    this.node.frequency.linearRampToValueAtTime(value, now + 0.005);
  }

  set Q(value) {
    const now = audioContext.currentTime;
    this.node.Q.linearRampToValueAtTime(value, now + 0.005);
  }

  reset() {
    const now = audioContext.currentTime;
    this.node.frequency.linearRampToValueAtTime(this.params.frequency, now + 0.005);
    this.node.Q.linearRampToValueAtTime(this.params.Q, now + 0.005);
  }

  connect(output) {
    this.node.connect(output);
  }

  disconnect() {
    this.node.disconnect();
  }
}

export default Filter;
