import * as audio from 'waves-audio';

const audioContext = audio.audioContext;
const scheduler = audio.getScheduler();


class GranularSynth {
  constructor() {
    this.buffers = null;
    this.fadeDuration = 1;

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
      currentEngine.env.gain.linearRampToValueAtTime(0, now + this.fadeDuration);

      setTimeout(() => {
        // if engine has not been readded since last stop, remove from scheduler
        if (this.currentEngineIndex !== currentEngineIndex && currentEngine.granular.master)
          scheduler.remove(currentEngine.granular);
      }, this.fadeDuration * 1000);
    }

    // fade in new engine
    this.currentEngineIndex = (this.currentEngineIndex + 1) % 2;

    const buffer = this.buffers[label][bufferIndex];
    const duration = buffer.duration;
    const newEngine = this.engines[this.currentEngineIndex];

    newEngine.env.gain.cancelScheduledValues(now);
    newEngine.env.gain.setValueAtTime(newEngine.env.gain.value, now);
    newEngine.env.gain.linearRampToValueAtTime(1, now + this.fadeDuration);
    newEngine.granular.buffer = buffer;
    // play grain randomly between 1/4 and 3/4 of the buffer
    newEngine.granular.position = duration / 2;
    newEngine.granular.positionVar = duration / 4;

    if (!newEngine.granular.master)
      scheduler.add(newEngine.granular);
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
      env.gain.linearRampToValueAtTime(0, now + this.fadeDuration);

      setTimeout(() => {
        if (granular.master)
          scheduler.remove(granular);

        if (callback)
          callback();
      }, this.fadeDuration * 1000);
    } else if (callback !== null) {
      callback();
    }
  }
}

export default GranularSynth;


