const defaults = {
  highThresh: 1.2,
  lowThresh: 0.3,
  offDelay: 500,
  startCallback: null,
  stopCallback: null,
};

export default class AutoMotionTrigger {
  constructor(options) {
    this.params = Object.assign({}, defaults, options);
    this.isMoving = false;
    this.timeout = null;
    this.state = 'off';
  }

  push(value) {
    if (this.state === 'on') {
      if (value > this.params.highThresh && !this.isMoving) {
        this.isMoving = true;
        this._start();
      } else if (value < this.params.lowThresh && this.isMoving) {
        this.isMoving = false; // keep this out of the timeout
        if (!this.timeout) {
          this.timeout = setTimeout(this._stop.bind(this), this.params.offDelay);
        }
      }
    } else {
      if (this.isMoving) {
        this.isMoving = false;
      }
    }
  }

  setState(onOff) {
    this.state = onOff;
    if (onOff === 'off') {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  _start() {
    clearTimeout(this.timeout);
    this.timeout = null;
    this.params.startCallback();
  }

  _stop() {
    this.params.stopCallback();
  }
}