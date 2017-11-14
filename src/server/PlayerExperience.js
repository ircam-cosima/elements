import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

class PlayerExperience extends Experience {
  constructor(clientTypes, config, presets, comm) {
    super(clientTypes);

    this.config = config;
    this.presets = presets;
    this.comm = comm;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.checkin = this.require('checkin');

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

    this.subscriptions = new Map();
  }

  start() {
    super.start();

    appStore.addListener((channel, ...args) => {
      switch (channel) {
        case 'add-player-to-project': {
          const [player, project] = args;
          const action = {
            type: 'add-player-to-project',
            payload: {
              player: player.serialize(),
              project: project.serialize(),
            },
          };

          this.dispatch(action, player.client);
          break;
        }
        case 'remove-player-from-project': {
          const [player, project] = args;
          const action = {
            type: 'remove-player-from-project',
            payload: {
              player: player.serialize(),
              project: project.serialize(),
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
        case 'update-project-param': {
          const [project] = args;
          const action = {
            type: 'update-project-param',
            payload: project.serialize(),
          };

          const clients = project.players.getClients();
          this.dispatch(action, clients);
          break;
        }
        case 'update-model': {
          const [project, model] = args;
          const action = {
            type: 'update-model',
            payload: project.serialize(),
          };

          const clients = project.players.getClients();
          this.dispatch(action, clients);
          break;
        }
        case 'create-project': {
          const action = {
            type: 'list-project-overview',
            payload: appStore.projects.overview(),
          }

          const clients = this.subscriptions.get('list-project-overview');
          this.dispatch(action, clients);
          break;
        }
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
    const preset = this.presets[client.type];
    appStore.registerPlayer(client, preset);

    this.receive(client, 'subscribe', this.subscribe(client));
    this.receive(client, 'unsubscribe', this.unsubscribe(client));
    this.receive(client, 'request', this.request(client));

    // create sensor and decoding chain (is common to every player)
    if (this.streamSensors)
      this.initializeSensorStreaming(client);
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
          const { projectUuid } = payload;
          // @todo - allow request by name
          const project = appStore.projects.get(projectUuid);
          appStore.removePlayerFromProject(player, player.project);
          appStore.addPlayerToProject(player, project);
          break;
        }
        case 'update-player-param': {
          const { uuid, name, value } = payload;
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
        case 'create-project': {
          const { name } = payload;
          // test is project already exists
          let project = appStore.projects.getByName(name);

          if (project !== null) {
            appStore.removePlayerFromProject(player, player.project);
            appStore.addPlayerToProject(player, project);
          } else {
            appStore.createProject(name)
              .then(project => {
                appStore.removePlayerFromProject(player, player.project);
                appStore.addPlayerToProject(player, project);
              })
              .catch(err => console.error(err.stack));
          }
          break;
        }
      }
    }
  }

  dispatch(action, clients = null) {
    const actionType = action.type;

    if (this.subscriptions.has(actionType)) {
      const subscribedClients = this.subscriptions.get(actionType);

      if (!('forEach' in clients))
        clients = [clients];

      clients.forEach(client => {
        if (subscribedClients.has(client))
          this.send(client, 'dispatch', action);
      });
    }
  }

  initializeSensorStreaming(client) {
    this.rawSocket.receive(client, 'sensors', data => {
      this.comm.emit('sensors', data);
    });
  }
}

export default PlayerExperience;
