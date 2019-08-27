import { Experience, audioContext } from 'soundworks/client';
import ControllerView from './ControllerView';
import AudioRendererHook from './AudioRendererHook';


class ControllerExperience extends Experience {
  constructor(config, clientPresets, projectPresets, audioFiles) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      files: { labels: audioFiles },
    });
    this.syncScheduler = this.require('sync-scheduler');

    if (config.env === 'production') {
      this.auth = this.require('auth');
    }

    this.config = config;
    this.clientPresets = clientPresets;
    this.projectPresets = projectPresets;
    this.audioRendererHooks = {};

    this.dispatch = this.dispatch.bind(this);
    // define if we need the `rawSocket` service
    this.streams = false;
    this.sensorsBuffer = null;

    for (let name in clientPresets) {
      const preset = clientPresets[name];
      const modules = Object.keys(preset);

      if (modules.indexOf('streams') !== -1) {
        this.streams = true;
        this.rawSocket = this.require('raw-socket');
      }
    }
  }

  getAudioOutput() {
    return audioContext.destination;
  }

  start() {
    super.start();

    // initialize the whole thing
    this.receive('dispatch', this.dispatch);

    const action = {
      type: 'init',
      payload: null,
    };

    this.request(action);

    // initialize the view / allow for canvas rendering
    this.view = new ControllerView();
    this.view.model.projectPresets = projectPresets;
    this.view.model.audioFiles = this.audioBufferManager.data.labels;

    this.monitorAudioRequests = {};

    // request server action
    this.view.request = (type, payload) => {
       // store audio duplicated clients to handle project change
      if (type === 'monitor') {
        const { name, value } = payload;

        if (name === 'audio') {
          if (value === true) {
            this.monitorAudioRequests[payload.uuid] = payload;
          } else {
            delete this.monitorAudioRequests[payload.uuid];
          }
        }
      }

      const action = { type, payload };
      this.request(action);
    };

    if (this.streams) {
      this.rawSocket.receive('sensors', data => {
        if (!this.sensorsBuffer) {
          this.sensorsBuffer = new Float32Array(data.length);
        }

        const playerIndex = data[0];

        for (let i = 0; i < this.sensorsBuffer.length; i++) {
          this.sensorsBuffer[i] = data[i + 1];
        }

        this.view.processSensorsStream(playerIndex, this.sensorsBuffer);

        if (this.audioRendererHooks[playerIndex]) {
          this.audioRendererHooks[playerIndex].processSensorsData(this.sensorsBuffer);
        }
      });

      this.receive('decoding', (playerIndex, data) => {
        const likelihoods = data.likelihoods;
        this.view.processLikelihoodsStream(playerIndex, likelihoods);
        //forward to audioRenderer
        if (this.audioRendererHooks[playerIndex]) {
          this.audioRendererHooks[playerIndex].processDecoderOutput(data);
        }
      });
    }

    this.show();
  }

  stop() {}

  request(action) {
    this.send('request', action);
  }

  dispatch(action) {
    const { type, payload } = action;

    switch (type) {
      case 'init': {
        const { projectsDetails, projectsOverview } = payload;

        this.view.model.projectsOverview = projectsOverview;

        projectsDetails.forEach(project => {
          this.view.addProject(project);

          project.players.forEach(player => {
            this.view.addPlayerToProject(player, project.uuid);
          });
        });

        this.view.updateHeader();
        break;
      }
      case 'list-project': {
        const { projectsDetails, projectsOverview } = payload;
        this.view.model.projectsOverview = projectsOverview;

        projectsDetails.forEach(project => {
          project.players.forEach(player => {
            this.view.updatePlayer(player);
          });
        });

        this.view.updateHeader();
        break;
      }
      case 'create-project': {
        const project = payload;
        this.view.addProject(project);
        break;
      }
      case 'delete-project': {
        const project = payload;
        this.view.deleteProject(project);
        break;
      }
      // case 'update-model':
      case 'update-project-param': {
        const project = payload;
        this.view.updateProject(project);
        this.view.updateProjectPlayers(project);
        break;
      }
      case 'add-player-to-project': {
        const { player, project } = payload;
        this.view.addPlayerToProject(player, project);
        this.view.updateHeader();

        if (this.monitorAudioRequests[player.uuid]) {
          // if  player was audio monitored in last project, request again
          this.request({
            type: 'monitor',
            payload: this.monitorAudioRequests[player.uuid],
          });
        }
        break;
      }
      case 'remove-player-from-project': {
        const { player, project } = payload;
        this.view.model.monitoring[player.index] = {};
        this.view.removePlayerFromProject(player, project);
        this.view.updateHeader();
        break;
      }
      case 'update-player-param': {

        const player = payload;
        this.view.updatePlayer(player);
        break;
      }
      case 'update-audio-files': {
        this.view.model.audioFiles = this.audioBufferManager.data.labels;
        projectsDetails.forEach(project => {
          project.players.forEach(player => {
            this.view.updatePlayer(player);
          });
        });
        break;
      }

      case 'monitor': {
        const { uuid, monitorDetails } = payload;
        const player = this.view.model.players.find(p => p.uuid === uuid);

        this.view.model.monitoring[player.index] = monitorDetails;
        this.view.updatePlayer(player);

        if (monitorDetails.audio === true && !this.audioRendererHooks[player.index]) {

          const project = this.view.model.projects.find(p => p.uuid === player.project.uuid);
          const audioRenderer = new AudioRendererHook(this, player, project);
          this.audioRendererHooks[player.index] = audioRenderer;

        } else if (monitorDetails.audio === false && this.audioRendererHooks[player.index]) {
          this.audioRendererHooks[player.index].stop();
          delete this.audioRendererHooks[player.index];
        }
        break;
      }

      case 'unregister-player': {
        const { player } = payload;
        delete this.view.model.monitoring[player.index];

        break;
      }

      default: {
        throw new Error(`Invalid action ${type}`);
        break;
      }
    }

    // handle audio duplication
    // --------------------------------------------------------
    // @clean - define who has the responsibility of checking the
    // data forwarding this is not clear here, and mix between
    // ControllerExperience and AudioRendererHook
    switch (type) {
      case 'update-player-param': {
        const player = payload;

        if (this.audioRendererHooks[player.index]) {
          this.audioRendererHooks[player.index].updatePlayerParams(player);
        }
        break;
      }
      case 'update-project-param': {
        const project = payload;

        project.players.forEach(player => {
          if (this.audioRendererHooks[player.index]) {
            this.audioRendererHooks[player.index].updateProject(project);
          }
        });
        break;
      }
      case 'remove-player-from-project': {
        const { player, project } = payload;

        if (this.audioRendererHooks[player.index]) {
          this.audioRendererHooks[player.index].stop();
          delete this.audioRendererHooks[player.index];
        }
        break;
      }
      case 'update-audio-files': {
        const audioFiles = payload;

        for (let i in this.audioRendererHooks) {
          this.audioRendererHooks[i].updateAudioFiles(audioFiles);
        }
        break;
      }
    }
  }
}

export default ControllerExperience;
