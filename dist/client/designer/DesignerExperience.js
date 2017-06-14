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

var _PreProcess = require('../shared/PreProcess');

var _PreProcess2 = _interopRequireDefault(_PreProcess);

var _LikelihoodsRenderer = require('../shared/LikelihoodsRenderer');

var _LikelihoodsRenderer2 = _interopRequireDefault(_LikelihoodsRenderer);

var _config = require('../shared/config');

var _AudioEngine = require('../shared/AudioEngine');

var _AudioEngine2 = _interopRequireDefault(_AudioEngine);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

var viewModel = {
  classes: _config.classes
};

var viewTemplate = '\n  <div class="foreground">\n\n    <div id="nav">\n      <!-- <a href="#" id="openConfigBtn">&#9776;</a> -->\n      <a href="#" id="openConfigBtn"> <img src="/pics/navicon.png"> </a>\n    </div>\n\n    <div class="section-top flex-middle">\n      <div class="section-overlay">\n        \n        <div class="overlay-content">\n          <p> Global configuration </p>\n          <br />\n          <div class="selectDiv">\n            <label for="modelSelect"> Model type : </label>\n            <select id="modelSelect">\n              <option value="gmm">gmm</option>\n              <option value="hhmm">hhmm</option>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="gaussSelect"> Gaussians : </label>\n            <select id="gaussSelect">\n              <% for (var i = 0; i < 10; i++) { %>\n                <option value="<%= i+1 %>">\n                  <%= i+1 %>\n                </option>\n              <% } %>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="covModeSelect"> Covariance mode : </label>\n            <select id="covModeSelect">\n              <option value="full">full</option>\n              <option value="diagonal">diagonal</option>\n            </select>\n          </div>        \n          <div class="selectDiv">\n            <label for="absReg"> Absolute regularization : </label>\n            <input id="absReg" type="text" value="0.01">\n            </input>\n          </div>        \n          <div class="selectDiv">\n            <label for="relReg"> Relative regularization : </label>\n            <input id="relReg" type="text" value="0.01">\n            </input>\n          </div>        \n\n          <hr>\n          <p> Hhmm parameters </p>\n          <br />\n          <!--\n          <div class="selectDiv">\n            <label for="hierarchicalSelect"> Hierarchical : </label>\n            <select id="hierarchicalSelect">\n              <option value="yes">yes</option>\n              <option value="no">no</option>\n             </select>\n          </div>\n          -->        \n          <div class="selectDiv">\n            <label for="statesSelect"> States : </label>\n            <select id="statesSelect">\n              <% for (var i = 0; i < 20; i++) { %>\n                <option value="<%= i+1 %>">\n                  <%= i+1 %>\n                </option>\n              <% } %>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="transModeSelect"> Transition mode : </label>\n            <select id="transModeSelect">\n              <option value="ergodic">ergodic</option>\n              <option value="leftright">leftright</option>\n            </select>\n          </div> \n          <!--\n          <div class="selectDiv">\n            <label for="regressEstimSelect"> Regression estimator : </label>\n            <select id="regressEstimSelect">\n              <option value="full">full</option>\n              <option value="windowed">windowed</option>\n              <option value="likeliest">likeliest</option>\n            </select>\n          </div>\n          -->        \n        </div>\n      </div>\n\n      <div class="section-underlay">\n        <div class="selectDiv"> Label :\n          <select id="labelSelect">\n            <% for (var prop in classes) { %>\n              <option value="<%= prop %>">\n                <%= prop %>\n              </option>\n            <% } %>\n          </select>\n        </div>\n        <button id="recBtn">REC</button>\n        <button id="sendBtn">SEND</button>\n        <div class="canvasDiv">\n          <canvas class="multislider" id="likelihoods"></canvas>\n        </div>\n        <button id="clearLabelBtn">CLEAR LABEL</button>\n        <button id="clearModelBtn">CLEAR MODEL</button>\n        <div class="toggleDiv">\n          <button id="playBtn" class="toggleBtn"></button>\n          Enable sounds\n        </div>\n        <!--\n        <div class="toggleDiv">\n          <button id="intensityBtn" class="toggleBtn"></button>\n          Disable intensity control\n        </div>\n        -->\n      </div>\n    </div>\n\n    <div class="section-center flex-center">\n    </div>\n    <div class="section-bottom flex-middle">\n    </div>\n\n  </div>\n';

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

            callback(type, config);

            div.classList.remove('active');
          }
        }
      });
    }
  }, {
    key: 'onRecord',
    value: function onRecord(callback) {
      var _this3 = this;

      this.installEvents({
        'click #recBtn': function clickRecBtn() {
          var rec = _this3.$el.querySelector('#recBtn');
          if (!rec.classList.contains('active')) {
            rec.innerHTML = 'STOP';
            rec.classList.add('active');
            callback('record');
          } else {
            rec.innerHTML = 'REC';
            rec.classList.remove('active');
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
    // this.sharedConfig = this.require('shared-config');
    _this7.login = _this7.require('login');
    _this7.audioBufferManager = _this7.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: _config.classes
    });
    _this7.motionInput = _this7.require('motion-input', {
      descriptors: ['devicemotion']
    });

    _this7.labels = (0, _keys2.default)(_config.classes);
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

      this.show().then(function () {

        _this8._onConfig = _this8._onConfig.bind(_this8);
        _this8._onRecord = _this8._onRecord.bind(_this8);
        _this8._onSendPhrase = _this8._onSendPhrase.bind(_this8);
        _this8._onClearLabel = _this8._onClearLabel.bind(_this8);
        _this8._onClearModel = _this8._onClearModel.bind(_this8);
        _this8._onReceiveModel = _this8._onReceiveModel.bind(_this8);
        _this8._onModelFilter = _this8._onModelFilter.bind(_this8);
        _this8._motionCallback = _this8._motionCallback.bind(_this8);
        _this8._intensityCallback = _this8._intensityCallback.bind(_this8);
        _this8._enableSounds = _this8._enableSounds.bind(_this8);

        _this8.view.onConfig(_this8._onConfig);
        _this8.view.onRecord(_this8._onRecord);
        _this8.view.onSendPhrase(_this8._onSendPhrase);
        _this8.view.onClearLabel(_this8._onClearLabel);
        _this8.view.onClearModel(_this8._onClearModel);
        _this8.view.onEnableSounds(_this8._enableSounds);

        //------------------ LFO's ------------------//
        _this8._phraseRecorder = new _xmmLfo.PhraseRecorderLfo({
          columnNames: ['accelX', 'accelY', 'accelZ']
        });
        _this8._xmmDecoder = new _xmmLfo.XmmDecoderLfo({
          likelihoodWindow: 20,
          callback: _this8._onModelFilter
        });
        _this8._preProcess = new _PreProcess2.default(_this8._intensityCallback);
        _this8._preProcess.connect(_this8._phraseRecorder);
        _this8._preProcess.connect(_this8._xmmDecoder);
        _this8._preProcess.start();

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
    key: '_onRecord',
    value: function _onRecord(cmd) {
      switch (cmd) {
        case 'record':
          this._phraseRecorder.start();
          break;

        case 'stop':
          this._phraseRecorder.stop();
          break;
      }
    }
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
      this._preProcess.process(audioContext.currentTime, values);
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
    value: function _intensityCallback(frame) {
      this.audioEngine.setGainFromIntensity(frame.data[0]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwibGZvIiwiYXVkaW9Db250ZXh0Iiwidmlld01vZGVsIiwiY2xhc3NlcyIsInZpZXdUZW1wbGF0ZSIsIkRlc2lnbmVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJjYWxsYmFjayIsImluc3RhbGxFdmVudHMiLCJkaXYiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwiYWN0aXZlIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJhZGQiLCJlbHQiLCJ0eXBlIiwic2VsZWN0ZWRJbmRleCIsInZhbHVlIiwiY29uZmlnIiwiTnVtYmVyIiwicmVtb3ZlIiwicmVjIiwiaW5uZXJIVE1MIiwibGFiZWxzIiwidGV4dCIsImJ0biIsIkNhbnZhc1ZpZXciLCJEZXNpZ25lckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsImNoZWNraW4iLCJzaG93RGlhbG9nIiwibG9naW4iLCJhdWRpb0J1ZmZlck1hbmFnZXIiLCJmaWxlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsaWtlbGllc3QiLCJ1bmRlZmluZWQiLCJ2aWV3IiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY2xhc3NOYW1lIiwic2hvdyIsInRoZW4iLCJfb25Db25maWciLCJiaW5kIiwiX29uUmVjb3JkIiwiX29uU2VuZFBocmFzZSIsIl9vbkNsZWFyTGFiZWwiLCJfb25DbGVhck1vZGVsIiwiX29uUmVjZWl2ZU1vZGVsIiwiX29uTW9kZWxGaWx0ZXIiLCJfbW90aW9uQ2FsbGJhY2siLCJfaW50ZW5zaXR5Q2FsbGJhY2siLCJfZW5hYmxlU291bmRzIiwib25Db25maWciLCJvblJlY29yZCIsIm9uU2VuZFBocmFzZSIsIm9uQ2xlYXJMYWJlbCIsIm9uQ2xlYXJNb2RlbCIsIm9uRW5hYmxlU291bmRzIiwiX3BocmFzZVJlY29yZGVyIiwiY29sdW1uTmFtZXMiLCJfeG1tRGVjb2RlciIsImxpa2VsaWhvb2RXaW5kb3ciLCJfcHJlUHJvY2VzcyIsImNvbm5lY3QiLCJzdGFydCIsInJlbmRlcmVyIiwiYWRkUmVuZGVyZXIiLCJhdWRpb0VuZ2luZSIsImRhdGEiLCJpc0F2YWlsYWJsZSIsImFkZExpc3RlbmVyIiwicmVjZWl2ZSIsInNlbmQiLCJjbWQiLCJzdG9wIiwibGFiZWwiLCJzZXRQaHJhc2VMYWJlbCIsInBocmFzZSIsImdldFJlY29yZGVkUGhyYXNlIiwibGVuZ3RoIiwiY29uZmlybSIsImFsZXJ0IiwiY29uc29sZSIsImVycm9yIiwiZXZlbnRWYWx1ZXMiLCJ2YWx1ZXMiLCJzbGljZSIsImNvbmNhdCIsInByb2Nlc3MiLCJjdXJyZW50VGltZSIsIm1vZGVsIiwiY29uZmlndXJhdGlvbiIsImRlZmF1bHRfcGFyYW1ldGVycyIsIm1vZGVsVHlwZSIsInN0YXRlcyIsIl91cGRhdGVDb25maWdGcm9tTW9kZWwiLCJwYXJhbXMiLCJzZXQiLCJ2IiwiZ2F1c3NpYW5zIiwiY292YXJpYW5jZV9tb2RlIiwiYWJzb2x1dGVfcmVndWxhcml6YXRpb24iLCJyZWxhdGl2ZV9yZWd1bGFyaXphdGlvbiIsInRyYW5zaXRpb25fbW9kZSIsInJlcyIsImxpa2VsaWhvb2RzIiwibGlrZWxpZXN0SW5kZXgiLCJhbHBoYXMiLCJuZXdSZXMiLCJzZXRNb2RlbFJlc3VsdHMiLCJsb2ciLCJpIiwiaW5kZXhPZiIsImZhZGVUb05ld1NvdW5kIiwiZnJhbWUiLCJzZXRHYWluRnJvbUludGVuc2l0eSIsIm9uT2ZmIiwiZW5hYmxlU291bmRzIiwiRXhwZXJpZW5jZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxVOztBQUNaOztBQUNBOztJQUFZQyxHOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQzs7QUFFQSxJQUFNQyxZQUFZ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U0gsTUFBTUEsSUFBSUcsTUFBVixHQUFtQixDQUFDLEVBQUQsQ0FBbEMsQ0FKa0IsQ0FJcUI7O0FBRXZDLFVBQU1DLFNBQVM7QUFDYmpDLGVBQU9BLEtBRE07QUFFYnpDLG1CQUFXQSxTQUZFO0FBR2J1RSxxQkFBYUE7QUFIQSxPQUFmOztBQU1BLFdBQUt4QyxRQUFMLENBQWM0QyxlQUFkLENBQThCRCxNQUE5Qjs7QUFFQSxVQUFJLEtBQUsxRSxTQUFMLEtBQW1CeUMsS0FBdkIsRUFBOEI7QUFDNUIsYUFBS3pDLFNBQUwsR0FBaUJ5QyxLQUFqQjtBQUNBTyxnQkFBUTRCLEdBQVIsQ0FBWSwwQkFBMEJuQyxLQUF0QztBQUNBLFlBQU1vQyxJQUFJLEtBQUs3RixNQUFMLENBQVk4RixPQUFaLENBQW9CckMsS0FBcEIsQ0FBVjtBQUNBLGFBQUtSLFdBQUwsQ0FBaUI4QyxjQUFqQixDQUFnQ0YsQ0FBaEM7QUFDRDtBQUNGOzs7dUNBRWtCRyxLLEVBQU87QUFDeEIsV0FBSy9DLFdBQUwsQ0FBaUJnRCxvQkFBakIsQ0FBc0NELE1BQU05QyxJQUFOLENBQVcsQ0FBWCxDQUF0QztBQUNEOzs7a0NBRWFnRCxLLEVBQU87QUFDbkIsV0FBS2pELFdBQUwsQ0FBaUJrRCxZQUFqQixDQUE4QkQsS0FBOUI7QUFDRDs7O0VBdkw4Qi9ILFdBQVdpSSxVOztBQXdMM0M7O2tCQUVjaEcsa0IiLCJmaWxlIjoiRGVzaWduZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgeyBMb2dpbiB9IGZyb20gJy4uL3NlcnZpY2VzL0xvZ2luJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY29tbW9uJztcbmltcG9ydCB7IFBocmFzZVJlY29yZGVyTGZvLCBYbW1EZWNvZGVyTGZvIH0gZnJvbSAneG1tLWxmbyc7XG5pbXBvcnQgUHJlUHJvY2VzcyBmcm9tICcuLi9zaGFyZWQvUHJlUHJvY2Vzcyc7XG5pbXBvcnQgTGlrZWxpaG9vZHNSZW5kZXJlciBmcm9tICcuLi9zaGFyZWQvTGlrZWxpaG9vZHNSZW5kZXJlcic7XG5pbXBvcnQgeyBjbGFzc2VzIH0gZnJvbSAgJy4uL3NoYXJlZC9jb25maWcnO1xuaW1wb3J0IEF1ZGlvRW5naW5lIGZyb20gJy4uL3NoYXJlZC9BdWRpb0VuZ2luZSc7XG5cbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuXG5jb25zdCB2aWV3TW9kZWwgPSB7XG4gIGNsYXNzZXM6IGNsYXNzZXMsXG59O1xuXG5jb25zdCB2aWV3VGVtcGxhdGUgPSBgXG4gIDxkaXYgY2xhc3M9XCJmb3JlZ3JvdW5kXCI+XG5cbiAgICA8ZGl2IGlkPVwibmF2XCI+XG4gICAgICA8IS0tIDxhIGhyZWY9XCIjXCIgaWQ9XCJvcGVuQ29uZmlnQnRuXCI+JiM5Nzc2OzwvYT4gLS0+XG4gICAgICA8YSBocmVmPVwiI1wiIGlkPVwib3BlbkNvbmZpZ0J0blwiPiA8aW1nIHNyYz1cIi9waWNzL25hdmljb24ucG5nXCI+IDwvYT5cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tb3ZlcmxheVwiPlxuICAgICAgICBcbiAgICAgICAgPGRpdiBjbGFzcz1cIm92ZXJsYXktY29udGVudFwiPlxuICAgICAgICAgIDxwPiBHbG9iYWwgY29uZmlndXJhdGlvbiA8L3A+XG4gICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cIm1vZGVsU2VsZWN0XCI+IE1vZGVsIHR5cGUgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cIm1vZGVsU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJnbW1cIj5nbW08L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImhobW1cIj5oaG1tPC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiZ2F1c3NTZWxlY3RcIj4gR2F1c3NpYW5zIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJnYXVzc1NlbGVjdFwiPlxuICAgICAgICAgICAgICA8JSBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHsgJT5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiPCU9IGkrMSAlPlwiPlxuICAgICAgICAgICAgICAgICAgPCU9IGkrMSAlPlxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8JSB9ICU+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiY292TW9kZVNlbGVjdFwiPiBDb3ZhcmlhbmNlIG1vZGUgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cImNvdk1vZGVTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImZ1bGxcIj5mdWxsPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJkaWFnb25hbFwiPmRpYWdvbmFsPC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj4gICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJhYnNSZWdcIj4gQWJzb2x1dGUgcmVndWxhcml6YXRpb24gOiA8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPVwiYWJzUmVnXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIjAuMDFcIj5cbiAgICAgICAgICAgIDwvaW5wdXQ+XG4gICAgICAgICAgPC9kaXY+ICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwicmVsUmVnXCI+IFJlbGF0aXZlIHJlZ3VsYXJpemF0aW9uIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBpZD1cInJlbFJlZ1wiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIwLjAxXCI+XG4gICAgICAgICAgICA8L2lucHV0PlxuICAgICAgICAgIDwvZGl2PiAgICAgICAgXG5cbiAgICAgICAgICA8aHI+XG4gICAgICAgICAgPHA+IEhobW0gcGFyYW1ldGVycyA8L3A+XG4gICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgPCEtLVxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJoaWVyYXJjaGljYWxTZWxlY3RcIj4gSGllcmFyY2hpY2FsIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJoaWVyYXJjaGljYWxTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInllc1wiPnllczwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwibm9cIj5ubzwvb3B0aW9uPlxuICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIC0tPiAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cInN0YXRlc1NlbGVjdFwiPiBTdGF0ZXMgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cInN0YXRlc1NlbGVjdFwiPlxuICAgICAgICAgICAgICA8JSBmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHsgJT5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiPCU9IGkrMSAlPlwiPlxuICAgICAgICAgICAgICAgICAgPCU9IGkrMSAlPlxuICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8JSB9ICU+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwidHJhbnNNb2RlU2VsZWN0XCI+IFRyYW5zaXRpb24gbW9kZSA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwidHJhbnNNb2RlU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJlcmdvZGljXCI+ZXJnb2RpYzwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwibGVmdHJpZ2h0XCI+bGVmdHJpZ2h0PC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj4gXG4gICAgICAgICAgPCEtLVxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJyZWdyZXNzRXN0aW1TZWxlY3RcIj4gUmVncmVzc2lvbiBlc3RpbWF0b3IgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cInJlZ3Jlc3NFc3RpbVNlbGVjdFwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZnVsbFwiPmZ1bGw8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIndpbmRvd2VkXCI+d2luZG93ZWQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImxpa2VsaWVzdFwiPmxpa2VsaWVzdDwvb3B0aW9uPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgLS0+ICAgICAgICBcbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdW5kZXJsYXlcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPiBMYWJlbCA6XG4gICAgICAgICAgPHNlbGVjdCBpZD1cImxhYmVsU2VsZWN0XCI+XG4gICAgICAgICAgICA8JSBmb3IgKHZhciBwcm9wIGluIGNsYXNzZXMpIHsgJT5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjwlPSBwcm9wICU+XCI+XG4gICAgICAgICAgICAgICAgPCU9IHByb3AgJT5cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICA8JSB9ICU+XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGlkPVwicmVjQnRuXCI+UkVDPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gaWQ9XCJzZW5kQnRuXCI+U0VORDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FudmFzRGl2XCI+XG4gICAgICAgICAgPGNhbnZhcyBjbGFzcz1cIm11bHRpc2xpZGVyXCIgaWQ9XCJsaWtlbGlob29kc1wiPjwvY2FudmFzPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBpZD1cImNsZWFyTGFiZWxCdG5cIj5DTEVBUiBMQUJFTDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGlkPVwiY2xlYXJNb2RlbEJ0blwiPkNMRUFSIE1PREVMPC9idXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGVEaXZcIj5cbiAgICAgICAgICA8YnV0dG9uIGlkPVwicGxheUJ0blwiIGNsYXNzPVwidG9nZ2xlQnRuXCI+PC9idXR0b24+XG4gICAgICAgICAgRW5hYmxlIHNvdW5kc1xuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPCEtLVxuICAgICAgICA8ZGl2IGNsYXNzPVwidG9nZ2xlRGl2XCI+XG4gICAgICAgICAgPGJ1dHRvbiBpZD1cImludGVuc2l0eUJ0blwiIGNsYXNzPVwidG9nZ2xlQnRuXCI+PC9idXR0b24+XG4gICAgICAgICAgRGlzYWJsZSBpbnRlbnNpdHkgY29udHJvbFxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgLS0+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPlxuICAgIDwvZGl2PlxuXG4gIDwvZGl2PlxuYDtcblxuY2xhc3MgRGVzaWduZXJWaWV3IGV4dGVuZHMgc291bmR3b3Jrcy5DYW52YXNWaWV3IHtcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgb25Db25maWcoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNvcGVuQ29uZmlnQnRuJzogKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXYgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi1vdmVybGF5Jyk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGRpdi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpO1xuXG4gICAgICAgIGlmICghYWN0aXZlKSB7XG4gICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNtb2RlbFNlbGVjdCcpO1xuICAgICAgICAgIGNvbnN0IHR5cGUgPSBlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG5cbiAgICAgICAgICBjb25zdCBjb25maWcgPSB7fTtcbiAgICAgICAgICBsZXQgZWx0O1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNnYXVzc1NlbGVjdCcpO1xuICAgICAgICAgIGNvbmZpZ1snZ2F1c3NpYW5zJ10gPSBOdW1iZXIoZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlKTtcbiAgICAgICAgICBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjY292TW9kZVNlbGVjdCcpO1xuICAgICAgICAgIGNvbmZpZ1snY292YXJpYW5jZU1vZGUnXSA9IGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICAgICAgICBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjYWJzUmVnJyk7XG4gICAgICAgICAgY29uZmlnWydhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uJ10gPSBOdW1iZXIoZWx0LnZhbHVlKTtcbiAgICAgICAgICBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjcmVsUmVnJyk7XG4gICAgICAgICAgY29uZmlnWydyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uJ10gPSBOdW1iZXIoZWx0LnZhbHVlKTtcbiAgICAgICAgICAvLyBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjaGllcmFyY2hpY2FsU2VsZWN0Jyk7XG4gICAgICAgICAgLy8gY29uZmlnWydoaWVyYXJjaGljYWwnXSA9IChlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWUgPT09ICd5ZXMnKTtcbiAgICAgICAgICBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjdHJhbnNNb2RlU2VsZWN0Jyk7XG4gICAgICAgICAgY29uZmlnWyd0cmFuc2l0aW9uTW9kZSddID0gZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNzdGF0ZXNTZWxlY3QnKTtcbiAgICAgICAgICBjb25maWdbJ3N0YXRlcyddID0gTnVtYmVyKGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZSk7XG4gICAgICAgICAgLy8gZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3JlZ3Jlc3NFc3RpbVNlbGVjdCcpO1xuICAgICAgICAgIC8vIGNvbmZpZ1sncmVncmVzc2lvbkVzdGltYXRvciddID0gZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuXG4gICAgICAgICAgY2FsbGJhY2sodHlwZSwgY29uZmlnKTtcblxuICAgICAgICAgIGRpdi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25SZWNvcmQoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNyZWNCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlYyA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWNCdG4nKTtcbiAgICAgICAgaWYgKCFyZWMuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgICAgICAgIHJlYy5pbm5lckhUTUwgPSAnU1RPUCc7XG4gICAgICAgICAgcmVjLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgIGNhbGxiYWNrKCdyZWNvcmQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWMuaW5uZXJIVE1MID0gJ1JFQyc7XG4gICAgICAgICAgcmVjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgIGNhbGxiYWNrKCdzdG9wJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25TZW5kUGhyYXNlKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjc2VuZEJ0bic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgbGFiZWxzID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2xhYmVsU2VsZWN0Jyk7XG4gICAgICAgIGNhbGxiYWNrKGxhYmVscy5vcHRpb25zW2xhYmVscy5zZWxlY3RlZEluZGV4XS50ZXh0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uQ2xlYXJMYWJlbChjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI2NsZWFyTGFiZWxCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVscyA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNsYWJlbFNlbGVjdCcpO1xuICAgICAgICBjYWxsYmFjayhsYWJlbHMub3B0aW9uc1tsYWJlbHMuc2VsZWN0ZWRJbmRleF0udGV4dCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbkNsZWFyTW9kZWwoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNjbGVhck1vZGVsQnRuJzogKCkgPT4ge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25FbmFibGVTb3VuZHMoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNwbGF5QnRuJzogKCkgPT4ge1xuICAgICAgICBjb25zdCBidG4gPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjcGxheUJ0bicpO1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBidG4uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKTtcbiAgICAgICAgaWYgKCFhY3RpdmUpIHtcbiAgICAgICAgICBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKCFhY3RpdmUpOyAgICAgICAgXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cblxuXG5jbGFzcyBEZXNpZ25lckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbyddIH0pO1xuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicsIHsgc2hvd0RpYWxvZzogZmFsc2UgfSk7XG4gICAgLy8gdGhpcy5zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcbiAgICB0aGlzLmxvZ2luID0gdGhpcy5yZXF1aXJlKCdsb2dpbicpO1xuICAgIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicsIHtcbiAgICAgIGFzc2V0c0RvbWFpbjogYXNzZXRzRG9tYWluLFxuICAgICAgZmlsZXM6IGNsYXNzZXMsXG4gICAgfSk7XG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IHRoaXMucmVxdWlyZSgnbW90aW9uLWlucHV0Jywge1xuICAgICAgZGVzY3JpcHRvcnM6IFsnZGV2aWNlbW90aW9uJ11cbiAgICB9KTtcblxuICAgIHRoaXMubGFiZWxzID0gT2JqZWN0LmtleXMoY2xhc3Nlcyk7XG4gICAgdGhpcy5saWtlbGllc3QgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IERlc2lnbmVyVmlldyh2aWV3VGVtcGxhdGUsIHZpZXdNb2RlbCwge30sIHtcbiAgICAgIHByZXNlcnZlUGl4ZWxSYXRpbzogdHJ1ZSxcbiAgICAgIGNsYXNzTmFtZTogJ2Rlc2lnbmVyJ1xuICAgIH0pO1xuXG4gICAgdGhpcy5zaG93KCkudGhlbigoKSA9PiB7XG5cbiAgICAgIHRoaXMuX29uQ29uZmlnID0gdGhpcy5fb25Db25maWcuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uUmVjb3JkID0gdGhpcy5fb25SZWNvcmQuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uU2VuZFBocmFzZSA9IHRoaXMuX29uU2VuZFBocmFzZS5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25DbGVhckxhYmVsID0gdGhpcy5fb25DbGVhckxhYmVsLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbkNsZWFyTW9kZWwgPSB0aGlzLl9vbkNsZWFyTW9kZWwuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uUmVjZWl2ZU1vZGVsID0gdGhpcy5fb25SZWNlaXZlTW9kZWwuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uTW9kZWxGaWx0ZXIgPSB0aGlzLl9vbk1vZGVsRmlsdGVyLmJpbmQodGhpcyk7ICAgXG4gICAgICB0aGlzLl9tb3Rpb25DYWxsYmFjayA9IHRoaXMuX21vdGlvbkNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9pbnRlbnNpdHlDYWxsYmFjayA9IHRoaXMuX2ludGVuc2l0eUNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9lbmFibGVTb3VuZHMgPSB0aGlzLl9lbmFibGVTb3VuZHMuYmluZCh0aGlzKTtcblxuICAgICAgdGhpcy52aWV3Lm9uQ29uZmlnKHRoaXMuX29uQ29uZmlnKTtcbiAgICAgIHRoaXMudmlldy5vblJlY29yZCh0aGlzLl9vblJlY29yZCk7XG4gICAgICB0aGlzLnZpZXcub25TZW5kUGhyYXNlKHRoaXMuX29uU2VuZFBocmFzZSk7XG4gICAgICB0aGlzLnZpZXcub25DbGVhckxhYmVsKHRoaXMuX29uQ2xlYXJMYWJlbCk7XG4gICAgICB0aGlzLnZpZXcub25DbGVhck1vZGVsKHRoaXMuX29uQ2xlYXJNb2RlbCk7XG4gICAgICB0aGlzLnZpZXcub25FbmFibGVTb3VuZHModGhpcy5fZW5hYmxlU291bmRzKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0gTEZPJ3MgLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMuX3BocmFzZVJlY29yZGVyID0gbmV3IFBocmFzZVJlY29yZGVyTGZvKHtcbiAgICAgICAgY29sdW1uTmFtZXM6IFsgJ2FjY2VsWCcsICdhY2NlbFknLCAnYWNjZWxaJyBdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3htbURlY29kZXIgPSBuZXcgWG1tRGVjb2Rlckxmbyh7XG4gICAgICAgIGxpa2VsaWhvb2RXaW5kb3c6IDIwLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5fb25Nb2RlbEZpbHRlclxuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcmVQcm9jZXNzID0gbmV3IFByZVByb2Nlc3ModGhpcy5faW50ZW5zaXR5Q2FsbGJhY2spO1xuICAgICAgdGhpcy5fcHJlUHJvY2Vzcy5jb25uZWN0KHRoaXMuX3BocmFzZVJlY29yZGVyKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3MuY29ubmVjdCh0aGlzLl94bW1EZWNvZGVyKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3Muc3RhcnQoKTtcblxuICAgICAgLy8gaW5pdGlhbGl6ZSByZW5kZXJpbmdcbiAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgTGlrZWxpaG9vZHNSZW5kZXJlcigxMDApO1xuICAgICAgdGhpcy52aWV3LmFkZFJlbmRlcmVyKHRoaXMucmVuZGVyZXIpO1xuICAgICAgLy8gdGhpcy52aWV3LnNldFByZVJlbmRlcigoY3R4LCBkdCkgPT4ge30pO1xuXG4gICAgICB0aGlzLmF1ZGlvRW5naW5lID0gbmV3IEF1ZGlvRW5naW5lKHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyLmRhdGEpO1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5zdGFydCgpO1xuXG4gICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ2RldmljZW1vdGlvbicpKSB7XG4gICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLl9tb3Rpb25DYWxsYmFjayk7XG4gICAgfVxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLSBSRUNFSVZFIC0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMucmVjZWl2ZSgnbW9kZWwnLCB0aGlzLl9vblJlY2VpdmVNb2RlbCk7XG4gICAgfSk7XG4gIH1cblxuICBfb25Db25maWcodHlwZSwgY29uZmlnKSB7XG4gICAgdGhpcy5zZW5kKCdjb25maWd1cmF0aW9uJywgeyB0eXBlOiB0eXBlLCBjb25maWc6IGNvbmZpZyB9KTtcbiAgfVxuXG4gIF9vblJlY29yZChjbWQpIHtcbiAgICBzd2l0Y2ggKGNtZCkge1xuICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgdGhpcy5fcGhyYXNlUmVjb3JkZXIuc3RhcnQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0b3AnOlxuICAgICAgICB0aGlzLl9waHJhc2VSZWNvcmRlci5zdG9wKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9vblNlbmRQaHJhc2UobGFiZWwpIHtcbiAgICB0aGlzLl9waHJhc2VSZWNvcmRlci5zZXRQaHJhc2VMYWJlbChsYWJlbCk7XG4gICAgbGV0IHBocmFzZSA9IHRoaXMuX3BocmFzZVJlY29yZGVyLmdldFJlY29yZGVkUGhyYXNlKCk7XG4gICAgaWYgKHBocmFzZS5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoY29uZmlybSgnc2VuZCBwaHJhc2Ugd2l0aCBsYWJlbCAnICsgbGFiZWwgKyAnID8nKSkge1xuICAgICAgICB0aGlzLnNlbmQoJ3BocmFzZScsIHsgY21kOiAnYWRkJywgZGF0YTogcGhyYXNlIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhbGVydCgnY2Fubm90IHNlbmQgZW1wdHkgcGhyYXNlcycpO1xuICAgICAgY29uc29sZS5lcnJvcignZXJyb3IgOiBlbXB0eSBwaHJhc2VzIGFyZSBmb3JiaWRkZW4nKTtcbiAgICB9XG4gIH1cblxuICBfb25DbGVhckxhYmVsKGxhYmVsKSB7XG4gICAgaWYgKGNvbmZpcm0oJ2RvIHlvdSByZWFsbHkgd2FudCB0byByZW1vdmUgdGhlIGxhYmVsICcgKyBsYWJlbCArICcgPycpKSB7XG4gICAgICB0aGlzLnNlbmQoJ2NsZWFyJywgeyBjbWQ6ICdsYWJlbCcsIGRhdGE6IGxhYmVsIH0pO1xuICAgIH0gICAgXG4gIH1cblxuICBfb25DbGVhck1vZGVsKCkge1xuICAgIGlmIChjb25maXJtKCdkbyB5b3UgcmVhbGx5IHdhbnQgdG8gcmVtb3ZlIHRoZSBjdXJyZW50IG1vZGVsID8nKSkge1xuICAgICAgdGhpcy5zZW5kKCdjbGVhcicsIHsgY21kOiAnbW9kZWwnIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vPT09PT09PT09PT09PT09PSBjYWxsYmFja3MgOiA9PT09PT09PT09PT09PT09Ly9cblxuICBfbW90aW9uQ2FsbGJhY2soZXZlbnRWYWx1ZXMpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBldmVudFZhbHVlcy5zbGljZSgwLDMpLmNvbmNhdChldmVudFZhbHVlcy5zbGljZSgtMykpO1xuICAgIHRoaXMuX3ByZVByb2Nlc3MucHJvY2VzcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUsIHZhbHVlcyk7XG4gIH1cblxuICBfb25SZWNlaXZlTW9kZWwobW9kZWwpIHtcbiAgICBjb25zdCBjb25maWcgPSBtb2RlbCA/IG1vZGVsLmNvbmZpZ3VyYXRpb24uZGVmYXVsdF9wYXJhbWV0ZXJzIDoge307XG5cbiAgICBjb25maWcubW9kZWxUeXBlID0gY29uZmlnLnN0YXRlcyA/ICdoaG1tJyA6ICdnbW0nO1xuICAgIHRoaXMuX3VwZGF0ZUNvbmZpZ0Zyb21Nb2RlbChjb25maWcpO1xuICAgIHRoaXMuX3htbURlY29kZXIucGFyYW1zLnNldCgnbW9kZWwnLCBtb2RlbCk7XG4gIH1cblxuICBfdXBkYXRlQ29uZmlnRnJvbU1vZGVsKGNvbmZpZykge1xuICAgIGNvbnN0IHYgPSB0aGlzLnZpZXcuJGVsO1xuICAgIGxldCBlbHQ7XG5cbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNtb2RlbFNlbGVjdCcpO1xuICAgIGVsdC5zZWxlY3RlZEluZGV4ID0gKGNvbmZpZy5tb2RlbFR5cGUgPT09ICdoaG1tJykgPyAxIDogMDtcblxuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI2dhdXNzU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSBjb25maWcuZ2F1c3NpYW5zIC0gMTtcbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNjb3ZNb2RlU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSBjb25maWcuY292YXJpYW5jZV9tb2RlO1xuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI2Fic1JlZycpO1xuICAgIGVsdC52YWx1ZSA9IGNvbmZpZy5hYnNvbHV0ZV9yZWd1bGFyaXphdGlvbjtcbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNyZWxSZWcnKTtcbiAgICBlbHQudmFsdWUgPSBjb25maWcucmVsYXRpdmVfcmVndWxhcml6YXRpb247XG5cbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNzdGF0ZXNTZWxlY3QnKTtcbiAgICBlbHQuc2VsZWN0ZWRJbmRleCA9IGNvbmZpZy5zdGF0ZXMgPyBjb25maWcuc3RhdGVzIC0gMSA6IDA7XG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjdHJhbnNNb2RlU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSBjb25maWcudHJhbnNpdGlvbl9tb2RlID8gY29uZmlnLnRyYW5zaXRpb25fbW9kZSA6IDA7XG4gIH1cblxuICBfb25Nb2RlbEZpbHRlcihyZXMpIHtcbiAgICBjb25zdCBsaWtlbGlob29kcyA9IHJlcyA/IHJlcy5saWtlbGlob29kcyA6IFtdO1xuICAgIGNvbnN0IGxpa2VsaWVzdCA9IHJlcyA/IHJlcy5saWtlbGllc3RJbmRleCA6IC0xO1xuICAgIGNvbnN0IGxhYmVsID0gcmVzID8gcmVzLmxpa2VsaWVzdCA6ICd1bmtub3duJztcbiAgICBjb25zdCBhbHBoYXMgPSByZXMgPyByZXMuYWxwaGFzIDogW1tdXTsvLyByZXMuYWxwaGFzW2xpa2VsaWVzdF07XG5cbiAgICBjb25zdCBuZXdSZXMgPSB7XG4gICAgICBsYWJlbDogbGFiZWwsXG4gICAgICBsaWtlbGllc3Q6IGxpa2VsaWVzdCxcbiAgICAgIGxpa2VsaWhvb2RzOiBsaWtlbGlob29kc1xuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlcmVyLnNldE1vZGVsUmVzdWx0cyhuZXdSZXMpO1xuXG4gICAgaWYgKHRoaXMubGlrZWxpZXN0ICE9PSBsYWJlbCkge1xuICAgICAgdGhpcy5saWtlbGllc3QgPSBsYWJlbDtcbiAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIGdlc3R1cmUgdG8gOiAnICsgbGFiZWwpO1xuICAgICAgY29uc3QgaSA9IHRoaXMubGFiZWxzLmluZGV4T2YobGFiZWwpO1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5mYWRlVG9OZXdTb3VuZChpKTtcbiAgICB9XG4gIH1cblxuICBfaW50ZW5zaXR5Q2FsbGJhY2soZnJhbWUpIHtcbiAgICB0aGlzLmF1ZGlvRW5naW5lLnNldEdhaW5Gcm9tSW50ZW5zaXR5KGZyYW1lLmRhdGFbMF0pO1xuICB9XG5cbiAgX2VuYWJsZVNvdW5kcyhvbk9mZikge1xuICAgIHRoaXMuYXVkaW9FbmdpbmUuZW5hYmxlU291bmRzKG9uT2ZmKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRGVzaWduZXJFeHBlcmllbmNlOyJdfQ==