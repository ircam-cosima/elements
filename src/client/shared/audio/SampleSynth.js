import { audioContext } from 'soundworks/client';

class SampleSynth {
  constructor() {
    this.output = audioContext.createGain();
    this.output.gain.value = 1;
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  trigger(buffer) {
    const src = audioContext.createBufferSource();
    src.connect(this.output);
    src.buffer = buffer;

    src.start(audioContext.currentTime);
  }
}

export default SampleSynth;
