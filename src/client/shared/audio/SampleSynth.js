import { audioContext } from 'soundworks/client';

class SampleSynth {
  constructor(buffers) {
    this.buffers = buffers;
  }

  trigger(label) {
    const buffer = this.buffers[label];

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer;

    src.start(0);
  }
}

export default SampleSynth;
