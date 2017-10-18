import * as soundworks from 'soundworks/client';

import { triggers } from '../../shared/config/audio';
import { sounds as uiSounds } from '../../shared/config/ui';

import AmbienceView from './AmbienceView';

import TriggerEngine from '../shared/audio/TriggerEngine';

const client = soundworks.client;

class AmbienceExperience extends soundworks.Experience {
  constructor(config, viewOptions) {
    super();

    this.config = config;
    this.viewOptions = viewOptions;

    this.platform = this.require('platform', { features: ['web-audio'] });

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      files: { triggers, uiSounds },
    });

  }

  start() {
    super.start();

    const { triggers, uiSounds } = this.audioBufferManager.data;
    this.triggerEngine = new TriggerEngine(triggers, uiSounds);

    this.receive('audio:trigger', (action, label) => {
      switch (action) {
        case 'start':
          this.triggerEngine.start(label);
          break;
        case 'stop':
          this.triggerEngine.stop(label);
          break;
        default:
          break;
      }
    });

    this.view = new AmbienceView({
        title: 'Ambience',
      }, {}, {
        id: client.type,
      });

    this.show();
  }

}

export default AmbienceExperience;
