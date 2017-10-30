import { client } from 'soundworks/client';
import BaseModule from '../BaseModule';
import AudioControlView from './AudioControlView';
import merge from 'lodash.merge';

const MODULE_ID = 'audio-control';

class AudioControlModule extends BaseModule {
  constructor(experience, options = {}) {
    super(MODULE_ID, experience);

    this.options = Object.assign({
      showView: true,
      viewContainer: '#audio-control',
    }, options)

    this.allowedActions = [
      'add-player-to-project',
      'update-player-param',
    ];

    if (this.options.showView) {
      this.view = new AudioControlView();
      this.view.request = (type, payload) => {
        payload.uuid = client.uuid;
        const action = { type, payload };

        this.request(action);
      }
    }
  }

  show() {
    super.show();

    if (this.view) {
      this.view.render();
      this.view.show();

      const $container = this.experience.getContainer(this.options.viewContainer);

      if ($container)
        this.view.appendTo($container);
      else
        throw new Error(`Invalid view container "${this.options.viewContainer}"`);
    }
  }

  hide() {
    super.hide();

    if (this.view)
      this.view.remove();
  }

  dispatch(action) {
    const { type, payload } = action;
    let audioParams;

    switch (type) {
      case 'add-player-to-project':
        audioParams = payload.player.params.audio;
        break;
      case 'update-player-param': {
        audioParams = payload.params.audio;
        break;
      }
    }

    // update audio rendering
    if (audioParams.mute)
      this.experience.mute.gain.value = 0;
    else
      this.experience.mute.gain.value = 1;

    // update view
    if (this.view) {
      merge(this.view.model, audioParams);
      this.view.render();
    }
  }
}

export default AudioControlModule;
