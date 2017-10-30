import { client } from 'soundworks/client';
import BaseModule from '../BaseModule';
import merge from 'lodash.merge';
import RecordingControlView from './RecordingControlView';

const MODULE_ID = 'recording-control';

class RecordingControlModule extends BaseModule {
  constructor(experience, options = {}) {
    super(MODULE_ID, experience);

    this.options = Object.assign({
      viewContainer: '#recording-control',
    }, options);

    this.allowedActions = [
      'add-player-to-project',
      'update-player-param',
    ];

    this.view = new RecordingControlView();
    this.view.request = (type, payload) => {
      payload.uuid = client.uuid;
      const action = { type, payload };

      this.request(action);
    };
  }

  // mano and lfo sensor chain are ready at this point
  // start() {

  // }

  show() {
    this.view.render();
    this.view.show();
    this.view.appendTo(this.experience.getContainer('#recording-control'));
  }

  // hide() {

  // }

  dispatch(action) {
    console.log(action);

    const { type, payload } = action;
    let recordParams;


    switch (type) {
      case 'add-player-to-project':
        this.view.model.labels = Object.keys(payload.project.params.audio);
        recordParams = payload.player.params.record;
        break;
      case 'update-player-param':
        recordParams = payload.params.record;
        break;
    }

    // do whatever must be done on recording chain

    merge(this.view.model, recordParams);
    this.view.render();
  }
}

export default RecordingControlModule;
