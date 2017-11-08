import { audioContext } from 'soundworks/client';


class LoopSynth {
  constructor() {
    this.buffers = null;
    this.fadeDuration = 0.1;

    this._current = {};

    this.output = audioContext.createGain();
    this.output.gain.value = 0;
    this.output.gain.setValueAtTime(0, audioContext.currentTime);
  }

  set gain(value) {
    this.output.gain.setValueAtTime(value, audioContext.currentTime + 0.005);
  }

  connect(destination) {
    this.output.connect(destination);
  }

  trigger(label, bufferIndex) {
    const now = audioContext.currentTime;

    if (this._current.src) {
      const { src, env } = this._current;

      env.gain.linearRampToValueAtTime(0, now + this.fadeDuration);
      src.stop(now + this.fadeDuration);
    }

    const buffer = this.buffers[label][bufferIndex];

    const env = audioContext.createGain();
    env.connect(this.output);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + this.fadeDuration);

    const src = audioContext.createBufferSource();
    src.connect(env);
    src.buffer = buffer;
    src.loop = true;
    src.start(now);

    this._current.src = src;
    this._current.env = env;
    this._current.label = label;
  }
}

export default LoopSynth;
