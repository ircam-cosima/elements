import * as audio from 'waves-audio';
import BaseMapping from './BaseMapping';

const audioContext = audio.audioContext;
const scheduler = audio.getScheduler();

scheduler.period = 0.04;
scheduler.lookahead = 0.1;

class ProbabilisticEngine extends audio.GranularEngine {
  constructor(...args) {
    super(...args);


    this.periodAbs = 0.04;
    this.durationRel = 4;
    this.centered = true;

    this.buffers = null;
    this.labels = null;
    this.likelihoods = null;
    this.currentLabel = null;

    /**
     * Define how many entries among probabilities are taken in account
     * to define the played buffer
     */
    // this.maxSearchSpace = 2;
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
  constructor() {
    this.output = audioContext.createGain();
    this.output.gain.value = 1;
    this.output.gain.setValueAtTime(1, audioContext.currentTime);

    this.engine = new ProbabilisticEngine();
    this.engine.connect(this.output);
  }

  set buffers(buffers) {
    this.engine.buffers = buffers;
  }

  set labels(labels) {
    this.engine.labels = labels;
  }

  set gain(value) {
    this.engine.gain = value;
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    if (this.engine.master)
      scheduler.remove(this.engine);

    this.output.disconnect();
  }

  update(likelihoods) {
    if (likelihoods.length) {
      this.engine.likelihoods = likelihoods;

      if (!this.engine.master)
        scheduler.add(this.engine);
    } else {
      if (this.engine.master)
        scheduler.remove(this.engine);
    }
  }

  stop(callback = null) {
    if (this.engine.master)
      scheduler.remove(this.engine);

    if (callback)
      callback();
  }

}

const audioProcesses = [
  // {
  //   type: 'energy-filter',
  //   options: {},
  // },
  {
    type: 'feedback-delay'
  }
];

class ProbabilisticMapping extends BaseMapping {
  constructor() {
    super(audioProcesses);

    this.labels = null;
    this.buffers = null;
    this.destination = null;

    this.synth = new ProbabilisticGranularSynth();
  }

  stop() {
    this.synth.stop(() => {
      this.synth.disconnect();
      this.stopProcesses();
    });
  }

  setLabels(labels) {
    this.labels = labels;
    this.synth.labels = labels;
  }

  setBuffers(buffers) {
    this.buffers = buffers;
    this.synth.buffers = buffers;
  }

  setAudioDestination(destination) {
    this.createAudioChain(this.synth, destination);
  }

  enablePreview(label) {
    this.synth.stop();
    this.synth.labels = [label]; // force dummy label
    this.synth.update([1]);
  }

  disablePreview() {
    this.synth.labels = this.labels; // re-apply current labels
    this.synth.stop();
  }

  enableSensors() {
    // this.synth.gain = 0;
    super.enableSensors();
  }

  disableSensors() {
    // this.synth.gain = 1;
    super.disableSensors();
  }

  processSensorsData(data) {
    // const gain = Math.sqrt(data[1]);
    // this.synth.gain = gain;

    super.processSensorsData(data);
  }

  processDecoderOutput(data) {
    const { likelihoods } = data;
    this.synth.update(likelihoods);

    super.processDecoderOutput(data);
  }
}

export default ProbabilisticMapping;






























