
let uid = 0;

class Effect {
  constructor(id = 'effect', defaults = {}, options = {}) {
    this.id = id;
    this.uid = uid++;
    this.params = Object.assign({}, defaults, options);
  }

  reset() {

  }

  connect(output) {

  }

  disconnect() {

  }
}

export default Effect;
