import * as soundworks from 'soundworks/client';

import { triggers } from '../../shared/config/audio';

import AmbienceView from './AmbienceView';

const audioContext = soundworks.audioContext;
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

    for(let label in triggers ) {
      console.log(label);
    }

    this.bufferSources = {};

  }

  start() {
    super.start();

    this.view = new AmbienceView({
        title: 'Ambience',
      }, {}, {
        id: client.type,
      });

    this.show();
  }

  play(label) {

    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    const trigger = this.audioBufferManager.data[label];

    src.buffer = trigger.paths[0];
    src.loop = trigger.loop;

    src.start(audioContext.currentTime);

    this.bufferSources[label] = src;
  }

  stop(label) {
    const src = this.bufferSources[label];
    if(src) {
      src.stop(0);
    }
  }

}

export default AmbienceExperience;
