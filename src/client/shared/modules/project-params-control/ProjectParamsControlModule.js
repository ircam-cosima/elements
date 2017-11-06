import BaseModule from '../BaseModule';
import ProjectParamsControlView from './ProjectParamsControlView';

const MODULE_ID = 'project-params-control';

class ProjectParamsControlModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.view = new ProjectParamsControlView();
  }

  show() {
    this.view.render();
    this.view.show();
    this.view.appendTo(this.experience.getContainer('#project-params-control'))
  }
}

export default ProjectParamsControlModule;
