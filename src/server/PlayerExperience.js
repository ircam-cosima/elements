import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

class PlayerExperience extends Experience {
  constructor(clientType, config, comm) {
    super(clientType);

    this.config = config;
    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.checkin = this.require('checkin');
    // this.sharedParams = this.require('shared-params');
    // this.playerRegister = this.require('player-register');

    // this.rawSocket = this.require('raw-socket', {
    //   protocol: { channel: 'sensors', type: 'Float32' },
    // });

    this.subscriptions = new Map();
  }

  start() {
    super.start();

    // create sensor and decoding chain (is common to every player)

    appStore.addListener((channel, ...args) => {
      switch (channel) {
        case 'add-player-to-project': {
          const [player, project] = args;
          const action = {
            type: 'add-player-to-project',
            payload: {
              player: player.serialize(),
              project: project.serialize(),
              model: project.model,
            },
          };

          this.dispatch(action, player.client);
          break;
        }

        case 'update-player-param': {
          const [player] = args;
          const action = {
            type: 'update-player-param',
            payload: player.serialize(),
          };

          this.dispatch(action, player.client);
          break;
        }

        case 'update-model': {
          const [project, model] = args;
          const action = {
            type: 'update-model',
            payload: model,
          };

          const clients = project.players.getClients();
          this.dispatch(action, clients);
          break;
        }

        case 'create-project':
        case 'delete-project': {
          const action = {
            type: 'list-project-overview',
            payload: appStore.projects.overview(),
          }

          const clients = this.subscriptions.get('list-project-overview');
          this.dispatch(action, clients);
          break;
        }
      }
    });
  }

  enter(client) {
    super.enter(client);
    appStore.registerPlayer(client);

    this.receive(client, 'subscribe', this.subscribe(client));
    this.receive(client, 'unsubscribe', this.unsubscribe(client));
    this.receive(client, 'request', this.request(client));
  }

  exit(client) {
    appStore.unregisterPlayer(client);
    super.exit(client);
  }

  subscribe(client) {
    return actionType => {
      if (!this.subscriptions.has(actionType))
        this.subscriptions.set(actionType, new Set());

      const subscribedClients = this.subscriptions.get(actionType);
      subscribedClients.add(client);
    }
  }

  unsubscribe(client) {
    return actionType => {
      if (this.subscriptions.has(actionType)) {
        const subscribedClients = this.subscriptions.get(actionType);
        subscribedClients.delete(client);

        if (subscribedClients.size === 0)
          this.subscriptions.delete(actionType);
      }
    }
  }

  request(client) {
    return action => {
      const { type, payload } = action;
      const player = appStore.players.get(client.uuid);

      switch (type) {
        case 'list-project-overview': {
          action.payload = appStore.projects.overview();
          this.dispatch(action, client);
          break;
        }
        case 'add-player-to-project': {
          const project = appStore.projects.get(action.payload.projectUuid);
          appStore.removePlayerFromProject(player, player.project);
          appStore.addPlayerToProject(player, project);
          break;
        }
        case 'update-player-param': {
          const { uuid, name, value } = payload;
          appStore.updatePlayerParam(player, name, value);
          break;
        }
        case 'add-example': {
          const { uuid, example } = payload;
          const project = appStore.projects.get(uuid);
          appStore.addExampleToProject(example, project);
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

  dispatch(action, clients = null) {
    const actionType = action.type;

    if (this.subscriptions.has(actionType)) {
      const subscribedClients = this.subscriptions.get(actionType);

      if (!clients.length)
        clients = [clients];

      clients.forEach(client => {
        if (subscribedClients.has(client))
          this.send(client, 'dispatch', action);
      });
    }
  }
}

export default PlayerExperience;
