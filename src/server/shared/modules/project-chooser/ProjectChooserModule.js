import BaseModule from '../BaseModule';
import appStore from '../../appStore';


const MODULE_ID = 'project-chooser';

class ProjectChooserModule extends BaseModule {
  constructor(experience) {
    super(MODULE_ID, experience);

    this.allowedActions = [
      'project-list',
      'select-project',
    ];

    appStore.addListener((channel, ...args) => {
      switch (channel) {
        case 'add-player-to-project': // rename to select-project
          const [player, project] = args;
          const projectOverview = project.getOverview();
          const action = {
            type: 'select-project',
            payload: projectOverview,
          };

          console.log(action);
          this.dispatch(action, player.client);
          break;
      }
    });
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    const player = appStore.players.get(client.uuid);
    appStore.removePlayerFromProject(player, player.project);

    super.exit(client);
  }

  request(action, client) {
    switch (action.type) {
      case 'project-list':
        const projectList = appStore.projects.getOverview();
        action.payload = projectList;

        this.dispatch(action, client);
        break;
      case 'select-project':
        const player = appStore.players.get(client.uuid);
        const project = appStore.projects.get(action.payload.projectUuid);

        appStore.removePlayerFromProject(player, player.project);
        appStore.addPlayerToProject(player, project);
        break;
    }
  }
}

export default ProjectChooserModule;
