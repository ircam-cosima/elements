import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import * as imlMotion from 'iml-motion';
import { labels } from  '../shared/config';
import AudioEngine from '../shared/AudioEngine';

const audioContext = soundworks.audioContext;

const viewTemplate = `
  <label class="select-container">Session:
    <select id="select-model">
      <% for (var uuid in models) { %>
      <option value="<%= uuid %>">
        <%= models[uuid].username %>
      </option>
      <% } %>
    </select>
  </label>

  <div class="toggle-container" id="mute">
    <div class="toggle-btn"><div></div></div> Mute
  </div>
  <div class="toggle-container" id="intensity">
    <div class="toggle-btn"><div></div></div> Intensity
  </div>
`;

class PlayerView extends soundworks.View {
  constructor(template, content, events, options) {
    super(template, content, events, options);

    this._muteCallback = () => {};
    this._intensityCallback = () => {};
    this._modelChangeCallback = () => {};

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
      'change #select-model': () => {
        const value = this.$selectModel.value;
        this._modelChangeCallback(value);
      },
    });
  }

  onRender() {
    super.onRender();

    this.$muteBtn = this.$el.querySelector('#mute');
    this.$intensityBtn = this.$el.querySelector('#intensity');
    this.$selectModel = this.$el.querySelector('#select-model');
  }

  setMuteCallback(callback) {
    this._muteCallback = callback;
  }

  setIntensityCallback(callback) {
    this._intensityCallback = callback;
  }

  setModelChangeCallback(callback) {
    this._modelChangeCallback = callback;
  }

  setModelItem(item) {
    this.$selectModel.value = item;
  }
}


class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: labels,
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    // this.rawSocket = this.require('raw-socket');

    this.labels = Object.keys(labels);
    this.likeliest = undefined;

    this.models = null;
    this.currentModelId = null;
    this.enableIntensity = false;
    this._sensitivity = 1;


    this._onReceiveModels = this._onReceiveModels.bind(this);
    this._onModelChange = this._onModelChange.bind(this);
    this._feedDecoder = this._feedDecoder.bind(this);
    this._updateIntensity = this._updateIntensity.bind(this);
    this._onMuteToggle = this._onMuteToggle.bind(this);
    this._onIntensityToggle = this._onIntensityToggle.bind(this);
  }

  start() {
    super.start(); // don't forget this

    this.receive('models', this._onReceiveModels);

    // rendering
    this.view = new PlayerView(viewTemplate, { models: null }, {}, {
      className: 'player'
    });

    this.view.setModelChangeCallback(this._onModelChange);
    this.view.setMuteCallback(this._onMuteToggle);
    this.view.setIntensityCallback(this._onIntensityToggle);

    this.audioEngine = new AudioEngine(this.audioBufferManager.data);

    // lfo preprocessing
    this.processedSensors = new imlMotion.ProcessedSensors();
    this.processedSensors.addListener(data => {
      this._feedDecoder(data);
      this._updateIntensity(data[0]);
    });

    this.xmmDecoder = new imlMotion.XmmProcessor({ url: null });
    this.xmmDecoder.setConfig({ likelihoodWindow: 20 });

    this.sharedParams.addParamListener('sensitivity', value => {
      this._sensitivity = value;
    });

    Promise.all([this.show(), this.processedSensors.init()])
      .then(() => {
        this.audioEngine.start();
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

  _onReceiveModels(models) {
    const uuids = Object.keys(models);

    if (uuids.length > 0) {
      this.models = models;
      this.view.model.models = this.models;
      this.view.render('.select-container');

      const index = uuids.indexOf(this.currentModelId);

      if (this.currentModelId && index !== -1)
        this.currentModelId = uuids[index];
      else
        this.currentModelId = uuids[0];

      this.view.setModelItem(this.currentModelId);

      const model = this.models[this.currentModelId].model;
      this.xmmDecoder.setModel(model);
    }
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

  _onModelChange(value) {
    const model = this.models[value].model;

    this.currentModelId = value;
    this.xmmDecoder.setModel(model);
  }

  _onMuteToggle(bool) {
    this.audioEngine.mute = bool;
  }

  _onIntensityToggle(bool) {
    this.enableIntensity = bool;
  }
};

export default PlayerExperience;
