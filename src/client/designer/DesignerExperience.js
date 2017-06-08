import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import { PhraseRecorderLfo, XmmDecoderLfo } from 'xmm-lfo';
import { Login } from '../services/Login';
import { classes } from  '../shared/config';
import FeaturizerLfo from '../shared/FeaturizerLfo';
import MotionRenderer from '../shared/MotionRenderer';
import AudioEngine from '../shared/AudioEngine';

const audioContext = soundworks.audioContext;

class DesignerView extends soundworks.CanvasView {
  constructor(template, content, events, options) {
    super(template, content, events, options);
  }

  onConfig(callback) {
    this.installEvents({
      'click #openConfigBtn': () => {
        const div = this.$el.querySelector('.section-overlay');
        const active = div.classList.contains('active');

        if (!active) {
          div.classList.add('active');
        } else {
          elt = this.$el.querySelector('#modelSelect');
          const type = elt.options[elt.selectedIndex].value;

          const config = {};
          let elt;
          elt = this.$el.querySelector('#gaussSelect');
          config['gaussians'] = Number(elt.options[elt.selectedIndex].value);
          elt = this.$el.querySelector('#covModeSelect');
          config['covarianceMode'] = elt.options[elt.selectedIndex].value;
          elt = this.$el.querySelector('#absReg');
          config['absoluteRegularization'] = Number(elt.value);
          elt = this.$el.querySelector('#relReg');
          config['relativeRegularization'] = Number(elt.value);
          // elt = this.$el.querySelector('#hierarchicalSelect');
          // config['hierarchical'] = (elt.options[elt.selectedIndex].value === 'yes');
          elt = this.$el.querySelector('#transModeSelect');
          config['transitionMode'] = elt.options[elt.selectedIndex].value;
          elt = this.$el.querySelector('#statesSelect');
          config['states'] = Number(elt.options[elt.selectedIndex].value);
          // elt = this.$el.querySelector('#regressEstimSelect');
          // config['regressionEstimator'] = elt.options[elt.selectedIndex].value;

          callback(type, config);

          div.classList.remove('active');
        }
      }
    });
  }

  onRecord(callback) {
    this.installEvents({
      'click #recBtn': () => {
        const rec = this.$el.querySelector('#recBtn');
        if (!rec.classList.contains('active')) {
          rec.innerHTML = 'STOP';
          rec.classList.add('active');
          callback('record');
        } else {
          rec.innerHTML = 'REC';
          rec.classList.remove('active');
          callback('stop')
        }
      }
    });
  }

  onSendPhrase(callback) {
    this.installEvents({
      'click #sendBtn': () => {
        const labels = this.$el.querySelector('#labelSelect');
        callback(labels.options[labels.selectedIndex].text);
      }
    });
  }

  onClearLabel(callback) {
    this.installEvents({
      'click #clearLabelBtn': () => {
        const labels = this.$el.querySelector('#labelSelect');
        callback(labels.options[labels.selectedIndex].text);
      }
    });
  }

  onClearModel(callback) {
    this.installEvents({
      'click #clearModelBtn': () => {
        callback();
      }
    });
  }

  onEnableSounds(callback) {
    this.installEvents({
      'click #playBtn': () => {
        const btn = this.$el.querySelector('#playBtn');
        const active = btn.classList.contains('active');
        if (!active) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        callback(!active);        
      }
    });
  }
}

const viewTemplate = `
  <div class="foreground">

    <div id="nav">
      <!-- <a href="#" id="openConfigBtn">&#9776;</a> -->
      <a href="#" id="openConfigBtn"> <img src="/pics/navicon.png"> </a>
    </div>

    <div class="section-top flex-middle">
      <div class="section-overlay">
        
        <div class="overlay-content">
          <p> Global configuration </p>
          <br />
          <div class="selectDiv">
            <label for="modelSelect"> Model type : </label>
            <select id="modelSelect">
              <option value="gmm">gmm</option>
              <option value="hhmm">hhmm</option>
            </select>
          </div>
          <div class="selectDiv">
            <label for="gaussSelect"> Gaussians : </label>
            <select id="gaussSelect">
              <% for (var i = 0; i < 10; i++) { %>
                <option value="<%= i+1 %>">
                  <%= i+1 %>
                </option>
              <% } %>
            </select>
          </div>
          <div class="selectDiv">
            <label for="covModeSelect"> Covariance mode : </label>
            <select id="covModeSelect">
              <option value="full">full</option>
              <option value="diagonal">diagonal</option>
            </select>
          </div>        
          <div class="selectDiv">
            <label for="absReg"> Absolute regularization : </label>
            <input id="absReg" type="text" value="0.01">
            </input>
          </div>        
          <div class="selectDiv">
            <label for="relReg"> Relative regularization : </label>
            <input id="relReg" type="text" value="0.01">
            </input>
          </div>        

          <hr>
          <p> Hhmm parameters </p>
          <br />
          <!--
          <div class="selectDiv">
            <label for="hierarchicalSelect"> Hierarchical : </label>
            <select id="hierarchicalSelect">
              <option value="yes">yes</option>
              <option value="no">no</option>
             </select>
          </div>
          -->        
          <div class="selectDiv">
            <label for="statesSelect"> States : </label>
            <select id="statesSelect">
              <% for (var i = 0; i < 20; i++) { %>
                <option value="<%= i+1 %>">
                  <%= i+1 %>
                </option>
              <% } %>
            </select>
          </div>
          <div class="selectDiv">
            <label for="transModeSelect"> Transition mode : </label>
            <select id="transModeSelect">
              <option value="ergodic">ergodic</option>
              <option value="leftright">leftright</option>
            </select>
          </div> 
          <!--
          <div class="selectDiv">
            <label for="regressEstimSelect"> Regression estimator : </label>
            <select id="regressEstimSelect">
              <option value="full">full</option>
              <option value="windowed">windowed</option>
              <option value="likeliest">likeliest</option>
            </select>
          </div>
          -->        
        </div>
      </div>

    	<div class="section-underlay">
      	<!-- <p class="big"><%= title %></p> -->
        <div class="selectDiv"> Label :
          <select id="labelSelect">
            <% for (var prop in classes) { %>
              <option value="<%= prop %>">
                <%= prop %>
              </option>
            <% } %>
          </select>
        </div>
        <button id="recBtn">REC</button>
        <button id="sendBtn">SEND</button>
        <div class="canvasDiv">
          <canvas class="multislider" id="likelihoods"></canvas>
        </div>
        <button id="clearLabelBtn">CLEAR LABEL</button>
        <button id="clearModelBtn">CLEAR MODEL</button>
        <div class="toggleDiv">
          <button id="playBtn" class="toggleBtn"></button>
          Enable sounds
        </div>
      </div>
    </div>

    <div class="section-center flex-center">
    </div>
    <div class="section-bottom flex-middle">
    </div>

  </div>
`;

export default class DesignerExperience extends soundworks.Experience {
	constructor(assetsDomain) {
    super();

    const audioFiles = [];
    for (let label in classes) {
      audioFiles.push(classes[label]);
    }
    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.login = this.require('login');
    this.loader = this.require('loader', {
      assetsDomain: assetsDomain,
      files: audioFiles
    });
    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.labels = Object.keys(classes);
    this.likeliest = undefined;
	}

  //=============================================//

  init() {
    console.log('start initialization');

    this.audioEngine = new AudioEngine(classes, this.loader);

    // initialize the view
    this.viewTemplate = viewTemplate;
    this.viewContent = {
    	title: 'play !',
      classes: classes
    };
    this.viewCtor = DesignerView;
    this.viewOptions = { preservePixelRatio: true, className: 'superdesigner' };
    this.view = this.createView();

    this._onConfig = this._onConfig.bind(this);
    this._onRecord = this._onRecord.bind(this);
    this._onSendPhrase = this._onSendPhrase.bind(this);
    this._onClearLabel = this._onClearLabel.bind(this);
    this._onClearModel = this._onClearModel.bind(this);
    this._onReceiveModel = this._onReceiveModel.bind(this);
    this._onModelFilter = this._onModelFilter.bind(this);   
    this._motionCallback = this._motionCallback.bind(this);
    this._intensityCallback = this._intensityCallback.bind(this);
    this._enableSounds = this._enableSounds.bind(this);

    this.view.onConfig(this._onConfig);
    this.view.onRecord(this._onRecord);
    this.view.onSendPhrase(this._onSendPhrase);
    this.view.onClearLabel(this._onClearLabel);
    this.view.onClearModel(this._onClearModel);
    this.view.onEnableSounds(this._enableSounds);

    //--------------------------------- LFO's --------------------------------//
    this._devicemotionIn = new lfo.source.EventIn({
      frameType: 'vector',
      frameSize: 6,
      frameRate: 1,//this.motionInput.period doesn't seem available anymore
      description: ['accX', 'accY', 'accZ', 'gyrAlpha', 'gyrBeta', 'gyrGamma']
    });
    this._featurizer = new FeaturizerLfo({
      descriptors: [ 'accRaw', 'gyrZcr', 'accIntensity' ],
      // gyrZcrNoiseThresh: 0.01,
      // gyrZcrFrameSize: 100,
      // gyrZcrHopSize: 10,
      // callback: this._intensityCallback
    });
    // this._selectInput = new lfo.operator.Select({ indices: [0, 1, 2, 3, 4, 5] });
    this._selectInput = new lfo.operator.Select({ indices: [0, 1, 2] });
    // this._inputFilter = new lfo.operator.MovingAvrage({})
    // this._inputBridge = new lfo.sink.Bridge({
    //   // processFrame: (frame) => { console.log(frame); }
    // });
    this._selectAccIntensity = new lfo.operator.Select({ index: 6 });
    this._intensityBridge = new lfo.sink.Bridge({
      processFrame: this._intensityCallback
    });
    this._phraseRecorder = new PhraseRecorderLfo({
      columnNames: [ 'accelX', 'accelY', 'accelZ',
                     'gyrAmplitude', 'gyrFrequency', 'gyrPeriodicity' ]
    });
    // this._phraseRecorder = new PhraseRecorderLfo({
    //   columnNames: ['accelGravX', 'accelGravY', 'accelGravZ',
    //                  'rotAlpha', 'rotBeta', 'rotGamma']      
    // });
    this._xmmDecoder = new XmmDecoderLfo({
      likelihoodWindow: 50,
      callback: this._onModelFilter
    });

    this._devicemotionIn.connect(this._featurizer);
    this._featurizer.connect(this._selectInput);
    // this._devicemotionIn.connect(this._selectInput);
    // this._selectInput.connect(this._inputBridge);
    this._selectInput.connect(this._phraseRecorder);
    this._selectInput.connect(this._xmmDecoder);
    // this._devicemotionIn.connect(this._phraseRecorder);
    // this._devicemotionIn.connect(this._xmmDecoder);
    this._featurizer.connect(this._selectAccIntensity);
    this._selectAccIntensity.connect(this._intensityBridge);
    this._devicemotionIn.start();

    //----------------- RECEIVE -----------------//
    this.receive('model', this._onReceiveModel);
  }

  //=============================================//

  start() {
    super.start(); // don't forget this

    if (!this.hasStarted)
      this.init();

    this.show();

    // initialize rendering
    this.renderer = new MotionRenderer(100);
    this.view.addRenderer(this.renderer);
    // this function is called before each update (`Renderer.render`) of the canvas
    this.view.setPreRender((ctx, dt) => {});

    this.audioEngine.start();

    if (this.motionInput.isAvailable('devicemotion')) {
      this.motionInput.addListener('devicemotion', this._motionCallback);
    }
  }

  _onConfig(type, config) {
    this.send('configuration', { type: type, config: config });
    // console.log(config);
  }

  _onRecord(cmd) {
    switch (cmd) {
      case 'record':
        this._phraseRecorder.start();
        break;

      case 'stop':
        this._phraseRecorder.stop();
        break;
    }
  }

  _onSendPhrase(label) {
    this._phraseRecorder.setPhraseLabel(label);
    let phrase = this._phraseRecorder.getRecordedPhrase();
    if (phrase.length > 0) {
      if (confirm('send phrase with label ' + label + ' ?')) {
        this.send('phrase', { cmd: 'add', data: phrase });
      }
    } else {
      alert('cannot send empty phrases');
      console.error('error : empty phrases are forbidden');
    }
  }

  _onClearLabel(label) {
    if (confirm('do you really want to remove the label ' + label + ' ?')) {
      this.send('clear', { cmd: 'label', data: label });
    }    
  }

  _onClearModel() {
    if (confirm('do you really want to remove the current model ?')) {
      this.send('clear', { cmd: 'model' });
    }
  }

  //================ callbacks : ================//

  _motionCallback(eventValues) {
    const values = eventValues.slice(0,3).concat(eventValues.slice(-3));
    // values.forEach(function(elt) { elt *= 1000; });
    this._devicemotionIn.process(audioContext.currentTime, values);
  }

  _onReceiveModel(model) {
    // console.log(model);
    const config = model ? model.configuration.default_parameters : {};

    config.modelType = config.states ? 'hhmm' : 'gmm';
    this._updateConfigFromModel(config);
    this._xmmDecoder.params.set('model', model);

    // no use for this : model should be null
    // only if training was cancelled server-side
    
    // if (!model) {
    //   this.renderer.setModelResults({
    //     label: 'unknown',
    //     likeliest: 0,
    //     likelihoods: [ 0 ]
    //   });
    // }
    //console.log('received model : ' + JSON.stringify(model, null, 2));
  }

  _updateConfigFromModel(config) {
    const v = this.view.$el;
    let elt;

    elt = v.querySelector('#modelSelect');
    elt.selectedIndex = (config.modelType === 'hhmm') ? 1 : 0;

    elt = v.querySelector('#gaussSelect');
    elt.selectedIndex = config.gaussians - 1;
    elt = v.querySelector('#covModeSelect');
    elt.selectedIndex = config.covariance_mode;
    elt = v.querySelector('#absReg');
    elt.value = config.absolute_regularization;
    elt = v.querySelector('#relReg');
    elt.value = config.relative_regularization;

    // elt = v.querySelector('#hierarchicalSelect');
    // elt.selectedIndex = config.hierarchical ? 0 : 1;
    elt = v.querySelector('#transModeSelect');
    elt.selectedIndex = config.transition_mode ? config.transition_mode : 0;
    elt = v.querySelector('#statesSelect');
    elt.selectedIndex = config.states ? config.states - 1 : 0;
    // elt = v.querySelector('#regressEstimSelect');
    // elt.selectedIndex = config.regressionEstimator;
    //this.view.render();
  }

  _onModelFilter(res) {
    const likelihoods = res.likelihoods;
    const likeliest = res.likeliestIndex;
    const label = res.likeliest;
    // const alphas = res.alphas[likeliest];
    const newRes = {
      label: label,
      likeliest: likeliest,
      // alphas: alphas,
      likelihoods: likelihoods
    };

    this.renderer.setModelResults(newRes);

    if (this.likeliest !== label) {
    	this.likeliest = label;
      console.log('changed gesture to : ' + label);
      const i = this.labels.indexOf(label);
      this.audioEngine.fadeToNewSound(i);
    }
  }

  _intensityCallback(frame) {
    // console.log(frame);
    // this.audioEngine.setGainFromIntensity(frame.data[0]);
    this.audioEngine.setGainFromIntensity(1);
  }

  _enableSounds(onOff) {
    this.audioEngine.enableSounds(onOff);
  }
}