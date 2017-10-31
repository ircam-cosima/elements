import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

class ControllerExperience extends Experience {
  constructor(clientType, config, comm) {
    super(clientType);

    this.config = config;
    this.comm = comm;

    // this.rawSocket = this.require('raw-socket', {
    //   protocol: { channel: 'sensors', type: 'Float32' },
    // });
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

          const listProjectOverviewAction = {
            type: 'list-project-overview',
            payload: appStore.projects.overview(),
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

          const listProjectOverviewAction = {
            type: 'list-project-overview',
            payload: appStore.projects.overview(),
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
        case 'update-project-param':

          break;
        default:

          break;
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
      switch (action.type) {
        case 'list-project': {
          const projectsDetails = appStore.projects.serialize();
          const projectsOverview = appStore.projects.overview();
          action.payload = { projectsDetails, projectsOverview };

          this.dispatch(action, client);
          break;
        }

        case 'add-player-to-project': {
          const player = appStore.players.get(action.payload.playerUuid);
          const project = appStore.projects.get(action.payload.projectUuid);

          appStore.removePlayerFromProject(player, player.project);
          appStore.addPlayerToProject(player, project);
          break;
        }

        case 'update-player-param': {
          const { uuid, name, value } = action.payload;
          const player = appStore.players.get(uuid);

          appStore.updatePlayerParam(player, name, value);
        }
      }
    }
  }
}

export default ControllerExperience;
