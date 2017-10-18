import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

class TriggerEngine {
  constructor(triggers, uiSounds) {
    this.triggers = triggers;
    this.uiSounds = uiSounds;
    this.bufferSources = {};
  }

  start(label) {
    this.stop(label); // do not overlay

    let buffer = null;
    let loop = null;

    if (this.uiSounds[label]) {
      buffer = this.uiSounds[label];
      loop = false;
    } else {
      const trigger = this.triggers[label];
      buffer = trigger.paths[0];
      loop = trigger.loop;
    }

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer; // may choose
    src.loop = loop;
    src.start(audioContext.currentTime);

    this.bufferSources[label] = src;
  }

  /**
   * Helper to stop a single label.
   * @see stop
   * @param {String} label
   */
  _stopSingle(label) {
    const src = this.bufferSources[label];
    if(src) {
      src.stop(0);
      delete this.bufferSources[label];
    }
  }

  /**
   * Stop a label, or all of them.
   * @param {String} label to stop; '' to stop all
   */
  stop(label) {
    if(label) {
      this._stopSingle(label);
    } else {
      for(let label in this.bufferSources) {
        this._stopSingle(label);
      }
    }
  }

}

export default TriggerEngine;
