import { audioContext } from 'soundworks/client';
import { setParam, rampParam } from './utils';
import Effect from './Effect';

// cf. https://www.w3.org/TR/2018/WD-webaudio-20180619/#BiquadFilterNode-attributes
const defaults = {
  type: 'lowpass',
  frequency: 350,
  Q: 1,
  gain: 0,
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
    rampParam(this.node.frequency, value, 0.005);
  }

  set Q(value) {
    rampParam(this.node.Q, value, 0.005);
  }

  set gain(value) {
    rampParam(this.node.gain, value, 0.005);
  }

  reset() {
    setParam(this.node.frequency, this.params.frequency);
    setParam(this.node.Q, this.params.Q);
    setParam(this.node.gain, this.params.gain);
  }

  connect(output) {
    this.node.connect(output);
  }

  disconnect() {
    this.node.disconnect();
  }
}

export default Filter;
