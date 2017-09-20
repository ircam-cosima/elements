import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import * as imlMotion from 'iml-motion';
import PlayerView from './PlayerView';
import { labels } from  '../shared/config';
import AudioEngine from '../shared/AudioEngine';
import ProjectChooser from '../shared/services/ProjectChooser';

const audioContext = soundworks.audioContext;

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

    this._feedIntensity = this._feedIntensity.bind(this);
    this._feedDecoder = this._feedDecoder.bind(this);
    this._updateModel = this._updateModel.bind(this);
    this._updateParams = this._updateParams.bind(this);
    this._updateParamRequest = this._updateParamRequest.bind(this);
    this._openProjectChooser = this._openProjectChooser.bind(this);
  }

  start() {
    super.start();

    this.receive('model:update', this._updateModel);
    this.receive('params:update', this._updateParams);

    this.view = new PlayerView({
      likeliest: '',
    }, {}, { id: 'player' });

    this.view.setUpdateParamCallback(this._updateParamRequest)
    this.view.setSwitchProjectCallback(this._openProjectChooser);

    this.audioEngine = new AudioEngine(this.audioBufferManager.data);

    // lfo preprocessing
    this.processedSensors = new imlMotion.ProcessedSensors();
    this.processedSensors.addListener(data => {
      this._feedDecoder(data);
      this._feedIntensity(data[0]);
    });

    this.xmmDecoder = new imlMotion.XmmProcessor({ url: null });
    this.xmmDecoder.setConfig({ likelihoodWindow: 20 });

    Promise.all([this.show(), this.processedSensors.init()])
      .then(() => {
        this.audioEngine.start();
        this.processedSensors.start();
      })
      .catch(err => console.error(err.stack));
  }

  _updateModel(model) {
    if (model !== null)
      this.xmmDecoder.setModel(model);
  }

  _openProjectChooser() {
    this.projectChooser.show();
  }

  _updateParamRequest(paramName, value) {
    this.send('param:update', paramName, value);
  }

  _updateParams(params) {
    this.audioEngine.mute = params.mute;
    this.enableIntensity = params.intensity;
    this.view.updateParams(params);
  }

  _feedIntensity(value) {
    if (this.enableIntensity)
      this.audioEngine.setGainFromIntensity(value * 100 * this._sensitivity);
    else
      this.audioEngine.setGainFromIntensity(1);
  }

  _feedDecoder(data) {
    const res = this.xmmDecoder.run(data);
    const label = res ? res.likeliest : 'unknown';

    if (this.likeliest !== label) {
      const index = this.labels.indexOf(label);
      this.likeliest = label;
      this.audioEngine.fadeToNewSound(index);

      this.view.model.likeliest = label;
      this.view.render('#likeliest')
    }
  }
};

export default PlayerExperience;
