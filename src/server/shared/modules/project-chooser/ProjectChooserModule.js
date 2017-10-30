import BaseModule from '../BaseModule';
import appStore from '../../appStore';


const MODULE_ID = 'project-chooser';

class ProjectChooserModule extends BaseModule {
  constructor(experience) {
    super(MODULE_ID, experience);

    this.allowedActions = [
      'list-project-overview',
      'add-player-to-project',
    ];

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

  request(action, client) {
    switch (action.type) {
      case 'list-project-overview': {
        action.payload = appStore.projects.overview();
        this.dispatch(action, client);
        break;
      }

      case 'add-player-to-project': {
        const player = appStore.players.get(client.uuid);
        const project = appStore.projects.get(action.payload.projectUuid);

        appStore.removePlayerFromProject(player, player.project);
        appStore.addPlayerToProject(player, project);
        break;
      }
    }
  }
}

export default ProjectChooserModule;
