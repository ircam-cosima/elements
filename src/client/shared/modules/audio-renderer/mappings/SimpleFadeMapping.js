import { client } from 'soundworks/client';
import LoopSynth from '../../../audio/LoopSynth';

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

class SimpleFadeMapping {
  constructor() {
    this.synth = new LoopSynth();

    this.intensityFilter = new MovingAverage(10);
    this.currentLabel = null;
  }

  setLabels(labels) {
    this.labels = labels;
  }

  setBuffers(buffers) {
    this.buffers = buffers;
    this.synth.buffers = buffers;
  }

  setAudioDestination(destination) {
    this.synth.connect(destination);
  }

  enablePreview(label) {
    const index = client.index % this.buffers[label].length;
    this.synth.trigger(label, index);
  }

  disablePreview() {}

  enableSensors() {
    this.synth.gain = 0;
  }

  disableSensors() {
    this.synth.gain = 1;
  }

  processSensorsData(data) {
    const enhancedIntensity = data[1];
    const gain = this.intensityFilter.process(enhancedIntensity);

    this.synth.gain = gain;
  }

  processDecoderOutput(data) {
    const { likeliest } = data;

    if (likeliest !== null && this.currentLabel !== likeliest) {
      const index = client.index % this.buffers[likeliest].length;
      this.synth.trigger(likeliest, index);
      this.currentLabel = likeliest;
    }
  }
}

export default SimpleFadeMapping;
