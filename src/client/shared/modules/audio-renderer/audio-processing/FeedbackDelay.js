import { audioContext } from 'soundworks/client';

class FeedbackDelay {
  constructor({
    delayTime = 0.05,

  } = {}) {

    this.delay = audioContext.createDelay();
    this.delay.delayTime.value = 0.1;

    this.feedback = audioContext.createGain();
    this.feedback.gain.value = 0.9;

    this.feedback.connect(this.delay);
    this.delay.connect(this.feedback);

    this.preGain = audioContext.createGain();
    this.preGain.connect(this.delay);

    this.input = audioContext.createGain();
    this.input.connect(this.preGain);
  }

  connect(output) {
    this.delay.connect(output);
    this.input.connect(output);
  }

  disconnect() {
    this.delay.disconnect();
  }

  enableSensors() {
    const now = audioContext.currentTime;
    this.input.gain.value = 1 / 4;
    this.preGain.gain.value = 0;
  }

  disableSensors() {
    const now = audioContext.currentTime;
    this.input.gain.value = 1;
    this.preGain.gain.value = 0;
  }

  processSensorsData(data) {
    const energy = Math.min(Math.pow(data[1], 1/4), 0.9);
    this.preGain.gain.value = energy * 4;
  }
}

export default FeedbackDelay;
