import { audioContext } from 'soundworks/client';
import { setParam, rampParam } from './utils';
import Effect from './Effect';

const defaults = {
  preGain: 0,
  feedback: 0,
  delay: 1,
};

class Delay extends Effect {
  constructor(id, options) {
    super(id, defaults, options);

    this.preGainNode = audioContext.createGain();
    this.delayNode = audioContext.createDelay();
    this.feedbackNode = audioContext.createGain();

    this.preGainNode.connect(this.delayNode);
    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);

    this.inputNode = audioContext.createGain();
    this.inputNode.connect(this.preGainNode);

    this.reset();
  }

  get input() {
    return this.inputNode;
  }

  set preGain(value) {
    rampParam(this.preGainNode.gain, value, 0.005);
  }

  set delay(value) {
    rampParam(this.delayNode.delayTime, value, 0.005);
  }

  set feedback(value) {
    rampParam(this.feedbackNode.gain, value, 0.005);
  }

  reset() {
    setParam(this.preGainNode.gain, this.params.preGain);
    setParam(this.delayNode.delayTime, this.params.delay);
    setParam(this.feedbackNode.gain, this.params.feedback);
  }

  connect(output) {
    this.inputNode.connect(output); // direct
    this.delayNode.connect(output);
  }

  disconnect() {
    this.inputNode.disconnect();
    this.delayNode.disconnect();
  }
}

export default Delay;
