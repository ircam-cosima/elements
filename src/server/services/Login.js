import { Service, serviceManager } from 'soundworks/server';

const SERVICE_ID = 'service:login';

class Login extends Service {
	constructor() {
    super(SERVICE_ID);

    const defaults = {};
    this.configure(defaults);

    this.checkin = this.require('checkin');
	}

  /** @private */
  configure(options) {
    super.configure(options);
  }

  /** @private */
  start() {
    super.start();
  }

  /** @private */
  connect(client) {
  	super.connect(client);
  	client.activities['service:login'] = { username: null };
    this.receive(client, 'login', this._onLogin(client));
    this.receive(client, 'confirm', this._onConfirm(client));
    this.receive(client, 'logout', this._onLogout(client));
  }

  /** @private */
	_onLogin(client) {
		return (username) => {
      // check if user exists in db if needed
			this.send(client, 'login', username);
		};
	}

	/** @private */
	_onConfirm(client) {
		return (username) => {
			client.activities['service:login'].username = username;
			this.send(client, 'confirm', username);
		}
	}

  /** @private */
	_onLogout(client) {
		return (username) => {
			client.activities['service:login'].username = null;
			this.send(client, 'logout', username);
		};
	}
}

serviceManager.register(SERVICE_ID, Login);

export default Login;