

class BaseModule {
  constructor(id, experience) {
    this.id = id;
    this.experience = experience;

    /**
     * List of the action type the module can handle.
     * Each module must define and maintain its own list.
     * The client-side module also maintains that list.
     * @type Array<String>
     */
    this.allowedActions = [];

    this.subscriptions = new Map();

    // listen for the events emitted by the appStore, create actions
    // accordingly and dipatch them to the subscribers, example:
    //
    // appStore.addListener((channel, ...args) => {
    //   switch (channel) {
    //     case 'updateClientParam':
    //       // create the `action` object
    //       // define the target(s) of the action, making sure
    //       //  the client(s) subscribed to the `actionType`
    //       this.dispatch(action, clients);
    //       break;
    //   }
    // });
  }

  enter(client) {
    this.experience.receive(client, `module:${this.id}:subscribe`, actionType => {
      if (!this.subscriptions.has(actionType))
        this.subscriptions.set(actionType, new Set());

      const clients = this.subscriptions.get(actionType);
      clients.add(client);
    });

    this.experience.receive(client, `module:${this.id}:unsubscribe`, actionType => {
      const clients = this.subscriptions.get(actionType);

      if (clients)
        clients.delete(client);
    });

    this.experience.receive(client, `module:${this.id}:request`, action => {
      if (this.allowedActions.indexOf(action.type) === -1)
        throw new Error(`Module ${this.id} cannot handle "${action.type}" request`);

      this.request(action, client);
    });
  }

  exit(client) {

  }

  request(action, client) {
    // call the appStore according to the `actionType`, example:
    //
    // switch (acction.type) {
    //   case 'updateClientParam':
    //     const { uuid, paramName, value } = action.payload;
    //     appStore.updateClientParam(uuid, paramName, action);
    //     break;
    //   // ...
    // }
  }

  dispatch(action, clients) {
    const actionType = action.type;

    if (this.allowedActions.indexOf(action.type) === -1)
      throw new Error(`Module ${this.id} cannot dispatch action "${action.type}"`);

    if (typeof clients.forEach === 'function') {
      clients.forEach(client => {
        this.experience.send(client, `module:${this.id}:action`, action);
      });
    } else {
      const client = clients;
      this.experience.send(client, `module:${this.id}:action`, action);
    }
  }
}

export default BaseModule;
