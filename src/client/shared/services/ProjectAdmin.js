import { Service, SegmentedView, serviceManager, client } from 'soundworks/client';

const SERVICE_ID = 'service:project-admin';
const LOCAL_STORAGE_KEY = `soundworks:${SERVICE_ID}`;

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
class ProjectAdmin extends Service {
	constructor(options) {
		super(SERVICE_ID, true);

		const defaults = {
			viewPriority: 100,
		};

		this.configure(defaults);

    this._login = this._login.bind(this);
    this._onLoginAck = this._onLoginAck.bind(this);
    this._onLoginError = this._onLoginError.bind(this);
	}

  /** @private */
  start() {
    super.start();

    this.view.setLoginCallback(this._login);

    this.receive('project-ack', this._onLoginAck);
    this.receive('project-error', this._onLoginError);

    this.view.model.logged = false;
    this.view.model.name = null;

    this.show();
  }

    /** @private */
  stop() {
    super.stop();

    this.stopReceiving('project-ack', this._onLoginAck);
    this.stopReceiving('project-error', this._onLoginError);

    this.hide();
  }

  // disconnect client
  logout() {
    this.send('logout');
  }

  // check if user is already connected
  _login(name) {
    this.send('project-request', name);
  }

  // server ack that name is available
  _onLoginAck(user) {
    client.user = user;
    this.ready();
  }

  // server error: name is nor available
  _onLoginError(name) {
    this.view.model.name = name;
    this.view.model.error = true;
    this.view.render();
  }
}

serviceManager.register(SERVICE_ID, ProjectAdmin);

export default ProjectAdmin;
