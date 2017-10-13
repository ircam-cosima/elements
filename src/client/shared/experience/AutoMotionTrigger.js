const defaults = {
  highThreshold: 0.5,
  lowThreshold: 0.3,
  offDelay: 1000,
  startCallback: null,
  stopCallback: null,
};

class AutoMotionTrigger {
  constructor(options) {
    this.params = Object.assign({}, defaults, options);
    this.isMoving = false;
    this.timeoutId = null;
    this.state = 'off';
  }

  set highThreshold(value) {
    this.params.highThreshold = value;
  }

  get highThreshold() {
    return this.params.highThreshold;
  }

  set lowThreshold(value) {
    this.params.lowThreshold = value;
  }

  get lowThreshold() {
    return this.params.lowThreshold;
  }

  set offDelay(value) {
    this.params.offDelay = value;
  }

  get offDelay() {
    return this.params.offDelay;
  }

  push(value) {
    if (this.state === 'on') {
      if (value > this.params.highThreshold && !this.isMoving) {
        this.isMoving = true;

        if (this.timeoutId === null) {
          this.params.startCallback();
        } else {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }

      } else if (value < this.params.lowThreshold && this.isMoving) {
        this.isMoving = false; // keep this out of the timeout

        if (this.timeoutId === null) {
          this.timeoutId = setTimeout(() => {
            this.params.stopCallback();
            this.timeoutId = null;
          }, this.params.offDelay);
        }
      }
    } else {
      if (this.isMoving)
        this.isMoving = false;
    }
  }

  setState(onOff) {
    this.state = onOff;

    if (onOff === 'off') {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export default AutoMotionTrigger;
