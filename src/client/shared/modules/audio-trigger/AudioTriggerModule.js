import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';
import { audioContext } from 'soundworks/client';
import SampleSynth from '../../audio/SampleSynth';

const MODULE_ID = 'audio-trigger';

class AudioTriggerModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.subscriptions = [
      'trigger-audio',
    ];

    this.sampleSynth = new SampleSynth();
    this.sampleSynth.connect(audioContext.destination)
  }


  dispatch(action) {
    const { type, payload } = action;
    const { kind, label } = payload;

    switch (kind) {
      case 'ui': {
        const buffer = this.experience.audioBufferManager.data.uiSounds[label];
        this.sampleSynth.trigger(buffer);
        break;
      }
    }
  }
}

moduleManager.register(MODULE_ID, AudioTriggerModule);

export default AudioTriggerModule;
