import BaseModule from '../BaseModule';
import appStore from '../../appStore';

const MODULE_ID = 'recording-control';

class RecordingControlModule extends BaseModule {
  constructor(experience) {
    super(MODULE_ID, experience);

    this.allowedActions = [
      'add-player-to-project',
      'update-player-param',
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
        case 'update-player-param': {
          const [player] = args;
          const action = {
            type: 'update-player-param',
            payload: player.serialize(),
          };

          this.dispatch(action, player.client);
          break;
        }
      }
    });

  }

  request(action) {
    const { type, payload } = action;

    switch (type) {
      case 'update-player-param': {
        const { uuid, name, value } = payload;
        const player = appStore.players.get(uuid);
        appStore.updatePlayerParam(player, name, value);
        break;
      }
    }
  }
}

export default RecordingControlModule;
