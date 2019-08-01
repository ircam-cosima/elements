import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

class ControllerExperience extends Experience {
  constructor(clientType, config, presets, comm) {
    super(clientType);

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.syncScheduler = this.require('sync-scheduler');

    if (config.env === 'production') {
      this.auth = this.require('auth');
    }

    this.config = config;
    this.comm = comm;

    // define if we need the `rawSocket` service
    this.streams = false;
    this.oscStreams = false;

    // store monitoring informations that allows to define the sensors routing
    this.monitorings = {};

    this.defineStreamsRouting = this.defineStreamsRouting.bind(this);

    for (let name in presets) {
      const preset = presets[name];
      const moduleIds = Object.keys(preset);

      if (moduleIds.indexOf('streams') !== -1) {
        this.streams = true;

        this.rawSocket = this.require('raw-socket', {
          protocol: { channel: 'sensors', type: 'Float32' },
        });

        const streamsConfig = preset['streams'];

        if (streamsConfig.osc) {
          if (streamsConfig.osc.sendAddress) {
            this.config.osc.sendAddress = streamsConfig.osc.sendAddress;
          }

          if (streamsConfig.osc.sendPort) {
            this.config.osc.sendPort = streamsConfig.osc.sendPort;
          }

          this.oscStreams = true;
          this.osc = this.require('osc');
        }
      }
    }
  }

  start() {
    super.start();

    if (this.streams) {
      this.comm.addListener('sensors', data => {
        const playerIndex = data[0];

        try {
          // send to the controller who are asking for something
          this.monitorings[playerIndex].monitors.forEach((req, controller) => {
            if (req.sensors || req.audio) {
              this.rawSocket.send(controller, 'sensors', data);
            }
          });

          if (this.oscStreams) {
            this.osc.send('/sensors', Array.from(data));
          }
        } catch(err) {
          console.log('error sensors stream');
          console.log(playerIndex);
          console.error(err.stack);
        }
      });

      this.comm.addListener('decoding', (playerIndex, data) => {
        try {
          // send to the controller who are asking for something
          this.monitorings[playerIndex].monitors.forEach((req, controller) => {
            if (req.decoding || req.audio) {
              this.send(controller, 'decoding', playerIndex, data);
            }
          });

          if (this.oscStreams) {
            this.osc.send('/decoding', JSON.stringify(data));

            const likelihoods = data.likelihoods.slice(0);
            likelihoods.unshift(playerIndex);
            this.osc.send('/likelihoods', likelihoods);

            if (data.timeProgressions) {
              const timeProgressions = data.timeProgressions.slice(0);
              timeProgressions.unshift(playerIndex);
              this.osc.send('/timeProgressions', timeProgressions);
            }
          }
        } catch(err) {
          console.log('error sensors stream');
          console.log(playerIndex);
          console.error(err.stack);
        }
      });
    }

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

        case 'unregister-player': {
          const [player] = args;
          const payload = { player: player.serialize() };

          delete this.monitorings[player.index];

          const action = { type: 'unregister-player', payload };
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
    // @todo
    for (let i in this.monitorings) {
      if (this.monitorings[i].monitors.has(client)) {
        this.monitorings[i].monitors.delete(client);
      }
    }

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
        case 'init': {
          const projectsDetails = appStore.projects.serialize();
          const projectsOverview = appStore.projects.overview();
          action.payload = { projectsDetails, projectsOverview };
          this.dispatch(action, client);
          break;
        }
        case 'create-project': {
          const name = payload.name;
          const preset = payload.preset;
          // cannot create several projects with same name
          const project = appStore.projects.getByName(name);

          if (project === null)
            appStore.createProject(name, preset);

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
        case 'move-all-players-to-project': {
          const project = appStore.projects.get(payload.uuid);
          appStore.moveAllPlayersToProject(project);
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
        case 'trigger-audio': {
          this.comm.emit('trigger-audio', action);
          break;
        }
        case 'monitor': {
          this.defineStreamsRouting(client, payload);
          break;
        }

        case 'mute-all': {
          const mute = payload.mute;
          console.log('mute all', mute);

          appStore.players.forEach(player => {
            appStore.updatePlayerParam(player, 'audioRendering.mute', mute);
          });
        }
      }
    }
  }

  /**
   * Define if a player should stream its sensors, and route them to the
   * proper controller(s)
   * @param {Object} controller - the controller which makes the request
   * @param {Object} action - action descirbing the requested monitoring
   */
  defineStreamsRouting(controller, payload) {
    const { uuid, name, value } = payload;
    const player = appStore.players.get(uuid);

    if (!this.monitorings[player.index]) {
      this.monitorings[player.index] = {
        sensors: false,
        decoding: false,
        monitors: new Map(),
      };
    }

    const monitoringInfos = this.monitorings[player.index];

    if (!monitoringInfos.monitors.has(controller)) {
      monitoringInfos.monitors.set(controller, {});
    }

    const monitorDetails = monitoringInfos.monitors.get(controller);
    monitorDetails[name] = value;

    const currentlyStreamSensors = monitoringInfos.sensors;
    const currentlyStreamDecoding = monitoringInfos.decoding;

    let mustStreamSensors = false;
    let mustStreamDecoding = false;

    monitoringInfos.monitors.forEach((req, controller) => {
      mustStreamSensors = mustStreamSensors || !!(req.audio) || !!(req.sensors);
      mustStreamDecoding = mustStreamDecoding || !!(req.audio) || !!(req.decoding);
    });

    if (currentlyStreamSensors !== mustStreamSensors) {
      appStore.updatePlayerParam(player, 'streams.sensors', mustStreamSensors);
    }

    if (currentlyStreamDecoding !== mustStreamDecoding) {
      appStore.updatePlayerParam(player, 'streams.decoding', mustStreamDecoding);
    }

    monitoringInfos.sensors = mustStreamSensors;
    monitoringInfos.decoding = mustStreamDecoding;

    payload = {
      monitorDetails: monitorDetails,
      uuid: player.uuid,
    };

    const action = { type: 'monitor', payload };
    this.dispatch(action, controller);
  }
}

export default ControllerExperience;
