import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import * as mano from 'mano-js';

import { triggers, labels } from '../../../shared/config/audio';
import { sounds as uiSounds, colors as uiColors } from '../../../shared/config/ui';
import { presets } from '../../../shared/config/ml-presets';

import ClientView from './ClientView';
import AutoMotionTrigger from './AutoMotionTrigger';
import LikelihoodsRenderer from './LikelihoodsRenderer';
import FullColorRenderer from './FullColorRenderer';

import AudioEngine from '../audio/AudioEngine';
import GranularAudioEngine from '../audio/GranularAudioEngine';
import TriggerEngine from '../audio/TriggerEngine';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

function playSound(buffer, loop = false) {
  const src = audioContext.createBufferSource();
  src.connect(audioContext.destination);
  src.buffer = buffer;
  src.loop = loop;
  src.start(audioContext.currentTime);
  return src;
}

class ClientExperience extends soundworks.Experience {
  constructor(config, viewOptions) {
    super();

    this.config = config;
    this.viewOptions = viewOptions;

    this.triggers = {};
    this.labels = Object.keys(labels);
    this.likeliest = undefined;
    this.likelihoods = [];
    this.aggregatedOutput = new Float32Array();
    this.sensitivity = 1;
    this.hasModel = false;

    this.recordState = 'idle';

    this.streamSensors = false;

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin');
    this.projectManager = this.require('project-manager', {
      allowProjectCreation: viewOptions.allowProjectCreation,
    });
    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      files: { triggers, labels, uiSounds },
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.rawSocket = this.require('raw-socket');

    this._onClearLabel = this._onClearLabel.bind(this);
    this._onClearModel = this._onClearModel.bind(this);

    this._idleRecordingRequest = this._idleRecordingRequest.bind(this);
    this._armRecordingRequest = this._armRecordingRequest.bind(this);
    this._startRecordingRequest = this._startRecordingRequest.bind(this);
    this._stopRecordingRequest = this._stopRecordingRequest.bind(this);
    this._cancelRecordingRequest = this._cancelRecordingRequest.bind(this);
    this._confirmRecordingRequest = this._confirmRecordingRequest.bind(this);

    this._feedDecoder = this._feedDecoder.bind(this);
    this._feedRecorder = this._feedRecorder.bind(this);
    this._feedIntensity = this._feedIntensity.bind(this);
    this._streamSensors = this._streamSensors.bind(this);

    this._init = this._init.bind(this);
    this._updateParamRequest = this._updateParamRequest.bind(this);
    this._updateParams = this._updateParams.bind(this);
    this._updateTrainingConfigRequest = this._updateTrainingConfigRequest.bind(this);
    this._updateTrainingConfig = this._updateTrainingConfig.bind(this);
    this._updateProjectConfigRequest = this._updateProjectConfigRequest.bind(this);
    this._updateProjectConfig = this._updateProjectConfig.bind(this);
    this._updateModel = this._updateModel.bind(this);
    this._triggerCommand = this._triggerCommand.bind(this);
  }

  start() {
    super.start();

    const { triggers, uiSounds } = this.audioBufferManager.data;
    this.triggerEngine = new TriggerEngine(triggers, uiSounds);

    this.receive('audio:trigger', (action, label) => {
      switch (action) {
        case 'start':
          this.triggerEngine.start(label);
          break;
        case 'stop':
          this.triggerEngine.stop(label);
          break;
        default:
          break;
      }
    });

    this.receive('init', this._init);
    this.receive('params:update', this._updateParams);
    this.receive('config:update', this._updateProjectConfig);
    this.receive('training-config:update', this._updateTrainingConfig);
    this.receive('model:update', this._updateModel);
    this.receive('command:trigger', this._triggerCommand);
    this.receive('force:disconnect', () => window.location.reload());

    this.view = new ClientView({
        title: '',
        sounds: labels,
        assetsDomain: this.config.assetsDomain,
        recBtnState: 'idle', // in ['idle', 'armed', 'recording']
        presets: presets,
        hideAll: this.viewOptions.hideAll
      }, {}, {
        id: client.type,
        preservePixelRatio: false,
        ratios: { '.content': 1 },
      }
    );

    this.view.switchProjectCallback = () => this.projectManager.show();
    this.view.recordCallback = (cmd) => this._triggerCommand('record', cmd);
    this.view.clearLabelCallback = this._onClearLabel;
    this.view.clearModelCallback = this._onClearModel;
    this.view.updateParamCallback = this._updateParamRequest;
    this.view.updateTrainingConfigCallback = this._updateTrainingConfigRequest;
    this.view.updateProjectConfigCallback = this._updateProjectConfigRequest;

    // rendering
    this.likelihoodsRenderer = new LikelihoodsRenderer(this.view);

    const clientColor = uiColors[client.index % uiColors.length];
    this.fullColorRenderer = new FullColorRenderer(clientColor);

    const buffers = this.audioBufferManager.data.labels;

    this.audioEngine = new AudioEngine(buffers, client.index);
    this.previewAudioEngine = new AudioEngine(buffers, client.index);

    // data flow control
    this.eventIn = new lfo.source.EventIn({
      frameRate: 0,
      frameSize: 8,
      frameType: 'vector',
    });

    this.decoderOnOff = new lfo.operator.OnOff({ state: 'on' });
    this.decoderBridge = new lfo.sink.Bridge({
      processFrame: frame => {
        const data = frame.data;

        if (this._checkDataIntegrity(data))
          this._feedDecoder(data);
      },
    });

    this.recorderOnOff = new lfo.operator.OnOff({ state: 'off' });
    this.recorderBridge = new lfo.sink.Bridge({
      processFrame: frame => {
        const data = frame.data;

        if (this._checkDataIntegrity(data))
          this._feedRecorder(data);
      },
    });

    this.eventIn.connect(this.decoderOnOff);
    this.decoderOnOff.connect(this.decoderBridge);

    this.eventIn.connect(this.recorderOnOff);
    this.recorderOnOff.connect(this.recorderBridge);

    // preprocessing
    this.processedSensors = new mano.ProcessedSensors();
    this.processedSensors.addListener(data => {
      if (this._checkDataIntegrity(data)) {
        this.eventIn.process(null, data);
        this._feedIntensity(data[0]); // audio gain control
        this._feedEnhancedIntensity(data[1]); // thresholded recording control
      }
    });

    // recording
    this.exampleRecorder = new mano.Example();

    // decoding
    this.xmmDecoder = new mano.XmmProcessor({ url: this.config.trainUrl });
    this.xmmDecoder.setConfig({ likelihoodWindow: 20 });

    const defaultProjectConfig = this.config.defaultProjectConfig;

    this.autoTrigger = new AutoMotionTrigger({
      highThreshold: defaultProjectConfig.highThreshold,
      lowThreshold: defaultProjectConfig.lowThreshold,
      offDelay: defaultProjectConfig.offDelay,
      startCallback: this._startRecordingRequest,
      stopCallback: this._stopRecordingRequest,
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

    this.audioEngine.start();
    this.previewAudioEngine.start();

    Promise.all([this.show(), this.eventIn.init(), this.processedSensors.init()])
      .then(() => {
        this.view.addRenderer(this.fullColorRenderer);

        if (!this.viewOptions.hideAll)
          this.view.addRenderer(this.likelihoodsRenderer);

        this.view.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));
        this.view.setSectionsVisibility(this.viewOptions);

        this.processedSensors.start();
        this.eventIn.start();
      })
      .catch(err => console.error(err.stack));
  }

  _init() {
    this.projectManager.hide();
    this.view.updateProjectName(this.projectManager.getProject().name);
    this.send('project:fetch-all-request');
  }

  _updateParamRequest(name, value) {
    this.send('param:update', name, value);
  }

  _updateParams(params) {
    this.audioEngine.mute = params.mute;
    this.previewAudioEngine.mute = params.mute;
    this.enableIntensity = params.intensity;

    switch (params.recordState) {
      case 'idle':
        if (this.recordState !== params.recordState) {
          this._idleRecording();
        }
        break;

      case 'armed':
        if (this.recordState !== params.recordState) {
          this._armRecording();
        }
        break;

      case 'recording':
        if (['idle', 'armed'].includes(this.recordState)) {
          this._startRecording();
        }
        break;

      case 'pending':
        if (this.recordState === 'recording') {
          this._stopRecording();
        }
        break;

      case 'cancelled':
        if (this.recordState === 'pending') {
          this._cancelRecording();
        }
        break;

      case 'confirmed':
        if (this.recordState === 'pending') {
          this._confirmRecording();
        }
        break;
    }

    this.recordState = params.recordState;

    if (params.currentLabel) {
      const label = params.currentLabel;
      this.view.setCurrentLabel(label);

      this.previewAudioEngine.updateSounds([ label ]);

      if (!this.hasModel)
        this.previewAudioEngine.fadeToNewSound(label);
    }

    // stream sensors to admin
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
      this.send('updateProjectConfigRequest', name, config[name]);
  }

  _updateProjectConfig(config) {
    this.autoTrigger.highThreshold = config.highThreshold;
    this.autoTrigger.lowThreshold = config.lowThreshold;
    this.autoTrigger.offDelay = config.offDelay;

    this.view.updateProjectConfig(config);
  }

  // at some point, this could probably go in the same information pipeline
  // as everything else
  _updateTrainingConfigRequest(config) {
    this.send('training-config:update', config);
  }

  _updateTrainingConfig(config) {
    this.xmmDecoder.setConfig(config);

    const viewConfig = Object.assign({}, config.payload, {
      modelType: config.target.name.split(':')[1],
    });

    this.view.updateTrainingConfig(viewConfig);
  }

  _updateModelRequest() {
    this.send('ModelUpdateRequest');
  }

  _updateModel(model) {
    if (model === null || model.payload.models.length === 0) {
      this.hasModel = false;
      this.decoderOnOff.setState('off');
    } else {
      this.hasModel = true;
      this.previewAudioEngine.fadeToNewSound(null);
      this.decoderOnOff.setState('on');
    }

    this.xmmDecoder.setModel(model);

    const currentLabels = model
                        ? model.payload.models.map(model => model.label)
                        : [];

    this.audioEngine.updateSounds(currentLabels);
    this.likeliest = undefined; // otherwise won't fade to new sound on model update

    this.view.setCurrentLabels(currentLabels);
    this.view.showNotification('Model updated');
  }


  _triggerCommand(cmd, ...args) {
    switch (cmd) {
      case 'record':
        switch (args[0]) {
          case 'idle':
            this._idleRecordingRequest();
            break;
          case 'arm':
            this._armRecordingRequest();
            break;
          case 'start':
            this._startRecordingRequest();
            break;
          case 'stop':
            this._stopRecordingRequest();
            break;
          case 'confirm':
            this._confirmRecordingRequest();
            break;
          case 'cancel':
            this._cancelRecordingRequest();
            break;
          default:
            throw new Error(`Unkown arguments '${args}' for command '${cmd}'`);
        }
        break;

      case 'trigger':
        switch (args[0]) {
          case 'play':
            this._triggerSound(args[0]);
            break;
          case 'stop':
            this._stopSound(args[0]);
            break;
          case 'stopall':
            this._stopAllSounds();
            break;
          default:
            throw new Error(`Unkown arguments '${args}' for command '${cmd}'`);
        }
        break;

      default:
        throw new Error(`Unkown command '${cmd}'`);
    }
  }

  _idleRecordingRequest() {
    this.send('param:update', 'recordState', 'idle');
  }

  _idleRecording() {
    this.autoTrigger.setState('off');
    this.view.stopRecording();
  }

  _armRecordingRequest() {
    this.send('param:update', 'recordState', 'armed');
  }

  _armRecording() {
    this.autoTrigger.setState('on');
    this.view.armRecording();
  }

  _startRecordingRequest() {
    this.send('param:update', 'recordState', 'recording');
  }

  _startRecording() {
    // disable recognition, enable recording input flow@
    this.decoderOnOff.setState('off');
    this.recorderOnOff.setState('on');

    this.likeliest = this.view.getCurrentLabel();

    // start recording
    this.exampleRecorder.clear();
    this.view.startRecording();

    playSound(this.audioBufferManager.data.uiSounds['startRecord']);

    this.previewAudioEngine.updateSounds([ this.likeliest ]);
    this.previewAudioEngine.fadeToNewSound(this.likeliest);
    this.audioEngine.fadeToNewSound(null);
  }

  _stopRecordingRequest() {
    this.send('param:update', 'recordState', 'pending');
  }

  _stopRecording() {
    // enable recognition back, disable recording input flow
    if (this.hasModel)
      this.decoderOnOff.setState('on');

    this.recorderOnOff.setState('off');

    this.view.stopRecording();
    this.autoTrigger.setState('off');

    playSound(this.audioBufferManager.data.uiSounds['stopRecord']);
    // this.previewAudioEngine.removeSound(this.view.getCurrentLabel());
    this.previewAudioEngine.updateSounds([]);

    this.view.confirmDialog('send')
      .then((value) => {
        if (value === 'confirm')
          this._confirmRecordingRequest();
        else if (value === 'cancel')
          this._cancelRecordingRequest();
      })
      .catch((err) => {
        if (err instanceof Error)
          console.error(err.stack);
      });
  }

  _cancelRecordingRequest() {
    this.send('param:update', 'recordState', 'cancelled');
  }

  _cancelRecording() {
    this.view.removeDialog();
    this._idleRecordingRequest();
  }

  _confirmRecordingRequest() {
    this.send('param:update', 'recordState', 'confirmed');
  }

  _confirmRecording() {
    this.view.removeDialog();

    this.exampleRecorder.setLabel(this.view.getCurrentLabel());
    this.send('example', { cmd: 'add', data: this.exampleRecorder.getExample() });
    this._idleRecordingRequest();
  }

  ////////// TRIGGERED SOUNDS

  _playTrigger(label) {
    if (this.triggers[label])
      this.triggers[label].stop();

    const buffer = this.audioBufferManager.data.triggers[label];
    const loop = triggers[label].loop;
    this.triggers[label] = playSound(buffer, loop);
  }

  _stopTrigger(label) {
    if (this.triggers[label])
      this.triggers[label].stop();
  }

  _stopAllTriggers() {
    for (let t in this.triggers)
      t.stop();

    this.triggers = {};
  }

  ////////// DATA FLOW MANAGEMENT

  _feedRecorder(data) {
    this.exampleRecorder.addElement(data);
  }

  _feedDecoder(data) {
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

    this.likelihoodsRenderer.setModelResults(formattedResults);
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
    } else {
      this.audioEngine.setGainFromIntensity(1);
      this.previewAudioEngine.setGainFromIntensity(1);
    }
  }

  _feedEnhancedIntensity(value) {
    this.autoTrigger.push(value * 100);
  }

  _onClearLabel(label) {
    this.view.confirmDialog('clear-label', label).then((result) => {
      if (result === 'confirm')
        this.send('example', { cmd: 'clear', data: label });

      this.view.removeDialog();
    }).catch(() => {});
  }

  _onClearModel() {
    this.view.confirmDialog('clear-all').then((result) => {
      if (result === 'confirm')
        this.send('example', { cmd: 'clearall', data: null });

      this.view.removeDialog();
    }).catch(() => {});
  }

  _streamSensors(data) {
    // we need to check this as the likelihoods length could change anytime :
    const aggregatedLength = data.length + this.likelihoods.length;

    if (this.aggregatedOutput.length != aggregatedLength)
      this.aggregatedOutput = new Float32Array(aggregatedLength);

    for (let i = 0; i < data.length; i++)
      this.aggregatedOutput[i] = data[i];

    for (let i = 0; i < this.likelihoods.length; i++)
      this.aggregatedOutput[i + data.length] = this.likelihoods[i];

    this.rawSocket.send('sensors', this.aggregatedOutput);
  }

  _checkDataIntegrity(data) {
    for (let i = 0; i < data.length; i++) {
      if (!Number.isFinite(data[i]) && data[i] !== null) {
        this.send('logFaultySensorData', data);
        return false;
      }
    }

    return true;
  }
};

export default ClientExperience;
