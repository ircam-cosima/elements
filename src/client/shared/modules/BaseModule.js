

class BaseModule {
  constructor(id, experience) {
    this.id = id;
    this.experience = experience;

    /**
     * List of the action type the module can handle.
     * Each module must define and maintain its own list.
     * The server-side module also maintains that list.
     * @type Array<String>
     */
    this.allowedActions = [];

    this.dispatch = this.dispatch.bind(this);
  }

  start() {
    this.experience.receive(`module:${this.id}:action`, this.dispatch);
    this.allowedActions.forEach(actionType => this.subscribe(actionType));
  }

  stop() {
    this.allowedActions.forEach(actionType => this.unsubscribe(actionType));
    this.experience.stopReceiving(`module:${this.id}:action`);
  }

  show() {

  }

  hide() {

  }

  subscribe(actionType) {
    if (this.allowedActions.indexOf(actionType) === -1)
      throw new Error(`Module ${this.id} cannot subscribe to action "${actionType}"`);

    this.experience.send(`module:${this.id}:subscribe`, actionType);
  }

  unsubscribe(actionType) {
    this.experience.send(`module:${this.id}:unsubscribe`, actionType);
  }

  request(action) {
    if (this.allowedActions.indexOf(action.type) === -1)
      throw new Error(`Module ${this.id} cannot request action "${action.type}"`);

    this.experience.send(`module:${this.id}:request`, action);
  }

  dispatch(action) {
    // update state, rendering, etc according to the actionType, example:
    //
    // switch (action.type) {
    //   case 'updateClientParam':
    //     const { uuid, paramName, value } = action.payload;
    //     if (param.name === 'audio.mute') {
    //       this.synth.mute = value;
    //       this.view.model.mute = value;
    //       this.view.render('#audio-controls');
    //     }
    //   break;
    //   // ...
    // }
  }
}

export default BaseModule;
