
class Effect {
  constructor(id = 'effect', defaults = {}, options = {}) {
    this.id = id;
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
