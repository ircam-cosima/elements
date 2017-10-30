import { audioContext } from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';

function createWhiteNoiseBuffer(duration) {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const audioBuffer = audioContext.createBuffer(1, length, sampleRate);
  const buffer = audioBuffer.getChannelData(0);

  for (let i = 0; i < length; i++)
    buffer[i] = Math.random() * 2 - 1;

  return audioBuffer;
}

class WhiteNoiseSynth {
  constructor() {
    this.src = null;
    this.buffer = createWhiteNoiseBuffer(2);

    this.mute = audioContext.createGain();
    this.mute.gain.value = 1;

    const now = audioContext.currentTime;
    this.volume = audioContext.createGain();
    this.volume.connect(this.mute);
    this.volume.gain.value = 1;
    this.volume.gain.linearRampToValueAtTime(1, now);
  }

  connect(destination) {
    this.mute.connect(destination);
  }

  mute(value) {
    if (mute)
      this.mute.gain.value = 0;
    else
      this.mute.gain.value = 1;
  }

  /**
   * @param {Number} value - volume in dB
   */
  volume(value) {
    const lin = decibelToLinear(value);
    const now = audioContext.currentTime;

    this.volume.linearRampToValueAtTime(lin, now + 0.005);
  }

  start(offset = 0) {
    if (this.src)
      this.stop();

    const now = audioContext.currentTime;
    const src = audioContext.createBufferSource();
    src.connect(this.volume);
    src.buffer = this.buffer;
    src.loop = true;
    src.start(now + offset);

    this.src = src;
  }

  stop(offset = 0) {
    const now = audioContext.currentTime;
    this.src.stop(now + offset);

    this.src = null;
  }
}

export default WhiteNoiseSynth;
