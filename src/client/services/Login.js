import { Service, SegmentedView, serviceManager } from 'soundworks/client';

const SERVICE_ID = 'service:login';
const LOCAL_STORAGE_KEY = `soundworks:${SERVICE_ID}`;

/*
const viewTemplate = `
<% if (!logged) { %>
	<div class="section-top flex-middle">
    <p><%= instructions %></p>
  </div>
  <div class="section-center flex-center">
    <div>
      <input type="text" id="username" />
      <button class="btn" id="login"><%= login %></button>
    </div>
  </div>
  <div class="section-bottom"></div>
<% } else { %>
  <div class="section-top flex-middle">
    <p><%= welcomeMessage %><%= userName %></p>
  </div>
  <div class="section-center flex-center">
    <div>
      <button class="btn" id="confirm"><%= confirm %></button>
      <button class="btn" id="logout"><%= logout %></button>
    </div>
  </div>
  <div class="section-bottom"></div>
<% } %>`;

const viewModel = {
	instructions: 'Enter your user name',
	login : 'Log in',
	welcomeMessage: 'Logged in as ',
	userName: null,
  confirm: 'Confirm',
	logout: 'Log out',
	logged: false
};
//*/

/**
 * Interface for the client `login` service
 *
 * works in conjunction with the datastorage service
 * uses localStorage to check if the client is already logged in
 * if so, displays a welcome message
 * if not, provides a text input to specifiy a user name
 * if the user name doesn't already exist in the database, automatically creates a new entry
 * not secure : several users can be connected simultaneously using the same user name
 */

class Login extends Service {
	constructor(options) {
		super(SERVICE_ID, true);

		const defaults = {
			viewPriority: 100,
		};

		this.configure(defaults);

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin');

    this._username = null;

    this._onLoginResponse = this._onLoginResponse.bind(this);
    this._onLoginConfirmed = this._onLoginConfirmed.bind(this);
    this._onLogoutResponse = this._onLogoutResponse.bind(this);

    this._login = this._login.bind(this);
    this._confirm = this._confirm.bind(this);
    this._logout = this._logout.bind(this);
	}

  /** @private */
	init() {
    // console.log('login init');
	}

  /** @private */
  start() {
    super.start();

    this.view.setLoginCallback(this._login);
    this.view.setConfirmCallback(this._confirm);
    this.view.setLogoutCallback(this._logout);

    this.receive('login', this._onLoginResponse);
    this.receive('confirm', this._onLoginConfirmed);
    this.receive('logout', this._onLogoutResponse);

    const storedUsername = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedUsername !== null) {
      this.view.model.logged = true;
      this.view.model.username = storedUsername;
      this._username = storedUsername;
    } else {
      this.view.model.logged = false;
      this.view.model.username = null;  
    }

    this.show();
  }

  /** @private */
  stop() {
  	super.stop();

    this.removeListener('login', this._onLoginResponse);
    this.removeListener('confirm', this._onLoginConfirmed);
    this.removeListener('logout', this._onLogoutResponse);

    this.hide();
  }

  getUsername() {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  }

	_login(username) {
		this.send('login', username);
	}

  _confirm() {
    this.send('confirm', this._username);
  }

	_logout() {
		this.send('logout', this._username);
	}

	_onLoginResponse(username) {
    this._username = username;
		localStorage.setItem(LOCAL_STORAGE_KEY, username);
    this.view.model.username = username;
    this.view.model.logged = true;
    this.view.render();
	}

  _onLoginConfirmed(username) {
    this.ready();
  }

	_onLogoutResponse(username) {
		this._username = null;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this.view.model.username = null;
    this.view.model.logged = false;
    this.view.render();
	}
}

serviceManager.register(SERVICE_ID, Login);

export default Login;
