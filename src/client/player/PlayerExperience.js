import * as soundworks from 'soundworks/client';
import * as mano from 'mano-js';
// for testing purpose
import WhiteNoiseSynth from '../shared/audio/WhiteNoiseSynth';

const audioContext = soundworks.audioContext;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="main-content">
      <% /* @todo - create placeholder dynamically from defined modules */ %>

      <div class="module-container" id="project-params-control"></div>
      <div class="module-container" id="model-sync"></div>
      <div class="module-container" id="project-chooser"></div>
      <div class="module-container" id="audio-control"></div>
      <div class="module-container" id="recording-control"></div>

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


    this.subscriptions = new Map();

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

    this.dispatch = this.dispatch.bind(this);
  }

  start() {
    super.start();

    this.receive('dispatch', this.dispatch);

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
    this.xmmDecoder = new mano.XmmProcessor({ /* @todo: pass options */ });

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

  //
  subscribe(module, actionType) {
    if (!this.subscriptions.has(actionType)) {
      this.subscriptions.set(actionType, new Set());
      this.send('subscribe', actionType);
    }

    const subscribedModules = this.subscriptions.get(actionType);
    subscribedModules.add(module);
  }

  unsubscribe(module, actionType) {
    if (this.subscriptions.has(actionType)) {
      const subscribedModules = this.subscriptions.get(actionType);

      if (subscribedModules.has(module)) {
        subscribedModules.delete(module);

        if (subscribedModules.size === 0) {
          this.send('unsubscribe', actionType);
          this.subscriptions.delete(actionType);
        }
      } else {
        throw new Error(`Invalid unsubscribe call: module ${module.id} did not subscribe to ${actionType}`);
      }
    } else {
      throw new Error(`Invalid unsubscribe call: no module subscribed to ${actionType}`);
    }
  }

  request(action) {
    this.send('request', action);
  }

  dispatch(action) {
    const actionType = action.type;
    const subscribedModules = this.subscriptions.get(actionType);

    subscribedModules.forEach(module => module.dispatch(action));
  }

  //
  getContainer(selector = '.main-content') {
    return this.view.$el.querySelector(selector);
  }

  getAudioOutput() {
    return this.master;
  }

  /**
   * Sometime processedSensors seems to output invalid data, this should not
   * happend but should not crashe the application neither,when this problem is
   * fixed, we will be able to remove that check.
   */
  _checkDataIntegrity(data) {
    for (let i = 0; i < data.length; i++) {
      if (!Number.isFinite(data[i]) && data[i] !== null) {
        this.send('logFaultySensorData', data);
        return false;
      }
    }

    return true;
  }
}

export default PlayerExperience;
