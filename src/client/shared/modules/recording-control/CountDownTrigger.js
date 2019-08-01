import { audioContext, audio } from 'soundworks/client';

const defaults = {
  threshold: 0.0001,
  offDelay: 0.3,
  preRollCount: 2, // num ticks before recording
  preRollInterval: 1, // in seconds
  startCallback: null,
  stopCallback: null,
  playSound: null,
}

class CountDownTrigger {
  constructor(options) {
    this.options = Object.assign({}, defaults, options);
    this.isMoving = false;
    this.stopTimeoutId = null;
    this.prerollId = null;
    this.state = 'off';
    this.counter = 0;
  }

  set threshold(value) {
    this.options.threshold = value;
  }

  set offDelay(value) {
    this.options.offDelay = value;
  }

  set preRollCount(value) {
    this.options.preRollCount = value;
  }

  set preRollInterval(value) {
    this.options.preRollInterval = value;
  }

  process(energy) {
    if (energy > this.options.threshold && !this.isMoving) {
      this.isMoving = true;

      if (this.stopTimeoutId) {
        clearTimeout(this.stopTimeoutId);
        this.stopTimeoutId = null;
      }
    } else if (energy < this.options.threshold && this.isMoving) {
      this.isMoving = false;

      this.stopTimeoutId = setTimeout(() => {
        this.options.stopCallback();
        this.stopTimeoutId = null;
        this.isMoving = false;
      }, this.options.offDelay * 1000);
    }
  }

  /**
   * state can be 'preroll', 'on', 'off'
   */
  setState(state) {
    this.state = state;

    if (this.state === 'preroll') {
      this.counter = this.options.preRollCount;

      this.prerollId = setInterval(() => {
        if (this.counter === 0) {
          clearInterval(this.prerollId);
          this.options.startCallback();
        } else {
          this.options.countCallback(this.counter);
          this.counter -= 1;
        }
      }, this.options.preRollInterval * 1000);
    } else if (this.state === 'on') {
      // listen for off
      clearInterval(this.prerollId);
      this.isMoving = true;
    } else if (this.state === 'off') {
      this.options.stopCallback();
      this.stopTimeoutId = null;
      this.isMoving = false;
    }
  }
}

export default CountDownTrigger;
