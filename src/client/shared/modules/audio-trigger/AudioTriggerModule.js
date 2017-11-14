import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';

const MODULE_ID = 'audio-trigger';

class AudioTriggerModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.subscriptions = [
      'trigger-audio',
    ];

    // this.synth =
  }


  dispatch(action) {

    // const { type, payload } = action;

    // const { kind, label,  }
    // kind could be 'ui' or 'env'
    // label is label
    // optionnal `action` : start or stop

  }
}
