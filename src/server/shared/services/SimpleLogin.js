import { Service, serviceManager } from 'soundworks/server';
import uuidv4 from 'uuid/v4';

const SERVICE_ID = 'service:simple-login';


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
      const index = Object.keys(this.users).indexOf(username);
      const exists = (index !== -1) ? true : false;

      if (!exists) {
        const user = {
          name: username,
          uuid: uuidv4(),
        };

        client.activities['service:login'].user = user;
        this.users[username] = user;

        this.send(client, 'login-ack', user);
      } else {
        this.send(client, 'login-error', username);
      }
    }
  }

  /** @private */
  _onConfirm(client) {
    return (user) => {
      const registeredUser = this.users[user.name];

      if (
          registeredUser === undefined ||
          (user.name === registeredUser.name && user.uuid === registeredUser.uuid)
      ) {
        client.activities['service:login'].user = user;
        this.users[user.name] = user;

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
      delete this.users[user.name];

      this.send(client, 'logout-ack');
    };
  }
}

serviceManager.register(SERVICE_ID, SimpleLogin);

export default SimpleLogin;
