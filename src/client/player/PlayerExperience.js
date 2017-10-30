import * as soundworks from 'soundworks/client';
// for testing purpose
import WhiteNoiseSynth from '../shared/audio/WhiteNoiseSynth';

const audioContext = soundworks.audioContext;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="main-content">

      <div id="audio-control"></div>
      <div id="recording-control"></div>
    </div>
  </div>
`;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(config, modules = []) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin');
    // this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      // should be loaded when the project is chosen
      // files: { triggers, labels, uiSounds },
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.mute = audioContext.createGain();
    this.mute.connect(audioContext.destination);
    // mute by default, let the AudioControl module handle the rest
    this.mute.gain.value = 0;

    this.master = audioContext.createGain();
    this.master.connect(this.mute);
    this.master.gain.value = 1;

    /**
     * Instanciate and install modules required by the role of the client.
     * Role could be defined according to a hash in url.
     */
    this.modules = new Set();
    // @todo - should be able to pass options to each modules
    modules.forEach(ctor => {
      const module = new ctor(this);
      this.modules.add(module);
    });
  }

  start() {
    super.start();

    // initialize the view / allow for canvas rendering
    this.view = new soundworks.CanvasView(template, {}, {}, {
      id: 'player',
      ratios: { '.main-content': 1 },
    });

    const synth = new WhiteNoiseSynth();
    synth.connect(this.getAudioOutput());
    synth.start();

    this.modules.forEach(module => module.start());

    this.show().then(() => {
      this.modules.forEach(module => module.show());
    });
  }

  stop() {
    this.modules.forEach(module => module.stop());
  }

  getContainer(selector = '.main-content') {
    return this.view.$el.querySelector(selector);
  }

  getAudioOutput() {
    return this.master;
  }
}

export default PlayerExperience;
