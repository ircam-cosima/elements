import { Service, serviceManager } from 'soundworks/server';
import appStore from '../appStore';

const SERVICE_ID = 'service:project-manager';

// @todo - rename to ProjectChooser

class ProjectManager extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {};

    this.configure(defaults);

    this.require('client-register');
  }

  /** @private */
  configure(options) {
    super.configure(options);
  }

  /** @private */
  start() {
    super.start();

    const refreshList = () => {
      const clients = appStore.clients;
      const projectList = Array.from(appStore.projects);
      clients.forEach(client => this.send(client, 'project-list', projectList));
    }

    appStore.addListener('create-project', refreshList);
    appStore.addListener('delete-project', refreshList);

    this.ready();
  }

  /** @private */
  connect(client) {
    super.connect(client);

    this.receive(client, 'project-list:request', () => {
      const projectList = Array.from(appStore.projects);
      this.send(client, 'project-list', projectList);
    });

    this.receive(client, 'project-request', this.enterProject(client));
  }

  disconnect(client) {
    this.exitProject(client);
    super.disconnect(client);
  }

  exitProject(client) {
    // console.log('exitProject', client);
    appStore.removeClientFromProject(client);
    this.project = null;
  }

  /** @private */
  enterProject(client) {
    return name => {
      let project = appStore.getProjectByName(name);

      if (project === null)
        project = appStore.createProject(name);

      appStore.addClientToProject(client, project);
      this.send(client, 'project-ack', project);
      this._chooseProjectCallback(client)
    }
  }

  setChooseProjectCallback(callback) {
    this._chooseProjectCallback = callback;
  }
}

serviceManager.register(SERVICE_ID, ProjectManager);

export default ProjectManager;
