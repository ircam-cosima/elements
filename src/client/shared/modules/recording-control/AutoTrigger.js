const defaults = {
  highThreshold: 0.2,
  lowThreshold: 0.05,
  offDelay: 200,
  startCallback: null,
  stopCallback: null,
};

class AutoTrigger {
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

  process(value) {
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
            this.isMoving = false;
          }, this.params.offDelay);
        }
      }
    } else {
      if (this.isMoving)
        this.isMoving = false;
    }
  }

  setState(state) {
    this.state = state;

    if (state === 'off') {
      if (this.timeoutId !== null)
        clearTimeout(this.timeoutId);

      this.timeoutId = null;
      this.params.stopCallback();
      this.isMoving = false;
    }
  }
}

export default AutoTrigger;
