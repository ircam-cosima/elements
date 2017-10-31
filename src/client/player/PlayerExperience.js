import * as soundworks from 'soundworks/client';
import * as mano from 'mano-js';
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

    /**
     * Instanciate and install modules required by the role of the client.
     * Role could be defined according to a hash in url.
     */
    this.modules = new Map();
    // @todo - should be able to pass options to each modules
    modules.forEach(ctor => {
      const mod = new ctor(this);
      this.modules.set(mod.id, mod);
    });
  }

  start() {
    super.start();

    // init view
    this.view = new soundworks.CanvasView(template, {}, {}, {
      id: 'player',
      ratios: { '.main-content': 1 },
    });

    // init audio output chain
    this.mute = audioContext.createGain();
    this.mute.connect(audioContext.destination);
    this.mute.gain.value = 0; // mute by default, see `AudioControlModule`

    this.master = audioContext.createGain();
    this.master.connect(this.mute);
    this.master.gain.value = 1;

    // test synth
    const synth = new WhiteNoiseSynth();
    synth.connect(this.getAudioOutput());
    synth.start();

    // sensors chain and xmm decoder
    this.processedSensors = new mano.ProcessedSensors();
    // this.xmmDecoder = new mano.Processor({});

    Promise.all([this.show(), this.processedSensors.init()])
      .then(() => {
        this.modules.forEach(module => module.start());
        this.modules.forEach(module => module.show());

        this.processedSensors.start();
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
