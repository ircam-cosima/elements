import { Service, SegmentedView, serviceManager } from 'soundworks/client';

const SERVICE_ID = 'service:project-chooser';
const LOCAL_STORAGE_KEY = `soundworks:${SERVICE_ID}`;

/**
 * Simple service that can show up anytime upon request to switch project.
 */

class ProjectChooser extends Service {
  constructor(options) {
    super(SERVICE_ID, true);

    const defaults = {
      viewPriority: 8,
    };

    this.configure(defaults);

    this._selectProjectRequest = this._selectProjectRequest.bind(this);
    this._onReceiveProjectList = this._onReceiveProjectList.bind(this);
    this._onProjectAck = this._onProjectAck.bind(this);
    this._onProjectError = this._onProjectError.bind(this);
  }

  /** @private */
  start() {
    super.start();

    this.view.setSelectCallback(this._selectProjectRequest);

    this.send('project-list:request');
    this.receive('project-list', this._onReceiveProjectList);
    this.receive('project-ack', this._onProjectAck);
    this.receive('project-error', this._onProjectError);

    this.show();
  }

  /** @private */
  stop() {
    this.hide();
    super.stop();
  }

  /** @private */
  _selectProjectRequest(uuid) {
    this.send('project-request', uuid);
  }

  /** @private */
  _onReceiveProjectList(projects) {
    console.log(projects);
    this.view.setProjectList(projects);
    this.view.render();
  }

  /** @private */
  _onProjectAck(project) {
    this.ready();
  }

  /**
   * @private
   * @todo
   */
  _onProjectError() {
    this.view.model.error = true;
    this.view.render();
  }
}

serviceManager.register(SERVICE_ID, ProjectChooser);

export default ProjectChooser;
