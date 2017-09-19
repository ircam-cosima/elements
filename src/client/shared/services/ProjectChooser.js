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
      viewPriority: 100,
    };

    this.configure(defaults);

    this._select = this._select.bind(this);
    this._onReceiveProjectList = this._onReceiveProjectList.bind(this);
    this._onProjectAck = this._onProjectAck.bind(this);
    this._onProjectError = this._onProjectError.bind(this);
  }

  /** @private */
  start() {
    super.start();
    this.view.setSelectCallback(this._select);
    this.receive('project-list', this._onReceiveProjectList);
    this.receive('project-ack', this._onProjectAck);
    this.receive('project-error', this._onProjectError);
    this.send('project-list-request');
    this.show();
  }

  /** @private */
  stop() {
    super.stop();
    this.stopReceiving('project-list', this._onReceiveProjectList);
    this.stopReceiving('project-ack', this._onProjectAck);
    this.stopReceiving('project-error', this._onProjectError);
    this.hide();
  }

  /** @private */
  _select(projectName) {
    this.send('project-request', projectName);
  }

  /** @private */
  _onReceiveProjectList(projects) {
    this.view.setProjectList(projects);
    this.view.render();
  }

  /** @private */
  _onProjectAck() {
    console.log('received ack');
    this.ready();
  }

  /**
   * @private
   * @todo
   */
  _onProjectError() {
    console.log('received error');
    // this.ready();
  }
}

serviceManager.register(SERVICE_ID, ProjectChooser);

export default ProjectChooser;
