import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import { PhraseRecorderLfo, XmmDecoderLfo } from 'xmm-lfo';

import AudioEngine from '../shared/AudioEngine';
import AutoMotionTrigger from '../shared/AutoMotionTrigger';
import DesignerView from './DesignerView';
import FeaturizerLfo from '../shared/FeaturizerLfo';
import LikelihoodsRenderer from '../shared/LikelihoodsRenderer';
import SimpleLogin from '../shared/services/SimpleLogin';
import { sounds } from  '../shared/config';

const audioContext = soundworks.audioContext;

class DesignerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.login = this.require('simple-login');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: sounds,
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.labels = Object.keys(sounds);
    this.likeliest = undefined;

    this.assetsDomain = assetsDomain;

    this._onConfigUpdate = this._onConfigUpdate.bind(this);
    this._onRecord = this._onRecord.bind(this);
    this._onClearLabel = this._onClearLabel.bind(this);
    this._onClearModel = this._onClearModel.bind(this);
    this._onReceiveModel = this._onReceiveModel.bind(this);
    this._onModelFilter = this._onModelFilter.bind(this);

    this._startRecording = this._startRecording.bind(this);
    this._stopRecording = this._stopRecording.bind(this);
    this._motionCallback = this._motionCallback.bind(this);
    this._intensityCallback = this._intensityCallback.bind(this);
    this._mute = this._mute.bind(this);

    this._persistUser = this._persistUser.bind(this);
    this._deleteUser = this._deleteUser.bind(this);
  }

  start() {
    super.start(); // don't forget this

    const autoTriggerDefaults = {
      highThreshold: 0.7,
      lowThreshold: 0.2,
      offDelay: 500,
    }

    this.view = new DesignerView({
        sounds: sounds,
        assetsDomain: this.assetsDomain,
        record: autoTriggerDefaults,
      }, {}, {
        preservePixelRatio: true,
        className: 'designer',
        ratios: { '.content': 1 },
      }
    );

    this.view.setConfigCallback(this._onConfigUpdate);
    this.view.setRecordCallback(this._onRecord);
    this.view.setClearLabelCallback(this._onClearLabel);
    this.view.setClearModelCallback(this._onClearModel);
    this.view.setMuteCallback(this._mute);
    this.view.setPersistUserCallback(this._persistUser);
    this.view.setDeleteUserCallback(this._deleteUser);

    // rendering
    this.renderer = new LikelihoodsRenderer(this.view);
    this.audioEngine = new AudioEngine(this.audioBufferManager.data);

    // lfo chain
    this.devicemotionIn = new lfo.source.EventIn({
      frameType: 'vector',
      frameSize: 3, // 6,
      frameRate: 1, // this.motionInput.period doesn't seem available anymore
      description: ['accelGravX', 'accelGravY', 'accelGravZ'], // 'gyrAlpha', 'gyrBeta', 'gyrGamma']
    });

    this.featurizer = new FeaturizerLfo({
      descriptors: [ 'accIntensity' ],
      callback: this._intensityCallback
    });

    this.phraseRecorder = new PhraseRecorderLfo({
      columnNames: ['accelGravX', 'accelGravY', 'accelGravZ'],
                     // 'rotAlpha', 'rotBeta', 'rotGamma']
    });

    this.onOffDecoder = new lfo.operator.OnOff();
    this.onOffDecoder.setState('on');
    this.xmmDecoder = new XmmDecoderLfo({
      likelihoodWindow: 20,
      callback: this._onModelFilter
    });

    this.devicemotionIn.connect(this.featurizer);
    this.devicemotionIn.connect(this.phraseRecorder);
    this.devicemotionIn.connect(this.onOffDecoder);
    this.onOffDecoder.connect(this.xmmDecoder);

    this.autoTrigger = new AutoMotionTrigger({
      highThreshold: autoTriggerDefaults.highThreshold,
      lowThreshold: autoTriggerDefaults.lowThreshold,
      offDelay: autoTriggerDefaults.offDelay,
      startCallback: this._startRecording,
      stopCallback: this._stopRecording,
    });

    this.receive('model', this._onReceiveModel);

    this.show().then(() => {
      this.devicemotionIn.start();

      // init rendering
      this.view.addRenderer(this.renderer);
      this.view.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

      this.audioEngine.start();

      if (this.motionInput.isAvailable('devicemotion'))
        this.motionInput.addListener('devicemotion', this._motionCallback);
    });
  }

  _onConfigUpdate(type, xmmConfig, recordConfig) {
    this.send('configuration', { type: type, config: xmmConfig });

    this.autoTrigger.highThreshold = recordConfig.highThreshold;
    this.autoTrigger.lowThreshold = recordConfig.lowThreshold;
    this.autoTrigger.offDelay = recordConfig.offDelay;
  }

  _onRecord(cmd) {
    switch (cmd) {
      case 'arm':
        this.autoTrigger.setState('on');
        break;
      case 'stop':
        this._stopRecording();
        break;
    }
  }

  _startRecording() {
    // set to play currently selected sound by interrupting recognition
    // and forcing current label
    this.onOffDecoder.setState('off');

    this.likeliest = this.view.getCurrentLabel();
    const labelIndex = this.labels.indexOf(this.likeliest);
    this.audioEngine.fadeToNewSound(labelIndex);

    // start recording
    this.phraseRecorder.start();
    this.view.startRecording();
  }

  _stopRecording() {
    // stop recording
    this.phraseRecorder.stop();
    // enable recognition back
    this.onOffDecoder.setState('on');

    this.view.stopRecording();
    this.autoTrigger.setState('off');

    this.view.confirm('send').then(() => {
      const label = this.view.getCurrentLabel();
      this.phraseRecorder.setPhraseLabel(label);
      const phrase = this.phraseRecorder.getRecordedPhrase();

      if (phrase.length === 0)
        return;

      this.send('phrase', { cmd: 'add', data: phrase });
    }).catch((err) => {
      if (err instanceof Error)
        console.error(err.stack)
    });
  }

  _onClearLabel(label) {
    // @todo - crashes the server when no label to clear
    this.view.confirm('clear-label', label).then(() => {
      this.send('clear', { cmd: 'label', data: label });
    }).catch(() => {});
  }

  _onClearModel() {
    this.view.confirm('clear-all').then(() => {
      this.send('clear', { cmd: 'model' });
    }).catch(() => {});
  }

  _motionCallback(eventValues) {
    const values = eventValues.slice(0, 3);
    this.devicemotionIn.process(audioContext.currentTime, values);
  }

  _onReceiveModel(model) {
    const config = model ? model.configuration.default_parameters : {};
    config.modelType = config.states ? 'hhmm' : 'gmm';
    this.view.setConfig(config);

    const currentLabels = model.models.map(model => model.label);
    this.view.setCurrentLabels(currentLabels);

    this.xmmDecoder.params.set('model', model);
  }

  _onModelFilter(results) {
    const likelihoods = results ? results.likelihoods : [];
    const likeliest = results ? results.likeliestIndex : -1;
    const label = results ? results.likeliest : null;
    // const alphas = results ? results.alphas : [[]];

    const formattedResults = {
      label: label,
      likeliest: likeliest,
      likelihoods: likelihoods
    };

    this.renderer.setModelResults(formattedResults);

    if (this.likeliest !== label) {
      this.likeliest = label;

      const index = this.labels.indexOf(label);
      this.audioEngine.fadeToNewSound(index);
      console.log(`gesture changed to: ${label}`);
    }
  }

  _intensityCallback(values) {
    this.autoTrigger.push(values[0]);
    this.audioEngine.setGainFromIntensity(values[0]);
  }

  _mute(mute) {
    this.audioEngine.mute = mute;
  }

  _persistUser() {
    this.send('persist-user');
  }

  _deleteUser() {
    this.send('delete-user');
  }
};

export default DesignerExperience;
