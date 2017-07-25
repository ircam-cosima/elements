import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import { XmmDecoderLfo } from 'xmm-lfo';
import { sounds } from  '../shared/config';
import PreProcess from '../shared/PreProcess';
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
      'change #model-select': () => {
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
    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: sounds,
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.labels = Object.keys(sounds);
    this.likeliest = undefined;

    this.models = null;
    this.currentModelId = null;
    this.enableIntensity = false;

    this._onReceiveModels = this._onReceiveModels.bind(this);
    this._onModelChange = this._onModelChange.bind(this);
    this._onModelFilter = this._onModelFilter.bind(this);
    this._motionCallback = this._motionCallback.bind(this);
    this._intensityCallback = this._intensityCallback.bind(this);
    this._onMuteChange = this._onMuteChange.bind(this);
    this._onIntensityChange = this._onIntensityChange.bind(this);
  }

  start() {
    super.start(); // don't forget this

    this.receive('models', this._onReceiveModels);

    // rendering
    this.view = new PlayerView(viewTemplate, { models: null }, {}, {
      className: 'player'
    });

    this.view.setModelChangeCallback(this._onModelChange);
    this.view.setMuteCallback(this._onMuteChange);
    this.view.setIntensityCallback(this._onIntensityChange);

    this.audioEngine = new AudioEngine(this.audioBufferManager.data);
    this.audioEngine.start();

    // lfo preprocessing
    this.xmmDecoder = new XmmDecoderLfo({
      likelihoodWindow: 20,
      callback: this._onModelFilter,
    });
    this.preProcess = new PreProcess(this._intensityCallback);
    this.preProcess.connect(this.xmmDecoder);
    this.preProcess.start();

    if (this.motionInput.isAvailable('devicemotion'))
      this.motionInput.addListener('devicemotion', this._motionCallback);

    // as show can be async, we make sure that the view is actually rendered
    this.show();
  }

  _motionCallback(eventValues) {
    const values = eventValues.slice(0, 3);
    this.preProcess.process(audioContext.currentTime, values);
  }

  _intensityCallback(frame) {
    if (this.enableIntensity)
      this.audioEngine.setGainFromIntensity(frame.data[0]);
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
      this.xmmDecoder.params.set('model', model);
    }
  }

  _onModelFilter(res) {
    const likelihoods = res ? res.likelihoods : [];
    const likeliest = res ? res.likeliestIndex : -1;
    const label = res ? res.likeliest : 'unknown';
    // const alphas = res ? res.alphas : [[]];// res.alphas[likeliest];

    if (this.likeliest !== label) {
      const index = this.labels.indexOf(label);
      this.likeliest = label;
      this.audioEngine.fadeToNewSound(index);

      console.log('changed gesture to : ' + label);
    }
  }

  _onModelChange(value) {
    const model = this.models[this.currentModelId].model;

    this.currentModelId = value;
    this.xmmDecoder.params.set('model', model);
  }

  _onMuteChange(bool) {
    this.audioEngine.mute = bool;
  }

  _onIntensityChange(bool) {
    this.enableIntensity = bool;
  }
};

export default PlayerExperience;
