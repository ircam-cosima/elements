import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import * as imlMotion from 'iml-motion';

import DesignerView from './DesignerView';
import ProjectAdmin from '../shared/services/ProjectAdmin';
import AudioEngine from '../shared/AudioEngine';
import GranularAudioEngine from '../shared/GranularAudioEngine';
import AutoMotionTrigger from '../shared/AutoMotionTrigger';
import LikelihoodsRenderer from '../shared/LikelihoodsRenderer';
import { labels, clicks, presets } from '../shared/config';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const autoTriggerDefaults = {
  highThreshold: 0.05,
  lowThreshold: 0.01,
  offDelay: 200,
}

function playSound(buffer) {
  const src = audioContext.createBufferSource();
  src.connect(audioContext.destination);
  src.buffer = buffer;
  src.start(audioContext.currentTime);
}

class DesignerExperience extends soundworks.Experience {
  constructor(config) {
    super();

    this.config = config;
    this.labels = Object.keys(labels);
    this.likeliest = undefined;
    this.likelihoods = [];
    this.sensitivity = 1;

    this.streamSensors = false;

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.projectAdmin = this.require('project-admin');
    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      files: { labels: labels, clicks: clicks }
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.rawSocket = this.require('raw-socket');

    this._updateMLConfig = this._updateMLConfig.bind(this);
    this._onRecord = this._onRecord.bind(this);
    this._onClearLabel = this._onClearLabel.bind(this);
    this._onClearModel = this._onClearModel.bind(this);
    this._startRecording = this._startRecording.bind(this);
    this._stopRecording = this._stopRecording.bind(this);
    this._feedDecoder = this._feedDecoder.bind(this);
    this._feedRecorder = this._feedRecorder.bind(this);
    this._feedIntensity = this._feedIntensity.bind(this);
    this._streamSensors = this._streamSensors.bind(this);

    this._init = this._init.bind(this);
    this._updateParamRequest = this._updateParamRequest.bind(this);
    this._updateParams = this._updateParams.bind(this);
    this._updateProjectConfigRequest = this._updateProjectConfigRequest.bind(this);
    this._updateProjectConfig = this._updateProjectConfig.bind(this);
    this._updateModelRequest = this._updateModelRequest.bind(this);
    this._updateModel = this._updateModel.bind(this);
    this._triggerCommand = this._triggerCommand.bind(this);
  }

  start() {
    super.start();

    this.receive('init', this._init);
    this.receive('params:update', this._updateParams);
    this.receive('config:update', this._updateProjectConfig);
    this.receive('model:update', this._updateModel);
    this.receive('command:trigger', this._triggerCommand);
    this.receive('force:disconnect', () => window.location.reload());

    this.view = new DesignerView({
        sounds: labels,
        assetsDomain: this.config.assetsDomain,
        record: autoTriggerDefaults,
        recBtnState: 0, // 0 is waiting, 1 is armed, 2 is recording, 3 is idle
        presets: presets,
      }, {}, {
        preservePixelRatio: false,
        id: 'designer',
        ratios: { '.content': 1 },
      }
    );

    this.view.setUpdateMLConfigCallback(this._updateMLConfig);
    this.view.setRecordCallback(this._onRecord);
    this.view.setClearLabelCallback(this._onClearLabel);
    this.view.setClearModelCallback(this._onClearModel);

    this.view.setUpdateParamCallback(this._updateParamRequest);
    this.view.setUpdateProjectConfigCallback(this._updateProjectConfigRequest);

    // rendering
    this.renderer = new LikelihoodsRenderer(this.view);

    const buffers = this.audioBufferManager.data.labels;
    this.audioEngine = new AudioEngine(buffers);
    this.previewAudioEngine = new AudioEngine(buffers);
    // this.granularAudioEngine = new GranularAudioEngine(buffers);

    // preprocessing
    this.processedSensors = new imlMotion.ProcessedSensors();

    this.eventIn = new lfo.source.EventIn({
      frameRate: 0,
      frameSize: 8,
      frameType: 'vector',
    });

    this.decoderOnOff = new lfo.operator.OnOff({ state: 'on' });

    this.decoderBridge = new lfo.sink.Bridge({
      processFrame: frame => this._feedDecoder(frame.data),
    });

    this.recorderBridge = new lfo.sink.Bridge({
      processFrame: frame => this._feedRecorder(frame.data),
    });

    this.processedSensors.addListener(data => {
      for (let i = 0; i < data.length; i++) {
        if (!Number.isFinite(data[i]) && data[i] !== null) {
        // if (Number.isNaN(data[i])) {
          this.send('error:input-data', data);
          return;
        }
      }

      this.eventIn.process(null, data);
      this._feedIntensity(data[0]); // audio gain control
      this._feedEnhancedIntensity(data[1]); // thresholded recording control
    });

    this.eventIn.connect(this.decoderOnOff);
    this.decoderOnOff.connect(this.decoderBridge);
    this.eventIn.connect(this.recorderBridge);

    // recording and decoding
    this.trainingData = new imlMotion.TrainingData();

    this.xmmDecoder = new imlMotion.XmmProcessor({ url: this.config.trainUrl });
    this.xmmDecoder.setConfig({ likelihoodWindow: 20 });

    this.autoTrigger = new AutoMotionTrigger({
      highThreshold: autoTriggerDefaults.highThreshold,
      lowThreshold: autoTriggerDefaults.lowThreshold,
      offDelay: autoTriggerDefaults.offDelay,
      startCallback: this._startRecording,
      stopCallback: this._stopRecording,
    });

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

    // this.audioEngine.start();
    // this.granularAudioEngine.start();

    Promise.all([this.show(), this.eventIn.init(), this.processedSensors.init()])
      .then(() => {
        this.view.addRenderer(this.renderer);
        this.view.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

        this.audioEngine.start();
        this.previewAudioEngine.start();
        // this.granularAudioEngine.start();

        this.processedSensors.start();
        this.eventIn.start();
      })
      .catch(err => console.error(err.stack));
  }

  _init(trainingData) {
    if (trainingData.config !== null)
      this.xmmDecoder.setConfig(trainingData.config);

    if (trainingData.trainingSet !== null) {
      this.trainingData.setTrainingSet(trainingData.trainingSet);
      this._trainModel();
    }
  }

  _trainModel() {
    const trainingSet = this.trainingData.getTrainingSet();

    this.xmmDecoder
      .train(trainingSet)
      .then(response => {
        const model = response.model;
        const config = this.xmmDecoder.getConfig();
        const trainingSet = this.trainingData.getTrainingSet();

        // this.granularAudioEngine.setLabels(this.trainingData.getLabels());

        this._updateModelRequest({
          config: config,
          trainingSet: trainingSet,
          model: model,
        });
      })
      .catch(err => console.error(err.stack));
  }

  _updateParamRequest(name, value) {
    this.send('param:update', name, value);
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

  // here we receive an object instead of a name => value pair
  // so explode it... this will trigger 3 refresh. This is bad but prepare
  // the field for more dynamic and consistent behavior in some future
  _updateProjectConfigRequest(config) {
    for (let name in config)
      this.send('config:update', name, config[name]);
  }

  _updateProjectConfig(config) {
    this.autoTrigger.highThreshold = config.highThreshold;
    this.autoTrigger.lowThreshold = config.lowThreshold;
    this.autoTrigger.offDelay = config.offDelay;

    this.view.updateProjectConfig(config);
  }

  _updateModelRequest(data) {
    this.send('model:update', data);
  }

  _updateModel(model, config) {
    this.xmmDecoder.setConfig(config);
    this.xmmDecoder.setModel(model);

    const viewConfig = Object.assign({}, config.payload, {
      modelType: config.target.name.split(':')[1],
    });
    const currentLabels = model.payload.models.map(model => model.label);

    this.audioEngine.updateSounds(currentLabels);
    this.likeliest = undefined; // otherwise won't fade to new sound on model update

    this.view.updateMLConfig(viewConfig);
    this.view.setCurrentLabels(currentLabels);

    this.view.showNotification('Model updated');
  }

  // at some point, this could probably go in the same information pipeline
  // as everything else
  _updateMLConfig(xmmConfig) {
    this.xmmDecoder.setConfig(xmmConfig);
    this._trainModel();
  }

  _triggerCommand(cmd, ...args) {
    switch (cmd) {
      case 'startRecording':
        this._startRecording();
        break;
      case 'stopRecording':
        this._stopRecording();
        break;
    }
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
    this.decoderOnOff.setState('off');

    this.likeliest = this.view.getCurrentLabel();

    // start recording
    this.trainingData.startRecording(this.likeliest);
    this.view.startRecording();

    playSound(this.audioBufferManager.data.clicks['startRec']);
    this.previewAudioEngine.addSound(this.likeliest);
    this.previewAudioEngine.fadeToNewSound(this.likeliest);
    this.audioEngine.fadeToNewSound(null);

    this.send('param:update', 'recording', true);
  }

  _stopRecording() {
    // stop recording
    this.trainingData.stopRecording();
    // enable recognition back
    this.decoderOnOff.setState('on');

    this.view.stopRecording();
    this.autoTrigger.setState('off');

    playSound(this.audioBufferManager.data.clicks['stopRec']);
    this.previewAudioEngine.removeSound(this.view.getCurrentLabel());

    this.send('param:update', 'recording', false);

    this.view.confirm('send').then(() => {
      this._trainModel();
    }, () => { // if cancelled (reject)
      this.trainingData.deleteRecording(this.trainingData.length - 1);
    }).catch((err) => {
      if (err instanceof Error)
        console.error(err.stack)
    });
  }

  _feedRecorder(data) {
    // check if some problem occured in preprocessing
    for (let i = 0; i < data.length; i++) {
      if (Number.isNaN(data[i])) {
        this.send('error:input-data', data);
        return;
      }
    }

    this.trainingData.addElement(data);
  }

  _feedDecoder(data) {
    // check if some problem occured in preprocessing
    for (let i = 0; i < data.length; i++) {
      if (Number.isNaN(data[i])) {
        this.send('error:input-data', data);
        return;
      }
    }

    const results = this.xmmDecoder.run(data);
    const likelihoods = results ? results.likelihoods : [];
    const likeliest = results ? results.likeliestIndex : -1;
    let label = 'unknown';

    if (results && results.likeliest)
      label = results.likeliest;

    const formattedResults = {
      label: label,
      likeliest: likeliest,
      likelihoods: likelihoods,
    };

    // this.granularAudioEngine.setModelResults(formattedResults);
    this.renderer.setModelResults(formattedResults);

    this.likelihoods = likelihoods;

    if (this.likeliest !== label) {
      this.likeliest = label;
      this.audioEngine.fadeToNewSound(label);
    }
  }

  _feedIntensity(value) {
    if (this.enableIntensity) {
      const intensity = value * 100 * this.sensitivity;
      this.audioEngine.setGainFromIntensity(intensity);
      this.previewAudioEngine.setGainFromIntensity(intensity);

      // this.granularAudioEngine.setIntensity(scaled);
    } else {
      this.audioEngine.setGainFromIntensity(1);
      this.previewAudioEngine.setGainFromIntensity(1);

      // this.granularAudioEngine.setIntensity(scaled);
    }
  }

  _feedEnhancedIntensity(value) {
    this.autoTrigger.push(value * 100);
  }

  _streamSensors(data) {
    const aggregated = new Float32Array(data.length + this.likelihoods.length);

    for (let i = 0; i < data.length; i++)
      aggregated[i] = data[i];

    for (let i = 0; i < this.likelihoods.length; i++)
      aggregated[i + data.length] = this.likelihoods[i];

    this.rawSocket.send('sensors', aggregated);
  }

  _onClearLabel(label) {
    this.view.confirm('clear-label', label).then(() => {
      this.trainingData.deleteRecordingsByLabel(label);
      this._trainModel();
    }).catch(() => {});
  }

  _onClearModel() {
    this.view.confirm('clear-all').then(() => {
      this.trainingData.clear();
      this._trainModel();
      // this.send('clear');
    }).catch(() => {});
  }
};

export default DesignerExperience;
