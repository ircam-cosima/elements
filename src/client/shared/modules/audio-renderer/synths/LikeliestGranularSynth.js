import { audioContext, audio, client } from 'soundworks/client';

const scheduler = audio.getScheduler();

class GranularSynth {
  constructor(config) {
    const defaults = {
      fadeDuration: 1,
    };

    this.params = Object.assign({}, defaults, config);
    this.buffers = null;

    this.output = audioContext.createGain();
    this.output.gain.value = 1;
    this.output.gain.setValueAtTime(1, audioContext.currentTime);

    this.engines = [];

    const now = audioContext.currentTime;
    // we need to swap between 2 granular engine to create the cross fade
    for (let i = 0; i < 2; i++) {
      const env = audioContext.createGain();
      env.connect(this.output);
      env.gain.value = 0;
      env.gain.setValueAtTime(0, now);

      const granular = new audio.GranularEngine();
      granular.connect(env);

      this.engines[i] = { granular, env };
    }

    this.currentEngineIndex = 0;
  }

  set gain(value) {
    const now = audioContext.currentTime;
    this.output.gain.setValueAtTime(value, now + 0.005);
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.engines.forEach(engine => {
      if (engine.master)
        scheduler.remove(engine);
    });

    this.output.disconnect();
  }

  trigger(label, bufferIndex) {
    const now = audioContext.currentTime;
    // fade out current engine
    const currentEngineIndex = this.currentEngineIndex;
    const currentEngine = this.engines[currentEngineIndex];

    if (currentEngine.granular.master) {
      currentEngine.env.gain.cancelScheduledValues(now);
      currentEngine.env.gain.setValueAtTime(currentEngine.env.gain.value, now);
      currentEngine.env.gain.linearRampToValueAtTime(0, now + this.params.fadeDuration);

      setTimeout(() => {
        // if engine has not been readded since last stop, remove from scheduler
        if (this.currentEngineIndex !== currentEngineIndex && currentEngine.granular.master)
          scheduler.remove(currentEngine.granular);
      }, this.params.fadeDuration * 1000);
    }

    // fade in new engine
    this.currentEngineIndex = (this.currentEngineIndex + 1) % 2;

    const buffer = this.buffers[label][bufferIndex];
    const duration = buffer.duration;
    const newEngine = this.engines[this.currentEngineIndex];

    newEngine.env.gain.cancelScheduledValues(now);
    newEngine.env.gain.setValueAtTime(newEngine.env.gain.value, now);
    newEngine.env.gain.linearRampToValueAtTime(1, now + this.params.fadeDuration);
    newEngine.granular.buffer = buffer;

    // play grain randomly between 1/4 and 3/4 of the buffer
    // newEngine.granular.position = duration / 2; //
    // newEngine.granular.positionVar = duration / 4;

    // freeze (relative to start)
    newEngine.granular.position = now % (duration - 0.05);
    newEngine.granular.positionVar = 0.02;

    // freeze
    // newEngine.granular.position = duration / 2;
    // newEngine.granular.positionVar = 0.02;

    if (!newEngine.granular.master)
      scheduler.add(newEngine.granular);
  }

  updatePosition() {
    try {
      const currentEngineIndex = this.currentEngineIndex;
      const currentEngine = this.engines[currentEngineIndex];

      if (currentEngine.granular.master) {
        const now = audioContext.currentTime;
        const duration = currentEngine.granular.buffer.duration;
        const position = now % (duration - 0.05);
        currentEngine.granular.position = position;
      }
    } catch(err) {
      alert('error: ' + err.message);
    }
  }

  stop(callback = null) {
    const currentEngineIndex = this.currentEngineIndex;
    const currentEngine = this.engines[currentEngineIndex];
    // engine in scheduler
    if (currentEngine.granular.master) {
      const { granular, env } = currentEngine;
      const now = audioContext.currentTime;
      env.gain.cancelScheduledValues(now);
      env.gain.setValueAtTime(env.gain.value, now);
      env.gain.linearRampToValueAtTime(0, now + this.params.fadeDuration);

      setTimeout(() => {
        if (granular.master)
          scheduler.remove(granular);

        if (callback)
          callback();
      }, this.params.fadeDuration * 1000);
    } else if (callback !== null) {
      callback();
    }
  }
}

class LikeliestGranularSynth {
  constructor(config) {
    this.synth = new GranularSynth(config);

    this.currentLabel = null;
    this.labels = null;
    this.buffers = null;
  }

  connect(destination) {
    this.synth.connect(destination);
  }

  disconnect() {
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

    this.synth.updatePosition();
  }
}

export default LikeliestGranularSynth;


