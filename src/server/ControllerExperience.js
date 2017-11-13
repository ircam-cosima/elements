import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';


class ControllerExperience extends Experience {
  constructor(clientType, config, presets, comm) {
    super(clientType);

    this.config = config;
    this.comm = comm;

    // define if we need the `rawSocket` service
    this.streamSensors = false;

    for (let name in presets) {
      const preset = presets[name];
      const modules = Object.keys(preset);

      if (modules.indexOf('stream-sensors') !== -1)
        this.streamSensors = true;
    }

    if (this.streamSensors) {
      this.rawSocket = this.require('raw-socket', {
        protocol: { channel: 'sensors', type: 'Float32' },
      });
    }
  }

  start() {
    super.start();

    appStore.addListener((channel, ...args) => {
      switch (channel) {
        case 'add-player-to-project':
        case 'remove-player-from-project': {
          const [player, project] = args;
          const action = {
            type: channel,
            payload: {
              player: player.serialize(),
              project: project.serialize(),
            },
          };

          this.dispatch(action, this.clients);
          break;
        }
        case 'create-project': {
          const [project] = args;
          const createProjectAction = {
            type: 'create-project',
            payload: project.serialize(),
          };

          this.dispatch(createProjectAction, this.clients);

          const projectsDetails = appStore.projects.serialize();
          const projectsOverview = appStore.projects.overview();
          const listProjectOverviewAction = {
            type: 'list-project',
            payload: { projectsDetails, projectsOverview },
          };

          this.dispatch(listProjectOverviewAction, this.clients);
          break;
        }
        case 'delete-project': {
          const [project] = args;
          const deleteProjectAction = {
            type: 'delete-project',
            payload: project.serialize(),
          };

          this.dispatch(deleteProjectAction, this.clients);

          const projectsDetails = appStore.projects.serialize();
          const projectsOverview = appStore.projects.overview();
          const listProjectOverviewAction = {
            type: 'list-project',
            payload: { projectsDetails, projectsOverview },
          };

          this.dispatch(listProjectOverviewAction, this.clients);
          break;
        }
        case 'update-player-param': {
          const [player] = args;
          const action = {
            type: 'update-player-param',
            payload: player.serialize(),
          }

          this.dispatch(action, this.clients);
          break;
        }
        case 'update-model':
        case 'update-project-param': {
          const [project] = args;
          const action = {
            type: 'update-project-param',
            payload: project.serialize(),
          };

          this.dispatch(action, this.clients);
          break;
        }
      }
    });
  }

  enter(client) {
    super.enter(client);

    this.receive(client, 'request', this.request(client));
  }

  exit(client) {
    super.exit(client);
  }

  dispatch(action, clients) {
    const actionType = action.type;

    if (typeof clients.forEach === 'function') {
      clients.forEach(client => this.send(client, `dispatch`, action));
    } else {
      const client = clients;
      this.send(client, `dispatch`, action);
    }
  }

  request(client) {
    return action => {
      const { type, payload } = action;

      switch (type) {
        case 'init-list-project': {
          const projectsDetails = appStore.projects.serialize();
          const projectsOverview = appStore.projects.overview();
          action.payload = { projectsDetails, projectsOverview };
          this.dispatch(action, client);
          break;
        }
        case 'create-project': {
          const name = payload.name;
          const project = appStore.projects.getByName(name);

          if (project === null)
            appStore.createProject(name);

          break;
        }
        case 'delete-project': {
          const uuid = payload.uuid;
          const project = appStore.projects.get(uuid);
          appStore.deleteProject(project);
          break;
        }
        case 'add-player-to-project': {
          const player = appStore.players.get(payload.playerUuid);
          const project = appStore.projects.get(payload.projectUuid);
          appStore.removePlayerFromProject(player, player.project);
          appStore.addPlayerToProject(player, project);
          break;
        }
        case 'update-player-param': {
          const { uuid, name, value } = payload;
          const player = appStore.players.get(uuid);
          appStore.updatePlayerParam(player, name, value);
          break;
        }
        case 'update-project-param': {
          const { uuid, name, value } = payload;
          const project = appStore.projects.get(uuid);
          appStore.updateProjectParam(project, name, value);
          break;
        }
        case 'update-project-ml-preset': {
          const { uuid, name } = payload;
          const project = appStore.projects.get(uuid);
          appStore.updateProjectMLPreset(project, name);
          break;
        }
        case 'clear-examples': {
          const { uuid, label } = payload;
          const project = appStore.projects.get(uuid);
          appStore.clearExamplesFromProject(label, project);
          break;
        }
        case 'clear-all-examples': {
          const { uuid } = payload;
          const project = appStore.projects.get(uuid);
          appStore.clearAllExamplesFromProject(project);
          break;
        }

      }
    }
  }
}

export default ControllerExperience;
