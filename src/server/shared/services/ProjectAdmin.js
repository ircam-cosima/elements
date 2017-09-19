import { Service, serviceManager } from 'soundworks/server';
import appStore from '../appStore';

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

    this.receive(client, 'project-request', this.enterProject(client));
  }

  // disconnect(client) {
  //   super.disconnect(client);
  // }

  exitProject(client) {
    appStore.removeDesignerFromProject(client);
  }

  /** @private */
  enterProject(client) {
    return name => {
      let project = appStore.getProjectByName(name);

      if (project === null) {
        project = appStore.createProject(name);
        appStore.addDesignerToProject(client, project);

        this.send(client, 'project-ack', project);
      } else {
        const designer = appStore.getProjectDesigner(project);

        if (designer === null) {
          appStore.addDesignerToProject(client, project);
          this.send(client, 'project-ack', project);
        } else {
          this.send(client, 'project-error', name);
        }
      }
    }
  }
}

serviceManager.register(SERVICE_ID, ProjectAdmin);

export default ProjectAdmin;
