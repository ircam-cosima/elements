import * as soundworks from 'soundworks/client';
import ControllerView from './ControllerView';

class ControllerExperience extends soundworks.Experience {
  constructor() {
    super();

    this._deleteProjectRequest = this._deleteProjectRequest.bind(this);
    this._disconnectDesignerRequest = this._disconnectDesignerRequest.bind(this);

    this._setProjectList = this._setProjectList.bind(this);
    this._createProject = this._createProject.bind(this);
    this._deleteProject = this._deleteProject.bind(this);
    this._updateProject = this._updateProject.bind(this);
    // this._select
    this._updateProjectOverview = this._updateProjectOverview.bind(this);
    this._updateProjectParamRequest = this._updateProjectParamRequest.bind(this);
    this._updateClientParamRequest = this._updateClientParamRequest.bind(this);
  }

  start() {
    super.start();

    this.view = new ControllerView();

    this.view.setDeleteProjectCallback(this._deleteProjectRequest);
    this.view.setDisconnectDesignerCallback(this._disconnectDesignerRequest);
    this.view.setUpdateProjectParamCallback(this._updateProjectParamRequest);
    this.view.setUpdateClientParamCallback(this._updateClientParamRequest);

    this.receive('project:list', this._setProjectList);
    this.receive('project:overview', this._updateProjectOverview);

    this.receive('project:create', this._createProject);
    this.receive('project:delete', this._deleteProject);
    this.receive('project:update', this._updateProject);

    this.show().then(() => {
      // console.log('app started');
    });
  }

  _deleteProjectRequest(uuid) {
    this.send('project:delete', uuid);
  }

  _disconnectDesignerRequest(uuid) {
    this.send('designer:disconnect', uuid);
  }

  _updateProjectParamRequest(uuid, paramName, value) {
    this.send('param:project:update', uuid, paramName, value);
  }

  _updateClientParamRequest(uuid, paramName, value) {
    this.send('param:client:update', uuid, paramName, value);
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
