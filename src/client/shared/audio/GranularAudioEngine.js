import * as lfo from 'waves-lfo/client';
import { audio, audioContext } from 'soundworks/client';

//========================= the audio engine class : =========================//

class GranularAudioEngineBase extends audio.GranularEngine {
  constructor(buffers) {
    super();

    this.allBuffers = buffers;
    this.buffers = {};
    this.labels = [];

    this.periodAbs   = 0.05;
    this.periodRel = 0.01;
    this.periodVar = 0;
    this.positionVar = 0.01;
    this.durationAbs = 0.12;
    this.durationRel = 0;
    this.attackAbs = 0;
    this.attackRel = 0.5;
    this.releaseAbs = 0;
    this.releaseRel = 0.5;

    this.gain = 1;
    this.intensity = 0;

    this.modelResults = {
      likelihoods: [],
    }
  }

  advanceTime(time) {
    // this._selectBufferFromLikelihoods();
    return super.advanceTime(time);
  }

  setLabels(labels) {
    console.log(labels);
    this.labels = labels;
    this.buffers = {};

    for (let i = 0; i < labels.length; i++)
      this.buffers[labels[i]] = this.allBuffers[labels[i]];

    console.log(this.buffers);
  }

  setModelResults(results) {
    this.modelResults = results;
    this._selectBufferFromLikelihoods();
    this.position = (this.buffer.duration - this.durationAbs) * this.intensity;
  }

  setIntensity(value) {
    this.intensity = value;
  }

    // probability of buffer for next grain directly from likelihoods
  _selectBufferFromLikelihoods() {
    let sum = 0;
    const randomRanges = [];
    const likelihoods = this.modelResults.likelihoods;

    for (let i = 0; i < likelihoods.length; i++) {
      randomRanges.push([ sum, sum + likelihoods[i] ]);
      sum += likelihoods[i];
    }

    const randomValue = Math.random();

    for (let i = 0; i < randomRanges.length; i++) {
      if (randomValue >= randomRanges[i][0] && randomValue <= randomRanges[i][1]) {
        this.buffer = this.buffers[this.labels[i]];
        // console.log(this.nextBuffer);
        return true;
      }
    }

    return false;
  }
};

/* WRAPPER */

const scheduler = audio.getScheduler();

class GranularAudioEngine {
  constructor(buffers) {
    this.masterNode = audioContext.createGain();
    this.masterNode.connect(audioContext.destination);

    this.gainNode = audioContext.createGain();
    this.gainNode.connect(this.masterNode);

    this.engine = new GranularAudioEngineBase(buffers);
    this.engine.connect(this.gainNode);

    this.scale = new lfo.operator.Scale({
      inputMin: 0,
      inputMax: 1,
      outputMin: 0,
      outputMax: 1,
    });

    this.clip = new lfo.operator.Clip({ min: 0, max: 1 });

    this.scale.initStream({ frameType: 'vector', frameSize: 1 });
    this.clip.initStream({ frameType: 'scalar', frameSize: 1 });
  }

  start() {
    scheduler.add(this.engine);
    this.gainNode.gain.value = 0;
    this.masterNode.gain.value = 1;
  }

  stop() {
    this.masterNode.gain.value = 0;
    scheduler.remove(this.engine);
  }

  setModelResults(results) {
    this.engine.setModelResults(results);
  }

  setLabels(labels) {
    this.engine.setLabels(labels);
  }

  setMasterVolume(value) {
    this.masterNode.gain.setValueAtTime(value, audioContext.currentTime);
  }

  setIntensity(value) {
    const scaled = this.scale.inputVector([ value ]);
    const clipped = this.clip.inputVector(scaled);
    this.intensity = clipped[0];
    this.gainNode.gain.value = this.intensity;
    this.engine.setIntensity(this.intensity);
  }

  setGainFromIntensity(value) {
    // const scaled = this.scale.inputVector([ value ]);
    // const clipped = this.clip.inputVector([ scaled ]);
    // this.gainNode.gain.value = clipped;

    this.gainNode.gain.value = value;
  }

  setPositionFromIntensity(value) {
    // TODO : tweak (boost ?) this value a little bit
    // console.log(this.engine);
    this.engine.position = (this.engine.buffer.duration - this.engine.durationAbs) * value;
  }
};

export default GranularAudioEngine;
