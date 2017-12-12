import { Experience } from 'soundworks/client';
import ControllerView from './ControllerView';


class ControllerExperience extends Experience {
  constructor(config) {
    super();

    this.config = config;

    this.dispatch = this.dispatch.bind(this);

    // define if we need the `rawSocket` service
    const presets = config.presets;
    this.streams = false;
    this.buffer = null;

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

    this.receive('dispatch', this.dispatch);

    const action = {
      type: 'init-list-project',
      payload: null,
    };

    this.request(action);

    // initialize the view / allow for canvas rendering
    this.view = new ControllerView();
    this.view.request = (type, payload) => {
      const action = { type, payload };
      this.request(action);
    };

    if (this.streams) {
      this.rawSocket.receive('sensors', data => {
        if (!this.buffer)
          this.buffer = new Float32Array(data.length - 1);

        const playerIndex = data[0];

        for (let i = 0; i < this.buffer.length; i++)
          this.buffer[i] = data[i + 1];

        this.view.processSensorsStream(playerIndex, this.buffer);
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
      case 'update-model':
      case 'update-project-param': {
        const project = payload;
        this.view.updateProject(project);
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
      default: {
        throw new Error(`Invalid action ${type}`);
        break;
      }
    }
  }
}

export default ControllerExperience;
