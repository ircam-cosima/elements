import { Service, SegmentedView, serviceManager } from 'soundworks/client';

const SERVICE_ID = 'service:login';

class LoginView extends SegmentedView {
  onLogin(callback) {
    this.installEvents({
      'click #login': () => {
        const userName = this.$el.querySelector('#username').value;
        if (userName !== '') {
          callback(userName);
        }
    	}
    });
  }

  onConfirm(callback) {
    this.installEvents({
      'click #confirm': () => {
        callback();
      }
    });
  }

  onLogout(callback) {
  	this.installEvents({
      'click #logout': () => {
        callback();
      }
    });
  }
}

const defaultViewTemplate = `
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

const defaultViewContent = {
	instructions: 'Enter your user name',
	login : 'Log in',
	welcomeMessage: 'Logged in as ',
	userName: null,
  confirm: 'Confirm',
	logout: 'Log out',
	logged: false
};

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
			viewCtor: LoginView
		};

		this.configure(defaults);

    this._defaultViewTemplate = defaultViewTemplate;
    this._defaultViewContent = defaultViewContent;

    this._onLoginResponse = this._onLoginResponse.bind(this);
    this._onLoginConfirmed = this._onLoginConfirmed.bind(this);
    this._onLogoutResponse = this._onLogoutResponse.bind(this);
    this._login = this._login.bind(this);
    this._confirm = this._confirm.bind(this);
    this._logout = this._logout.bind(this);

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin');
	}

  //configure(options) 

  /** @private */
	init() {
		this._userName = null;

		this.viewCtor = this.options.viewCtor;
		this.view = this.createView();
		this.view.onLogin(this._login);
    this.view.onConfirm(this._confirm);
		this.view.onLogout(this._logout);
	}

  /** @private */
  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.receive('login', this._onLoginResponse);
    this.receive('confirm', this._onLoginConfirmed);
    this.receive('logout', this._onLogoutResponse);

    const key = 'soundworks:service:login:userName'; // too long for safari :(
    // const key = 'soundworks:userName';
    const storedUserName = localStorage.getItem(key);
    // const storedUserName = localStorage.getItem('soundworks:service:login:userName');

    if (storedUserName !== null) {
      this.view.content.logged = true;
      this.view.content.userName = storedUserName;
      this._userName = storedUserName;
    } else {
      this.view.content.logged = false;
      this.view.content.userName = null;  
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

  getUserName() {
    return localStorage.getItem('soundworks:service:login:userName');
  }

	_login(userName) {
		this.send('login', userName);
	}

  _confirm() {
    this.send('confirm', this._userName);
  }

	_logout() {
		this.send('logout', this._userName);
	}

	_onLoginResponse(userName) {
    this._userName = userName;
    console.log('login response : ' + this._userName);
		localStorage.setItem('soundworks:service:login:userName', userName);
		this._defaultViewContent.logged = true;
    this._defaultViewContent.userName = userName;
    this.view.render();
	}

  _onLoginConfirmed(userName) {
    console.log('server confirmed that ' + userName + ' is logged in');
    this.ready();
  }

	_onLogoutResponse(userName) {
		this._userName = null;
    localStorage.removeItem('soundworks:service:login:userName');
		this._defaultViewContent.logged = false;
    this._defaultViewContent.userName = null;
    this.view.render();
	}
}

serviceManager.register(SERVICE_ID, Login);

export default Login;