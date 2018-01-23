import { Experience } from 'soundworks/client';
import ControllerView from './ControllerView';
import AudioRendererHook from './AudioRendererHook';


class ControllerExperience extends Experience {
  constructor(config) {
    super();

    this.audioBufferManager = this.require('audio-buffer-manager');
    if (process.ENV === 'como') {
      this.auth = this.require('auth');
    }

    this.config = config;

    this.dispatch = this.dispatch.bind(this);
    // define if we need the `rawSocket` service
    const presets = config.presets;
    this.streams = false;
    this.sensorsBuffer = null;

    for (let name in presets) {
      const preset = presets[name];
      const modules = Object.keys(preset);

      if (modules.indexOf('streams') !== -1) {
        this.streams = true;
        this.rawSocket = this.require('raw-socket');
      }
    }
  }

  start() {
    super.start();

    this.audioRendererHook = new AudioRendererHook(this.audioBufferManager, this.config);

    // initialize the whole thing
    this.receive('dispatch', this.dispatch);

    const action = {
      type: 'init-list-project',
      payload: null,
    };

    this.request(action);

    // initialize the view / allow for canvas rendering
    this.view = new ControllerView();
    // request server action
    this.view.request = (type, payload) => {
      const action = { type, payload };
      this.request(action);
    };

    // request local action
    this.view.requestLocal = (type, payload) => {
      this.requestLocal({ type, payload });
    };

    if (this.streams) {
      this.rawSocket.receive('sensors', data => {
        if (!this.sensorsBuffer)
          this.sensorsBuffer = new Float32Array(data.length - 1);

        const playerIndex = data[0];

        for (let i = 0; i < this.sensorsBuffer.length; i++)
          this.sensorsBuffer[i] = data[i + 1];

        this.view.processSensorsStream(playerIndex, this.sensorsBuffer);
        //forward to audioRenderer
        this.audioRendererHook.processSensorsData(playerIndex, this.sensorsBuffer);
      });

      this.receive('decoding', (playerIndex, data) => {
        const likelihoods = data.likelihoods;
        this.view.processLikelihoodsStream(playerIndex, likelihoods);
        //forward to audioRenderer
        this.audioRendererHook.processDecoderOutput(playerIndex, data);
      });
    }

    this.show();
  }

  stop() {}

  // action that shall not be dispatched to the server
  requestLocal(action) {
    const { type, payload } = action;

    // handle stop duplication
    switch (type) {
      case 'duplicate-audio': {
        const { player, project } = payload;
        this.audioRendererHook.init(player, project);
        break;
      }
      case 'stop-duplicate-audio': {
        this.audioRendererHook.stop();
        break;
      }
    }
  }

  request(action) {
    this.send('request', action);
  }

  dispatch(action) {
    const { type, payload } = action;

    switch (type) {
      case 'init-list-project': {
          const { projectsDetails, projectsOverview } = payload;
          projectsDetails.forEach(project => {
            this.view.model.projectsOverview = projectsOverview;
            this.view.addProject(project);

            project.players.forEach(player => {
              this.view.addPlayerToProject(player, project.uuid);
            });
          });
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
        break;
      }
      case 'add-player-to-project': {
        const { player, project } = payload;
        this.view.addPlayerToProject(player, project);
        break;
      }
      case 'remove-player-from-project': {
        const { player, project } = payload;
        this.view.removePlayerFromProject(player, project);
        break;
      }
      case 'update-player-param': {
        const player = payload;
        this.view.updatePlayer(player);
        break;
      }

      default: {
        throw new Error(`Invalid action ${type}`);
        break;
      }
    }

    // handle audio duplication
    switch (type) {
      case 'update-player-param': {
        this.audioRendererHook.updatePlayerParams(payload.params.audioRendering);
        break;
      }
      case 'update-project-param': {
        this.audioRendererHook.updateProject(payload);
        break;
      }
      case 'remove-player-from-project': {
        const { player, project } = payload;

        if (player.uuid === this.audioRendererHook.player.uuid)
          this.audioRendererHook.stop();
      }
    }
  }
}

export default ControllerExperience;
