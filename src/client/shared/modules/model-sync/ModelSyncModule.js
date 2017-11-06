import BaseModule from '../BaseModule';
import ModelSyncView from './ModelSyncView';

const MODULE_ID = 'model-sync';

class ModelSyncModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.subscriptions = [
      'add-player-to-project',
      'update-model',
    ];

    this.view = new ModelSyncView();
  }

  show() {
    this.view.render();
    this.view.show();
    this.view.appendTo(this.experience.getContainer('#model-sync'));
  }

  dispatch(action) {
    const { type, payload } = action;
    let model = null;

    switch (type) {
      case 'add-player-to-project':
        model = payload.model;
        break;
      case 'update-model':
        model = payload;
        break;
    }

    this.experience.xmmDecoder.setModel(model);
    this.view.model.state = 'notification';
    this.view.render();
  }
}

export default ModelSyncModule;
