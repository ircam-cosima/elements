import { audioContext } from 'soundworks/client';
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
    const now = audioContext.currentTime;
    this.preGainNode.gain.linearRampToValueAtTime(value, now + 0.005);
  }

  set delay(value) {
    const now = audioContext.currentTime;
    this.delayNode.delayTime.linearRampToValueAtTime(value, now + 0.005);
  }

  set feedback(value) {
    const now = audioContext.currentTime;
    this.feedbackNode.gain.linearRampToValueAtTime(value, now + 0.005);
  }

  reset() {
    const now = audioContext.currentTime;
    this.preGainNode.gain.linearRampToValueAtTime(this.params.preGain, now + 0.005);
    this.delayNode.delayTime.linearRampToValueAtTime(this.params.delay, now + 0.005);
    this.feedbackNode.gain.linearRampToValueAtTime(this.params.feedback, now + 0.005);
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
