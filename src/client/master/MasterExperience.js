import * as soundworks from 'soundworks/client';
import MasterView from './MasterView';

class MasterExperience extends soundworks.Experience {
  constructor() {
    super();

    this._deleteProjectRequest = this._deleteProjectRequest.bind(this);
    this._disconnectDesignerRequest = this._disconnectDesignerRequest.bind(this);

    this._setProjectList = this._setProjectList.bind(this);
    this._createProject = this._createProject.bind(this);
    this._deleteProject = this._deleteProject.bind(this);
    this._updateProject = this._updateProject.bind(this);
    this._updateProjectOverview = this._updateProjectOverview.bind(this);
    this._updateGroupParamRequest = this._updateGroupParamRequest.bind(this);
  }

  start() {
    super.start();

    this.view = new MasterView();

    this.view.setDeleteProjectCallback(this._deleteProjectRequest);
    this.view.setDisconnectDesignerCallback(this._disconnectDesignerRequest);
    this.view.setUpdateGroupParamCallback(this._updateGroupParamRequest);

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

  _updateGroupParamRequest(uuid, name, value) {
    this.send('param:group:update', uuid, name, value);
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

export default MasterExperience;
