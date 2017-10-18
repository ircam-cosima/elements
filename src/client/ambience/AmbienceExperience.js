import * as soundworks from 'soundworks/client';

import { triggers } from '../../shared/config/audio';

import AmbienceView from './AmbienceView';

import TriggerEngine from '../shared/audio/TriggerEngine';

const client = soundworks.client;

class AmbienceExperience extends soundworks.Experience {
  constructor(config, viewOptions) {
    super();

    this.config = config;
    this.viewOptions = viewOptions;

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      files: triggers,
    });

  }

  start() {
    super.start();

    this.triggerEngine = new TriggerEngine(this.audioBufferManager.data);

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
