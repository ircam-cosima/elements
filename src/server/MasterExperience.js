import * as soundworks from 'soundworks/server';
import appStore from './shared/appStore';


class MasterExperience extends soundworks.Experience {
  constructor(clientType) {
    super(clientType);
  }

  start() {
    super.start();

    appStore.addListener('create-project', project => {
      const projectsOverview = Array.from(appStore.projects);
      const serializedProject = this._serializeProject(project);
      this.broadcast('master', null, 'project:create', serializedProject);
      this.broadcast('master', null, 'project:overview', projectsOverview);
    });
    // cannot use the broadcast method as serialize will crash...
    appStore.addListener('delete-project', project => {
      const projectsOverview = Array.from(appStore.projects);
      this.broadcast('master', null, 'project:delete', project);
      this.broadcast('master', null, 'project:overview', projectsOverview);
    });

    const broadcast = (channel, project) => {
      const serializedProject = this._serializeProject(project);
      this.broadcast('master', null, channel, serializedProject);
    };

    appStore.addListener('add-designer-to-project', project => broadcast('project:update', project));
    appStore.addListener('remove-designer-from-project', project => broadcast('project:update', project));
    appStore.addListener('add-player-to-project', project => broadcast('project:update', project));
    appStore.addListener('remove-player-from-project', project => broadcast('project:update', project));

    appStore.addListener('set-project-param', project => broadcast('project:update', project));
    // appStore.addListener('set-client-param', project => broadcast('project:update', project));

    // this implies to refactor the designer and player
    // to be compliant with the appStore overall design
    // appStore.addListener('set-client-param', client => {
    //   this.send(client)
    // });

    // parameters change
    appStore.addListener('')
  }

  enter(client) {
    super.enter(client);

    // send init informations
    const projects = appStore.projects;
    const projectsOverview = Array.from(projects);
    const serializedProjectList = [];

    projects.forEach((project) => {
      const serializedProject = this._serializeProject(project);
      serializedProjectList.push(serializedProject);
    });

    this.send(client, 'project:list', serializedProjectList);
    this.send(client, 'project:overview', projectsOverview);


    this.receive(client, 'project:delete', this._onProjectDeleteRequest(client));
    this.receive(client, 'designer:disconnect', this._onDesignerDisconnectRequest(client));
    this.receive(client, 'param:project:update', this._onUpdateProjectParam(client));
    this.receive(client, 'param:client:update', this._onUpdateClientParam(client));
  }

  exit(client) {
    super.exit(client);
  }

  /**
   * Given a project, returns a serialize version of all it clients
   */
  _serializeProject(project) {
    const serialized = {
      name: project.name,
      uuid: project.uuid,
      params: project.params,
      hasDesigner: false,
      clients: [],
    };

    // handle designer
    const designer = appStore.getProjectDesigner(project);

    if (designer !== null) {
      const client = {
        type: 'designer',
        uuid: designer.uuid,
        params: designer.params,
      };

      serialized.hasDesigner = true;
      serialized.clients.push(client);
    }

    const players = appStore.getProjectPlayers(project);

    players.forEach(player => {
      const client = {
        type: 'player',
        uuid: player.uuid,
        params: player.params,
      };

      serialized.clients.push(client);
    });

    return serialized;
  }

  _onProjectDeleteRequest(client) {
    return uuid => {
      const project = appStore.getProjectByUuid(uuid);

      if (project !== null)
        appStore.deleteProject(project);
    }
  }

  _onDesignerDisconnectRequest(client) {
    return uuid => {
      const designer = appStore.getClientByUuid(uuid);
      this.send(designer, 'force:disconnect');
    }
  }

  _onUpdateProjectParam(client) {
    return (uuid, paramName, value) => {
      const project = appStore.getProjectByUuid(uuid);
      appStore.setProjectParam(project, paramName, value);
    }
  }

  _onUpdateClientParam(client) {
    return (uuid, paramName, value) => {
      const user = appStore.getClientByUuid(uuid);
      appStore.setClientParam(user, paramName, value);
    }
  }
}

export default MasterExperience;
