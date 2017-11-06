
const subscriptions = new Map();

class BaseModule {
  constructor(id, experience) {
    this.id = id;
    this.experience = experience;

    /**
     * List of the action type the module is listening to.
     * @type Array<String>
     */
    this.subscriptions = [];

    /**
     * List of the action type the module can request.
     * @type Array<String>
     */
    this.allowedRequests = [];

    this.dispatch = this.dispatch.bind(this);
  }

  start() {
    this.subscriptions.forEach(actionType => this.subscribe(actionType));
  }

  stop() {
    this.subscriptions.forEach(actionType => this.unsubscribe(actionType));
  }

  show() {

  }

  hide() {

  }

  subscribe(actionType) {
    if (this.subscriptions.indexOf(actionType) === -1)
      throw new Error(`Module ${this.id} cannot subscribe to action "${actionType}"`);

    this.experience.subscribe(this, actionType);
  }

  unsubscribe(actionType) {
    this.experience.unsubscribe(this, actionType);
  }

  request(action) {
    if (this.allowedRequests.indexOf(action.type) === -1)
      throw new Error(`Module ${this.id} cannot request action "${action.type}"`);

    this.experience.request(action);
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
