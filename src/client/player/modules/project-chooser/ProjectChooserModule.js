import BaseModule from '../BaseModule';
import ProjectChooserView from './ProjectChooserView';

const MODULE_ID = 'project-chooser';

class ProjectManagerModule extends BaseModule {
  constructor(experience) {
    super(MODULE_ID, experience);

    this.allowedActions = [
      'project-list',
      'select-project',
    ];

    this.view = new ProjectChooserView();
    this.view.selectProject = projectUuid => {
      const action = {
        type: 'select-project',
        payload: { projectUuid },
      };

      this.request(action);
    };
  }

  show() {
    super.show();

    this.view.render();
    this.view.show();
    this.view.appendTo(this.experience.view.$el);
  }

  hide() {
    super.hide();
  }

  start() {
    super.start();

    // @note - probably move subscriptions to `BaseModule`
    this.subscribe('project-list');
    this.subscribe('select-project');

    const initAction = {
      type: 'project-list',
      payload: null,
    };

    this.request(initAction);
  }

  stop() {
    super.stop();

    // @note - probably move subscriptions to `BaseModule`
    this.unsubscribe('project-list');
    this.unsubscribe('select-project');
  }

  dispatch(action) {
    switch (action.type) {
      case 'project-list':
        this.view.model.projectList = action.payload;
        this.view.render('#project-list');
        break;
      case 'select-project':
        this.view.model.projectName = action.payload.name;
        this.view.render('#project-name');
        break;
    }
  }
}

export default ProjectManagerModule;
