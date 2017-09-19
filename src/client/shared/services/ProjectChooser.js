import { Service, SegmentedView, serviceManager } from 'soundworks/client';

const SERVICE_ID = 'service:project-chooser';
const LOCAL_STORAGE_KEY = `soundworks:${SERVICE_ID}`;

/**
 * Simple service that can show up anytime upon request to switch project.
 */

class ProjectChooser extends Service {
  constructor(options) {
    super(SERVICE_ID, true);

    const defaults = {
      viewPriority: 100,
    };

    this.configure(defaults);

    this.user = null;

    this._login = this._login.bind(this);
    this._confirm = this._confirm.bind(this); // returning user login
    this._onLoginAck = this._onLoginAck.bind(this);
    this._onLoginError = this._onLoginError.bind(this);
    this._logout = this._logout.bind(this);
    this._onLogoutAck = this._onLogoutAck.bind(this);
  }

  /** @private */
  start() {
    super.start();

    this.view.setLoginCallback(this._login);
    this.view.setConfirmCallback(this._confirm);
    this.view.setLogoutCallback(this._logout);

    this.receive('login-ack', this._onLoginAck);
    this.receive('login-error', this._onLoginError);
    this.receive('logout-ack', this._onLogoutAck);

    const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

    if (user !== null) {
      this.view.model.logged = true;
      this.view.model.username = user.name;
      this.user = user;
    } else {
      this.view.model.logged = false;
      this.view.model.username = null;
    }

    this.show();
  }

    /** @private */
  stop() {
    super.stop();

    this.stopReceiving('login-ack', this._onLoginAck);
    this.stopReceiving('login-error', this._onLoginError);
    this.stopReceiving('logout-ack', this._onLogoutAck);

    this.hide();
  }

  // check if user already exists
  _login(username) {
    this.send('login', username);
  }

  _confirm() {
    this.send('confirm', this.user);
  }

  // server ack that username is available
  _onLoginAck(user) {
    console.log(user);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));

    this.user = user;
    this.ready();
  }

  // server error: username is nor available
  _onLoginError(username) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    this.user = null;
    this.view.model.username = username;
    this.view.model.error = true;
    this.view.model.logged = false;
    this.view.render();
  }

  // destroy user on the server
  _logout() {
    this.send('logout', this.user);
  }

  _onLogoutAck() {
    console.log('logout');
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    this.user = null;
    this.view.model.username = null;
    this.view.model.logged = false;
    this.view.model.error = false;
    this.view.render();
  }
}

serviceManager.register(SERVICE_ID, SimpleLogin);

export default SimpleLogin;
