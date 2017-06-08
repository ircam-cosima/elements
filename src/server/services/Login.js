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
  	// client.activities.login = { userName: null };
  	client.activities['service:login'] = { userName: null };
    this.receive(client, 'login', this._onLogin(client));
    this.receive(client, 'confirm', this._onConfirm(client));
    this.receive(client, 'logout', this._onLogout(client));
  }

  /** @private */
  /** @todo check for eventual db errors with more callbacks in Mongo.js */
	_onLogin(client) {
		return (userName) => {
			// if (!this._mongo.docExistsInColl('users', {
			// 	userName: userName
			// })) {
			// 	this._mongo.writeDocToColl('users', {
			// 		userName: userName
			// 	});
			// }

			// this._mongo.docExistsInColl('users', { userName: userName }, (yes) => {
			// 	if (!yes) {
			// 		this._mongo.writeDocToColl('users', { userName: userName });
			// 	}
			// })
			this.send(client, 'login', userName);
		};
	}

	/** @private */
	_onConfirm(client) {
		return (userName) => {
			// client.activities.login.userName = userName;
			// console.log(client.activities);
			client.activities['service:login'].userName = userName;
			this.send(client, 'confirm', userName);
		}
	}

  /** @private */
	_onLogout(client) {
		return (userName) => {
			// client.activities.login.userName = null;
			client.activities['service:login'].userName = null;
			this.send(client, 'logout', userName);
		};
	}
}

serviceManager.register(SERVICE_ID, Login);

export default Login;