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

    // let the view build the request for now...
    this.view.request = (type, payload) => {
      const action = { type, payload };
      this.request(action);
    };


    // this.view.updateClientParam((uuid, name, value) => {

    // });

    // this.view.updateProjectParam((uuid, name, value) => {

    // });

    this.show().then(() => {
      // do something
    });
  }

  stop() {}

  request(action) {
    this.send('request', action);
  }

  dispatch(action) {
    switch (action.type) {
      case 'list-project': {
          const { projectsDetails, projectsOverview } = action.payload;
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
        const { player, project } = action.payload;
        this.view.addPlayerToProject(player, project);
        break;
      }

      case 'remove-player-from-project': {
        const { player, project } = action.payload;
        this.view.removePlayerFromProject(player, project);
        break;
      }

      case 'update-player-param': {
        this.view.updatePlayer(action.payload);
        break;
      }

      default:
        throw new Error(`Invalid action ${action.type}`);
        break;
    }
  }
}

export default ControllerExperience;
