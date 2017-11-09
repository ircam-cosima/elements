import { audioContext } from 'soundworks/client';

class SampleSynth {
  constructor(buffers) {
    this.buffers = buffers;

    this.output = audioContext.createGain();
    this.output.gain.value = 1;
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  trigger(label) {
    const buffer = this.buffers[label];

    const src = audioContext.createBufferSource();
    src.connect(this.output);
    src.buffer = buffer;

    src.start(audioContext.currentTime);
  }
}

export default SampleSynth;
