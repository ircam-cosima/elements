import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

// simple moving average filter to smooth energy input
class MvAvrg{
	constructor() {
		this.value = 0;
		// this.avgMaxFilterSize = 50;
    this.avgFilterSize = 50;
		this.avgFilter = [];
		for (var i = 0; i < this.avgFilterSize; i++) {
			this.avgFilter.push(0);
		}
		this.filterIndex = 0;
	}

	filter(value) {
		this.value = value;
		// apply filter on the time progression :
		this.avgFilter[this.filterIndex] = value;
		let filteredValue = 0;
		for (let i = 0; i < this.avgFilterSize; i++) {
			filteredValue += this.avgFilter[i];
		}
		filteredValue /= this.avgFilterSize;
		this.filterIndex = (this.filterIndex + 1) % this.avgFilterSize;
		return filteredValue;
	}

	reset() {
		for (var i = 0; i < this.avgFilterSize; i++) {
			this.avgFilter[i] = this.value;
		}		
	}
}

//========================= the audio engine class : =========================//

export default class AudioEngine {
	constructor(classes, loader) {
		this._fadeInTime = 0.5;
    this._fadeOutTime = 1;

    this.labels = Object.keys(classes);
    const audioFiles = [];
    for (let label in classes) {
      audioFiles.push(classes[label]);
    }
    this.loader = loader;
    this.audioContext = audioContext;

		//----------------- BUFFERS -----------------//
    this.buffers = new Map();
    this.sources = new Map();
    for (let i = 0; i < this.loader.buffers.length; i++) {
      this.buffers.set(this.labels[i], this.loader.buffers[i]);
    }

    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);

    this.gain = audioContext.createGain();
    this.gain.connect(this.master);

    this.mute = audioContext.createGain();
    this.mute.connect(this.gain);

    this.mvAvrg = new MvAvrg();
    // this._soundIndex = -1;
	}

	start() {
    this.fades = [];
    for (let i = 0; i < this.labels.length; i++) {
    	const src = audioContext.createBufferSource();
    	src.buffer = this.loader.buffers[i];

    	const fade = audioContext.createGain();

    	src.connect(fade);
    	fade.connect(this.mute);

    	// fade.gain.setValueAtTime(0, audioContext.currentTime);
    	fade.gain.value = 0;
    	src.loop = true;
    	src.start(audioContext.currentTime);

    	this.fades.push(fade);
    }

    this.gain.gain.value = 0;
    this.mute.gain.value = 0;
    this.master.gain.value = 1;

    // this._fadeToNewSound(this._soundIndex);
    this.fadeToNewSound(-1);
	}

  setModelResults(res) {

  }

  fadeToNewSound(index) {
  	// this._soundIndex = -1;
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

  enableSounds(onOff) {
    const now = audioContext.currentTime;
    const val = onOff ? 1.0 : 0;
    const currentValue = this.mute.gain.value;
    this.mute.gain.cancelScheduledValues(now);
    this.mute.gain.setValueAtTime(currentValue, now);
    this.mute.gain.linearRampToValueAtTime(val, now + 1);
  }

  setMasterVolume(volVal) {
  	this.master.gain.setValueAtTime(volVal, audioContext.currentTime);
  }

  setGainFromIntensity(value) {
    const eventValue = this.mvAvrg.filter(value);
    const mini = 0.;
    const maxi = 1.;
    const factor = 1.;
    let scaledVal = this._scaleValue(eventValue, mini, maxi, factor);

    this.gain.gain.value = scaledVal;
  }

  _scaleValue(val, clipMin, clipMax, factor) {
    let scaledVal = Math.min(Math.max(val, clipMin), clipMax); // clip
    scaledVal = scaledVal - clipMin / (clipMax - clipMin); // normalize
    // uncomment if you want sigmoid :
    //*
    scaledVal = scaledVal * Math.PI + Math.PI; // map to [ PI ; 2PI ]
    scaledVal = Math.cos(scaledVal); // sigmoid from -1 to 1
    scaledVal = (scaledVal + 1) * 0.5; // remap to [ 0 ; 1 ]
    //*/
    scaledVal = Math.pow(scaledVal, factor); // apply pow factor
    return scaledVal;
  }
}