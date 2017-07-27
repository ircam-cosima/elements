import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

// simple moving average filter to smooth energy input
class MvAvrg {
  constructor() {
    this.value = 0;
    this.avgFilterSize = 20;
    this.filterIndex = 0;

    this.avgFilter = new Float32Array(this.avgFilterSize);
    for (let i = 0; i < this.avgFilterSize; i++) {
      this.avgFilter[i] = 0;
    }
  }

  filter(value) {
    this.value = value;
    // apply filter on the time progression :
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
  constructor(classes) {
    this._fadeInTime = 0.5;
    this._fadeOutTime = 1;

    this.labels = Object.keys(classes);
    this.buffers = classes;
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
    this.fades = [];
    for (let i = 0; i < this.labels.length; i++) {
      const src = audioContext.createBufferSource();
      src.buffer = this.buffers[this.labels[i]];

      const fade = audioContext.createGain();

      src.connect(fade);
      fade.connect(this.muteNode);

      fade.gain.value = 0;
      src.loop = true;
      src.start(audioContext.currentTime);

      this.fades.push(fade);
    }

    this.gainNode.gain.value = 0;
    this.muteNode.gain.value = 0;
    this.master.gain.value = 1;

    this.fadeToNewSound(-1);
  }

  fadeToNewSound(index) {
    const now = audioContext.currentTime;
    for (let i = 0; i < this.labels.length; i++) {
      const currentValue = this.fades[i].gain.value;
      this.fades[i].gain.cancelScheduledValues(now)
      this.fades[i].gain.setValueAtTime(currentValue, now);
      this.fades[i].gain.linearRampToValueAtTime(0, now + this._fadeOutTime);
    }

    if (index > -1 && index < this.labels.length) {
      const currentValue = this.fades[index].gain.value;
      this.fades[index].gain.cancelScheduledValues(now)
      this.fades[index].gain.setValueAtTime(currentValue, now);
      this.fades[index].gain.linearRampToValueAtTime(1, now + this._fadeInTime);
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
