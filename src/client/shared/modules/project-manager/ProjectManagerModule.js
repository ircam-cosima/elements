import { client } from 'soundworks/client';
import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';
import ProjectManagerView from './ProjectManagerView';

const MODULE_ID = 'project-manager';

class ProjectManager extends BaseModule {
  constructor(experience, options = {}) {
    super(MODULE_ID, experience);

    this.options = Object.assign({
      enableChange: true,
      enableCreation: false,
      forceProject: false, // name or uuid
      projectList: 'select', // 'none' | 'select' | 'buttons'
    }, options);

    this.subscriptions = [
      'list-project-overview',
      'add-player-to-project',
      'remove-player-from-project',
    ];

    this.allowedRequests = [
      'list-project-overview',
      'add-player-to-project',
    ];

    if (this.options.enableCreation)
      this.allowedRequests.push('create-project');

    this.view = new ProjectManagerView({
      enableChange: this.options.enableChange,
      enableCreation: this.options.enableCreation,
      forceProject: !!this.options.forceProject,
      projectList: this.options.projectList,
    });

    this.view.request = (type, payload) => {
      if (type === 'add-player-to-project')
        payload.clientUuid = client.uuid;

      const action = { type, payload };
      this.request(action);
    };
  }

  show() {
    super.show();

    this.view.render();
    this.view.show();
    this.view.appendTo(this.getContainer());
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

    if (this.options.forceProject) {
      const enterProjectAction = {
        type: 'add-player-to-project',
        payload: {
          clientUuid: client.uuid,
          projectUuid: this.options.forceProject,
        },
      };

      this.request(enterProjectAction);
    }
  }

  dispatch(action) {
    switch (action.type) {
      case 'list-project-overview': {
        this.view.model.projectOverviewList = action.payload;
        this.view.render();
        break;
      }
      case 'add-player-to-project': {
        this.view.model.project = action.payload.project;
        this.view.model.state = 'reduced',
        this.view.render();
        break;
      }
      case 'remove-player-from-project': {
        this.view.model.project = action.payload.project;
        this.view.model.state = 'expanded',
        this.view.render();
        break;
      }
    }
  }
}

moduleManager.register(MODULE_ID, ProjectManager);

export default ProjectManager;
