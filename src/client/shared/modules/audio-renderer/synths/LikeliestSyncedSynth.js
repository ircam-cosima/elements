import { audio, client } from 'soundworks/client';

const { TimeEngine, audioContext } = audio;

class SyncSynth extends TimeEngine {
  constructor(syncScheduler, buffer, config) {
    super();

    this.syncScheduler = syncScheduler;
    this.buffer = buffer;

    // @todo - if Infinity, never repeat the file
    if (config.period <= 0 || Math.abs(config.period) === Infinity) {
      this.period = this.buffer.duration;
    } else {
      this.period = config.period;
    }

    this.fadeDuration = config.fadeDuration;

    this.env = audioContext.createGain();
    this.sources = new Set();
  }

  connect(destination) {
    this.env.connect(destination);
  }

  start(origin) {
    this.origin = origin;

    const now = audioContext.currentTime;
    this.env.gain.setValueAtTime(0, now);
    this.env.gain.linearRampToValueAtTime(1, now + this.fadeDuration);

    this.syncScheduler.add(this);
  }

  stop() {
    const now = audioContext.currentTime;
    this.env.gain.setValueAtTime(1, now);
    this.env.gain.linearRampToValueAtTime(0, now + this.fadeDuration);

    this.syncScheduler.remove(this);
  }

  advanceTime(syncTime) {
    const relSyncTime = syncTime - this.origin;
    const audioTime = this.syncScheduler.audioTime;
    const offset = relSyncTime % this.period;
    const src = audioContext.createBufferSource();

    console.log(syncTime, offset);

    src.buffer = this.buffer;
    src.connect(this.env);
    src.start(audioTime, offset);

    return (Math.floor(relSyncTime / this.period) + 1) * this.period;
  }
}


class LikeliestSyncedSynth {
  constructor(config, syncScheduler) {
    this.config = config;
    this.syncScheduler = syncScheduler;

    this.labels = null;
    this.buffers = null;

    this.bus = audioContext.createGain();
  }

  connect(destination) {
    this.bus.connect(destination);
  }

  disconnect(destination) {
    this.bus.disconnect();
  }

  setLabels(labels) {
    this.labels = labels;
  }

  setBuffers(buffers) {
    this.buffers = buffers;
  }

  enablePreview(label) {
    this.processDecoderOutput({ likeliest: label });
  }

  disablePreview() {
    this.synth.stop();
  }

  processDecoderOutput(data) {
    const { likeliest } = data;

    if (this.currentLabel !== likeliest) {
      this.currentLabel = likeliest;

      if (this.synth) {
        this.synth.stop();
      }

      if (this.config.origin === 'absolute') {
        console.log(this.buffers);
        const index = client.index % this.buffers[likeliest].length;
        const buffer = this.buffers[likeliest][index];
        const origin = 0;

        this.synth = new SyncSynth(this.syncScheduler, buffer, this.config);
        this.synth.connect(this.bus);
        this.synth.start(origin);
      }
    }
  }
}

export default LikeliestSyncedSynth;
