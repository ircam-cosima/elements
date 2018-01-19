import * as audio from 'waves-audio';

const audioContext = audio.audioContext;
const scheduler = audio.getScheduler();

class ProbabilisticGranularSynth {
  constructor() {
    this.buffers = null;

    this.output = audioContext.createGain();
    this.output.gain.value = 1;
    this.output.gain.setValueAtTime(1, audioContext.currentTime);

    this.engine = new audio.GranularEngine();
    this.engine.connect(this.output);
  }

  set gain(value) {
    const now = audioContext.currentTime;
    this.output.gain.setValueAtTime(value, now + 0.005);
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    if (this.engine.master)
      scheduler.remove(this.engine);

    this.output.disconnect();
  }

  trigger(label, bufferIndex) {
    const buffer = this.buffers[label][bufferIndex];
    const duration = buffer.duration;

    // play grain randomly between 1/4 and 3/4 of the buffer
    this.engine.buffer = buffer;
    this.engine.position = duration / 2;
    this.engine.positionVar = duration / 4;

    if (!this.engine.master)
      scheduler.add(this.engine);
  }

  stop(callback = null) {
    if (this.engine.master)
      scheduler.remove(this.engine);
    if (callback)
      callback();
  }

}

export default ProbabilisticGranularSynth;


