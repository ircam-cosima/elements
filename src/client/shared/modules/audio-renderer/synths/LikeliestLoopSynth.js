import { audioContext, client } from 'soundworks/client';

class LoopSynth {
  constructor(config) {
    const defaults = {
      fadeDuration: 1,
    };

    this.params = Object.assign({}, defaults, config);
    this.buffers = null;

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
    env.gain.linearRampToValueAtTime(1, now + this.params.fadeDuration);

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
      const endTime = now + this.params.fadeDuration;

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

class LikeliestLoopSynth {
  constructor(config) {
    this.synth = new LoopSynth(config);

    this.currentLabel = null;
    this.labels = null;
    this.buffers = null;
  }

  connect(destination) {
    this.synth.connect(destination);
  }

  stop() {
    this.synth.disconnect();
  }

  setLabels(labels) {
    this.labels = labels;
  }

  setBuffers(buffers) {
    this.buffers = buffers;
    this.synth.buffers = buffers;
  }

  enablePreview(label) {
    const index = client.index % this.buffers[label].length;
    this.synth.trigger(label, index);

    this.currentLabel = null;
  }

  disablePreview() {
    this.synth.stop();
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

export default LikeliestLoopSynth;


