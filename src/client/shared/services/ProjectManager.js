import { Service, SegmentedView, serviceManager, client } from 'soundworks/client';

const SERVICE_ID = 'service:project-manager';
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
class ProjectManager extends Service {
  constructor(options) {
    super(SERVICE_ID, true);

    const defaults = {
      viewPriority: 8,
      allowProjectCreation: true,
    };

    this.configure(defaults);

    this._login = this._login.bind(this);

    this._onReceiveProjectList = this._onReceiveProjectList.bind(this);
    this._onProjectAck = this._onProjectAck.bind(this);
    this._onProjectError = this._onProjectError.bind(this);

    this.project = null;
  }

  /** @private */
  start() {
    super.start();

    this.view.setLoginCallback(this._login);

    this.send('project-list:request');

    this.receive('project-list', this._onReceiveProjectList);
    this.receive('project-ack', this._onProjectAck);
    this.receive('project-error', this._onProjectError);

    this.view.model.logged = false;
    this.view.model.name = null;
    this.view.model.allowProjectCreation = this.options.allowProjectCreation;

    this.show();
  }

  /** @private */
  stop() {
    this.hide();
    super.stop();
  }

  logout() {
    this.send('logout');
  }

  ////////// LOGIN / CREATE FROM TEXT FIELD

  /** @private */
  _login(name) {
    this.send('project-request', name);
  }

  /** @private */
  _onReceiveProjectList(projects) {
    this.view.setProjectList(projects);
    this.view.render();
  }

  /** @private */
  _onProjectAck(project) {
    this.project = project;
    this.ready();
  }

  /**
   * @private
   * @todo
   */
  _onProjectError() {
    this.view.model.error = true;
    this.view.render();
  }

  getProject() {
    return this.project;
  }
}

serviceManager.register(SERVICE_ID, ProjectManager);

export default ProjectManager;
