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

      // viewModel.assetsDomain = this.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwibGZvIiwiYXVkaW9Db250ZXh0Iiwidmlld01vZGVsIiwiY2xhc3NlcyIsInZpZXdUZW1wbGF0ZSIsIkRlc2lnbmVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJjYWxsYmFjayIsImluc3RhbGxFdmVudHMiLCJkaXYiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwiYWN0aXZlIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJhZGQiLCJlbHQiLCJ0eXBlIiwic2VsZWN0ZWRJbmRleCIsInZhbHVlIiwiY29uZmlnIiwiTnVtYmVyIiwicmVtb3ZlIiwicmVjIiwiaW5uZXJIVE1MIiwibGFiZWxzIiwidGV4dCIsImJ0biIsIkNhbnZhc1ZpZXciLCJEZXNpZ25lckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsImNoZWNraW4iLCJzaG93RGlhbG9nIiwibG9naW4iLCJhdWRpb0J1ZmZlck1hbmFnZXIiLCJmaWxlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsaWtlbGllc3QiLCJ1bmRlZmluZWQiLCJ2aWV3IiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY2xhc3NOYW1lIiwic2hvdyIsInRoZW4iLCJfb25Db25maWciLCJiaW5kIiwiX29uUmVjb3JkIiwiX29uU2VuZFBocmFzZSIsIl9vbkNsZWFyTGFiZWwiLCJfb25DbGVhck1vZGVsIiwiX29uUmVjZWl2ZU1vZGVsIiwiX29uTW9kZWxGaWx0ZXIiLCJfbW90aW9uQ2FsbGJhY2siLCJfaW50ZW5zaXR5Q2FsbGJhY2siLCJfZW5hYmxlU291bmRzIiwib25Db25maWciLCJvblJlY29yZCIsIm9uU2VuZFBocmFzZSIsIm9uQ2xlYXJMYWJlbCIsIm9uQ2xlYXJNb2RlbCIsIm9uRW5hYmxlU291bmRzIiwiX3BocmFzZVJlY29yZGVyIiwiY29sdW1uTmFtZXMiLCJfeG1tRGVjb2RlciIsImxpa2VsaWhvb2RXaW5kb3ciLCJfcHJlUHJvY2VzcyIsImNvbm5lY3QiLCJzdGFydCIsInJlbmRlcmVyIiwiYWRkUmVuZGVyZXIiLCJhdWRpb0VuZ2luZSIsImRhdGEiLCJpc0F2YWlsYWJsZSIsImFkZExpc3RlbmVyIiwicmVjZWl2ZSIsInNlbmQiLCJjbWQiLCJzdG9wIiwibGFiZWwiLCJzZXRQaHJhc2VMYWJlbCIsInBocmFzZSIsImdldFJlY29yZGVkUGhyYXNlIiwibGVuZ3RoIiwiY29uZmlybSIsImFsZXJ0IiwiY29uc29sZSIsImVycm9yIiwiZXZlbnRWYWx1ZXMiLCJ2YWx1ZXMiLCJzbGljZSIsImNvbmNhdCIsInByb2Nlc3MiLCJjdXJyZW50VGltZSIsIm1vZGVsIiwiY29uZmlndXJhdGlvbiIsImRlZmF1bHRfcGFyYW1ldGVycyIsIm1vZGVsVHlwZSIsInN0YXRlcyIsIl91cGRhdGVDb25maWdGcm9tTW9kZWwiLCJwYXJhbXMiLCJzZXQiLCJ2IiwiZ2F1c3NpYW5zIiwiY292YXJpYW5jZV9tb2RlIiwiYWJzb2x1dGVfcmVndWxhcml6YXRpb24iLCJyZWxhdGl2ZV9yZWd1bGFyaXphdGlvbiIsInRyYW5zaXRpb25fbW9kZSIsInJlcyIsImxpa2VsaWhvb2RzIiwibGlrZWxpZXN0SW5kZXgiLCJhbHBoYXMiLCJuZXdSZXMiLCJzZXRNb2RlbFJlc3VsdHMiLCJsb2ciLCJpIiwiaW5kZXhPZiIsImZhZGVUb05ld1NvdW5kIiwiZnJhbWUiLCJzZXRHYWluRnJvbUludGVuc2l0eSIsIm9uT2ZmIiwiZW5hYmxlU291bmRzIiwiRXhwZXJpZW5jZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxVOztBQUNaOztBQUNBOztJQUFZQyxHOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQzs7QUFFQSxJQUFNQyxZQUFZ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RSxTQUFTSCxNQUFNQSxJQUFJRyxNQUFWLEdBQW1CLENBQUMsRUFBRCxDQUFsQyxDQUprQixDQUlxQjs7QUFFdkMsVUFBTUMsU0FBUztBQUNiakMsZUFBT0EsS0FETTtBQUViekMsbUJBQVdBLFNBRkU7QUFHYnVFLHFCQUFhQTtBQUhBLE9BQWY7O0FBTUEsV0FBS3hDLFFBQUwsQ0FBYzRDLGVBQWQsQ0FBOEJELE1BQTlCOztBQUVBLFVBQUksS0FBSzFFLFNBQUwsS0FBbUJ5QyxLQUF2QixFQUE4QjtBQUM1QixhQUFLekMsU0FBTCxHQUFpQnlDLEtBQWpCO0FBQ0FPLGdCQUFRNEIsR0FBUixDQUFZLDBCQUEwQm5DLEtBQXRDO0FBQ0EsWUFBTW9DLElBQUksS0FBSzdGLE1BQUwsQ0FBWThGLE9BQVosQ0FBb0JyQyxLQUFwQixDQUFWO0FBQ0EsYUFBS1IsV0FBTCxDQUFpQjhDLGNBQWpCLENBQWdDRixDQUFoQztBQUNEO0FBQ0Y7Ozt1Q0FFa0JHLEssRUFBTztBQUN4QixXQUFLL0MsV0FBTCxDQUFpQmdELG9CQUFqQixDQUFzQ0QsTUFBTTlDLElBQU4sQ0FBVyxDQUFYLENBQXRDO0FBQ0Q7OztrQ0FFYWdELEssRUFBTztBQUNuQixXQUFLakQsV0FBTCxDQUFpQmtELFlBQWpCLENBQThCRCxLQUE5QjtBQUNEOzs7RUF4TDhCL0gsV0FBV2lJLFU7O0FBeUwzQzs7a0JBRWNoRyxrQiIsImZpbGUiOiJEZXNpZ25lckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCB7IExvZ2luIH0gZnJvbSAnLi4vc2VydmljZXMvTG9naW4nO1xuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jb21tb24nO1xuaW1wb3J0IHsgUGhyYXNlUmVjb3JkZXJMZm8sIFhtbURlY29kZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCBQcmVQcm9jZXNzIGZyb20gJy4uL3NoYXJlZC9QcmVQcm9jZXNzJztcbmltcG9ydCBMaWtlbGlob29kc1JlbmRlcmVyIGZyb20gJy4uL3NoYXJlZC9MaWtlbGlob29kc1JlbmRlcmVyJztcbmltcG9ydCB7IGNsYXNzZXMgfSBmcm9tICAnLi4vc2hhcmVkL2NvbmZpZyc7XG5pbXBvcnQgQXVkaW9FbmdpbmUgZnJvbSAnLi4vc2hhcmVkL0F1ZGlvRW5naW5lJztcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmNvbnN0IHZpZXdNb2RlbCA9IHtcbiAgY2xhc3NlczogY2xhc3Nlcyxcbn07XG5cbmNvbnN0IHZpZXdUZW1wbGF0ZSA9IGBcbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmRcIj5cblxuICAgIDxkaXYgaWQ9XCJuYXZcIj5cbiAgICAgIDwhLS0gPGEgaHJlZj1cIiNcIiBpZD1cIm9wZW5Db25maWdCdG5cIj4mIzk3NzY7PC9hPiAtLT5cbiAgICAgIDxhIGhyZWY9XCIjXCIgaWQ9XCJvcGVuQ29uZmlnQnRuXCI+IDxpbWcgc3JjPVwiL3BpY3MvbmF2aWNvbi5wbmdcIj4gPC9hPlxuICAgIDwvZGl2PlxuXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1vdmVybGF5XCI+XG4gICAgICAgIFxuICAgICAgICA8ZGl2IGNsYXNzPVwib3ZlcmxheS1jb250ZW50XCI+XG4gICAgICAgICAgPHA+IEdsb2JhbCBjb25maWd1cmF0aW9uIDwvcD5cbiAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwibW9kZWxTZWxlY3RcIj4gTW9kZWwgdHlwZSA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwibW9kZWxTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImdtbVwiPmdtbTwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiaGhtbVwiPmhobW08L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJnYXVzc1NlbGVjdFwiPiBHYXVzc2lhbnMgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cImdhdXNzU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDwlIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykgeyAlPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI8JT0gaSsxICU+XCI+XG4gICAgICAgICAgICAgICAgICA8JT0gaSsxICU+XG4gICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJjb3ZNb2RlU2VsZWN0XCI+IENvdmFyaWFuY2UgbW9kZSA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwiY292TW9kZVNlbGVjdFwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZnVsbFwiPmZ1bGw8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImRpYWdvbmFsXCI+ZGlhZ29uYWw8L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PiAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImFic1JlZ1wiPiBBYnNvbHV0ZSByZWd1bGFyaXphdGlvbiA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9XCJhYnNSZWdcIiB0eXBlPVwidGV4dFwiIHZhbHVlPVwiMC4wMVwiPlxuICAgICAgICAgICAgPC9pbnB1dD5cbiAgICAgICAgICA8L2Rpdj4gICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJyZWxSZWdcIj4gUmVsYXRpdmUgcmVndWxhcml6YXRpb24gOiA8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPVwicmVsUmVnXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIjAuMDFcIj5cbiAgICAgICAgICAgIDwvaW5wdXQ+XG4gICAgICAgICAgPC9kaXY+ICAgICAgICBcblxuICAgICAgICAgIDxocj5cbiAgICAgICAgICA8cD4gSGhtbSBwYXJhbWV0ZXJzIDwvcD5cbiAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICA8IS0tXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImhpZXJhcmNoaWNhbFNlbGVjdFwiPiBIaWVyYXJjaGljYWwgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cImhpZXJhcmNoaWNhbFNlbGVjdFwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwieWVzXCI+eWVzPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJub1wiPm5vPC9vcHRpb24+XG4gICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgLS0+ICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwic3RhdGVzU2VsZWN0XCI+IFN0YXRlcyA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwic3RhdGVzU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDwlIGZvciAodmFyIGkgPSAwOyBpIDwgMjA7IGkrKykgeyAlPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI8JT0gaSsxICU+XCI+XG4gICAgICAgICAgICAgICAgICA8JT0gaSsxICU+XG4gICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ0cmFuc01vZGVTZWxlY3RcIj4gVHJhbnNpdGlvbiBtb2RlIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJ0cmFuc01vZGVTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImVyZ29kaWNcIj5lcmdvZGljPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJsZWZ0cmlnaHRcIj5sZWZ0cmlnaHQ8L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PiBcbiAgICAgICAgICA8IS0tXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cInJlZ3Jlc3NFc3RpbVNlbGVjdFwiPiBSZWdyZXNzaW9uIGVzdGltYXRvciA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwicmVncmVzc0VzdGltU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJmdWxsXCI+ZnVsbDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwid2luZG93ZWRcIj53aW5kb3dlZDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwibGlrZWxpZXN0XCI+bGlrZWxpZXN0PC9vcHRpb24+XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAtLT4gICAgICAgIFxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi11bmRlcmxheVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+IExhYmVsIDpcbiAgICAgICAgICA8c2VsZWN0IGlkPVwibGFiZWxTZWxlY3RcIj5cbiAgICAgICAgICAgIDwlIGZvciAodmFyIHByb3AgaW4gY2xhc3NlcykgeyAlPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiPCU9IHByb3AgJT5cIj5cbiAgICAgICAgICAgICAgICA8JT0gcHJvcCAlPlxuICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gaWQ9XCJyZWNCdG5cIj5SRUM8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBpZD1cInNlbmRCdG5cIj5TRU5EPC9idXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYW52YXNEaXZcIj5cbiAgICAgICAgICA8Y2FudmFzIGNsYXNzPVwibXVsdGlzbGlkZXJcIiBpZD1cImxpa2VsaWhvb2RzXCI+PC9jYW52YXM+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGlkPVwiY2xlYXJMYWJlbEJ0blwiPkNMRUFSIExBQkVMPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gaWQ9XCJjbGVhck1vZGVsQnRuXCI+Q0xFQVIgTU9ERUw8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInRvZ2dsZURpdlwiPlxuICAgICAgICAgIDxidXR0b24gaWQ9XCJwbGF5QnRuXCIgY2xhc3M9XCJ0b2dnbGVCdG5cIj48L2J1dHRvbj5cbiAgICAgICAgICBFbmFibGUgc291bmRzXG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8IS0tXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGVEaXZcIj5cbiAgICAgICAgICA8YnV0dG9uIGlkPVwiaW50ZW5zaXR5QnRuXCIgY2xhc3M9XCJ0b2dnbGVCdG5cIj48L2J1dHRvbj5cbiAgICAgICAgICBEaXNhYmxlIGludGVuc2l0eSBjb250cm9sXG4gICAgICAgIDwvZGl2PlxuICAgICAgICAtLT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+XG4gICAgPC9kaXY+XG5cbiAgPC9kaXY+XG5gO1xuXG5jbGFzcyBEZXNpZ25lclZpZXcgZXh0ZW5kcyBzb3VuZHdvcmtzLkNhbnZhc1ZpZXcge1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cblxuICBvbkNvbmZpZyhjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI29wZW5Db25maWdCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpdiA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLW92ZXJsYXknKTtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gZGl2LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJyk7XG5cbiAgICAgICAgaWYgKCFhY3RpdmUpIHtcbiAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI21vZGVsU2VsZWN0Jyk7XG4gICAgICAgICAgY29uc3QgdHlwZSA9IGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcblxuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHt9O1xuICAgICAgICAgIGxldCBlbHQ7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2dhdXNzU2VsZWN0Jyk7XG4gICAgICAgICAgY29uZmlnWydnYXVzc2lhbnMnXSA9IE51bWJlcihlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWUpO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNjb3ZNb2RlU2VsZWN0Jyk7XG4gICAgICAgICAgY29uZmlnWydjb3ZhcmlhbmNlTW9kZSddID0gZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNhYnNSZWcnKTtcbiAgICAgICAgICBjb25maWdbJ2Fic29sdXRlUmVndWxhcml6YXRpb24nXSA9IE51bWJlcihlbHQudmFsdWUpO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWxSZWcnKTtcbiAgICAgICAgICBjb25maWdbJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nXSA9IE51bWJlcihlbHQudmFsdWUpO1xuICAgICAgICAgIC8vIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNoaWVyYXJjaGljYWxTZWxlY3QnKTtcbiAgICAgICAgICAvLyBjb25maWdbJ2hpZXJhcmNoaWNhbCddID0gKGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZSA9PT0gJ3llcycpO1xuICAgICAgICAgIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyN0cmFuc01vZGVTZWxlY3QnKTtcbiAgICAgICAgICBjb25maWdbJ3RyYW5zaXRpb25Nb2RlJ10gPSBlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3N0YXRlc1NlbGVjdCcpO1xuICAgICAgICAgIGNvbmZpZ1snc3RhdGVzJ10gPSBOdW1iZXIoZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlKTtcbiAgICAgICAgICAvLyBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjcmVncmVzc0VzdGltU2VsZWN0Jyk7XG4gICAgICAgICAgLy8gY29uZmlnWydyZWdyZXNzaW9uRXN0aW1hdG9yJ10gPSBlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG5cbiAgICAgICAgICBjYWxsYmFjayh0eXBlLCBjb25maWcpO1xuXG4gICAgICAgICAgZGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvblJlY29yZChjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI3JlY0J0bic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVjID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3JlY0J0bicpO1xuICAgICAgICBpZiAoIXJlYy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgICAgICAgcmVjLmlubmVySFRNTCA9ICdTVE9QJztcbiAgICAgICAgICByZWMuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgY2FsbGJhY2soJ3JlY29yZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlYy5pbm5lckhUTUwgPSAnUkVDJztcbiAgICAgICAgICByZWMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgY2FsbGJhY2soJ3N0b3AnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvblNlbmRQaHJhc2UoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNzZW5kQnRuJzogKCkgPT4ge1xuICAgICAgICBjb25zdCBsYWJlbHMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjbGFiZWxTZWxlY3QnKTtcbiAgICAgICAgY2FsbGJhY2sobGFiZWxzLm9wdGlvbnNbbGFiZWxzLnNlbGVjdGVkSW5kZXhdLnRleHQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25DbGVhckxhYmVsKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjY2xlYXJMYWJlbEJ0bic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgbGFiZWxzID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2xhYmVsU2VsZWN0Jyk7XG4gICAgICAgIGNhbGxiYWNrKGxhYmVscy5vcHRpb25zW2xhYmVscy5zZWxlY3RlZEluZGV4XS50ZXh0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uQ2xlYXJNb2RlbChjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI2NsZWFyTW9kZWxCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbkVuYWJsZVNvdW5kcyhjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI3BsYXlCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNwbGF5QnRuJyk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGJ0bi5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpO1xuICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soIWFjdGl2ZSk7ICAgICAgICBcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuXG5cbmNsYXNzIERlc2lnbmVyRXhwZXJpZW5jZSBleHRlbmRzIHNvdW5kd29ya3MuRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGFzc2V0c0RvbWFpbikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJ10gfSk7XG4gICAgdGhpcy5jaGVja2luID0gdGhpcy5yZXF1aXJlKCdjaGVja2luJywgeyBzaG93RGlhbG9nOiBmYWxzZSB9KTtcbiAgICAvLyB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuICAgIHRoaXMubG9naW4gPSB0aGlzLnJlcXVpcmUoJ2xvZ2luJyk7XG4gICAgdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLWJ1ZmZlci1tYW5hZ2VyJywge1xuICAgICAgYXNzZXRzRG9tYWluOiBhc3NldHNEb21haW4sXG4gICAgICBmaWxlczogY2xhc3NlcyxcbiAgICB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7XG4gICAgICBkZXNjcmlwdG9yczogWydkZXZpY2Vtb3Rpb24nXVxuICAgIH0pO1xuXG4gICAgdGhpcy5sYWJlbHMgPSBPYmplY3Qua2V5cyhjbGFzc2VzKTtcbiAgICB0aGlzLmxpa2VsaWVzdCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7IC8vIGRvbid0IGZvcmdldCB0aGlzXG5cbiAgICAvLyB2aWV3TW9kZWwuYXNzZXRzRG9tYWluID0gdGhpcy5cbiAgICB0aGlzLnZpZXcgPSBuZXcgRGVzaWduZXJWaWV3KHZpZXdUZW1wbGF0ZSwgdmlld01vZGVsLCB7fSwge1xuICAgICAgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlLFxuICAgICAgY2xhc3NOYW1lOiAnZGVzaWduZXInXG4gICAgfSk7XG5cbiAgICB0aGlzLnNob3coKS50aGVuKCgpID0+IHtcblxuICAgICAgdGhpcy5fb25Db25maWcgPSB0aGlzLl9vbkNvbmZpZy5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25SZWNvcmQgPSB0aGlzLl9vblJlY29yZC5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25TZW5kUGhyYXNlID0gdGhpcy5fb25TZW5kUGhyYXNlLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbkNsZWFyTGFiZWwgPSB0aGlzLl9vbkNsZWFyTGFiZWwuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uQ2xlYXJNb2RlbCA9IHRoaXMuX29uQ2xlYXJNb2RlbC5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25SZWNlaXZlTW9kZWwgPSB0aGlzLl9vblJlY2VpdmVNb2RlbC5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25Nb2RlbEZpbHRlciA9IHRoaXMuX29uTW9kZWxGaWx0ZXIuYmluZCh0aGlzKTsgICBcbiAgICAgIHRoaXMuX21vdGlvbkNhbGxiYWNrID0gdGhpcy5fbW90aW9uQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX2ludGVuc2l0eUNhbGxiYWNrID0gdGhpcy5faW50ZW5zaXR5Q2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX2VuYWJsZVNvdW5kcyA9IHRoaXMuX2VuYWJsZVNvdW5kcy5iaW5kKHRoaXMpO1xuXG4gICAgICB0aGlzLnZpZXcub25Db25maWcodGhpcy5fb25Db25maWcpO1xuICAgICAgdGhpcy52aWV3Lm9uUmVjb3JkKHRoaXMuX29uUmVjb3JkKTtcbiAgICAgIHRoaXMudmlldy5vblNlbmRQaHJhc2UodGhpcy5fb25TZW5kUGhyYXNlKTtcbiAgICAgIHRoaXMudmlldy5vbkNsZWFyTGFiZWwodGhpcy5fb25DbGVhckxhYmVsKTtcbiAgICAgIHRoaXMudmlldy5vbkNsZWFyTW9kZWwodGhpcy5fb25DbGVhck1vZGVsKTtcbiAgICAgIHRoaXMudmlldy5vbkVuYWJsZVNvdW5kcyh0aGlzLl9lbmFibGVTb3VuZHMpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLSBMRk8ncyAtLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgICAgdGhpcy5fcGhyYXNlUmVjb3JkZXIgPSBuZXcgUGhyYXNlUmVjb3JkZXJMZm8oe1xuICAgICAgICBjb2x1bW5OYW1lczogWyAnYWNjZWxYJywgJ2FjY2VsWScsICdhY2NlbFonIF1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5feG1tRGVjb2RlciA9IG5ldyBYbW1EZWNvZGVyTGZvKHtcbiAgICAgICAgbGlrZWxpaG9vZFdpbmRvdzogMjAsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLl9vbk1vZGVsRmlsdGVyXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3MgPSBuZXcgUHJlUHJvY2Vzcyh0aGlzLl9pbnRlbnNpdHlDYWxsYmFjayk7XG4gICAgICB0aGlzLl9wcmVQcm9jZXNzLmNvbm5lY3QodGhpcy5fcGhyYXNlUmVjb3JkZXIpO1xuICAgICAgdGhpcy5fcHJlUHJvY2Vzcy5jb25uZWN0KHRoaXMuX3htbURlY29kZXIpO1xuICAgICAgdGhpcy5fcHJlUHJvY2Vzcy5zdGFydCgpO1xuXG4gICAgICAvLyBpbml0aWFsaXplIHJlbmRlcmluZ1xuICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBMaWtlbGlob29kc1JlbmRlcmVyKDEwMCk7XG4gICAgICB0aGlzLnZpZXcuYWRkUmVuZGVyZXIodGhpcy5yZW5kZXJlcik7XG4gICAgICAvLyB0aGlzLnZpZXcuc2V0UHJlUmVuZGVyKChjdHgsIGR0KSA9PiB7fSk7XG5cbiAgICAgIHRoaXMuYXVkaW9FbmdpbmUgPSBuZXcgQXVkaW9FbmdpbmUodGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YSk7XG4gICAgICB0aGlzLmF1ZGlvRW5naW5lLnN0YXJ0KCk7XG5cbiAgICBpZiAodGhpcy5tb3Rpb25JbnB1dC5pc0F2YWlsYWJsZSgnZGV2aWNlbW90aW9uJykpIHtcbiAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ2RldmljZW1vdGlvbicsIHRoaXMuX21vdGlvbkNhbGxiYWNrKTtcbiAgICB9XG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tIFJFQ0VJVkUgLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgICAgdGhpcy5yZWNlaXZlKCdtb2RlbCcsIHRoaXMuX29uUmVjZWl2ZU1vZGVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNvbmZpZyh0eXBlLCBjb25maWcpIHtcbiAgICB0aGlzLnNlbmQoJ2NvbmZpZ3VyYXRpb24nLCB7IHR5cGU6IHR5cGUsIGNvbmZpZzogY29uZmlnIH0pO1xuICB9XG5cbiAgX29uUmVjb3JkKGNtZCkge1xuICAgIHN3aXRjaCAoY21kKSB7XG4gICAgICBjYXNlICdyZWNvcmQnOlxuICAgICAgICB0aGlzLl9waHJhc2VSZWNvcmRlci5zdGFydCgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc3RvcCc6XG4gICAgICAgIHRoaXMuX3BocmFzZVJlY29yZGVyLnN0b3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX29uU2VuZFBocmFzZShsYWJlbCkge1xuICAgIHRoaXMuX3BocmFzZVJlY29yZGVyLnNldFBocmFzZUxhYmVsKGxhYmVsKTtcbiAgICBsZXQgcGhyYXNlID0gdGhpcy5fcGhyYXNlUmVjb3JkZXIuZ2V0UmVjb3JkZWRQaHJhc2UoKTtcbiAgICBpZiAocGhyYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChjb25maXJtKCdzZW5kIHBocmFzZSB3aXRoIGxhYmVsICcgKyBsYWJlbCArICcgPycpKSB7XG4gICAgICAgIHRoaXMuc2VuZCgncGhyYXNlJywgeyBjbWQ6ICdhZGQnLCBkYXRhOiBwaHJhc2UgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsZXJ0KCdjYW5ub3Qgc2VuZCBlbXB0eSBwaHJhc2VzJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdlcnJvciA6IGVtcHR5IHBocmFzZXMgYXJlIGZvcmJpZGRlbicpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkNsZWFyTGFiZWwobGFiZWwpIHtcbiAgICBpZiAoY29uZmlybSgnZG8geW91IHJlYWxseSB3YW50IHRvIHJlbW92ZSB0aGUgbGFiZWwgJyArIGxhYmVsICsgJyA/JykpIHtcbiAgICAgIHRoaXMuc2VuZCgnY2xlYXInLCB7IGNtZDogJ2xhYmVsJywgZGF0YTogbGFiZWwgfSk7XG4gICAgfSAgICBcbiAgfVxuXG4gIF9vbkNsZWFyTW9kZWwoKSB7XG4gICAgaWYgKGNvbmZpcm0oJ2RvIHlvdSByZWFsbHkgd2FudCB0byByZW1vdmUgdGhlIGN1cnJlbnQgbW9kZWwgPycpKSB7XG4gICAgICB0aGlzLnNlbmQoJ2NsZWFyJywgeyBjbWQ6ICdtb2RlbCcgfSk7XG4gICAgfVxuICB9XG5cbiAgLy89PT09PT09PT09PT09PT09IGNhbGxiYWNrcyA6ID09PT09PT09PT09PT09PT0vL1xuXG4gIF9tb3Rpb25DYWxsYmFjayhldmVudFZhbHVlcykge1xuICAgIGNvbnN0IHZhbHVlcyA9IGV2ZW50VmFsdWVzLnNsaWNlKDAsMykuY29uY2F0KGV2ZW50VmFsdWVzLnNsaWNlKC0zKSk7XG4gICAgdGhpcy5fcHJlUHJvY2Vzcy5wcm9jZXNzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgdmFsdWVzKTtcbiAgfVxuXG4gIF9vblJlY2VpdmVNb2RlbChtb2RlbCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IG1vZGVsID8gbW9kZWwuY29uZmlndXJhdGlvbi5kZWZhdWx0X3BhcmFtZXRlcnMgOiB7fTtcblxuICAgIGNvbmZpZy5tb2RlbFR5cGUgPSBjb25maWcuc3RhdGVzID8gJ2hobW0nIDogJ2dtbSc7XG4gICAgdGhpcy5fdXBkYXRlQ29uZmlnRnJvbU1vZGVsKGNvbmZpZyk7XG4gICAgdGhpcy5feG1tRGVjb2Rlci5wYXJhbXMuc2V0KCdtb2RlbCcsIG1vZGVsKTtcbiAgfVxuXG4gIF91cGRhdGVDb25maWdGcm9tTW9kZWwoY29uZmlnKSB7XG4gICAgY29uc3QgdiA9IHRoaXMudmlldy4kZWw7XG4gICAgbGV0IGVsdDtcblxuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI21vZGVsU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSAoY29uZmlnLm1vZGVsVHlwZSA9PT0gJ2hobW0nKSA/IDEgOiAwO1xuXG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjZ2F1c3NTZWxlY3QnKTtcbiAgICBlbHQuc2VsZWN0ZWRJbmRleCA9IGNvbmZpZy5nYXVzc2lhbnMgLSAxO1xuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI2Nvdk1vZGVTZWxlY3QnKTtcbiAgICBlbHQuc2VsZWN0ZWRJbmRleCA9IGNvbmZpZy5jb3ZhcmlhbmNlX21vZGU7XG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjYWJzUmVnJyk7XG4gICAgZWx0LnZhbHVlID0gY29uZmlnLmFic29sdXRlX3JlZ3VsYXJpemF0aW9uO1xuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI3JlbFJlZycpO1xuICAgIGVsdC52YWx1ZSA9IGNvbmZpZy5yZWxhdGl2ZV9yZWd1bGFyaXphdGlvbjtcblxuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI3N0YXRlc1NlbGVjdCcpO1xuICAgIGVsdC5zZWxlY3RlZEluZGV4ID0gY29uZmlnLnN0YXRlcyA/IGNvbmZpZy5zdGF0ZXMgLSAxIDogMDtcbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyN0cmFuc01vZGVTZWxlY3QnKTtcbiAgICBlbHQuc2VsZWN0ZWRJbmRleCA9IGNvbmZpZy50cmFuc2l0aW9uX21vZGUgPyBjb25maWcudHJhbnNpdGlvbl9tb2RlIDogMDtcbiAgfVxuXG4gIF9vbk1vZGVsRmlsdGVyKHJlcykge1xuICAgIGNvbnN0IGxpa2VsaWhvb2RzID0gcmVzID8gcmVzLmxpa2VsaWhvb2RzIDogW107XG4gICAgY29uc3QgbGlrZWxpZXN0ID0gcmVzID8gcmVzLmxpa2VsaWVzdEluZGV4IDogLTE7XG4gICAgY29uc3QgbGFiZWwgPSByZXMgPyByZXMubGlrZWxpZXN0IDogJ3Vua25vd24nO1xuICAgIGNvbnN0IGFscGhhcyA9IHJlcyA/IHJlcy5hbHBoYXMgOiBbW11dOy8vIHJlcy5hbHBoYXNbbGlrZWxpZXN0XTtcblxuICAgIGNvbnN0IG5ld1JlcyA9IHtcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIGxpa2VsaWVzdDogbGlrZWxpZXN0LFxuICAgICAgbGlrZWxpaG9vZHM6IGxpa2VsaWhvb2RzXG4gICAgfTtcblxuICAgIHRoaXMucmVuZGVyZXIuc2V0TW9kZWxSZXN1bHRzKG5ld1Jlcyk7XG5cbiAgICBpZiAodGhpcy5saWtlbGllc3QgIT09IGxhYmVsKSB7XG4gICAgICB0aGlzLmxpa2VsaWVzdCA9IGxhYmVsO1xuICAgICAgY29uc29sZS5sb2coJ2NoYW5nZWQgZ2VzdHVyZSB0byA6ICcgKyBsYWJlbCk7XG4gICAgICBjb25zdCBpID0gdGhpcy5sYWJlbHMuaW5kZXhPZihsYWJlbCk7XG4gICAgICB0aGlzLmF1ZGlvRW5naW5lLmZhZGVUb05ld1NvdW5kKGkpO1xuICAgIH1cbiAgfVxuXG4gIF9pbnRlbnNpdHlDYWxsYmFjayhmcmFtZSkge1xuICAgIHRoaXMuYXVkaW9FbmdpbmUuc2V0R2FpbkZyb21JbnRlbnNpdHkoZnJhbWUuZGF0YVswXSk7XG4gIH1cblxuICBfZW5hYmxlU291bmRzKG9uT2ZmKSB7XG4gICAgdGhpcy5hdWRpb0VuZ2luZS5lbmFibGVTb3VuZHMob25PZmYpO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEZXNpZ25lckV4cGVyaWVuY2U7Il19