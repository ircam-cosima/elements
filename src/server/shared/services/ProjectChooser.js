import { Service, serviceManager } from 'soundworks/server';
import appStore from '../appStore';
import uuidv4 from 'uuid/v4';

const SERVICE_ID = 'service:project-chooser';

// @todo - rename to ProjectChooser

class ProjectChooser extends Service {
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
        appStore.addPlayerToProject(client, project);
        this.send(client, 'project-ack', project);
      } else {
        this.send(client, 'project-error', project);
      }
    };
  }
}

serviceManager.register(SERVICE_ID, ProjectChooser);

export default ProjectChooser;
