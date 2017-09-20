import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import * as imlMotion from 'iml-motion';
import PlayerView from './PlayerView';
import { labels } from  '../shared/config';
import AudioEngine from '../shared/AudioEngine';
import ProjectChooser from '../shared/services/ProjectChooser';
import Notification from './Notification';

const audioContext = soundworks.audioContext;

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.streamSensors = false;
    this.labels = Object.keys(labels);
    this.likeliest = undefined;
    this.enableIntensity = false;
    this.sensitivity = 1;

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

    this.rawSocket = this.require('raw-socket');

    this._feedIntensity = this._feedIntensity.bind(this);
    this._feedDecoder = this._feedDecoder.bind(this);
    this._streamSensors = this._streamSensors.bind(this);
    this._updateModel = this._updateModel.bind(this);
    this._updateParams = this._updateParams.bind(this);
    this._updateParamRequest = this._updateParamRequest.bind(this);
  }

  start() {
    super.start();

    this.receive('model:update', this._updateModel);
    this.receive('params:update', this._updateParams);

    this.view = new PlayerView({
      title: '',
      likeliest: '',
    }, {}, { id: 'player' });

    this.view.setUpdateParamCallback(this._updateParamRequest)
    this.view.setSwitchProjectCallback(() => this.projectChooser.show());

    this.audioEngine = new AudioEngine(this.audioBufferManager.data);

    // lfo preprocessing
    this.processedSensors = new imlMotion.ProcessedSensors();
    this.processedSensors.addListener(data => {
      this._feedDecoder(data);
      this._feedIntensity(data[0]);
    });

    this.xmmDecoder = new imlMotion.XmmProcessor({ url: null });
    this.xmmDecoder.setConfig({ likelihoodWindow: 20 });

    // shared parameters mapping
    this.sharedParams.addParamListener('sensitivity', value => {
      this.sensitivity = value;
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

    Promise.all([this.show(), this.processedSensors.init()])
      .then(() => {
        this.audioEngine.start();
        this.processedSensors.start();
      })
      .catch(err => console.error(err.stack));
  }

  _updateModel(params) {
    // needs an explicit call if used after experience initialization
    this.projectChooser.hide();

    this.view.updateProjectName(params.projectName);

    if (params.model !== null) {
      this.xmmDecoder.setConfig(params.config);
      this.xmmDecoder.setModel(params.model);

      if (params.notification) {
        const msg = { msg: 'model updated !' };
        const notification = new Notification(msg);
        notification.render();
        notification.show();
        notification.appendTo(this.view.$el);
      }
    }
  }

  _updateParamRequest(paramName, value) {
    this.send('param:update', paramName, value);
  }

  _updateParams(params) {
    this.audioEngine.mute = params.mute;
    this.enableIntensity = params.intensity;

    // stream sensors to
    if (params.streamSensors !== this.streamSensors) {
      if (params.streamSensors === true)
        this.processedSensors.addListener(this._streamSensors);
      else
        this.processedSensors.removeListener(this._streamSensors);

      this.streamSensors = params.streamSensors;
    }

    this.view.updateParams(params);
  }

  _feedIntensity(value) {
    if (this.enableIntensity)
      this.audioEngine.setGainFromIntensity(value * 100 * this.sensitivity);
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

  _streamSensors(data) {
    this.rawSocket.send('sensors', data);
  }
};

export default PlayerExperience;
