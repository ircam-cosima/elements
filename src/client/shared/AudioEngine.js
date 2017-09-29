import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

// simple moving average filter to smooth energy input
class MvAvrg {
  constructor() {
    this.value = 0;
    this.avgFilterSize = 20;
    this.filterIndex = 0;

    this.avgFilter = new Float32Array(this.avgFilterSize);

    for (let i = 0; i < this.avgFilterSize; i++)
      this.avgFilter[i] = 0;
  }

  filter(value) {
    this.value = value;
    this.avgFilter[this.filterIndex] = value;

    let filteredValue = 0;

    for (let i = 0; i < this.avgFilterSize; i++)
      filteredValue += this.avgFilter[i];

    filteredValue /= this.avgFilterSize;
    this.filterIndex = (this.filterIndex + 1) % this.avgFilterSize;

    return filteredValue;
  }

  reset() {
    for (var i = 0; i < this.avgFilterSize; i++)
      this.avgFilter[i] = this.value;
  }
}

//========================= the audio engine class : =========================//

class AudioEngine {
  constructor(buffers) {
    this._fadeInTime = 0.5;
    this._fadeOutTime = 1;

    this.buffers = buffers;
    this.labels = [];
    this.audioContext = audioContext;

    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);

    this.gainNode = audioContext.createGain();
    this.gainNode.connect(this.master);

    this.muteNode = audioContext.createGain();
    this.muteNode.connect(this.gainNode);

    this.mvAvrg = new MvAvrg();

    this.mute = false;
  }

  set mute(mute) {
    const now = audioContext.currentTime;
    const val = mute ? 0 : 1;
    const currentValue = this.muteNode.gain.value;

    this.muteNode.gain.cancelScheduledValues(now);
    this.muteNode.gain.setValueAtTime(currentValue, now);
    this.muteNode.gain.linearRampToValueAtTime(val, now + 1);
  }

  start() {
    this.sources = {};
    this.fades = {};

    for (let i = 0; i < this.labels.length; i++) {
      this._startLabel(this.labels[i]);
    }

    this.gainNode.gain.value = 0;
    this.muteNode.gain.value = 0;
    this.master.gain.value = 1;

    this.fadeToNewSound(null);
  }

  addSound(label) {
    if (this.labels.indexOf(label) === -1) {
      this.labels.push(label);
      this._startLabel(label);
    }
  }

  removeSound(label) {
    const index = this.labels.indexOf(label);

    if (index !== -1) {
      this._stopLabel(label);
      this.labels.splice(index, 1);
    }
  }

  updateSounds(labels) {
    const prevLabels = this.labels;
    this.labels = labels;

    for (let i = 0; i < labels.length; i++)
      if (prevLabels.indexOf(labels[i]) === -1)
        this._startLabel(labels[i]);

    for (let i = 0; i < prevLabels.length; i++)
      if (labels.indexOf(prevLabels[i]) === -1)
        this._stopLabel(prevLabels[i]);
  }

  _startLabel(label) {
    if (this.fades[label]) return;

    const src = audioContext.createBufferSource();
    src.buffer = this.buffers[label];

    const fade = audioContext.createGain();

    src.connect(fade);
    fade.connect(this.muteNode);

    fade.gain.value = 0;
    src.loop = true;
    src.start(audioContext.currentTime);

    this.sources[label] = src;
    this.fades[label] = fade;
  }

  _stopLabel(label) {
    if (!this.fades[label]) return;

    this.fades[label].gain.value = 0;
    this.sources[label].stop();

    this.fades[label].disconnect(this.muteNode);
    this.sources[label].disconnect(this.fades[label]);

    this.fades[label] = undefined;
    this.sources[label] = undefined;
  }

  fadeToNewSound(label) {
    const now = audioContext.currentTime;
    for (let i = 0; i < this.labels.length; i++) {
      const l = this.labels[i];
      const currentValue = this.fades[l].gain.value;
      this.fades[l].gain.cancelScheduledValues(now)
      this.fades[l].gain.setValueAtTime(currentValue, now);
      this.fades[l].gain.linearRampToValueAtTime(0, now + this._fadeOutTime);
    }

    if (label !== null && this.fades[label]) {
      const currentValue = this.fades[label].gain.value;
      this.fades[label].gain.cancelScheduledValues(now)
      this.fades[label].gain.setValueAtTime(currentValue, now);
      this.fades[label].gain.linearRampToValueAtTime(1, now + this._fadeInTime);
    }
  }

  setMasterVolume(volVal) {
    this.master.gain.setValueAtTime(volVal, audioContext.currentTime);
  }

  setGainFromIntensity(value) {
    const eventValue = this.mvAvrg.filter(value);
    const minIn = 0.;
    const maxIn = 5.;
    const minOut = 0;
    const maxOut = 1;
    const factor = 1.;
    const scaledVal = this._scaleValue(eventValue, minIn, maxIn, minOut, maxOut);

    this.gainNode.gain.value = this._clip(scaledVal, 0, 1);
  }

  _scaleValue(val, minIn, maxIn, minOut, maxOut, factor = 1, sigmoid = false) {
    let scaledVal;

    if (sigmoid || factor !== 1) {
      scaledVal = this._scale(val, minIn, maxIn, 0, 1);

      if (sigmoid) {
        scaledVal = scaledVal * Math.PI + Math.PI; // map to [ PI ; 2PI ]
        scaledVal = Math.cos(scaledVal); // sigmoid from -1 to 1
        scaledVal = (scaledVal + 1) * 0.5; // remap to [ 0 ; 1 ]
      }

      if (factor !== 1) {
        scaledVal = Math.pow(scaledVal, factor); // apply pow factor
      }

      return this._scale(scaledVal, 0, 1, minOut, maxOut);
    } else {
      return this._scale(val, minIn, maxIn, minOut, maxOut);
    }
  }

  _scale(val, minIn, maxIn, minOut, maxOut) {
    const a = (maxOut - minOut) / (maxIn - minIn);
    const b = maxOut - a * maxIn;
    return a * val + b;
  }

  _clip(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }
}

export default AudioEngine;
