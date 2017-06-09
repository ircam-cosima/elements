import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import { XmmDecoderLfo } from 'xmm-lfo';
import { classes } from  '../shared/config';
// import FeaturizerLfo from '../shared/FeaturizerLfo';
import PreProcess from '../shared/PreProcess';
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

  setModelItem(item) {
    const el = this.$el.querySelector('#modelSelect');
    el.value = item;
  }
}

const viewTemplate = `
  <!-- <canvas class="background"> -->
  <div class="foreground">
    <div class="section-top flex-middle">
    	<div>

        <div class="selectDiv" id="modelsDiv">
          <label> Model : </label>
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
    this._currentModel = null;
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

    this._onReceiveModels = this._onReceiveModels.bind(this);
    this._onModelChange = this._onModelChange.bind(this);
    this._onModelFilter = this._onModelFilter.bind(this);   
    this._motionCallback = this._motionCallback.bind(this);

    this._onSoundOnOff = this._onSoundOnOff.bind(this);
    this._onIntensityOnOff = this._onIntensityOnOff.bind(this);

    this._intensityCallback = this._intensityCallback.bind(this);

    this.view.onModelChange(this._onModelChange);
    this.view.onSoundOnOff(this._onSoundOnOff);
    this.view.onIntensityOnOff(this._onIntensityOnOff);


    //------------------ LFO's ------------------//
    this._xmmDecoder = new XmmDecoderLfo({
      likelihoodWindow: 20,
      callback: this._onModelFilter,
    });
    this._preProcess = new PreProcess(this._intensityCallback);
    this._preProcess.connect(this._xmmDecoder);
    this._preProcess.start();

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

    this.audioEngine.start();

    if (this.motionInput.isAvailable('devicemotion')) {
      this.motionInput.addListener('devicemotion', this._motionCallback);
    }
  }

  //================ callbacks : ================//

  _motionCallback(eventValues) {
    const values = eventValues.slice(0,3).concat(eventValues.slice(-3));
    // this._devicemotionIn.process(audioContext.currentTime, values);
    this._preProcess.process(audioContext.currentTime, values);
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

  _onReceiveModels(models) {
  	this._models = models;

  	this.view.content = {
    	title: 'play !',
      models: this._models  		
  	};

		this.view.render('#modelsDiv');
		// this._currentModel = Object.keys(models)[0];

    const prevModels = Object.keys(models);
    const prevModelIndex = prevModels.indexOf(this._currentModel);

    if (this._currentModel &&  prevModelIndex > -1) {
      this._currentModel = prevModels[prevModelIndex];
      this.view.setItem(this._currentModel);
    } else {
      this._currentModel = prevModels[0];
    }

    this._xmmDecoder.params.set('model', this._models[this._currentModel]);
    console.log('received models');
  }

  _onModelFilter(res) {

    const likelihoods = res ? res.likelihoods : [];
    const likeliest = res ? res.likeliestIndex : -1;
    const label = res ? res.likeliest : 'unknown';
    const alphas = res ? res.alphas : [[]];// res.alphas[likeliest];

    const newRes = {
      label: label,
      likeliest: likeliest,
      // alphas: alphas,
      likelihoods: likelihoods
    }

    if (this.likeliest !== label) {
    	this.likeliest = label;
      console.log('changed gesture to : ' + label);
      const i = this.labels.indexOf(label);
      this.audioEngine.fadeToNewSound(i);
    }
  }

  _onModelChange(value) {
    this._currentModel = value;
    this._xmmDecoder.params.set('model', this._models[this._currentModel]);
  }

  _onSoundOnOff(onOff) {
    this.audioEngine.enableSounds(onOff);
  }

  _onIntensityOnOff(onOff) {
    this._intensityOn = onOff;
  }
}