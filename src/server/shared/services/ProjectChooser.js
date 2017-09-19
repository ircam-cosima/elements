import { Service, serviceManager } from 'soundworks/server';
import appStore from '../appStore';
import uuidv4 from 'uuid/v4';

const SERVICE_ID = 'service:project-chooser';

// @todo - rename to ProjectChooser

class ProjectChooser extends Service {
  constructor() {
    super(SERVICE_ID);

    const defaults = {};

    // this.loggedProjectMap = new Map();
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
    this.receive(client, 'project-list-request', () => {
      this.send(client, 'project-list', this._getProjectList());
    });
    this.receive(client, 'project-request', this.enterProject(client));
  }

  // disconnect(client) {
  //   super.disconnect(client);
  // }

  exitProject(client) {
    appStore.removePlayerFromProject(client);
  }

  /** @private */
  enterProject(client) {
    return projectName => {
      let project = appStore.getProjectByName(projectName);
      console.log('getting project : ' + projectName);
      if (project !== null) {
        appStore.addPlayerToProject(client, project);
        this.send(client, 'project-ack', project);
      } else {
        this.send(client, 'project-error', project);
      }
    };
  }

  /** @private */
  _getProjectList() {
    const projects = [];

    appStore.projects.forEach(project => {
      projects.push(project.name);
    });

    return projects;
  }
}

serviceManager.register(SERVICE_ID, ProjectChooser);

export default ProjectChooser;
