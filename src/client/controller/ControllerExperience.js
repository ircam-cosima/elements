import * as soundworks from 'soundworks/client';
import ControllerView from './ControllerView';

const template = ``;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class ControllerExperience extends soundworks.Experience {
  constructor(config) {
    super();

    this.config = config;

    this.dispatch = this.dispatch.bind(this);
  }

  start() {
    super.start();

    this.receive('dispatch', this.dispatch);

    const action = {
      type: 'list-project',
      payload: null,
    };

    this.request(action);

    // initialize the view / allow for canvas rendering
    this.view = new ControllerView(template, {}, {}, { id: this.id });
    this.view.request = (type, payload) => {
      const action = { type, payload };
      this.request(action);
    };

    this.show();
  }

  stop() {}

  request(action) {
    this.send('request', action);
  }

  dispatch(action) {
    const { type, payload } = action;

    switch (type) {
      case 'list-project': {
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
      default: {
        throw new Error(`Invalid action ${type}`);
        break;
      }
    }
  }
}

export default ControllerExperience;
