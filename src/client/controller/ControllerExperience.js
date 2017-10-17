import * as soundworks from 'soundworks/client';
import ControllerView from './ControllerView';
import * as lfo from 'waves-lfo/client';
import * as controllers from 'basic-controllers';
import { triggers, labels } from '../../shared/config/audio';

class ControllerExperience extends soundworks.Experience {
  constructor() {
    super();

    this.rawSocket = this.require('raw-socket');

    this._audioTriggerCallback = this._audioTriggerCallback.bind(this);

    this._deleteProjectRequest = this._deleteProjectRequest.bind(this);
    this._disconnectDesignerRequest = this._disconnectDesignerRequest.bind(this);

    this._setProjectList = this._setProjectList.bind(this);
    this._createProject = this._createProject.bind(this);
    this._deleteProject = this._deleteProject.bind(this);
    this._updateProject = this._updateProject.bind(this);
    this._updateProjectOverview = this._updateProjectOverview.bind(this);
    this._updateProjectParamRequest = this._updateProjectParamRequest.bind(this);
    this._updateProjectConfigRequest = this._updateProjectConfigRequest.bind(this);
    this._updateClientParamRequest = this._updateClientParamRequest.bind(this);
    this._updateClientExclusiveParamRequest = this._updateClientExclusiveParamRequest.bind(this);
    this._triggerClientCommand = this._triggerClientCommand.bind(this);
  }

  start() {
    super.start();

    document.documentElement.style.backgroundColor = 'white';

    this.view = new ControllerView();

    this.view.audioTriggerCallback = this._audioTriggerCallback;
    this.view.deleteProjectCallback = this._deleteProjectRequest;
    this.view.disconnectDesignerCallback = this._disconnectDesignerRequest;
    this.view.clearModelCallback = this._clearModelRequest.bind(this);
    this.view.clearLabelCallback = this._clearLabelRequest.bind(this);
    this.view.updateProjectParamCallback = this._updateProjectParamRequest;
    this.view.updateProjectConfigCallback = this._updateProjectConfigRequest;
    this.view.updateClientParamCallback = this._updateClientParamRequest;
    this.view.updateClientExclusiveParamCallback = this._updateClientExclusiveParamRequest;
    this.view.triggerClientCommandCallback = this._triggerClientCommand;

    this.receive('project:list', this._setProjectList);
    this.receive('project:overview', this._updateProjectOverview);

    this.receive('project:create', this._createProject);
    this.receive('project:delete', this._deleteProject);
    this.receive('project:update', this._updateProject);

    this.show().then(() => {
      // sensors visualizer
      const displayFilter = [1, 1, 1, 1, 1, 1, 1, 1];

      this.eventIn = new lfo.source.EventIn({
        frameType: 'vector',
        frameSize: 8,
        frameRate: 0,
      });

      this.displayFilter = new lfo.operator.Multiplier({
        factor: displayFilter,
      });

      this.bpfDisplay = new lfo.sink.BpfDisplay({
        min: -1,
        max: 1,
        width: 600,
        height: 300,
        duration: 10,
        line: true,
        radius: 0,
        colors: [
          '#da251c', '#f8cc11', // intensity
          'steelblue', 'orange', 'green',
          '#565656', '#fa8064', '#54b2a9',
        ],
        canvas: '#sensors'
      });

      this.eventIn.connect(this.displayFilter);
      this.displayFilter.connect(this.bpfDisplay);
      this.eventIn.start();

      this.rawSocket.receive('sensors', data => {
        this.eventIn.process(null, data)
      });

      this.receive('sensors-display', (value) => {
        if (value)
          this.bpfDisplay.resetStream();
      });

      const intensityToggle = new controllers.Toggle({
        label: 'intensity',
        active: true,
        container: '#sensors-controls',
        callback: active => {
          const value = active === true ? 1 : 0;
          displayFilter[0] = value;
          displayFilter[1] = value;
        }
      });

      const bandpassToggle = new controllers.Toggle({
        label: 'bandpass',
        active: true,
        container: '#sensors-controls',
        callback: active => {
          const value = active === true ? 1 : 0;
          displayFilter[2] = value;
          displayFilter[3] = value;
          displayFilter[4] = value;
        }
      });

      const orientationToggle = new controllers.Toggle({
        label: 'orientation',
        active: true,
        container: '#sensors-controls',
        callback: active => {
          const value = active === true ? 1 : 0;
          displayFilter[5] = value;
          displayFilter[6] = value;
          displayFilter[7] = value;
        }
      });

      const bpfTickness = new controllers.Slider({
        label: 'tickness',
        min: 0,
        max: 10,
        step: 1,
        value: 0,
        container: '#sensors-controls',
        callback: value => this.bpfDisplay.params.set('radius', value),
      });
    });
  }

  _audioTriggerCallback(action, label) {
    this.send('audio:trigger', action, label);
  }

  _deleteProjectRequest(uuid) {
    this.send('project:delete', uuid);
  }

  _disconnectDesignerRequest(uuid) {
    this.send('designer:disconnect', uuid);
  }

  _clearModelRequest(uuid) {
    this.send('project:clearModel', uuid);
  }

  _clearLabelRequest(uuid, label) {
    this.send('project:clearLabel', uuid, label);
  }
  // parameters realtive to user interfaces
  _updateProjectParamRequest(uuid, paramName, value) {
    this.send('param:project:update', uuid, paramName, value);
  }

  // parameters relative to training
  _updateProjectConfigRequest(uuid, paramName, value) {
    this.send('config:project:update', uuid, paramName, value);
  }

  _updateClientParamRequest(uuid, paramName, value) {
    this.send('param:client:update', uuid, paramName, value);
  }

  _updateClientExclusiveParamRequest(uuid, paramName, value) {
    this.send('exclusive:param:client:update', uuid, paramName, value);
  }

  _triggerClientCommand(uuid, cmd, ...args) {
    this.send('command:trigger', uuid, cmd, ...args);
  }

  // build project overview menu
  _updateProjectOverview(projectsOverview) {
    this.view.createProjectList(projectsOverview);
  }

  // build projects detailled descriptions
  _setProjectList(projectList) {
    projectList.forEach(project => this.view.addProject(project));
  }

  _createProject(project) {
    this.view.addProject(project);
  }

  _deleteProject(project) {
    this.view.deleteProject(project);
  }

  _updateProject(project) {
    this.view.updateProject(project);
  }
}

export default ControllerExperience;
