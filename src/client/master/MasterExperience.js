import * as soundworks from 'soundworks/client';
import MasterView from './MasterView';

class MasterExperience extends soundworks.Experience {
  constructor() {
    super();

    this._onProjectList = this._onProjectList.bind(this);
    this._deleteProjectRequest = this._deleteProjectRequest.bind(this);

    this._deleteProject = this._deleteProject.bind(this);
  }

  start() {
    super.start();

    this.view = new MasterView();

    this.view.setDeleteProjectCallback(this._deleteProjectRequest);

    this.send('project:list');

    this.receive('project:list', this._onProjectList);
    this.receive('project:delete', this._deleteProject);

    this.show().then(() => {
      // console.log('app started');
    });
  }

  _onProjectList(projectList) {
    projectList.forEach(project => this.view.addProject(project));
  }

  _deleteProjectRequest(uuid) {
    this.send('project:delete', uuid);
  }

  _deleteProject(project) {
    this.view.deleteProject(project);
  }
}

export default MasterExperience;
