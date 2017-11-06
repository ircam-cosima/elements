import { client } from 'soundworks/client';
import BaseModule from '../BaseModule';
import ProjectChooserView from './ProjectChooserView';

const MODULE_ID = 'project-chooser';

class ProjectChooserModule extends BaseModule {
  constructor(experience, options = {}) {
    super(MODULE_ID, experience);

    this.subscriptions = [
      'list-project-overview',
      'add-player-to-project',
    ];

    this.allowedRequests = [
      'list-project-overview',
      'add-player-to-project',
    ];

    this.options = Object.assign({
      showView: true,
      project: '', // name or uuid
    });

    // could switch view according to client type
    this.view = new ProjectChooserView();
    this.view.selectProject = projectUuid => {
      const action = {
        type: 'add-player-to-project',
        payload: {
          clientUuid: client.uuid,
          projectUuid: projectUuid,
        },
      };

      this.request(action);
    };
  }

  show() {
    super.show();

    this.view.render();
    this.view.show();
    this.view.appendTo(this.experience.getContainer('#project-chooser'));
  }

  hide() {
    super.hide();
  }

  start() {
    super.start();

    const initAction = {
      type: 'list-project-overview',
      payload: null,
    };

    this.request(initAction);

    // force default project
    // @todo - handle this as an option of the module
    const enterProjectAction = {
      type: 'add-player-to-project',
      payload: {
        clientUuid: client.uuid,
        projectUuid: 'fefc0121-083c-4fe9-9a08-bd35d4a25790',
      },
    };

    this.request(enterProjectAction);
  }

  dispatch(action) {
    switch (action.type) {
      case 'list-project-overview':
        this.view.model.projectOverviewList = action.payload;
        this.view.render();
        break;
      case 'add-player-to-project':
        this.view.model.project = action.payload.project;
        this.view.model.state = 'reduced',
        this.view.render();
        break;
    }
  }
}

export default ProjectChooserModule;
