import { Service, serviceManager } from 'soundworks/server';
import designerStore from '../designerStore';
import uuidv4 from 'uuid/v4';

const SERVICE_ID = 'service:simple-login';

let _user;

class SimpleLogin extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {};
    this.configure(defaults);

    this.users = {};
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

    client.activities['service:login'] = {};

    this.receive(client, 'login', this._onLogin(client));
    this.receive(client, 'confirm', this._onConfirm(client));
    this.receive(client, 'logout', this._onLogout(client));
  }

  /** @private */
  _onLogin(client) {
    return (username) => {
      let user = designerStore.getConnectedUserByUsername(username);

      if (user === null) {
        user = designerStore.getPersistedUserByUsername(username);

        if (user === null)
          user = { name: username, uuid: uuidv4() };

        client.activities['service:login'].user = user;
        designerStore.add(user);

        _user = user;

        this.send(client, 'login-ack', user);
      } else {
        this.send(client, 'login-error', username);
      }
    }
  }

  /** @private */
  _onConfirm(client) {
    return (user) => {
      const connectedUser = designerStore.getConnectedUserByUsername(user.name);

      if (connectedUser === null) {
        const persistedUser = designerStore.getPersistedUserByUsername(user.name);

        if (persistedUser)
          user = persistedUser;

        client.activities['service:login'].user = user;
        designerStore.add(user);

        this.send(client, 'login-ack', user);
      } else if (user.name === connectedUser.name && user.uuid === connectedUser.uuid) {
        user = connectedUser;
        client.activities['service:login'].user = user;
        designerStore.add(user);

        this.send(client, 'login-ack', user);
      } else {
        this.send(client, 'login-error', user.name);
      }
    }
  }

  /** @private */
  _onLogout(client) {
    return (user) => {
      client.activities['service:login'].user = null;
      designerStore.remove(user);

      this.send(client, 'logout-ack');
    };
  }
}

serviceManager.register(SERVICE_ID, SimpleLogin);

export default SimpleLogin;
