'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _Login = require('../services/Login');

var _common = require('waves-lfo/common');

var lfo = _interopRequireWildcard(_common);

var _xmmLfo = require('xmm-lfo');

var _FeaturizerLfo = require('../shared/FeaturizerLfo');

var _FeaturizerLfo2 = _interopRequireDefault(_FeaturizerLfo);

var _LikelihoodsRenderer = require('../shared/LikelihoodsRenderer');

var _LikelihoodsRenderer2 = _interopRequireDefault(_LikelihoodsRenderer);

var _config = require('../shared/config');

var _AudioEngine = require('../shared/AudioEngine');

var _AudioEngine2 = _interopRequireDefault(_AudioEngine);

var _AutoMotionTrigger = require('../shared/AutoMotionTrigger');

var _AutoMotionTrigger2 = _interopRequireDefault(_AutoMotionTrigger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

var viewModel = {
  sounds: _config.sounds,
  assetsDomain: ''
};

var viewTemplate = '\n  <div class="foreground">\n\n    <div id="nav">\n      <!-- <a href="#" id="openConfigBtn">&#9776;</a> -->\n      <a href="#" id="openConfigBtn"> <img src="<%= assetsDomain %>pics/navicon.png"> </a>\n    </div>\n\n    <div class="section-top flex-middle">\n      <div class="section-overlay">\n        \n        <div class="overlay-content">\n          <p> Global configuration </p>\n          <br />\n          <div class="selectDiv">\n            <label for="modelSelect"> Model type : </label>\n            <select id="modelSelect">\n              <option value="gmm">gmm</option>\n              <option value="hhmm">hhmm</option>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="gaussSelect"> Gaussians : </label>\n            <select id="gaussSelect">\n              <% for (var i = 0; i < 10; i++) { %>\n                <option value="<%= i+1 %>">\n                  <%= i+1 %>\n                </option>\n              <% } %>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="covModeSelect"> Covariance mode : </label>\n            <select id="covModeSelect">\n              <option value="full">full</option>\n              <option value="diagonal">diagonal</option>\n            </select>\n          </div>        \n          <div class="selectDiv">\n            <label for="absReg"> Absolute regularization : </label>\n            <input id="absReg" type="text" value="0.01">\n            </input>\n          </div>        \n          <div class="selectDiv">\n            <label for="relReg"> Relative regularization : </label>\n            <input id="relReg" type="text" value="0.01">\n            </input>\n          </div>        \n\n          <hr>\n          <p> Hhmm parameters </p>\n          <br />\n          <!--\n          <div class="selectDiv">\n            <label for="hierarchicalSelect"> Hierarchical : </label>\n            <select id="hierarchicalSelect">\n              <option value="yes">yes</option>\n              <option value="no">no</option>\n             </select>\n          </div>\n          -->        \n          <div class="selectDiv">\n            <label for="statesSelect"> States : </label>\n            <select id="statesSelect">\n              <% for (var i = 0; i < 20; i++) { %>\n                <option value="<%= i+1 %>">\n                  <%= i+1 %>\n                </option>\n              <% } %>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="transModeSelect"> Transition mode : </label>\n            <select id="transModeSelect">\n              <option value="ergodic">ergodic</option>\n              <option value="leftright">leftright</option>\n            </select>\n          </div> \n          <!--\n          <div class="selectDiv">\n            <label for="regressEstimSelect"> Regression estimator : </label>\n            <select id="regressEstimSelect">\n              <option value="full">full</option>\n              <option value="windowed">windowed</option>\n              <option value="likeliest">likeliest</option>\n            </select>\n          </div>\n          -->\n\n          <!--\n          <hr>\n          <p> Autorecord parameters </p>\n          <br />\n          <div class="selectDiv">\n            <label for="highThresh"> High threshold : </label>\n            <input id="highThresh" type="text" value="0.6">\n            </input>\n          </div>        \n          <div class="selectDiv">\n            <label for="lowThresh"> Low threshold : </label>\n            <input id="lowThresh" type="text" value="0.3">\n            </input>\n          </div>        \n          <div class="selectDiv">\n            <label for="offDelay"> Off delay (ms) : </label>\n            <input id="offDelay" type="text" value="500">\n            </input>\n          </div>        \n          -->\n        </div>\n      </div>\n\n      <div class="section-underlay">\n        <div class="selectDiv"> Label :\n          <select id="labelSelect">\n            <% for (var prop in sounds) { %>\n              <option value="<%= prop %>">\n                <%= prop %>\n              </option>\n            <% } %>\n          </select>\n        </div>\n        <button id="recBtn">REC</button>\n        <button id="sendBtn">SEND</button>\n        <div class="canvasDiv">\n          <canvas class="multislider" id="likelihoods"></canvas>\n        </div>\n        <button id="clearLabelBtn">CLEAR LABEL</button>\n        <button id="clearModelBtn">CLEAR MODEL</button>\n        <div class="toggleDiv">\n          <button id="playBtn" class="toggleBtn"></button>\n          Enable sounds\n        </div>\n        <!--\n        <div class="toggleDiv">\n          <button id="intensityBtn" class="toggleBtn"></button>\n          Disable intensity control\n        </div>\n        -->\n      </div>\n    </div>\n\n    <div class="section-center flex-center">\n    </div>\n    <div class="section-bottom flex-middle">\n    </div>\n\n  </div>\n';

var DesignerView = function (_soundworks$CanvasVie) {
  (0, _inherits3.default)(DesignerView, _soundworks$CanvasVie);

  function DesignerView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, DesignerView);
    return (0, _possibleConstructorReturn3.default)(this, (DesignerView.__proto__ || (0, _getPrototypeOf2.default)(DesignerView)).call(this, template, content, events, options));
  }

  (0, _createClass3.default)(DesignerView, [{
    key: 'onConfig',
    value: function onConfig(callback) {
      var _this2 = this;

      this.installEvents({
        'click #openConfigBtn': function clickOpenConfigBtn() {
          var div = _this2.$el.querySelector('.section-overlay');
          var active = div.classList.contains('active');

          if (!active) {
            div.classList.add('active');
          } else {
            elt = _this2.$el.querySelector('#modelSelect');
            var type = elt.options[elt.selectedIndex].value;

            var config = {};
            var elt = void 0;
            elt = _this2.$el.querySelector('#gaussSelect');
            config['gaussians'] = Number(elt.options[elt.selectedIndex].value);
            elt = _this2.$el.querySelector('#covModeSelect');
            config['covarianceMode'] = elt.options[elt.selectedIndex].value;
            elt = _this2.$el.querySelector('#absReg');
            config['absoluteRegularization'] = Number(elt.value);
            elt = _this2.$el.querySelector('#relReg');
            config['relativeRegularization'] = Number(elt.value);
            // elt = this.$el.querySelector('#hierarchicalSelect');
            // config['hierarchical'] = (elt.options[elt.selectedIndex].value === 'yes');
            elt = _this2.$el.querySelector('#transModeSelect');
            config['transitionMode'] = elt.options[elt.selectedIndex].value;
            elt = _this2.$el.querySelector('#statesSelect');
            config['states'] = Number(elt.options[elt.selectedIndex].value);
            // elt = this.$el.querySelector('#regressEstimSelect');
            // config['regressionEstimator'] = elt.options[elt.selectedIndex].value;

            // elt = this.$el.querySelector('#highThresh');
            // config['highThresh'] = Number(elt.value);
            // elt = this.$el.querySelector('#lowThresh');
            // config['lowThresh'] = Number(elt.value);
            // elt = this.$el.querySelector('#offDelay');
            // config['offDelay'] = Number(elt.value);

            callback(type, config);

            div.classList.remove('active');
          }
        }
      });
    }
  }, {
    key: 'onArm',
    value: function onArm(callback) {
      var _this3 = this;

      this.installEvents({
        'click #recBtn': function clickRecBtn() {
          var rec = _this3.$el.querySelector('#recBtn');
          if (!rec.classList.contains('armed')) {
            rec.innerHTML = 'ARMED';
            rec.classList.add('armed');
            // rec.classList.remove('recording');
            callback('arm');
          } else {
            rec.innerHTML = 'STOP';
            rec.classList.remove('active');
            rec.classList.remove('armed');
            callback('stop');
          }
        }
      });
    }
  }, {
    key: 'onSendPhrase',
    value: function onSendPhrase(callback) {
      var _this4 = this;

      this.installEvents({
        'click #sendBtn': function clickSendBtn() {
          var labels = _this4.$el.querySelector('#labelSelect');
          callback(labels.options[labels.selectedIndex].text);
        }
      });
    }
  }, {
    key: 'onClearLabel',
    value: function onClearLabel(callback) {
      var _this5 = this;

      this.installEvents({
        'click #clearLabelBtn': function clickClearLabelBtn() {
          var labels = _this5.$el.querySelector('#labelSelect');
          callback(labels.options[labels.selectedIndex].text);
        }
      });
    }
  }, {
    key: 'onClearModel',
    value: function onClearModel(callback) {
      this.installEvents({
        'click #clearModelBtn': function clickClearModelBtn() {
          callback();
        }
      });
    }
  }, {
    key: 'onEnableSounds',
    value: function onEnableSounds(callback) {
      var _this6 = this;

      this.installEvents({
        'click #playBtn': function clickPlayBtn() {
          var btn = _this6.$el.querySelector('#playBtn');
          var active = btn.classList.contains('active');
          if (!active) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
          callback(!active);
        }
      });
    }
  }]);
  return DesignerView;
}(soundworks.CanvasView);

;

var DesignerExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(DesignerExperience, _soundworks$Experienc);

  function DesignerExperience(assetsDomain) {
    (0, _classCallCheck3.default)(this, DesignerExperience);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (DesignerExperience.__proto__ || (0, _getPrototypeOf2.default)(DesignerExperience)).call(this));

    _this7.platform = _this7.require('platform', { features: ['web-audio'] });
    _this7.checkin = _this7.require('checkin', { showDialog: false });
    _this7.sharedConfig = _this7.require('shared-config', { items: ['assetsDomain'] });
    _this7.login = _this7.require('login');
    _this7.audioBufferManager = _this7.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: _config.sounds
    });
    _this7.motionInput = _this7.require('motion-input', {
      descriptors: ['devicemotion']
    });

    _this7.labels = (0, _keys2.default)(_config.sounds);
    _this7.likeliest = undefined;
    return _this7;
  }

  (0, _createClass3.default)(DesignerExperience, [{
    key: 'start',
    value: function start() {
      var _this8 = this;

      (0, _get3.default)(DesignerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerExperience.prototype), 'start', this).call(this); // don't forget this

      this.view = new DesignerView(viewTemplate, viewModel, {}, {
        preservePixelRatio: true,
        className: 'designer'
      });

      this.view.model.assetsDomain = this.sharedConfig.get('assetsDomain');

      this.show().then(function () {

        _this8._onConfig = _this8._onConfig.bind(_this8);
        _this8._onArm = _this8._onArm.bind(_this8);
        _this8._autoStartRecord = _this8._autoStartRecord.bind(_this8);
        _this8._autoStopRecord = _this8._autoStopRecord.bind(_this8);
        _this8._onSendPhrase = _this8._onSendPhrase.bind(_this8);
        _this8._onClearLabel = _this8._onClearLabel.bind(_this8);
        _this8._onClearModel = _this8._onClearModel.bind(_this8);
        _this8._onReceiveModel = _this8._onReceiveModel.bind(_this8);
        _this8._onModelFilter = _this8._onModelFilter.bind(_this8);
        _this8._motionCallback = _this8._motionCallback.bind(_this8);
        _this8._intensityCallback = _this8._intensityCallback.bind(_this8);
        _this8._enableSounds = _this8._enableSounds.bind(_this8);

        _this8.view.onConfig(_this8._onConfig);
        _this8.view.onArm(_this8._onArm);
        _this8.view.onSendPhrase(_this8._onSendPhrase);
        _this8.view.onClearLabel(_this8._onClearLabel);
        _this8.view.onClearModel(_this8._onClearModel);
        _this8.view.onEnableSounds(_this8._enableSounds);

        //--------------------------------- LFO's --------------------------------//
        _this8._devicemotionIn = new lfo.source.EventIn({
          frameType: 'vector',
          frameSize: 3, // 6,
          frameRate: 1, // this.motionInput.period doesn't seem available anymore
          description: ['accelGravX', 'accelGravY', 'accelGravZ'] // 'gyrAlpha', 'gyrBeta', 'gyrGamma']
        });
        _this8._featurizer = new _FeaturizerLfo2.default({
          descriptors: ['accIntensity'],
          callback: _this8._intensityCallback
        });
        _this8._phraseRecorder = new _xmmLfo.PhraseRecorderLfo({
          columnNames: ['accelGravX', 'accelGravY', 'accelGravZ']
          // 'rotAlpha', 'rotBeta', 'rotGamma']      
        });
        _this8._onOffDecoder = new lfo.operator.OnOff();
        _this8._onOffDecoder.setState('on');
        _this8._xmmDecoder = new _xmmLfo.XmmDecoderLfo({
          likelihoodWindow: 20,
          callback: _this8._onModelFilter
        });

        _this8._devicemotionIn.connect(_this8._featurizer);
        _this8._devicemotionIn.connect(_this8._phraseRecorder);
        _this8._devicemotionIn.connect(_this8._onOffDecoder);
        _this8._onOffDecoder.connect(_this8._xmmDecoder);
        _this8._devicemotionIn.start();

        _this8.autoTrigger = new _AutoMotionTrigger2.default({
          highThresh: 0.6,
          lowThresh: 0.4,
          offDelay: 300,
          startCallback: _this8._autoStartRecord,
          stopCallback: _this8._autoStopRecord
        });

        // initialize rendering
        _this8.renderer = new _LikelihoodsRenderer2.default(100);
        _this8.view.addRenderer(_this8.renderer);
        // this.view.setPreRender((ctx, dt) => {});

        _this8.audioEngine = new _AudioEngine2.default(_this8.audioBufferManager.data);
        _this8.audioEngine.start();

        if (_this8.motionInput.isAvailable('devicemotion')) {
          _this8.motionInput.addListener('devicemotion', _this8._motionCallback);
        }

        //----------------- RECEIVE -----------------//
        _this8.receive('model', _this8._onReceiveModel);
      });
    }
  }, {
    key: '_onConfig',
    value: function _onConfig(type, config) {
      this.send('configuration', { type: type, config: config });
    }
  }, {
    key: '_onArm',
    value: function _onArm(cmd) {
      switch (cmd) {
        case 'arm':
          this.autoTrigger.setState('on');
          break;

        case 'stop':
          this._autoStopRecord();
          break;
      }
    }
  }, {
    key: '_autoStartRecord',
    value: function _autoStartRecord() {
      // set to play currently selected sound by interrupting recognition
      // and forcing current label
      this._onOffDecoder.setState('off');
      var labels = this.view.$el.querySelector('#labelSelect');
      this.likeliest = labels.options[labels.selectedIndex].text;
      this.audioEngine.fadeToNewSound(this.labels.indexOf(this.likeliest));

      // start recording
      this._phraseRecorder.start();

      // update view
      var rec = this.view.$el.querySelector('#recBtn');
      rec.innerHTML = 'STOP';
      rec.classList.add('active');
    }
  }, {
    key: '_autoStopRecord',
    value: function _autoStopRecord() {
      // stop recording
      this._phraseRecorder.stop();

      // enable recognition back
      this._onOffDecoder.setState('on');

      // update view
      var rec = this.view.$el.querySelector('#recBtn');
      rec.innerHTML = 'REC';
      rec.classList.remove('active', 'armed');
      this.autoTrigger.setState('off');
    }

    //=============================================//

  }, {
    key: '_onSendPhrase',
    value: function _onSendPhrase(label) {
      this._phraseRecorder.setPhraseLabel(label);
      var phrase = this._phraseRecorder.getRecordedPhrase();
      if (phrase.length > 0) {
        if (confirm('send phrase with label ' + label + ' ?')) {
          this.send('phrase', { cmd: 'add', data: phrase });
        }
      } else {
        alert('cannot send empty phrases');
        console.error('error : empty phrases are forbidden');
      }
    }
  }, {
    key: '_onClearLabel',
    value: function _onClearLabel(label) {
      if (confirm('do you really want to remove the label ' + label + ' ?')) {
        this.send('clear', { cmd: 'label', data: label });
      }
    }
  }, {
    key: '_onClearModel',
    value: function _onClearModel() {
      if (confirm('do you really want to remove the current model ?')) {
        this.send('clear', { cmd: 'model' });
      }
    }

    //================ callbacks : ================//

  }, {
    key: '_motionCallback',
    value: function _motionCallback(eventValues) {
      var values = eventValues.slice(0, 3).concat(eventValues.slice(-3));
      this._devicemotionIn.process(audioContext.currentTime, values);
    }
  }, {
    key: '_onReceiveModel',
    value: function _onReceiveModel(model) {
      var config = model ? model.configuration.default_parameters : {};

      config.modelType = config.states ? 'hhmm' : 'gmm';
      this._updateConfigFromModel(config);
      this._xmmDecoder.params.set('model', model);
    }
  }, {
    key: '_updateConfigFromModel',
    value: function _updateConfigFromModel(config) {
      var v = this.view.$el;
      var elt = void 0;

      elt = v.querySelector('#modelSelect');
      elt.selectedIndex = config.modelType === 'hhmm' ? 1 : 0;

      elt = v.querySelector('#gaussSelect');
      elt.selectedIndex = config.gaussians - 1;
      elt = v.querySelector('#covModeSelect');
      elt.selectedIndex = config.covariance_mode;
      elt = v.querySelector('#absReg');
      elt.value = config.absolute_regularization;
      elt = v.querySelector('#relReg');
      elt.value = config.relative_regularization;

      elt = v.querySelector('#statesSelect');
      elt.selectedIndex = config.states ? config.states - 1 : 0;
      elt = v.querySelector('#transModeSelect');
      elt.selectedIndex = config.transition_mode ? config.transition_mode : 0;
    }
  }, {
    key: '_onModelFilter',
    value: function _onModelFilter(res) {
      var likelihoods = res ? res.likelihoods : [];
      var likeliest = res ? res.likeliestIndex : -1;
      var label = res ? res.likeliest : 'unknown';
      var alphas = res ? res.alphas : [[]]; // res.alphas[likeliest];

      var newRes = {
        label: label,
        likeliest: likeliest,
        likelihoods: likelihoods
      };

      this.renderer.setModelResults(newRes);

      if (this.likeliest !== label) {
        this.likeliest = label;
        console.log('changed gesture to : ' + label);
        var i = this.labels.indexOf(label);
        this.audioEngine.fadeToNewSound(i);
      }
    }
  }, {
    key: '_intensityCallback',
    value: function _intensityCallback(values) {
      this.autoTrigger.push(values[0]);
      this.audioEngine.setGainFromIntensity(values[0]);
    }
  }, {
    key: '_enableSounds',
    value: function _enableSounds(onOff) {
      this.audioEngine.enableSounds(onOff);
    }
  }]);
  return DesignerExperience;
}(soundworks.Experience);

;

exports.default = DesignerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwibGZvIiwiYXVkaW9Db250ZXh0Iiwidmlld01vZGVsIiwic291bmRzIiwiYXNzZXRzRG9tYWluIiwidmlld1RlbXBsYXRlIiwiRGVzaWduZXJWaWV3IiwidGVtcGxhdGUiLCJjb250ZW50IiwiZXZlbnRzIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiaW5zdGFsbEV2ZW50cyIsImRpdiIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJhY3RpdmUiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImFkZCIsImVsdCIsInR5cGUiLCJzZWxlY3RlZEluZGV4IiwidmFsdWUiLCJjb25maWciLCJOdW1iZXIiLCJyZW1vdmUiLCJyZWMiLCJpbm5lckhUTUwiLCJsYWJlbHMiLCJ0ZXh0IiwiYnRuIiwiQ2FudmFzVmlldyIsIkRlc2lnbmVyRXhwZXJpZW5jZSIsInBsYXRmb3JtIiwicmVxdWlyZSIsImZlYXR1cmVzIiwiY2hlY2tpbiIsInNob3dEaWFsb2ciLCJzaGFyZWRDb25maWciLCJpdGVtcyIsImxvZ2luIiwiYXVkaW9CdWZmZXJNYW5hZ2VyIiwiZmlsZXMiLCJtb3Rpb25JbnB1dCIsImRlc2NyaXB0b3JzIiwibGlrZWxpZXN0IiwidW5kZWZpbmVkIiwidmlldyIsInByZXNlcnZlUGl4ZWxSYXRpbyIsImNsYXNzTmFtZSIsIm1vZGVsIiwiZ2V0Iiwic2hvdyIsInRoZW4iLCJfb25Db25maWciLCJiaW5kIiwiX29uQXJtIiwiX2F1dG9TdGFydFJlY29yZCIsIl9hdXRvU3RvcFJlY29yZCIsIl9vblNlbmRQaHJhc2UiLCJfb25DbGVhckxhYmVsIiwiX29uQ2xlYXJNb2RlbCIsIl9vblJlY2VpdmVNb2RlbCIsIl9vbk1vZGVsRmlsdGVyIiwiX21vdGlvbkNhbGxiYWNrIiwiX2ludGVuc2l0eUNhbGxiYWNrIiwiX2VuYWJsZVNvdW5kcyIsIm9uQ29uZmlnIiwib25Bcm0iLCJvblNlbmRQaHJhc2UiLCJvbkNsZWFyTGFiZWwiLCJvbkNsZWFyTW9kZWwiLCJvbkVuYWJsZVNvdW5kcyIsIl9kZXZpY2Vtb3Rpb25JbiIsInNvdXJjZSIsIkV2ZW50SW4iLCJmcmFtZVR5cGUiLCJmcmFtZVNpemUiLCJmcmFtZVJhdGUiLCJkZXNjcmlwdGlvbiIsIl9mZWF0dXJpemVyIiwiX3BocmFzZVJlY29yZGVyIiwiY29sdW1uTmFtZXMiLCJfb25PZmZEZWNvZGVyIiwib3BlcmF0b3IiLCJPbk9mZiIsInNldFN0YXRlIiwiX3htbURlY29kZXIiLCJsaWtlbGlob29kV2luZG93IiwiY29ubmVjdCIsInN0YXJ0IiwiYXV0b1RyaWdnZXIiLCJoaWdoVGhyZXNoIiwibG93VGhyZXNoIiwib2ZmRGVsYXkiLCJzdGFydENhbGxiYWNrIiwic3RvcENhbGxiYWNrIiwicmVuZGVyZXIiLCJhZGRSZW5kZXJlciIsImF1ZGlvRW5naW5lIiwiZGF0YSIsImlzQXZhaWxhYmxlIiwiYWRkTGlzdGVuZXIiLCJyZWNlaXZlIiwic2VuZCIsImNtZCIsImZhZGVUb05ld1NvdW5kIiwiaW5kZXhPZiIsInN0b3AiLCJsYWJlbCIsInNldFBocmFzZUxhYmVsIiwicGhyYXNlIiwiZ2V0UmVjb3JkZWRQaHJhc2UiLCJsZW5ndGgiLCJjb25maXJtIiwiYWxlcnQiLCJjb25zb2xlIiwiZXJyb3IiLCJldmVudFZhbHVlcyIsInZhbHVlcyIsInNsaWNlIiwiY29uY2F0IiwicHJvY2VzcyIsImN1cnJlbnRUaW1lIiwiY29uZmlndXJhdGlvbiIsImRlZmF1bHRfcGFyYW1ldGVycyIsIm1vZGVsVHlwZSIsInN0YXRlcyIsIl91cGRhdGVDb25maWdGcm9tTW9kZWwiLCJwYXJhbXMiLCJzZXQiLCJ2IiwiZ2F1c3NpYW5zIiwiY292YXJpYW5jZV9tb2RlIiwiYWJzb2x1dGVfcmVndWxhcml6YXRpb24iLCJyZWxhdGl2ZV9yZWd1bGFyaXphdGlvbiIsInRyYW5zaXRpb25fbW9kZSIsInJlcyIsImxpa2VsaWhvb2RzIiwibGlrZWxpZXN0SW5kZXgiLCJhbHBoYXMiLCJuZXdSZXMiLCJzZXRNb2RlbFJlc3VsdHMiLCJsb2ciLCJpIiwicHVzaCIsInNldEdhaW5Gcm9tSW50ZW5zaXR5Iiwib25PZmYiLCJlbmFibGVTb3VuZHMiLCJFeHBlcmllbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7O0FBQ1o7O0FBQ0E7O0lBQVlDLEc7O0FBQ1o7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUMsZUFBZUYsV0FBV0UsWUFBaEM7O0FBRUEsSUFBTUMsWUFBWTtBQUNoQkMsd0JBRGdCO0FBRWhCQyxnQkFBYztBQUZFLENBQWxCOztBQUtBLElBQU1DLDA5SkFBTjs7SUFzSk1DLFk7OztBQUNKLHdCQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQkMsTUFBL0IsRUFBdUNDLE9BQXZDLEVBQWdEO0FBQUE7QUFBQSw2SUFDeENILFFBRHdDLEVBQzlCQyxPQUQ4QixFQUNyQkMsTUFEcUIsRUFDYkMsT0FEYTtBQUUvQzs7Ozs2QkFFUUMsUSxFQUFVO0FBQUE7O0FBQ2pCLFdBQUtDLGFBQUwsQ0FBbUI7QUFDakIsZ0NBQXdCLDhCQUFNO0FBQzVCLGNBQU1DLE1BQU0sT0FBS0MsR0FBTCxDQUFTQyxhQUFULENBQXVCLGtCQUF2QixDQUFaO0FBQ0EsY0FBTUMsU0FBU0gsSUFBSUksU0FBSixDQUFjQyxRQUFkLENBQXVCLFFBQXZCLENBQWY7O0FBRUEsY0FBSSxDQUFDRixNQUFMLEVBQWE7QUFDWEgsZ0JBQUlJLFNBQUosQ0FBY0UsR0FBZCxDQUFrQixRQUFsQjtBQUNELFdBRkQsTUFFTztBQUNMQyxrQkFBTSxPQUFLTixHQUFMLENBQVNDLGFBQVQsQ0FBdUIsY0FBdkIsQ0FBTjtBQUNBLGdCQUFNTSxPQUFPRCxJQUFJVixPQUFKLENBQVlVLElBQUlFLGFBQWhCLEVBQStCQyxLQUE1Qzs7QUFFQSxnQkFBTUMsU0FBUyxFQUFmO0FBQ0EsZ0JBQUlKLFlBQUo7QUFDQUEsa0JB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aWduZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgeyBMb2dpbiB9IGZyb20gJy4uL3NlcnZpY2VzL0xvZ2luJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY29tbW9uJztcbmltcG9ydCB7IFBocmFzZVJlY29yZGVyTGZvLCBYbW1EZWNvZGVyTGZvIH0gZnJvbSAneG1tLWxmbyc7XG5pbXBvcnQgRmVhdHVyaXplckxmbyBmcm9tICcuLi9zaGFyZWQvRmVhdHVyaXplckxmbyc7XG5pbXBvcnQgTGlrZWxpaG9vZHNSZW5kZXJlciBmcm9tICcuLi9zaGFyZWQvTGlrZWxpaG9vZHNSZW5kZXJlcic7XG5pbXBvcnQgeyBzb3VuZHMgfSBmcm9tICAnLi4vc2hhcmVkL2NvbmZpZyc7XG5pbXBvcnQgQXVkaW9FbmdpbmUgZnJvbSAnLi4vc2hhcmVkL0F1ZGlvRW5naW5lJztcbmltcG9ydCBBdXRvTW90aW9uVHJpZ2dlciBmcm9tICcuLi9zaGFyZWQvQXV0b01vdGlvblRyaWdnZXInO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuY29uc3Qgdmlld01vZGVsID0ge1xuICBzb3VuZHM6IHNvdW5kcyxcbiAgYXNzZXRzRG9tYWluOiAnJyxcbn07XG5cbmNvbnN0IHZpZXdUZW1wbGF0ZSA9IGBcbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmRcIj5cblxuICAgIDxkaXYgaWQ9XCJuYXZcIj5cbiAgICAgIDwhLS0gPGEgaHJlZj1cIiNcIiBpZD1cIm9wZW5Db25maWdCdG5cIj4mIzk3NzY7PC9hPiAtLT5cbiAgICAgIDxhIGhyZWY9XCIjXCIgaWQ9XCJvcGVuQ29uZmlnQnRuXCI+IDxpbWcgc3JjPVwiPCU9IGFzc2V0c0RvbWFpbiAlPnBpY3MvbmF2aWNvbi5wbmdcIj4gPC9hPlxuICAgIDwvZGl2PlxuXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1vdmVybGF5XCI+XG4gICAgICAgIFxuICAgICAgICA8ZGl2IGNsYXNzPVwib3ZlcmxheS1jb250ZW50XCI+XG4gICAgICAgICAgPHA+IEdsb2JhbCBjb25maWd1cmF0aW9uIDwvcD5cbiAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwibW9kZWxTZWxlY3RcIj4gTW9kZWwgdHlwZSA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwibW9kZWxTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImdtbVwiPmdtbTwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiaGhtbVwiPmhobW08L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJnYXVzc1NlbGVjdFwiPiBHYXVzc2lhbnMgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cImdhdXNzU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDwlIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykgeyAlPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI8JT0gaSsxICU+XCI+XG4gICAgICAgICAgICAgICAgICA8JT0gaSsxICU+XG4gICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJjb3ZNb2RlU2VsZWN0XCI+IENvdmFyaWFuY2UgbW9kZSA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwiY292TW9kZVNlbGVjdFwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZnVsbFwiPmZ1bGw8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImRpYWdvbmFsXCI+ZGlhZ29uYWw8L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PiAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImFic1JlZ1wiPiBBYnNvbHV0ZSByZWd1bGFyaXphdGlvbiA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9XCJhYnNSZWdcIiB0eXBlPVwidGV4dFwiIHZhbHVlPVwiMC4wMVwiPlxuICAgICAgICAgICAgPC9pbnB1dD5cbiAgICAgICAgICA8L2Rpdj4gICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJyZWxSZWdcIj4gUmVsYXRpdmUgcmVndWxhcml6YXRpb24gOiA8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPVwicmVsUmVnXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIjAuMDFcIj5cbiAgICAgICAgICAgIDwvaW5wdXQ+XG4gICAgICAgICAgPC9kaXY+ICAgICAgICBcblxuICAgICAgICAgIDxocj5cbiAgICAgICAgICA8cD4gSGhtbSBwYXJhbWV0ZXJzIDwvcD5cbiAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICA8IS0tXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImhpZXJhcmNoaWNhbFNlbGVjdFwiPiBIaWVyYXJjaGljYWwgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cImhpZXJhcmNoaWNhbFNlbGVjdFwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwieWVzXCI+eWVzPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJub1wiPm5vPC9vcHRpb24+XG4gICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgLS0+ICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwic3RhdGVzU2VsZWN0XCI+IFN0YXRlcyA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwic3RhdGVzU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDwlIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykgeyAlPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI8JT0gaSsxICU+XCI+XG4gICAgICAgICAgICAgICAgICA8JT0gaSsxICU+XG4gICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ0cmFuc01vZGVTZWxlY3RcIj4gVHJhbnNpdGlvbiBtb2RlIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJ0cmFuc01vZGVTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImVyZ29kaWNcIj5lcmdvZGljPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJsZWZ0cmlnaHRcIj5sZWZ0cmlnaHQ8L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PiBcbiAgICAgICAgICA8IS0tXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cInJlZ3Jlc3NFc3RpbVNlbGVjdFwiPiBSZWdyZXNzaW9uIGVzdGltYXRvciA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwicmVncmVzc0VzdGltU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJmdWxsXCI+ZnVsbDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwid2luZG93ZWRcIj53aW5kb3dlZDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwibGlrZWxpZXN0XCI+bGlrZWxpZXN0PC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAtLT5cblxuICAgICAgICAgIDwhLS1cbiAgICAgICAgICA8aHI+XG4gICAgICAgICAgPHA+IEF1dG9yZWNvcmQgcGFyYW1ldGVycyA8L3A+XG4gICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImhpZ2hUaHJlc2hcIj4gSGlnaCB0aHJlc2hvbGQgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPVwiaGlnaFRocmVzaFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIwLjZcIj5cbiAgICAgICAgICAgIDwvaW5wdXQ+XG4gICAgICAgICAgPC9kaXY+ICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwibG93VGhyZXNoXCI+IExvdyB0aHJlc2hvbGQgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPVwibG93VGhyZXNoXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIjAuM1wiPlxuICAgICAgICAgICAgPC9pbnB1dD5cbiAgICAgICAgICA8L2Rpdj4gICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJvZmZEZWxheVwiPiBPZmYgZGVsYXkgKG1zKSA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9XCJvZmZEZWxheVwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCI1MDBcIj5cbiAgICAgICAgICAgIDwvaW5wdXQ+XG4gICAgICAgICAgPC9kaXY+ICAgICAgICBcbiAgICAgICAgICAtLT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdW5kZXJsYXlcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPiBMYWJlbCA6XG4gICAgICAgICAgPHNlbGVjdCBpZD1cImxhYmVsU2VsZWN0XCI+XG4gICAgICAgICAgICA8JSBmb3IgKHZhciBwcm9wIGluIHNvdW5kcykgeyAlPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiPCU9IHByb3AgJT5cIj5cbiAgICAgICAgICAgICAgICA8JT0gcHJvcCAlPlxuICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gaWQ9XCJyZWNCdG5cIj5SRUM8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBpZD1cInNlbmRCdG5cIj5TRU5EPC9idXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYW52YXNEaXZcIj5cbiAgICAgICAgICA8Y2FudmFzIGNsYXNzPVwibXVsdGlzbGlkZXJcIiBpZD1cImxpa2VsaWhvb2RzXCI+PC9jYW52YXM+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGlkPVwiY2xlYXJMYWJlbEJ0blwiPkNMRUFSIExBQkVMPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gaWQ9XCJjbGVhck1vZGVsQnRuXCI+Q0xFQVIgTU9ERUw8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRvZ2dsZURpdlwiPlxuICAgICAgICAgIDxidXR0b24gaWQ9XCJwbGF5QnRuXCIgY2xhc3M9XCJ0b2dnbGVCdG5cIj48L2J1dHRvbj5cbiAgICAgICAgICBFbmFibGUgc291bmRzXG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8IS0tXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGVEaXZcIj5cbiAgICAgICAgICA8YnV0dG9uIGlkPVwiaW50ZW5zaXR5QnRuXCIgY2xhc3M9XCJ0b2dnbGVCdG5cIj48L2J1dHRvbj5cbiAgICAgICAgICBEaXNhYmxlIGludGVuc2l0eSBjb250cm9sXG4gICAgICAgIDwvZGl2PlxuICAgICAgICAtLT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+XG4gICAgPC9kaXY+XG5cbiAgPC9kaXY+XG5gO1xuXG5jbGFzcyBEZXNpZ25lclZpZXcgZXh0ZW5kcyBzb3VuZHdvcmtzLkNhbnZhc1ZpZXcge1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cblxuICBvbkNvbmZpZyhjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI29wZW5Db25maWdCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpdiA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLW92ZXJsYXknKTtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gZGl2LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJyk7XG5cbiAgICAgICAgaWYgKCFhY3RpdmUpIHtcbiAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI21vZGVsU2VsZWN0Jyk7XG4gICAgICAgICAgY29uc3QgdHlwZSA9IGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcblxuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHt9O1xuICAgICAgICAgIGxldCBlbHQ7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2dhdXNzU2VsZWN0Jyk7XG4gICAgICAgICAgY29uZmlnWydnYXVzc2lhbnMnXSA9IE51bWJlcihlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWUpO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNjb3ZNb2RlU2VsZWN0Jyk7XG4gICAgICAgICAgY29uZmlnWydjb3ZhcmlhbmNlTW9kZSddID0gZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNhYnNSZWcnKTtcbiAgICAgICAgICBjb25maWdbJ2Fic29sdXRlUmVndWxhcml6YXRpb24nXSA9IE51bWJlcihlbHQudmFsdWUpO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWxSZWcnKTtcbiAgICAgICAgICBjb25maWdbJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nXSA9IE51bWJlcihlbHQudmFsdWUpO1xuICAgICAgICAgIC8vIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNoaWVyYXJjaGljYWxTZWxlY3QnKTtcbiAgICAgICAgICAvLyBjb25maWdbJ2hpZXJhcmNoaWNhbCddID0gKGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZSA9PT0gJ3llcycpO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyN0cmFuc01vZGVTZWxlY3QnKTtcbiAgICAgICAgICBjb25maWdbJ3RyYW5zaXRpb25Nb2RlJ10gPSBlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3N0YXRlc1NlbGVjdCcpO1xuICAgICAgICAgIGNvbmZpZ1snc3RhdGVzJ10gPSBOdW1iZXIoZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlKTtcbiAgICAgICAgICAvLyBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjcmVncmVzc0VzdGltU2VsZWN0Jyk7XG4gICAgICAgICAgLy8gY29uZmlnWydyZWdyZXNzaW9uRXN0aW1hdG9yJ10gPSBlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG5cbiAgICAgICAgICAvLyBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjaGlnaFRocmVzaCcpO1xuICAgICAgICAgIC8vIGNvbmZpZ1snaGlnaFRocmVzaCddID0gTnVtYmVyKGVsdC52YWx1ZSk7XG4gICAgICAgICAgLy8gZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2xvd1RocmVzaCcpO1xuICAgICAgICAgIC8vIGNvbmZpZ1snbG93VGhyZXNoJ10gPSBOdW1iZXIoZWx0LnZhbHVlKTtcbiAgICAgICAgICAvLyBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjb2ZmRGVsYXknKTtcbiAgICAgICAgICAvLyBjb25maWdbJ29mZkRlbGF5J10gPSBOdW1iZXIoZWx0LnZhbHVlKTtcblxuICAgICAgICAgIGNhbGxiYWNrKHR5cGUsIGNvbmZpZyk7XG5cbiAgICAgICAgICBkaXYuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uQXJtKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjcmVjQnRuJzogKCkgPT4ge1xuICAgICAgICBjb25zdCByZWMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjcmVjQnRuJyk7XG4gICAgICAgIGlmICghcmVjLmNsYXNzTGlzdC5jb250YWlucygnYXJtZWQnKSkge1xuICAgICAgICAgIHJlYy5pbm5lckhUTUwgPSAnQVJNRUQnO1xuICAgICAgICAgIHJlYy5jbGFzc0xpc3QuYWRkKCdhcm1lZCcpO1xuICAgICAgICAgIC8vIHJlYy5jbGFzc0xpc3QucmVtb3ZlKCdyZWNvcmRpbmcnKTtcbiAgICAgICAgICBjYWxsYmFjaygnYXJtJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjLmlubmVySFRNTCA9ICdTVE9QJztcbiAgICAgICAgICByZWMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgcmVjLmNsYXNzTGlzdC5yZW1vdmUoJ2FybWVkJyk7XG4gICAgICAgICAgY2FsbGJhY2soJ3N0b3AnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvblNlbmRQaHJhc2UoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNzZW5kQnRuJzogKCkgPT4ge1xuICAgICAgICBjb25zdCBsYWJlbHMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjbGFiZWxTZWxlY3QnKTtcbiAgICAgICAgY2FsbGJhY2sobGFiZWxzLm9wdGlvbnNbbGFiZWxzLnNlbGVjdGVkSW5kZXhdLnRleHQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25DbGVhckxhYmVsKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjY2xlYXJMYWJlbEJ0bic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgbGFiZWxzID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2xhYmVsU2VsZWN0Jyk7XG4gICAgICAgIGNhbGxiYWNrKGxhYmVscy5vcHRpb25zW2xhYmVscy5zZWxlY3RlZEluZGV4XS50ZXh0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uQ2xlYXJNb2RlbChjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI2NsZWFyTW9kZWxCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbkVuYWJsZVNvdW5kcyhjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI3BsYXlCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNwbGF5QnRuJyk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGJ0bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpO1xuICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soIWFjdGl2ZSk7ICAgICAgICBcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuXG5jbGFzcyBEZXNpZ25lckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbyddIH0pO1xuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicsIHsgc2hvd0RpYWxvZzogZmFsc2UgfSk7XG4gICAgdGhpcy5zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnLCB7IGl0ZW1zOiBbJ2Fzc2V0c0RvbWFpbiddIH0pO1xuICAgIHRoaXMubG9naW4gPSB0aGlzLnJlcXVpcmUoJ2xvZ2luJyk7XG4gICAgdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLWJ1ZmZlci1tYW5hZ2VyJywge1xuICAgICAgYXNzZXRzRG9tYWluOiBhc3NldHNEb21haW4sXG4gICAgICBmaWxlczogc291bmRzLFxuICAgIH0pO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHtcbiAgICAgIGRlc2NyaXB0b3JzOiBbJ2RldmljZW1vdGlvbiddXG4gICAgfSk7XG5cbiAgICB0aGlzLmxhYmVscyA9IE9iamVjdC5rZXlzKHNvdW5kcyk7XG4gICAgdGhpcy5saWtlbGllc3QgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IERlc2lnbmVyVmlldyh2aWV3VGVtcGxhdGUsIHZpZXdNb2RlbCwge30sIHtcbiAgICAgIHByZXNlcnZlUGl4ZWxSYXRpbzogdHJ1ZSxcbiAgICAgIGNsYXNzTmFtZTogJ2Rlc2lnbmVyJ1xuICAgIH0pO1xuXG4gICAgdGhpcy52aWV3Lm1vZGVsLmFzc2V0c0RvbWFpbiA9IHRoaXMuc2hhcmVkQ29uZmlnLmdldCgnYXNzZXRzRG9tYWluJyk7XG5cbiAgICB0aGlzLnNob3coKS50aGVuKCgpID0+IHtcblxuICAgICAgdGhpcy5fb25Db25maWcgPSB0aGlzLl9vbkNvbmZpZy5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25Bcm0gPSB0aGlzLl9vbkFybS5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fYXV0b1N0YXJ0UmVjb3JkID0gdGhpcy5fYXV0b1N0YXJ0UmVjb3JkLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9hdXRvU3RvcFJlY29yZCA9IHRoaXMuX2F1dG9TdG9wUmVjb3JkLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vblNlbmRQaHJhc2UgPSB0aGlzLl9vblNlbmRQaHJhc2UuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uQ2xlYXJMYWJlbCA9IHRoaXMuX29uQ2xlYXJMYWJlbC5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25DbGVhck1vZGVsID0gdGhpcy5fb25DbGVhck1vZGVsLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vblJlY2VpdmVNb2RlbCA9IHRoaXMuX29uUmVjZWl2ZU1vZGVsLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbk1vZGVsRmlsdGVyID0gdGhpcy5fb25Nb2RlbEZpbHRlci5iaW5kKHRoaXMpOyAgIFxuICAgICAgdGhpcy5fbW90aW9uQ2FsbGJhY2sgPSB0aGlzLl9tb3Rpb25DYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5faW50ZW5zaXR5Q2FsbGJhY2sgPSB0aGlzLl9pbnRlbnNpdHlDYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fZW5hYmxlU291bmRzID0gdGhpcy5fZW5hYmxlU291bmRzLmJpbmQodGhpcyk7XG5cbiAgICAgIHRoaXMudmlldy5vbkNvbmZpZyh0aGlzLl9vbkNvbmZpZyk7XG4gICAgICB0aGlzLnZpZXcub25Bcm0odGhpcy5fb25Bcm0pO1xuICAgICAgdGhpcy52aWV3Lm9uU2VuZFBocmFzZSh0aGlzLl9vblNlbmRQaHJhc2UpO1xuICAgICAgdGhpcy52aWV3Lm9uQ2xlYXJMYWJlbCh0aGlzLl9vbkNsZWFyTGFiZWwpO1xuICAgICAgdGhpcy52aWV3Lm9uQ2xlYXJNb2RlbCh0aGlzLl9vbkNsZWFyTW9kZWwpO1xuICAgICAgdGhpcy52aWV3Lm9uRW5hYmxlU291bmRzKHRoaXMuX2VuYWJsZVNvdW5kcyk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIExGTydzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMuX2RldmljZW1vdGlvbkluID0gbmV3IGxmby5zb3VyY2UuRXZlbnRJbih7XG4gICAgICAgIGZyYW1lVHlwZTogJ3ZlY3RvcicsXG4gICAgICAgIGZyYW1lU2l6ZTogMywgLy8gNixcbiAgICAgICAgZnJhbWVSYXRlOiAxLCAvLyB0aGlzLm1vdGlvbklucHV0LnBlcmlvZCBkb2Vzbid0IHNlZW0gYXZhaWxhYmxlIGFueW1vcmVcbiAgICAgICAgZGVzY3JpcHRpb246IFsnYWNjZWxHcmF2WCcsICdhY2NlbEdyYXZZJywgJ2FjY2VsR3JhdlonXSwgLy8gJ2d5ckFscGhhJywgJ2d5ckJldGEnLCAnZ3lyR2FtbWEnXVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9mZWF0dXJpemVyID0gbmV3IEZlYXR1cml6ZXJMZm8oe1xuICAgICAgICBkZXNjcmlwdG9yczogWyAnYWNjSW50ZW5zaXR5JyBdLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5faW50ZW5zaXR5Q2FsbGJhY2tcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGhyYXNlUmVjb3JkZXIgPSBuZXcgUGhyYXNlUmVjb3JkZXJMZm8oe1xuICAgICAgICBjb2x1bW5OYW1lczogWydhY2NlbEdyYXZYJywgJ2FjY2VsR3JhdlknLCAnYWNjZWxHcmF2WiddLFxuICAgICAgICAgICAgICAgICAgICAgICAvLyAncm90QWxwaGEnLCAncm90QmV0YScsICdyb3RHYW1tYSddICAgICAgXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX29uT2ZmRGVjb2RlciA9IG5ldyBsZm8ub3BlcmF0b3IuT25PZmYoKTtcbiAgICAgIHRoaXMuX29uT2ZmRGVjb2Rlci5zZXRTdGF0ZSgnb24nKTtcbiAgICAgIHRoaXMuX3htbURlY29kZXIgPSBuZXcgWG1tRGVjb2Rlckxmbyh7XG4gICAgICAgIGxpa2VsaWhvb2RXaW5kb3c6IDIwLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5fb25Nb2RlbEZpbHRlclxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2RldmljZW1vdGlvbkluLmNvbm5lY3QodGhpcy5fZmVhdHVyaXplcik7XG4gICAgICB0aGlzLl9kZXZpY2Vtb3Rpb25Jbi5jb25uZWN0KHRoaXMuX3BocmFzZVJlY29yZGVyKTtcbiAgICAgIHRoaXMuX2RldmljZW1vdGlvbkluLmNvbm5lY3QodGhpcy5fb25PZmZEZWNvZGVyKTtcbiAgICAgIHRoaXMuX29uT2ZmRGVjb2Rlci5jb25uZWN0KHRoaXMuX3htbURlY29kZXIpO1xuICAgICAgdGhpcy5fZGV2aWNlbW90aW9uSW4uc3RhcnQoKTtcblxuICAgICAgdGhpcy5hdXRvVHJpZ2dlciA9IG5ldyBBdXRvTW90aW9uVHJpZ2dlcih7XG4gICAgICAgIGhpZ2hUaHJlc2g6IDAuNixcbiAgICAgICAgbG93VGhyZXNoOiAwLjQsXG4gICAgICAgIG9mZkRlbGF5OiAzMDAsXG4gICAgICAgIHN0YXJ0Q2FsbGJhY2s6IHRoaXMuX2F1dG9TdGFydFJlY29yZCxcbiAgICAgICAgc3RvcENhbGxiYWNrOiB0aGlzLl9hdXRvU3RvcFJlY29yZCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBpbml0aWFsaXplIHJlbmRlcmluZ1xuICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBMaWtlbGlob29kc1JlbmRlcmVyKDEwMCk7XG4gICAgICB0aGlzLnZpZXcuYWRkUmVuZGVyZXIodGhpcy5yZW5kZXJlcik7XG4gICAgICAvLyB0aGlzLnZpZXcuc2V0UHJlUmVuZGVyKChjdHgsIGR0KSA9PiB7fSk7XG5cbiAgICAgIHRoaXMuYXVkaW9FbmdpbmUgPSBuZXcgQXVkaW9FbmdpbmUodGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YSk7XG4gICAgICB0aGlzLmF1ZGlvRW5naW5lLnN0YXJ0KCk7XG5cbiAgICAgIGlmICh0aGlzLm1vdGlvbklucHV0LmlzQXZhaWxhYmxlKCdkZXZpY2Vtb3Rpb24nKSkge1xuICAgICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLl9tb3Rpb25DYWxsYmFjayk7XG4gICAgICB9XG4gIFxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLSBSRUNFSVZFIC0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMucmVjZWl2ZSgnbW9kZWwnLCB0aGlzLl9vblJlY2VpdmVNb2RlbCk7XG4gICAgfSk7XG4gIH1cblxuICBfb25Db25maWcodHlwZSwgY29uZmlnKSB7XG4gICAgdGhpcy5zZW5kKCdjb25maWd1cmF0aW9uJywgeyB0eXBlOiB0eXBlLCBjb25maWc6IGNvbmZpZyB9KTtcbiAgfVxuXG4gIF9vbkFybShjbWQpIHtcbiAgICBzd2l0Y2ggKGNtZCkge1xuICAgICAgY2FzZSAnYXJtJzpcbiAgICAgICAgdGhpcy5hdXRvVHJpZ2dlci5zZXRTdGF0ZSgnb24nKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0b3AnOlxuICAgICAgICB0aGlzLl9hdXRvU3RvcFJlY29yZCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfYXV0b1N0YXJ0UmVjb3JkKCkge1xuICAgIC8vIHNldCB0byBwbGF5IGN1cnJlbnRseSBzZWxlY3RlZCBzb3VuZCBieSBpbnRlcnJ1cHRpbmcgcmVjb2duaXRpb25cbiAgICAvLyBhbmQgZm9yY2luZyBjdXJyZW50IGxhYmVsXG4gICAgdGhpcy5fb25PZmZEZWNvZGVyLnNldFN0YXRlKCdvZmYnKTtcbiAgICBjb25zdCBsYWJlbHMgPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNsYWJlbFNlbGVjdCcpO1xuICAgIHRoaXMubGlrZWxpZXN0ID0gbGFiZWxzLm9wdGlvbnNbbGFiZWxzLnNlbGVjdGVkSW5kZXhdLnRleHQ7XG4gICAgdGhpcy5hdWRpb0VuZ2luZS5mYWRlVG9OZXdTb3VuZCh0aGlzLmxhYmVscy5pbmRleE9mKHRoaXMubGlrZWxpZXN0KSk7XG5cbiAgICAvLyBzdGFydCByZWNvcmRpbmdcbiAgICB0aGlzLl9waHJhc2VSZWNvcmRlci5zdGFydCgpO1xuXG4gICAgLy8gdXBkYXRlIHZpZXdcbiAgICBjb25zdCByZWMgPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWNCdG4nKTtcbiAgICByZWMuaW5uZXJIVE1MID0gJ1NUT1AnO1xuICAgIHJlYy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgfVxuXG4gIF9hdXRvU3RvcFJlY29yZCgpIHtcbiAgICAvLyBzdG9wIHJlY29yZGluZ1xuICAgIHRoaXMuX3BocmFzZVJlY29yZGVyLnN0b3AoKTtcblxuICAgIC8vIGVuYWJsZSByZWNvZ25pdGlvbiBiYWNrXG4gICAgdGhpcy5fb25PZmZEZWNvZGVyLnNldFN0YXRlKCdvbicpO1xuXG4gICAgLy8gdXBkYXRlIHZpZXdcbiAgICBjb25zdCByZWMgPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWNCdG4nKTtcbiAgICByZWMuaW5uZXJIVE1MID0gJ1JFQyc7XG4gICAgcmVjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScsICdhcm1lZCcpO1xuICAgIHRoaXMuYXV0b1RyaWdnZXIuc2V0U3RhdGUoJ29mZicpO1xuICB9XG5cbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4gIF9vblNlbmRQaHJhc2UobGFiZWwpIHtcbiAgICB0aGlzLl9waHJhc2VSZWNvcmRlci5zZXRQaHJhc2VMYWJlbChsYWJlbCk7XG4gICAgbGV0IHBocmFzZSA9IHRoaXMuX3BocmFzZVJlY29yZGVyLmdldFJlY29yZGVkUGhyYXNlKCk7XG4gICAgaWYgKHBocmFzZS5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoY29uZmlybSgnc2VuZCBwaHJhc2Ugd2l0aCBsYWJlbCAnICsgbGFiZWwgKyAnID8nKSkge1xuICAgICAgICB0aGlzLnNlbmQoJ3BocmFzZScsIHsgY21kOiAnYWRkJywgZGF0YTogcGhyYXNlIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhbGVydCgnY2Fubm90IHNlbmQgZW1wdHkgcGhyYXNlcycpO1xuICAgICAgY29uc29sZS5lcnJvcignZXJyb3IgOiBlbXB0eSBwaHJhc2VzIGFyZSBmb3JiaWRkZW4nKTtcbiAgICB9XG4gIH1cblxuICBfb25DbGVhckxhYmVsKGxhYmVsKSB7XG4gICAgaWYgKGNvbmZpcm0oJ2RvIHlvdSByZWFsbHkgd2FudCB0byByZW1vdmUgdGhlIGxhYmVsICcgKyBsYWJlbCArICcgPycpKSB7XG4gICAgICB0aGlzLnNlbmQoJ2NsZWFyJywgeyBjbWQ6ICdsYWJlbCcsIGRhdGE6IGxhYmVsIH0pO1xuICAgIH0gICAgXG4gIH1cblxuICBfb25DbGVhck1vZGVsKCkge1xuICAgIGlmIChjb25maXJtKCdkbyB5b3UgcmVhbGx5IHdhbnQgdG8gcmVtb3ZlIHRoZSBjdXJyZW50IG1vZGVsID8nKSkge1xuICAgICAgdGhpcy5zZW5kKCdjbGVhcicsIHsgY21kOiAnbW9kZWwnIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vPT09PT09PT09PT09PT09PSBjYWxsYmFja3MgOiA9PT09PT09PT09PT09PT09Ly9cblxuICBfbW90aW9uQ2FsbGJhY2soZXZlbnRWYWx1ZXMpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBldmVudFZhbHVlcy5zbGljZSgwLDMpLmNvbmNhdChldmVudFZhbHVlcy5zbGljZSgtMykpO1xuICAgIHRoaXMuX2RldmljZW1vdGlvbkluLnByb2Nlc3MoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLCB2YWx1ZXMpO1xuICB9XG5cbiAgX29uUmVjZWl2ZU1vZGVsKG1vZGVsKSB7XG4gICAgY29uc3QgY29uZmlnID0gbW9kZWwgPyBtb2RlbC5jb25maWd1cmF0aW9uLmRlZmF1bHRfcGFyYW1ldGVycyA6IHt9O1xuXG4gICAgY29uZmlnLm1vZGVsVHlwZSA9IGNvbmZpZy5zdGF0ZXMgPyAnaGhtbScgOiAnZ21tJztcbiAgICB0aGlzLl91cGRhdGVDb25maWdGcm9tTW9kZWwoY29uZmlnKTtcbiAgICB0aGlzLl94bW1EZWNvZGVyLnBhcmFtcy5zZXQoJ21vZGVsJywgbW9kZWwpO1xuICB9XG5cbiAgX3VwZGF0ZUNvbmZpZ0Zyb21Nb2RlbChjb25maWcpIHtcbiAgICBjb25zdCB2ID0gdGhpcy52aWV3LiRlbDtcbiAgICBsZXQgZWx0O1xuXG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjbW9kZWxTZWxlY3QnKTtcbiAgICBlbHQuc2VsZWN0ZWRJbmRleCA9IChjb25maWcubW9kZWxUeXBlID09PSAnaGhtbScpID8gMSA6IDA7XG5cbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNnYXVzc1NlbGVjdCcpO1xuICAgIGVsdC5zZWxlY3RlZEluZGV4ID0gY29uZmlnLmdhdXNzaWFucyAtIDE7XG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjY292TW9kZVNlbGVjdCcpO1xuICAgIGVsdC5zZWxlY3RlZEluZGV4ID0gY29uZmlnLmNvdmFyaWFuY2VfbW9kZTtcbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNhYnNSZWcnKTtcbiAgICBlbHQudmFsdWUgPSBjb25maWcuYWJzb2x1dGVfcmVndWxhcml6YXRpb247XG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjcmVsUmVnJyk7XG4gICAgZWx0LnZhbHVlID0gY29uZmlnLnJlbGF0aXZlX3JlZ3VsYXJpemF0aW9uO1xuXG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjc3RhdGVzU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSBjb25maWcuc3RhdGVzID8gY29uZmlnLnN0YXRlcyAtIDEgOiAwO1xuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI3RyYW5zTW9kZVNlbGVjdCcpO1xuICAgIGVsdC5zZWxlY3RlZEluZGV4ID0gY29uZmlnLnRyYW5zaXRpb25fbW9kZSA/IGNvbmZpZy50cmFuc2l0aW9uX21vZGUgOiAwO1xuICB9XG5cbiAgX29uTW9kZWxGaWx0ZXIocmVzKSB7XG4gICAgY29uc3QgbGlrZWxpaG9vZHMgPSByZXMgPyByZXMubGlrZWxpaG9vZHMgOiBbXTtcbiAgICBjb25zdCBsaWtlbGllc3QgPSByZXMgPyByZXMubGlrZWxpZXN0SW5kZXggOiAtMTtcbiAgICBjb25zdCBsYWJlbCA9IHJlcyA/IHJlcy5saWtlbGllc3QgOiAndW5rbm93bic7XG4gICAgY29uc3QgYWxwaGFzID0gcmVzID8gcmVzLmFscGhhcyA6IFtbXV07Ly8gcmVzLmFscGhhc1tsaWtlbGllc3RdO1xuXG4gICAgY29uc3QgbmV3UmVzID0ge1xuICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgbGlrZWxpZXN0OiBsaWtlbGllc3QsXG4gICAgICBsaWtlbGlob29kczogbGlrZWxpaG9vZHNcbiAgICB9O1xuXG4gICAgdGhpcy5yZW5kZXJlci5zZXRNb2RlbFJlc3VsdHMobmV3UmVzKTtcblxuICAgIGlmICh0aGlzLmxpa2VsaWVzdCAhPT0gbGFiZWwpIHtcbiAgICAgIHRoaXMubGlrZWxpZXN0ID0gbGFiZWw7XG4gICAgICBjb25zb2xlLmxvZygnY2hhbmdlZCBnZXN0dXJlIHRvIDogJyArIGxhYmVsKTtcbiAgICAgIGNvbnN0IGkgPSB0aGlzLmxhYmVscy5pbmRleE9mKGxhYmVsKTtcbiAgICAgIHRoaXMuYXVkaW9FbmdpbmUuZmFkZVRvTmV3U291bmQoaSk7XG4gICAgfVxuICB9XG5cbiAgX2ludGVuc2l0eUNhbGxiYWNrKHZhbHVlcykge1xuICAgIHRoaXMuYXV0b1RyaWdnZXIucHVzaCh2YWx1ZXNbMF0pO1xuICAgIHRoaXMuYXVkaW9FbmdpbmUuc2V0R2FpbkZyb21JbnRlbnNpdHkodmFsdWVzWzBdKTtcbiAgfVxuXG4gIF9lbmFibGVTb3VuZHMob25PZmYpIHtcbiAgICB0aGlzLmF1ZGlvRW5naW5lLmVuYWJsZVNvdW5kcyhvbk9mZik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IERlc2lnbmVyRXhwZXJpZW5jZTsiXX0=