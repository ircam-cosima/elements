import { audioContext } from 'soundworks/client';

class LoopSynth {
  constructor() {
    this.buffers = null;
    this.fadeDuration = 0.1;

    this._current = {};

    this.output = audioContext.createGain();
    this.output.gain.value = 1;
    this.output.gain.setValueAtTime(1, audioContext.currentTime);

    this.disconnect = this.disconnect.bind(this);
  }

  set gain(value) {
    const now = audioContext.currentTime;
    this.output.gain.setValueAtTime(value, now + 0.005);
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  trigger(label, bufferIndex) {
    this.stop();

    const now = audioContext.currentTime;
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

  stop(callback = null) {
    if (this._current.src) {
      const { src, env } = this._current;
      const now = audioContext.currentTime;
      const endTime = now + this.fadeDuration;

      env.gain.cancelScheduledValues(now);
      env.gain.setValueAtTime(env.gain.value, now);
      env.gain.linearRampToValueAtTime(0, endTime);
      src.stop(endTime);

      this._current.src = null;
      this._current.env = null;

      if (callback)
        src.onend = callback;
    } else if (callback !== null) {
        callback();
    }
  }
}

export default LoopSynth;
