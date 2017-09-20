import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import * as imlMotion from 'iml-motion';
import { labels } from  '../shared/config';
import AudioEngine from '../shared/AudioEngine';
import ProjectChooser from '../shared/services/ProjectChooser';

const audioContext = soundworks.audioContext;

const viewTemplate = `
  <div class="toggle-container" id="mute">
    <div class="toggle-btn"><div></div></div> Mute
  </div>
  <div class="toggle-container" id="intensity">
    <div class="toggle-btn"><div></div></div> Intensity
  </div>
  <div class="truc" id="notification"></div>
`;

class PlayerView extends soundworks.View {
  constructor(template, content, events, options) {
    super(template, content, events, options);

    this._muteCallback = () => {};
    this._intensityCallback = () => {};

    this.installEvents({
      'touchstart #mute': () => {
        const $btn = this.$muteBtn;
        const active = $btn.classList.contains('active');

        if (!active)
          $btn.classList.add('active');
        else
          $btn.classList.remove('active');

        this._muteCallback(!active);
      },
      'touchstart #intensity': () => {
        const $btn = this.$intensityBtn;
        const active = $btn.classList.contains('active');

        if (!active)
          $btn.classList.add('active');
        else
          $btn.classList.remove('active');

        this._intensityCallback(!active);
      },
    });
  }

  onRender() {
    super.onRender();

    this.$muteBtn = this.$el.querySelector('#mute');
    this.$intensityBtn = this.$el.querySelector('#intensity');
  }

  setMuteCallback(callback) {
    this._muteCallback = callback;
  }

  setIntensityCallback(callback) {
    this._intensityCallback = callback;
  }

  setMuteBtn(bool) {
    const $btn = this.$muteBtn;
    const active = $btn.classList.contains('active');

    if (bool && !active)
      $btn.classList.add('active');
    else if (!bool && active)
      $btn.classList.remove('active');
  }

  setIntensityBtn(bool) {
    const $btn = this.$intensityBtn;
    const active = $btn.classList.contains('active');

    if (bool && !active)
      $btn.classList.add('active');
    else if (!bool && active)
      $btn.classList.remove('active');
  }
}


class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.projectChooser = this.require('project-chooser');
    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: labels,
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.labels = Object.keys(labels);
    this.likeliest = undefined;

    // this.models = null;
    // this.currentModelId = null;
    this.enableIntensity = false;
    this._sensitivity = 1;

    this._updateIntensity = this._updateIntensity.bind(this);
    this._onReceiveModel = this._onReceiveModel.bind(this);
    this._feedDecoder = this._feedDecoder.bind(this);
    this._toggleMute = this._toggleMute.bind(this);
    this._toggleIntensity = this._toggleIntensity.bind(this);
  }

  start() {
    super.start(); // don't forget this

    // rendering
    this.view = new PlayerView(viewTemplate, { models: null }, {}, {
      id: 'player'
    });

    // this.view.setDesignerChangeCallback(this._updateModel);
    this.view.setMuteCallback(this._toggleMute);
    this.view.setIntensityCallback(this._toggleIntensity);

    this.audioEngine = new AudioEngine(this.audioBufferManager.data);

    // lfo preprocessing
    this.processedSensors = new imlMotion.ProcessedSensors();
    this.processedSensors.addListener(data => {
      this._feedDecoder(data);
      this._updateIntensity(data[0]);
    });

    this.xmmDecoder = new imlMotion.XmmProcessor({ url: null });
    this.xmmDecoder.setConfig({ likelihoodWindow: 20 });

    // shared parameters mapping :
    this.sharedParams.addParamListener('sensitivity', value => {
      this._sensitivity = value;
    });

    this.sharedParams.addParamListener('intensityFeedback', value => {
      this.processedSensors.intensity.params.set('feedback', value);
    });

    this.sharedParams.addParamListener('intensityGain', value => {
      this.processedSensors.intensity.params.set('gain', value);
    });

    this.sharedParams.addParamListener('intensityPower', value => {
      this.processedSensors.intensityPower.params.set('exponent', value);
    });

    this.sharedParams.addParamListener('intensityLowClip', value => {
      this.processedSensors.powerClip.params.set('min', value);
      this.processedSensors.powerScale.params.set('inputMin', value);
    });

    this.sharedParams.addParamListener('bandpassGain', value => {
      this.processedSensors.bandpassGain.params.set('factor', value);
    });

    this.receive('model', this._onReceiveModel);

    Promise.all([this.show(), this.processedSensors.init()])
      .then(() => {
        this.audioEngine.start();
        this._toggleMute(true);
        this.view.setMuteBtn(true);
        this.processedSensors.start();
      })
      .catch(err => console.error(err.stack));
  }

  _updateIntensity(value) {
    if (this.enableIntensity)
      this.audioEngine.setGainFromIntensity(value * 100 * this._sensitivity);
    else
      this.audioEngine.setGainFromIntensity(1);
  }

  _onReceiveModel(model) {
    this.xmmDecoder.setModel(model);
  }

  _feedDecoder(data) {
    const res = this.xmmDecoder.run(data);
    const likelihoods = res ? res.likelihoods : [];
    const likeliest = res ? res.likeliestIndex : -1;
    const label = res ? res.likeliest : 'unknown';

    if (this.likeliest !== label) {
      const index = this.labels.indexOf(label);
      this.likeliest = label;
      this.audioEngine.fadeToNewSound(index);

      console.log('changed gesture to : ' + label);
    }
  }

  _toggleMute(bool) {
    this.audioEngine.mute = bool;
  }

  _toggleIntensity(bool) {
    this.enableIntensity = bool;
  }
};

export default PlayerExperience;
