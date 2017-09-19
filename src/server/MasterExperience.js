import * as soundworks from 'soundworks/server';
import appStore from './shared/appStore';


class MasterExperience extends soundworks.Experience {
  constructor(clientType) {
    super(clientType);
  }

  start() {
    super.start();
  }

  enter(client) {
    super.enter(client);

    this.receive(client, 'project:list', this._onProjectListRequest(client));
    this.receive(client, 'project:delete', this._onProjectDeleteRequest(client));
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
      hasDesigner: false,
      clients: [],
    };

    // handle designer
    const designer = appStore.getProjectDesigner(project);

    if (designer !== null) {
      const client = {
        type: 'designer',
        uuid: designer.uuid,
      };

      serialized.hasDesigner = true;
      serialized.clients.push(client);
    }

    const players = appStore.getProjectPlayers(project);

    players.forEach(player => {
      const client = {
        type: 'player',
        uuid: player.uuid,
      };

      serialized.clients.push(client);
    });

    return serialized;
  }

  /**
   * Send the full list of projects and clients when a master connects
   */
  _onProjectListRequest(client) {
    return () => {
      const projects = appStore.projects;
      const serializedProjectList = [];

      projects.forEach((project) => {
        const serializedProject = this._serializeProject(project);
        serializedProjectList.push(serializedProject);
      });

      console.log(serializedProjectList);

      this.send(client, 'project:list', serializedProjectList);
    }
  }

  _onProjectDeleteRequest(client) {
    return (uuid) => {
      const project = appStore.getProjectByUuid(uuid);

      if (project !== null) {
        appStore.deleteProject(project);
        this.broadcast('master', null, 'project:delete', project);
      }
    }
  }
}

export default MasterExperience;
