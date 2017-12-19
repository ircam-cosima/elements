import { client, audioContext } from 'soundworks/client';
import LoopSynth from '../../../audio/LoopSynth';
import GranularSynth from '../../../audio/GranularSynth';

class MovingAverage {
  constructor(order = 10) {
    this.order = order;
    this.buffer = new Float32Array(order);
    this.pointer = 0;
  }

  process(value) {
    this.buffer[this.pointer] = value;
    this.pointer = (this.pointer + 1) % this.order;

    let sum = 0;

    for (let i = 0; i < this.order; i++)
      sum += this.buffer[i];

    const avg = sum / this.order;

    return avg;
  }
}

/**
 * Mapping that use the `likeliest` recognized label to control a synth.
 * Apply energy to the cutoff of a low-pass filter.
 *
 * @todo - allow to choose between LoopSynth and GranularSynth from configuration
 */
class LikeliestMapping {
  constructor() {
    // this.synth = new LoopSynth();
    this.synth = new GranularSynth();

    this.currentLabel = null;
    this.output = null;
    this.labels = null;
    this.buffers = null;

    this.intensityFilter = new MovingAverage(20);
    this.minCutoffFreq = 50;
    this.maxCutoffFreq = 0.5 * audioContext.sampleRate;
    this.cutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const now = audioContext.currentTime;
    this.filter = audioContext.createBiquadFilter();
    this.filter.type = 'lowpass';
    // this.filter.Q.value = 0;
    this.filter.frequency.linearRampToValueAtTime(this.maxCutoffFreq, now + 0.005);
  }

  stop() {
    this.synth.stop(() => {
      this.synth.disconnect();
      this.output.disconnect();
    });
  }

  setLabels(labels) {
    this.labels = labels;
  }

  setBuffers(buffers) {
    this.buffers = buffers;
    this.synth.buffers = buffers;
  }

  setAudioDestination(destination) {
    this.filter.disconnect();
    this.filter.connect(destination);
    this.output = this.filter;

    this.synth.connect(this.output);
  }

  enablePreview(label) {
    const index = client.index % this.buffers[label].length;
    this.synth.trigger(label, index);

    this.currentLabel = null;
  }

  disablePreview() {
    this.synth.stop();
  }

  enableSensors() {
    const now = audioContext.currentTime;
    this.filter.frequency.linearRampToValueAtTime(this.minCutoffFreq, now + 0.01);
  }

  disableSensors() {
    const now = audioContext.currentTime;
    this.filter.frequency.linearRampToValueAtTime(this.maxCutoffFreq, now + 0.01);
  }

  processSensorsData(data) {
    const enhancedIntensity = data[1];
    let filteredIntensity = this.intensityFilter.process(enhancedIntensity);
    filteredIntensity = Math.sqrt(filteredIntensity);

    const now = audioContext.currentTime;
    const cutoffFrequency = this.minCutoffFreq * Math.exp(this.cutoffRatio * filteredIntensity);

    this.filter.frequency.linearRampToValueAtTime(cutoffFrequency, now + 0.01);
  }

  processDecoderOutput(data) {
    const { likeliest } = data;

    if (likeliest !== null && this.currentLabel !== likeliest) {
      this.currentLabel = likeliest;

      const index = client.index % this.buffers[likeliest].length;
      this.synth.trigger(likeliest, index);
    }
  }
}

export default LikeliestMapping;
