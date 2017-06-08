import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import { XmmDecoderLfo } from 'xmm-lfo';
import { classes } from  '../shared/config';
import FeaturizerLfo from '../shared/FeaturizerLfo';
// import MotionRenderer from '../shared/MotionRenderer';
import AudioEngine from '../shared/AudioEngine';

const audioContext = soundworks.audioContext;

class PlayerView extends soundworks.SegmentedView {
  constructor(template, content, events, options) {
    super(template, content, events, options);
  }

  onSoundOnOff(callback) {
    this.installEvents({
      'click #sound-onoff': () => {
        const rec = this.$el.querySelector('#sound-onoff');
        if (!rec.classList.contains('active')) {
          rec.innerHTML = 'SOUND ON';
          rec.classList.add('active');
          callback(true);
        } else {
          rec.innerHTML = 'SOUND OFF';
          rec.classList.remove('active');
          callback(false);
        }        
      }
    });
  }

  onIntensityOnOff(callback) {
    this.installEvents({
      'click #intensity-onoff': () => {
        const rec = this.$el.querySelector('#intensity-onoff');
        if (!rec.classList.contains('active')) {
          rec.innerHTML = 'INTENSITY ON';
          rec.classList.add('active');
          callback(true);
        } else {
          rec.innerHTML = 'INTENSITY OFF';
          rec.classList.remove('active');
          callback(false);
        }        
      }
    });
  }

  onModelChange(callback) {
    this.installEvents({
      'change #modelSelect': () => {
        const inputs = this.$el.querySelector('#modelSelect');
        callback(inputs.options[inputs.selectedIndex].value);
      }
    });
  }

  // onToggleSendOsc(callback) {
  //   this.installEvents({
  //     'click #sendOsc': () => {
  //       const btn = this.$el.querySelector('#sendOsc');
  //       const active = btn.classList.contains('active');
  //       if (!active) {
  //         btn.classList.add('active');
  //       } else {
  //         btn.classList.remove('active');
  //       }
  //       callback(!active);
  //     }
  //   });
  // }

  // onEnableSounds(callback) {
  //   this.installEvents({
  //     'click #playBtn': () => {
  //       const btn = this.$el.querySelector('#playBtn');
  //       const active = btn.classList.contains('active');
  //       if (!active) {
  //         btn.classList.add('active');
  //       } else {
  //         btn.classList.remove('active');
  //       }
  //       callback(!active);        
  //     }
  //   });
  // }

  // onSetMasterVolume(callback) {
  //   this.installEvents({
  //     'change #volumeSlider': () => {
  //       const slider = this.$el.querySelector('#volumeSlider');
  //       callback(slider.value);
  //     }
  //   });
  // }
}

const viewTemplate = `
  <!-- <canvas class="background"> -->
  <div class="foreground">
    <div class="section-top flex-middle">

    	<div>
        <div class="selectDiv" id="modelsDiv"> Model :
          <select id="modelSelect">
            <% for (var prop in models) { %>
              <option value="<%= prop %>">
                <%= prop %>
              </option>
            <% } %>
          </select>
        </div>

        <button id="sound-onoff"> SOUND OFF </button>

        <button id="intensity-onoff"> INTENSITY OFF </button>
        
    </div>
    <div class="section-center flex-center">
    </div>
    <div class="section-bottom flex-middle">
    </div>
  </div>
`;

export default class PlayerExperience extends soundworks.Experience {
	constructor(assetsDomain) {
    super();

    console.log('creating experience');

    const audioFiles = [];
    for (let label in classes) {
      audioFiles.push(classes[label]);
    }
    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.loader = this.require('loader', {
      assetsDomain: assetsDomain,
      files: audioFiles
    });
    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    this.labels = Object.keys(classes);
    this.likeliest = undefined;
    this._models = null;
    this._sendOscFlag = false;
    this._intensityOn = false;
	}

  //=============================================//

  init() {
    console.log('start initialization');

    this.audioEngine = new AudioEngine(classes, this.loader);

    // initialize the view
    this.viewTemplate = viewTemplate;
    this.viewContent = {
    	title: 'play !',
      models: null
    };
    this.viewCtor = PlayerView;
    this.viewOptions = { preservePixelRatio: true, className: 'player' };
    this.view = this.createView();

    this._onReceiveModel = this._onReceiveModel.bind(this);
    this._onReceiveModels = this._onReceiveModels.bind(this);
    this._onModelChange = this._onModelChange.bind(this);
    this._onModelFilter = this._onModelFilter.bind(this);   
    this._motionCallback = this._motionCallback.bind(this);

    this._soundOnOff = this._soundOnOff.bind(this);
    this._intensityOnOff = this._intensityOnOff.bind(this);

    this._intensityCallback = this._intensityCallback.bind(this);
    this._setMasterVolume = this._setMasterVolume.bind(this);

    this.view.onSoundOnOff(this._soundOnOff);
    this.view.onIntensityOnOff(this._intensityOnOff);

    // this.view.onModelChange(this._onModelChange);
    // this.view.onToggleSendOsc((val) => {
    //   this._sendOscFlag = val;
    // });

    // this.view.onEnableSounds(this._enableSounds);
    // this.view.onSetMasterVolume(this._setMasterVolume);

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
    this._selectInput = new lfo.operator.Select({ indices: [0, 1, 2] });
    // this._inputBridge = new lfo.sink.Bridge({
    //   // processFrame: (frame) => { console.log(frame); }
    // });
    this._selectAccIntensity = new lfo.operator.Select({ index: 6 });
    this._intensityBridge = new lfo.sink.Bridge({
      processFrame: this._intensityCallback
    });
    this._xmmDecoder = new XmmDecoderLfo({
      likelihoodWindow: 20,
      callback: this._onModelFilter
    });

    this._devicemotionIn.connect(this._featurizer);
    this._featurizer.connect(this._selectInput);
    this._selectInput.connect(this._xmmDecoder);
    this._featurizer.connect(this._selectAccIntensity);
    this._selectAccIntensity.connect(this._intensityBridge);
    // this._devicemotionIn.connect(this._xmmDecoder);
    this._devicemotionIn.start();

    //----------------- RECEIVE -----------------//
    this.receive('model', this._onReceiveModel);
    this.receive('models', this._onReceiveModels);
  }

  //=============================================//

  start() {
    super.start(); // don't forget this

    if (!this.hasStarted)
      this.init();

    this.show();

    // initialize rendering
    // this.renderer = new MotionRenderer(100);
    // this.view.addRenderer(this.renderer);
    // this function is called before each update (`Renderer.render`) of the canvas
    // this.view.setPreRender((ctx, dt) => {});

    this.audioEngine.start();
    // this._enableSounds(true);

    if (this.motionInput.isAvailable('devicemotion')) {
      this.motionInput.addListener('devicemotion', this._motionCallback);
    }
  }

  //================ callbacks : ================//

  _motionCallback(eventValues) {
    const values = eventValues.slice(0,3).concat(eventValues.slice(-3));
    this._devicemotionIn.process(audioContext.currentTime, values);

    if (this._sendOscFlag) {
    	this._sendOsc('sensors', values);
    }
  }

  _onReceiveModel(model) {
    this._xmmDecoder.params.set('model', model);
    console.log('received model');
  }

  _onReceiveModels(models) {
  	this._models = models;
  // 	this.view.content = {
  //   	title: 'play !',
  //     models: this._models  		
  // 	};
		// this.view.render('#modelsDiv');
		this._currentModel = Object.keys(models)[0];
    this._xmmDecoder.params.set('model', this._models['azerty'/*this._currentModel*/]);
    console.log('received models');
  }

  _onModelChange(value) {
  	this._currentModel = value;
    this._xmmDecoder.params.set('model', this._models[this._currentModel]);
  }

  _onModelFilter(res) {
    const likelihoods = res.likelihoods;
    const likeliest = res.likeliestIndex;
    const label = res.likeliest;
    const alphas = res.alphas;// res.alphas[likeliest];
    const newRes = {
      label: label,
      likeliest: likeliest,
      alphas: alphas,
      likelihoods: likelihoods
    }

    // this.renderer.setModelResults(newRes);

    if (this.likeliest !== label) {
    	this.likeliest = label;
      console.log('changed gesture to : ' + label);
      const i = this.labels.indexOf(label);
      this.audioEngine.fadeToNewSound(i);
    }

  	if (this._sendOscFlag) {
  		this._sendOsc('likelihoods', likelihoods);
  		this._sendOsc('likeliest', likeliest);
  	}
  }

  _soundOnOff(onOff) {
    this.audioEngine.enableSounds(onOff);
  }

  _intensityOnOff(onOff) {
    this._intensityOn = onOff;
  }

  _intensityCallback(frame) {
  	if (this._sendOscFlag) {
  		this._sendOsc('intensity', [frame.data[0]]);
  	}

    if (this._intensityOn) {
      this.audioEngine.setGainFromIntensity(frame.data[0]);      
    } else {
      this.audioEngine.setGainFromIntensity(1);
    }
  }

  _setMasterVolume(volume) {
    this.audioEngine.setMasterVolume(volume);
  }

  _sendOsc(suffix, values) {
  	this.send('sendosc', {
  		url: `/${this._currentModel}/${suffix}`,
  		values: values
  	});
  }
}