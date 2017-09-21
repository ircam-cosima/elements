import { Service, serviceManager } from 'soundworks/server';
import appStore from '../appStore';
import uuidv4 from 'uuid/v4';

const SERVICE_ID = 'service:project-chooser';

class ProjectChooser extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {};
    this.configure(defaults);

    this.require('client-register');

    this._chooseProjectCallback = null;
  }

  /** @private */
  configure(options) {
    super.configure(options);
  }

  /** @private */
  start() {
    super.start();

    // send to all clients (even deisgners that don't use the information)
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
    appStore.removePlayerFromProject(client);
  }

  /** @private */
  enterProject(client) {
    return uuid => {
      const project = appStore.getProjectByUuid(uuid);

      if (project !== null) {
        if (client.project)
          appStore.removePlayerFromProject(client);

        appStore.addPlayerToProject(client, project);
        this._chooseProjectCallback(client);

        this.send(client, 'project-ack', project);
      } else {
        this.send(client, 'project-error', project);
      }
    };
  }

  setChooseProjectCallback(callback) {
    this._chooseProjectCallback = callback;
  }
}

serviceManager.register(SERVICE_ID, ProjectChooser);

export default ProjectChooser;
