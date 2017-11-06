import BaseModule from '../BaseModule';
import ProjectParamsControlView from './ProjectParamsControlView';

const MODULE_ID = 'project-params-control';

class ProjectParamsControlModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.subscriptions = [
      'add-player-to-project',
      'update-project-param',
    ];

    this.allowedRequests = [
      'update-project-param',
      'update-project-ml-preset',
    ];

    this.view = new ProjectParamsControlView();
    this.view.request = (type, payload) => {
      payload.uuid = this.projectUuid;
      this.request({ type, payload });
    };
  }

  show() {
    this.view.render();
    this.view.show();
    this.view.appendTo(this.experience.getContainer('#project-params-control'))
  }

  dispatch(action) {
    const { type, payload } = action;
    let projectParams = null;

    switch (type) {
      case 'add-player-to-project': {
        this.projectUuid = payload.project.uuid;
        projectParams = payload.project.params;
        break;
      }
      case 'update-project-param': {
        projectParams = payload.params;
        break;
      }
    }

    // const learningConfig =
    this.view.model.learningConfig = projectParams.learning.config;
    this.view.model.recordingOptions = projectParams.recording.options;
    this.view.render();
  }
}

export default ProjectParamsControlModule;
