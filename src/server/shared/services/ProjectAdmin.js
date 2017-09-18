import { Service, serviceManager } from 'soundworks/server';
import projectStore from '../projectStore';
import uuidv4 from 'uuid/v4';

const SERVICE_ID = 'service:project-admin';

// @todo - rename to ProjectChooser

class ProjectAdmin extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {};

    this.loggedProjectMap = new Map();
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

    this.receive(client, 'project-request', this._onLogin(client));
  }

  disconnect(client) {
    super.disconnect(client);

    const project = client.project;
    this.loggedProjectMap.set(project, false);
  }

  /** @private */
  _onLogin(client) {
    return name => {
      let project = projectStore.getByName(name);
      const connected = this.loggedProjectMap.get(project);

      if (connected) {
        this.send(client, 'project-error', name);
      } else {
        // create project if not exist
        if (project === null) {
          project = { name: name, uuid: uuidv4() };
          projectStore.persist(project);
        }

        client.project = project;
        this.loggedProjectMap.set(project, true);

        this.send(client, 'project-ack', project);
      }
    }
  }
}

serviceManager.register(SERVICE_ID, ProjectAdmin);

export default ProjectAdmin;
