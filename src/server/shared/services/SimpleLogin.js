import { Service, serviceManager } from 'soundworks/server';
import designerStore from '../designerStore';
import uuidv4 from 'uuid/v4';

const SERVICE_ID = 'service:simple-login';

class SimpleLogin extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {};

    this.userConnectedMap = new Map();
    this.configure(defaults);
  }

  /** @private */
  configure(options) {
    super.configure(options);
  }

  /** @private */
  start() {
    super.start();
    this.ready();
  }

  /** @private */
  connect(client) {
    super.connect(client);
    this.receive(client, 'login', this._onLogin(client));
  }

  disconnect(client) {
    super.disconnect(client);

    const user = client.user;
    this.userConnectedMap.set(user, false);
  }

  /** @private */
  _onLogin(client) {
    return username => {
      let user = designerStore.getByUsername(username);
      const connected = this.userConnectedMap.get(user);

      if (connected) {
        this.send(client, 'login-error', username);
      } else {
        // create user if not exist
        if (user === null) {
          user = { name: username, uuid: uuidv4() };
          designerStore.persist(user);
        }

        client.user = user;
        this.userConnectedMap.set(user, true);

        this.send(client, 'login-ack', user);
      }
    }
  }
}

serviceManager.register(SERVICE_ID, SimpleLogin);

export default SimpleLogin;
