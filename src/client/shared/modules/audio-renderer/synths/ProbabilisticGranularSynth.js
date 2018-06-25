import { audio, audioContext } from 'soundworks/client';

const scheduler = audio.getScheduler();
scheduler.period = 0.04;
scheduler.lookahead = 0.1;

class ProbabilisticGranularEngine extends audio.GranularEngine {
  constructor(...args) {
    super(...args);

    this.periodAbs = 0.04;
    this.durationRel = 4;
    this.centered = true;

    this.buffers = null;
    this.labels = null;
    this.likelihoods = null;
    this.currentLabel = null;
  }

  advanceTime(time) {
    const rand = Math.random();
    let sum = 0;
    let targetIndex = null;

    for (let i = 0; i < this.likelihoods.length; i++) {
      sum += this.likelihoods[i];

      if (rand <= sum) {
        targetIndex = i;
        break;
      }
    }

    let label = this.labels[targetIndex];

    if (label === -1) {
      if (!this.currentLabel)
        return null; // just wait for next update to be readded to the scheduler
      else
        label = this.currentLabel;
    }

    this.currentLabel = label;

    // sometime this is undefined for an undefined reason
    if (!this.buffers[this.currentLabel])
      return null;

    const buffer = this.buffers[this.currentLabel][0];
    const duration = buffer.duration;

    this.buffer = buffer;
    this.position = duration / 2;
    this.positionVar = duration / 4;

    const nextTime = super.advanceTime(time);
    return nextTime;
  }
}

class ProbabilisticGranularSynth {
  constructor(config) {
    this.labels = null;
    this.buffers = null;
    this.destination = null;

    this.engine = new ProbabilisticGranularEngine();
  }

  connect(destination) {
    this.engine.connect(destination);
  }

  stop() {
    if (this.engine.master)
      scheduler.remove(this.engine);

    this.engine.disconnect();
  }

  setLabels(labels) {
    if (labels.length === 0 && this.engine.master)
      scheduler.remove(this.engine);

    this.labels = labels;
    this.engine.labels = labels;
  }

  setBuffers(buffers) {
    this.buffers = buffers;
    this.engine.buffers = buffers;
  }

  enablePreview(label) {
    if (this.engine.master)
      scheduler.remove(this.engine);

    this.engine.labels = [label];
    this.engine.likelihoods = [1];
  }

  disablePreview() {
    if (this.engine.master)
      scheduler.remove(this.engine);

    this.engine.labels = this.labels;
  }

  processDecoderOutput(data) {
    const { likelihoods } = data;

    if (likelihoods.length) {
      this.engine.likelihoods = likelihoods;

      if (!this.engine.master)
        scheduler.add(this.engine);
    } else {
      if (this.engine.master)
        scheduler.remove(this.engine);
    }
  }
}

export default ProbabilisticGranularSynth;

