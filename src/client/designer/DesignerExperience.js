import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import * as imlMotion from 'iml-motion';
// import { PhraseRecorderLfo, XmmDecoderLfo } from 'xmm-lfo';

import AudioEngine from '../shared/AudioEngine';
import AutoMotionTrigger from '../shared/AutoMotionTrigger';
import DesignerView from './DesignerView';
import LikelihoodsRenderer from '../shared/LikelihoodsRenderer';
import SimpleLogin from '../shared/services/SimpleLogin';
import { labels, clicks } from  '../shared/config';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

class DesignerExperience extends soundworks.Experience {
  constructor(config) {
    super();

    this.config = config;
    this.labels = Object.keys(labels);
    this.likeliest = undefined;
    this.isStreamingSensors = false;
    this._sensitivity = 1;

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.login = this.require('simple-login');
    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      files: { labels: labels, clicks: clicks }
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    // stream sensors
    if (config.env !== 'production')
      this.rawSocket = this.require('raw-socket');


    this._onConfigUpdate = this._onConfigUpdate.bind(this);
    this._onRecord = this._onRecord.bind(this);
    this._onClearLabel = this._onClearLabel.bind(this);
    this._onClearModel = this._onClearModel.bind(this);
    this._onNewTrainingData = this._onNewTrainingData.bind(this);

    this._startRecording = this._startRecording.bind(this);
    this._stopRecording = this._stopRecording.bind(this);
    this._feedDecoder = this._feedDecoder.bind(this);
    this._feedRecorder = this._feedRecorder.bind(this);
    this._feedIntensity = this._feedIntensity.bind(this);
    this._mute = this._mute.bind(this);
    this._onIntensityToggle = this._onIntensityToggle.bind(this);

    this._persistUser = this._persistUser.bind(this);
    this._deleteUser = this._deleteUser.bind(this);
  }

  start() {
    super.start(); // don't forget this

    if (this.config.env !== 'production' &&
        client.urlParams &&
        client.urlParams[0] === 'stream') {
      this.isStreamingSensors = true;
    }

    const autoTriggerDefaults = {
      highThreshold: 0.5,
      lowThreshold: 0.01,
      offDelay: 500,
    }

    this.view = new DesignerView({
        sounds: labels,
        assetsDomain: this.config.assetsDomain,
        record: autoTriggerDefaults,
        recBtnState: 0, // 0 is waiting, 1 is armed, 2 is recording, 3 is idle
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
    this.view.setIntensityCallback(this._onIntensityToggle);

    // rendering
    this.renderer = new LikelihoodsRenderer(this.view);

    // audio
    this.audioEngine = new AudioEngine(this.audioBufferManager.data.labels);

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
      this.eventIn.process(null, data);
      this._feedIntensity(data[0]);
    });

    this.eventIn.connect(this.decoderOnOff);
    this.decoderOnOff.connect(this.decoderBridge);
    this.eventIn.connect(this.recorderBridge);

    // recording and decoding
    this.trainingData = new imlMotion.TrainingData();

    this.xmmDecoder = new imlMotion.XmmProcessor({ url: this.config.trainUrl });
    this.xmmDecoder.setConfig({ likelihoodWindow: 20 });

    if (this.isStreamingSensors)
      this.processedSensors.addListener(data => this.rawSocket.send('sensors', data));

    this.autoTrigger = new AutoMotionTrigger({
      highThreshold: autoTriggerDefaults.highThreshold,
      lowThreshold: autoTriggerDefaults.lowThreshold,
      offDelay: autoTriggerDefaults.offDelay,
      startCallback: this._startRecording,
      stopCallback: this._stopRecording,
    });

    this.sharedParams.addParamListener('sensitivity', value => {
      this._sensitivity = value;
      // this.audioEngine.setMasterVolume(value);
    });


    this.receive('training-data', this._onNewTrainingData);

    Promise.all([this.show(), this.eventIn.init(), this.processedSensors.init()])
      .then(() => {
        this.view.addRenderer(this.renderer);
        this.view.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

        this.audioEngine.start();

        this.processedSensors.start();
        this.eventIn.start();
      })
      .catch(err => console.error(err.stack));
  }

  _onNewTrainingData(trainingData) {
    if (trainingData.config !== undefined)
      this.xmmDecoder.setConfig(trainingData.config);

    if (trainingData.trainingSet !== undefined) {
      this.trainingData.setTrainingSet(trainingData.trainingSet);

      this._updateModelAndSet(false);
    }
  }

  _onConfigUpdate(xmmConfig, recordConfig) {
    this.xmmDecoder.setConfig(xmmConfig);
    this._updateModelAndSet();

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
    this.decoderOnOff.setState('off');

    this.likeliest = this.view.getCurrentLabel();
    const labelIndex = this.labels.indexOf(this.likeliest);
    this.audioEngine.fadeToNewSound(labelIndex);

    // start recording
    this.trainingData.startRecording(this.likeliest);
    this.view.startRecording();

    this._playSound(this.audioBufferManager.data.clicks['startRec']);
  }

  _stopRecording() {
    // stop recording
    this.trainingData.stopRecording();
    // enable recognition back
    this.decoderOnOff.setState('on');

    this.view.stopRecording();
    this.autoTrigger.setState('off');

    this._playSound(this.audioBufferManager.data.clicks['stopRec']);

    this.view.confirm('send').then(() => {
      this._updateModelAndSet();
    }, () => { // if cancelled (reject)
      this.trainingData.deleteRecording(this.trainingData.length - 1);
    }).catch((err) => {
      if (err instanceof Error)
        console.error(err.stack)
    });
  }

  _feedRecorder(data) {
    this.trainingData.addElement(data);
  }

  _feedDecoder(data) {
    const results = this.xmmDecoder.run(data);

    const likelihoods = results ? results.likelihoods : [];
    const likeliest = results ? results.likeliestIndex : -1;
    const label = results ? results.likeliest : 'unknown';

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

  _feedIntensity(value) {
    this.autoTrigger.push(value * 100);

    if (this.enableIntensity)
      this.audioEngine.setGainFromIntensity(value * 100 * this._sensitivity);
    else
      this.audioEngine.setGainFromIntensity(1);
  }

  _onClearLabel(label) {
    this.view.confirm('clear-label', label).then(() => {
      this.trainingData.deleteRecordingsOfLabel(label);
      this._updateModelAndSet();
    }).catch(() => {});
  }

  _onClearModel() {
    this.view.confirm('clear-all').then(() => {
      this.trainingData.clear();
      this._updateModelAndSet();
      this.send('clear');
    }).catch(() => {});
  }

  _updateModelAndSet(persist = true) {
    const trainingSet = this.trainingData.getTrainingSet();

    this.xmmDecoder.train(trainingSet)
      .then(response => {
        const model = response.model;
        const config = this.xmmDecoder.getConfig();
        console.log(config);
        const currentLabels = model.payload.models.map(model => model.label);
        const viewConfig = Object.assign({}, config.payload, {
          modelType: config.target.name.split(':')[1],
        });

        this.view.setConfig(viewConfig);
        this.view.setCurrentLabels(currentLabels);

        if (persist) {
          const trainingSet = this.trainingData.getTrainingSet();

          this.send('training-data', {
            config: config,
            trainingSet: trainingSet,
            model: model,
          });
        }
      })
      .catch(err => console.error(err.stack));
  }

  _mute(mute) {
    this.audioEngine.mute = mute;
  }

  _playSound(buffer) {
    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer;
    src.start(audioContext.currentTime);
  }

  _persistUser() {
    this.send('persist-user');
  }

  _deleteUser() {
    this.send('delete-user');
  }

  _onIntensityToggle(bool) {
    this.enableIntensity = bool;
  }
};

export default DesignerExperience;
