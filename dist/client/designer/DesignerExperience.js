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
  classes: _config.classes,
  assetsDomain: ''
};

var viewTemplate = '\n  <div class="foreground">\n\n    <div id="nav">\n      <!-- <a href="#" id="openConfigBtn">&#9776;</a> -->\n      <a href="#" id="openConfigBtn"> <img src="<%= assetsDomain %>pics/navicon.png"> </a>\n    </div>\n\n    <div class="section-top flex-middle">\n      <div class="section-overlay">\n        \n        <div class="overlay-content">\n          <p> Global configuration </p>\n          <br />\n          <div class="selectDiv">\n            <label for="modelSelect"> Model type : </label>\n            <select id="modelSelect">\n              <option value="gmm">gmm</option>\n              <option value="hhmm">hhmm</option>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="gaussSelect"> Gaussians : </label>\n            <select id="gaussSelect">\n              <% for (var i = 0; i < 10; i++) { %>\n                <option value="<%= i+1 %>">\n                  <%= i+1 %>\n                </option>\n              <% } %>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="covModeSelect"> Covariance mode : </label>\n            <select id="covModeSelect">\n              <option value="full">full</option>\n              <option value="diagonal">diagonal</option>\n            </select>\n          </div>        \n          <div class="selectDiv">\n            <label for="absReg"> Absolute regularization : </label>\n            <input id="absReg" type="text" value="0.01">\n            </input>\n          </div>        \n          <div class="selectDiv">\n            <label for="relReg"> Relative regularization : </label>\n            <input id="relReg" type="text" value="0.01">\n            </input>\n          </div>        \n\n          <hr>\n          <p> Hhmm parameters </p>\n          <br />\n          <!--\n          <div class="selectDiv">\n            <label for="hierarchicalSelect"> Hierarchical : </label>\n            <select id="hierarchicalSelect">\n              <option value="yes">yes</option>\n              <option value="no">no</option>\n             </select>\n          </div>\n          -->        \n          <div class="selectDiv">\n            <label for="statesSelect"> States : </label>\n            <select id="statesSelect">\n              <% for (var i = 0; i < 20; i++) { %>\n                <option value="<%= i+1 %>">\n                  <%= i+1 %>\n                </option>\n              <% } %>\n            </select>\n          </div>\n          <div class="selectDiv">\n            <label for="transModeSelect"> Transition mode : </label>\n            <select id="transModeSelect">\n              <option value="ergodic">ergodic</option>\n              <option value="leftright">leftright</option>\n            </select>\n          </div> \n          <!--\n          <div class="selectDiv">\n            <label for="regressEstimSelect"> Regression estimator : </label>\n            <select id="regressEstimSelect">\n              <option value="full">full</option>\n              <option value="windowed">windowed</option>\n              <option value="likeliest">likeliest</option>\n            </select>\n          </div>\n          -->        \n        </div>\n      </div>\n\n      <div class="section-underlay">\n        <div class="selectDiv"> Label :\n          <select id="labelSelect">\n            <% for (var prop in classes) { %>\n              <option value="<%= prop %>">\n                <%= prop %>\n              </option>\n            <% } %>\n          </select>\n        </div>\n        <button id="recBtn">REC</button>\n        <button id="sendBtn">SEND</button>\n        <div class="canvasDiv">\n          <canvas class="multislider" id="likelihoods"></canvas>\n        </div>\n        <button id="clearLabelBtn">CLEAR LABEL</button>\n        <button id="clearModelBtn">CLEAR MODEL</button>\n        <div class="toggleDiv">\n          <button id="playBtn" class="toggleBtn"></button>\n          Enable sounds\n        </div>\n        <!--\n        <div class="toggleDiv">\n          <button id="intensityBtn" class="toggleBtn"></button>\n          Disable intensity control\n        </div>\n        -->\n      </div>\n    </div>\n\n    <div class="section-center flex-center">\n    </div>\n    <div class="section-bottom flex-middle">\n    </div>\n\n  </div>\n';

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
    _this7.sharedConfig = _this7.require('shared-config', { items: ['assetsDomain'] });
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

      this.view.model.assetsDomain = this.sharedConfig.get('assetsDomain');
      console.log(this.view.model.assetsDomain);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwibGZvIiwiYXVkaW9Db250ZXh0Iiwidmlld01vZGVsIiwiY2xhc3NlcyIsImFzc2V0c0RvbWFpbiIsInZpZXdUZW1wbGF0ZSIsIkRlc2lnbmVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJjYWxsYmFjayIsImluc3RhbGxFdmVudHMiLCJkaXYiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwiYWN0aXZlIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJhZGQiLCJlbHQiLCJ0eXBlIiwic2VsZWN0ZWRJbmRleCIsInZhbHVlIiwiY29uZmlnIiwiTnVtYmVyIiwicmVtb3ZlIiwicmVjIiwiaW5uZXJIVE1MIiwibGFiZWxzIiwidGV4dCIsImJ0biIsIkNhbnZhc1ZpZXciLCJEZXNpZ25lckV4cGVyaWVuY2UiLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsImNoZWNraW4iLCJzaG93RGlhbG9nIiwic2hhcmVkQ29uZmlnIiwiaXRlbXMiLCJsb2dpbiIsImF1ZGlvQnVmZmVyTWFuYWdlciIsImZpbGVzIiwibW90aW9uSW5wdXQiLCJkZXNjcmlwdG9ycyIsImxpa2VsaWVzdCIsInVuZGVmaW5lZCIsInZpZXciLCJwcmVzZXJ2ZVBpeGVsUmF0aW8iLCJjbGFzc05hbWUiLCJtb2RlbCIsImdldCIsImNvbnNvbGUiLCJsb2ciLCJzaG93IiwidGhlbiIsIl9vbkNvbmZpZyIsImJpbmQiLCJfb25SZWNvcmQiLCJfb25TZW5kUGhyYXNlIiwiX29uQ2xlYXJMYWJlbCIsIl9vbkNsZWFyTW9kZWwiLCJfb25SZWNlaXZlTW9kZWwiLCJfb25Nb2RlbEZpbHRlciIsIl9tb3Rpb25DYWxsYmFjayIsIl9pbnRlbnNpdHlDYWxsYmFjayIsIl9lbmFibGVTb3VuZHMiLCJvbkNvbmZpZyIsIm9uUmVjb3JkIiwib25TZW5kUGhyYXNlIiwib25DbGVhckxhYmVsIiwib25DbGVhck1vZGVsIiwib25FbmFibGVTb3VuZHMiLCJfcGhyYXNlUmVjb3JkZXIiLCJjb2x1bW5OYW1lcyIsIl94bW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsIl9wcmVQcm9jZXNzIiwiY29ubmVjdCIsInN0YXJ0IiwicmVuZGVyZXIiLCJhZGRSZW5kZXJlciIsImF1ZGlvRW5naW5lIiwiZGF0YSIsImlzQXZhaWxhYmxlIiwiYWRkTGlzdGVuZXIiLCJyZWNlaXZlIiwic2VuZCIsImNtZCIsInN0b3AiLCJsYWJlbCIsInNldFBocmFzZUxhYmVsIiwicGhyYXNlIiwiZ2V0UmVjb3JkZWRQaHJhc2UiLCJsZW5ndGgiLCJjb25maXJtIiwiYWxlcnQiLCJlcnJvciIsImV2ZW50VmFsdWVzIiwidmFsdWVzIiwic2xpY2UiLCJjb25jYXQiLCJwcm9jZXNzIiwiY3VycmVudFRpbWUiLCJjb25maWd1cmF0aW9uIiwiZGVmYXVsdF9wYXJhbWV0ZXJzIiwibW9kZWxUeXBlIiwic3RhdGVzIiwiX3VwZGF0ZUNvbmZpZ0Zyb21Nb2RlbCIsInBhcmFtcyIsInNldCIsInYiLCJnYXVzc2lhbnMiLCJjb3ZhcmlhbmNlX21vZGUiLCJhYnNvbHV0ZV9yZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlX3JlZ3VsYXJpemF0aW9uIiwidHJhbnNpdGlvbl9tb2RlIiwicmVzIiwibGlrZWxpaG9vZHMiLCJsaWtlbGllc3RJbmRleCIsImFscGhhcyIsIm5ld1JlcyIsInNldE1vZGVsUmVzdWx0cyIsImkiLCJpbmRleE9mIiwiZmFkZVRvTmV3U291bmQiLCJmcmFtZSIsInNldEdhaW5Gcm9tSW50ZW5zaXR5Iiwib25PZmYiLCJlbmFibGVTb3VuZHMiLCJFeHBlcmllbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7O0FBQ1o7O0FBQ0E7O0lBQVlDLEc7O0FBQ1o7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLElBQU1DLGVBQWVG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ZSI6IkRlc2lnbmVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IHsgTG9naW4gfSBmcm9tICcuLi9zZXJ2aWNlcy9Mb2dpbic7XG5pbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvL2NvbW1vbic7XG5pbXBvcnQgeyBQaHJhc2VSZWNvcmRlckxmbywgWG1tRGVjb2RlckxmbyB9IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0IFByZVByb2Nlc3MgZnJvbSAnLi4vc2hhcmVkL1ByZVByb2Nlc3MnO1xuaW1wb3J0IExpa2VsaWhvb2RzUmVuZGVyZXIgZnJvbSAnLi4vc2hhcmVkL0xpa2VsaWhvb2RzUmVuZGVyZXInO1xuaW1wb3J0IHsgY2xhc3NlcyB9IGZyb20gICcuLi9zaGFyZWQvY29uZmlnJztcbmltcG9ydCBBdWRpb0VuZ2luZSBmcm9tICcuLi9zaGFyZWQvQXVkaW9FbmdpbmUnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuY29uc3Qgdmlld01vZGVsID0ge1xuICBjbGFzc2VzOiBjbGFzc2VzLFxuICBhc3NldHNEb21haW46ICcnLFxufTtcblxuY29uc3Qgdmlld1RlbXBsYXRlID0gYFxuICA8ZGl2IGNsYXNzPVwiZm9yZWdyb3VuZFwiPlxuXG4gICAgPGRpdiBpZD1cIm5hdlwiPlxuICAgICAgPCEtLSA8YSBocmVmPVwiI1wiIGlkPVwib3BlbkNvbmZpZ0J0blwiPiYjOTc3Njs8L2E+IC0tPlxuICAgICAgPGEgaHJlZj1cIiNcIiBpZD1cIm9wZW5Db25maWdCdG5cIj4gPGltZyBzcmM9XCI8JT0gYXNzZXRzRG9tYWluICU+cGljcy9uYXZpY29uLnBuZ1wiPiA8L2E+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLW92ZXJsYXlcIj5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJvdmVybGF5LWNvbnRlbnRcIj5cbiAgICAgICAgICA8cD4gR2xvYmFsIGNvbmZpZ3VyYXRpb24gPC9wPlxuICAgICAgICAgIDxiciAvPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJtb2RlbFNlbGVjdFwiPiBNb2RlbCB0eXBlIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJtb2RlbFNlbGVjdFwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZ21tXCI+Z21tPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJoaG1tXCI+aGhtbTwvb3B0aW9uPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImdhdXNzU2VsZWN0XCI+IEdhdXNzaWFucyA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwiZ2F1c3NTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPCUgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7ICU+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjwlPSBpKzEgJT5cIj5cbiAgICAgICAgICAgICAgICAgIDwlPSBpKzEgJT5cbiAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgPCUgfSAlPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImNvdk1vZGVTZWxlY3RcIj4gQ292YXJpYW5jZSBtb2RlIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJjb3ZNb2RlU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJmdWxsXCI+ZnVsbDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZGlhZ29uYWxcIj5kaWFnb25hbDwvb3B0aW9uPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+ICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiYWJzUmVnXCI+IEFic29sdXRlIHJlZ3VsYXJpemF0aW9uIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBpZD1cImFic1JlZ1wiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIwLjAxXCI+XG4gICAgICAgICAgICA8L2lucHV0PlxuICAgICAgICAgIDwvZGl2PiAgICAgICAgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cInJlbFJlZ1wiPiBSZWxhdGl2ZSByZWd1bGFyaXphdGlvbiA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9XCJyZWxSZWdcIiB0eXBlPVwidGV4dFwiIHZhbHVlPVwiMC4wMVwiPlxuICAgICAgICAgICAgPC9pbnB1dD5cbiAgICAgICAgICA8L2Rpdj4gICAgICAgIFxuXG4gICAgICAgICAgPGhyPlxuICAgICAgICAgIDxwPiBIaG1tIHBhcmFtZXRlcnMgPC9wPlxuICAgICAgICAgIDxiciAvPlxuICAgICAgICAgIDwhLS1cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiaGllcmFyY2hpY2FsU2VsZWN0XCI+IEhpZXJhcmNoaWNhbCA6IDwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0IGlkPVwiaGllcmFyY2hpY2FsU2VsZWN0XCI+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJ5ZXNcIj55ZXM8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIm5vXCI+bm88L29wdGlvbj5cbiAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAtLT4gICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzdGF0ZXNTZWxlY3RcIj4gU3RhdGVzIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJzdGF0ZXNTZWxlY3RcIj5cbiAgICAgICAgICAgICAgPCUgZm9yICh2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKSB7ICU+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjwlPSBpKzEgJT5cIj5cbiAgICAgICAgICAgICAgICAgIDwlPSBpKzEgJT5cbiAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgPCUgfSAlPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cInRyYW5zTW9kZVNlbGVjdFwiPiBUcmFuc2l0aW9uIG1vZGUgOiA8L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD1cInRyYW5zTW9kZVNlbGVjdFwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZXJnb2RpY1wiPmVyZ29kaWM8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImxlZnRyaWdodFwiPmxlZnRyaWdodDwvb3B0aW9uPlxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+IFxuICAgICAgICAgIDwhLS1cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwicmVncmVzc0VzdGltU2VsZWN0XCI+IFJlZ3Jlc3Npb24gZXN0aW1hdG9yIDogPC9sYWJlbD5cbiAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJyZWdyZXNzRXN0aW1TZWxlY3RcIj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImZ1bGxcIj5mdWxsPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJ3aW5kb3dlZFwiPndpbmRvd2VkPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJsaWtlbGllc3RcIj5saWtlbGllc3Q8L29wdGlvbj5cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIC0tPiAgICAgICAgXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXVuZGVybGF5XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIj4gTGFiZWwgOlxuICAgICAgICAgIDxzZWxlY3QgaWQ9XCJsYWJlbFNlbGVjdFwiPlxuICAgICAgICAgICAgPCUgZm9yICh2YXIgcHJvcCBpbiBjbGFzc2VzKSB7ICU+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI8JT0gcHJvcCAlPlwiPlxuICAgICAgICAgICAgICAgIDwlPSBwcm9wICU+XG4gICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgPCUgfSAlPlxuICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBpZD1cInJlY0J0blwiPlJFQzwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGlkPVwic2VuZEJ0blwiPlNFTkQ8L2J1dHRvbj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbnZhc0RpdlwiPlxuICAgICAgICAgIDxjYW52YXMgY2xhc3M9XCJtdWx0aXNsaWRlclwiIGlkPVwibGlrZWxpaG9vZHNcIj48L2NhbnZhcz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gaWQ9XCJjbGVhckxhYmVsQnRuXCI+Q0xFQVIgTEFCRUw8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBpZD1cImNsZWFyTW9kZWxCdG5cIj5DTEVBUiBNT0RFTDwvYnV0dG9uPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidG9nZ2xlRGl2XCI+XG4gICAgICAgICAgPGJ1dHRvbiBpZD1cInBsYXlCdG5cIiBjbGFzcz1cInRvZ2dsZUJ0blwiPjwvYnV0dG9uPlxuICAgICAgICAgIEVuYWJsZSBzb3VuZHNcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDwhLS1cbiAgICAgICAgPGRpdiBjbGFzcz1cInRvZ2dsZURpdlwiPlxuICAgICAgICAgIDxidXR0b24gaWQ9XCJpbnRlbnNpdHlCdG5cIiBjbGFzcz1cInRvZ2dsZUJ0blwiPjwvYnV0dG9uPlxuICAgICAgICAgIERpc2FibGUgaW50ZW5zaXR5IGNvbnRyb2xcbiAgICAgICAgPC9kaXY+XG4gICAgICAgIC0tPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj5cbiAgICA8L2Rpdj5cblxuICA8L2Rpdj5cbmA7XG5cbmNsYXNzIERlc2lnbmVyVmlldyBleHRlbmRzIHNvdW5kd29ya3MuQ2FudmFzVmlldyB7XG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKTtcbiAgfVxuXG4gIG9uQ29uZmlnKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjb3BlbkNvbmZpZ0J0bic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgZGl2ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tb3ZlcmxheScpO1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBkaXYuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKTtcblxuICAgICAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjbW9kZWxTZWxlY3QnKTtcbiAgICAgICAgICBjb25zdCB0eXBlID0gZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xuXG4gICAgICAgICAgY29uc3QgY29uZmlnID0ge307XG4gICAgICAgICAgbGV0IGVsdDtcbiAgICAgICAgICBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjZ2F1c3NTZWxlY3QnKTtcbiAgICAgICAgICBjb25maWdbJ2dhdXNzaWFucyddID0gTnVtYmVyKGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZSk7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2Nvdk1vZGVTZWxlY3QnKTtcbiAgICAgICAgICBjb25maWdbJ2NvdmFyaWFuY2VNb2RlJ10gPSBlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2Fic1JlZycpO1xuICAgICAgICAgIGNvbmZpZ1snYWJzb2x1dGVSZWd1bGFyaXphdGlvbiddID0gTnVtYmVyKGVsdC52YWx1ZSk7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3JlbFJlZycpO1xuICAgICAgICAgIGNvbmZpZ1sncmVsYXRpdmVSZWd1bGFyaXphdGlvbiddID0gTnVtYmVyKGVsdC52YWx1ZSk7XG4gICAgICAgICAgLy8gZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2hpZXJhcmNoaWNhbFNlbGVjdCcpO1xuICAgICAgICAgIC8vIGNvbmZpZ1snaGllcmFyY2hpY2FsJ10gPSAoZWx0Lm9wdGlvbnNbZWx0LnNlbGVjdGVkSW5kZXhdLnZhbHVlID09PSAneWVzJyk7XG4gICAgICAgICAgZWx0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3RyYW5zTW9kZVNlbGVjdCcpO1xuICAgICAgICAgIGNvbmZpZ1sndHJhbnNpdGlvbk1vZGUnXSA9IGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICAgICAgICBlbHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjc3RhdGVzU2VsZWN0Jyk7XG4gICAgICAgICAgY29uZmlnWydzdGF0ZXMnXSA9IE51bWJlcihlbHQub3B0aW9uc1tlbHQuc2VsZWN0ZWRJbmRleF0udmFsdWUpO1xuICAgICAgICAgIC8vIGVsdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNyZWdyZXNzRXN0aW1TZWxlY3QnKTtcbiAgICAgICAgICAvLyBjb25maWdbJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InXSA9IGVsdC5vcHRpb25zW2VsdC5zZWxlY3RlZEluZGV4XS52YWx1ZTtcblxuICAgICAgICAgIGNhbGxiYWNrKHR5cGUsIGNvbmZpZyk7XG5cbiAgICAgICAgICBkaXYuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uUmVjb3JkKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjcmVjQnRuJzogKCkgPT4ge1xuICAgICAgICBjb25zdCByZWMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjcmVjQnRuJyk7XG4gICAgICAgIGlmICghcmVjLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgICAgICByZWMuaW5uZXJIVE1MID0gJ1NUT1AnO1xuICAgICAgICAgIHJlYy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgICBjYWxsYmFjaygncmVjb3JkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjLmlubmVySFRNTCA9ICdSRUMnO1xuICAgICAgICAgIHJlYy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICBjYWxsYmFjaygnc3RvcCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uU2VuZFBocmFzZShjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI3NlbmRCdG4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVscyA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNsYWJlbFNlbGVjdCcpO1xuICAgICAgICBjYWxsYmFjayhsYWJlbHMub3B0aW9uc1tsYWJlbHMuc2VsZWN0ZWRJbmRleF0udGV4dCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbkNsZWFyTGFiZWwoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNjbGVhckxhYmVsQnRuJzogKCkgPT4ge1xuICAgICAgICBjb25zdCBsYWJlbHMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjbGFiZWxTZWxlY3QnKTtcbiAgICAgICAgY2FsbGJhY2sobGFiZWxzLm9wdGlvbnNbbGFiZWxzLnNlbGVjdGVkSW5kZXhdLnRleHQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25DbGVhck1vZGVsKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjY2xlYXJNb2RlbEJ0bic6ICgpID0+IHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uRW5hYmxlU291bmRzKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjcGxheUJ0bic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgYnRuID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3BsYXlCdG4nKTtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gYnRuLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJyk7XG4gICAgICAgIGlmICghYWN0aXZlKSB7XG4gICAgICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayghYWN0aXZlKTsgICAgICAgIFxuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5cbmNsYXNzIERlc2lnbmVyRXhwZXJpZW5jZSBleHRlbmRzIHNvdW5kd29ya3MuRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGFzc2V0c0RvbWFpbikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJ10gfSk7XG4gICAgdGhpcy5jaGVja2luID0gdGhpcy5yZXF1aXJlKCdjaGVja2luJywgeyBzaG93RGlhbG9nOiBmYWxzZSB9KTtcbiAgICB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycsIHsgaXRlbXM6IFsnYXNzZXRzRG9tYWluJ10gfSk7XG4gICAgdGhpcy5sb2dpbiA9IHRoaXMucmVxdWlyZSgnbG9naW4nKTtcbiAgICB0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlciA9IHRoaXMucmVxdWlyZSgnYXVkaW8tYnVmZmVyLW1hbmFnZXInLCB7XG4gICAgICBhc3NldHNEb21haW46IGFzc2V0c0RvbWFpbixcbiAgICAgIGZpbGVzOiBjbGFzc2VzLFxuICAgIH0pO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHtcbiAgICAgIGRlc2NyaXB0b3JzOiBbJ2RldmljZW1vdGlvbiddXG4gICAgfSk7XG5cbiAgICB0aGlzLmxhYmVscyA9IE9iamVjdC5rZXlzKGNsYXNzZXMpO1xuICAgIHRoaXMubGlrZWxpZXN0ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcblxuICAgIC8vIHZpZXdNb2RlbC5hc3NldHNEb21haW4gPSB0aGlzLlxuICAgIHRoaXMudmlldyA9IG5ldyBEZXNpZ25lclZpZXcodmlld1RlbXBsYXRlLCB2aWV3TW9kZWwsIHt9LCB7XG4gICAgICBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUsXG4gICAgICBjbGFzc05hbWU6ICdkZXNpZ25lcidcbiAgICB9KTtcblxuICAgIHRoaXMudmlldy5tb2RlbC5hc3NldHNEb21haW4gPSB0aGlzLnNoYXJlZENvbmZpZy5nZXQoJ2Fzc2V0c0RvbWFpbicpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMudmlldy5tb2RlbC5hc3NldHNEb21haW4pO1xuXG4gICAgdGhpcy5zaG93KCkudGhlbigoKSA9PiB7XG5cbiAgICAgIHRoaXMuX29uQ29uZmlnID0gdGhpcy5fb25Db25maWcuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uUmVjb3JkID0gdGhpcy5fb25SZWNvcmQuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uU2VuZFBocmFzZSA9IHRoaXMuX29uU2VuZFBocmFzZS5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25DbGVhckxhYmVsID0gdGhpcy5fb25DbGVhckxhYmVsLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbkNsZWFyTW9kZWwgPSB0aGlzLl9vbkNsZWFyTW9kZWwuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uUmVjZWl2ZU1vZGVsID0gdGhpcy5fb25SZWNlaXZlTW9kZWwuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uTW9kZWxGaWx0ZXIgPSB0aGlzLl9vbk1vZGVsRmlsdGVyLmJpbmQodGhpcyk7ICAgXG4gICAgICB0aGlzLl9tb3Rpb25DYWxsYmFjayA9IHRoaXMuX21vdGlvbkNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9pbnRlbnNpdHlDYWxsYmFjayA9IHRoaXMuX2ludGVuc2l0eUNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9lbmFibGVTb3VuZHMgPSB0aGlzLl9lbmFibGVTb3VuZHMuYmluZCh0aGlzKTtcblxuICAgICAgdGhpcy52aWV3Lm9uQ29uZmlnKHRoaXMuX29uQ29uZmlnKTtcbiAgICAgIHRoaXMudmlldy5vblJlY29yZCh0aGlzLl9vblJlY29yZCk7XG4gICAgICB0aGlzLnZpZXcub25TZW5kUGhyYXNlKHRoaXMuX29uU2VuZFBocmFzZSk7XG4gICAgICB0aGlzLnZpZXcub25DbGVhckxhYmVsKHRoaXMuX29uQ2xlYXJMYWJlbCk7XG4gICAgICB0aGlzLnZpZXcub25DbGVhck1vZGVsKHRoaXMuX29uQ2xlYXJNb2RlbCk7XG4gICAgICB0aGlzLnZpZXcub25FbmFibGVTb3VuZHModGhpcy5fZW5hYmxlU291bmRzKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0gTEZPJ3MgLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMuX3BocmFzZVJlY29yZGVyID0gbmV3IFBocmFzZVJlY29yZGVyTGZvKHtcbiAgICAgICAgY29sdW1uTmFtZXM6IFsgJ2FjY2VsWCcsICdhY2NlbFknLCAnYWNjZWxaJyBdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3htbURlY29kZXIgPSBuZXcgWG1tRGVjb2Rlckxmbyh7XG4gICAgICAgIGxpa2VsaWhvb2RXaW5kb3c6IDIwLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5fb25Nb2RlbEZpbHRlclxuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcmVQcm9jZXNzID0gbmV3IFByZVByb2Nlc3ModGhpcy5faW50ZW5zaXR5Q2FsbGJhY2spO1xuICAgICAgdGhpcy5fcHJlUHJvY2Vzcy5jb25uZWN0KHRoaXMuX3BocmFzZVJlY29yZGVyKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3MuY29ubmVjdCh0aGlzLl94bW1EZWNvZGVyKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3Muc3RhcnQoKTtcblxuICAgICAgLy8gaW5pdGlhbGl6ZSByZW5kZXJpbmdcbiAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgTGlrZWxpaG9vZHNSZW5kZXJlcigxMDApO1xuICAgICAgdGhpcy52aWV3LmFkZFJlbmRlcmVyKHRoaXMucmVuZGVyZXIpO1xuICAgICAgLy8gdGhpcy52aWV3LnNldFByZVJlbmRlcigoY3R4LCBkdCkgPT4ge30pO1xuXG4gICAgICB0aGlzLmF1ZGlvRW5naW5lID0gbmV3IEF1ZGlvRW5naW5lKHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyLmRhdGEpO1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5zdGFydCgpO1xuXG4gICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ2RldmljZW1vdGlvbicpKSB7XG4gICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLl9tb3Rpb25DYWxsYmFjayk7XG4gICAgfVxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLSBSRUNFSVZFIC0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMucmVjZWl2ZSgnbW9kZWwnLCB0aGlzLl9vblJlY2VpdmVNb2RlbCk7XG4gICAgfSk7XG4gIH1cblxuICBfb25Db25maWcodHlwZSwgY29uZmlnKSB7XG4gICAgdGhpcy5zZW5kKCdjb25maWd1cmF0aW9uJywgeyB0eXBlOiB0eXBlLCBjb25maWc6IGNvbmZpZyB9KTtcbiAgfVxuXG4gIF9vblJlY29yZChjbWQpIHtcbiAgICBzd2l0Y2ggKGNtZCkge1xuICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgdGhpcy5fcGhyYXNlUmVjb3JkZXIuc3RhcnQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0b3AnOlxuICAgICAgICB0aGlzLl9waHJhc2VSZWNvcmRlci5zdG9wKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9vblNlbmRQaHJhc2UobGFiZWwpIHtcbiAgICB0aGlzLl9waHJhc2VSZWNvcmRlci5zZXRQaHJhc2VMYWJlbChsYWJlbCk7XG4gICAgbGV0IHBocmFzZSA9IHRoaXMuX3BocmFzZVJlY29yZGVyLmdldFJlY29yZGVkUGhyYXNlKCk7XG4gICAgaWYgKHBocmFzZS5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoY29uZmlybSgnc2VuZCBwaHJhc2Ugd2l0aCBsYWJlbCAnICsgbGFiZWwgKyAnID8nKSkge1xuICAgICAgICB0aGlzLnNlbmQoJ3BocmFzZScsIHsgY21kOiAnYWRkJywgZGF0YTogcGhyYXNlIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhbGVydCgnY2Fubm90IHNlbmQgZW1wdHkgcGhyYXNlcycpO1xuICAgICAgY29uc29sZS5lcnJvcignZXJyb3IgOiBlbXB0eSBwaHJhc2VzIGFyZSBmb3JiaWRkZW4nKTtcbiAgICB9XG4gIH1cblxuICBfb25DbGVhckxhYmVsKGxhYmVsKSB7XG4gICAgaWYgKGNvbmZpcm0oJ2RvIHlvdSByZWFsbHkgd2FudCB0byByZW1vdmUgdGhlIGxhYmVsICcgKyBsYWJlbCArICcgPycpKSB7XG4gICAgICB0aGlzLnNlbmQoJ2NsZWFyJywgeyBjbWQ6ICdsYWJlbCcsIGRhdGE6IGxhYmVsIH0pO1xuICAgIH0gICAgXG4gIH1cblxuICBfb25DbGVhck1vZGVsKCkge1xuICAgIGlmIChjb25maXJtKCdkbyB5b3UgcmVhbGx5IHdhbnQgdG8gcmVtb3ZlIHRoZSBjdXJyZW50IG1vZGVsID8nKSkge1xuICAgICAgdGhpcy5zZW5kKCdjbGVhcicsIHsgY21kOiAnbW9kZWwnIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vPT09PT09PT09PT09PT09PSBjYWxsYmFja3MgOiA9PT09PT09PT09PT09PT09Ly9cblxuICBfbW90aW9uQ2FsbGJhY2soZXZlbnRWYWx1ZXMpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBldmVudFZhbHVlcy5zbGljZSgwLDMpLmNvbmNhdChldmVudFZhbHVlcy5zbGljZSgtMykpO1xuICAgIHRoaXMuX3ByZVByb2Nlc3MucHJvY2VzcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUsIHZhbHVlcyk7XG4gIH1cblxuICBfb25SZWNlaXZlTW9kZWwobW9kZWwpIHtcbiAgICBjb25zdCBjb25maWcgPSBtb2RlbCA/IG1vZGVsLmNvbmZpZ3VyYXRpb24uZGVmYXVsdF9wYXJhbWV0ZXJzIDoge307XG5cbiAgICBjb25maWcubW9kZWxUeXBlID0gY29uZmlnLnN0YXRlcyA/ICdoaG1tJyA6ICdnbW0nO1xuICAgIHRoaXMuX3VwZGF0ZUNvbmZpZ0Zyb21Nb2RlbChjb25maWcpO1xuICAgIHRoaXMuX3htbURlY29kZXIucGFyYW1zLnNldCgnbW9kZWwnLCBtb2RlbCk7XG4gIH1cblxuICBfdXBkYXRlQ29uZmlnRnJvbU1vZGVsKGNvbmZpZykge1xuICAgIGNvbnN0IHYgPSB0aGlzLnZpZXcuJGVsO1xuICAgIGxldCBlbHQ7XG5cbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNtb2RlbFNlbGVjdCcpO1xuICAgIGVsdC5zZWxlY3RlZEluZGV4ID0gKGNvbmZpZy5tb2RlbFR5cGUgPT09ICdoaG1tJykgPyAxIDogMDtcblxuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI2dhdXNzU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSBjb25maWcuZ2F1c3NpYW5zIC0gMTtcbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNjb3ZNb2RlU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSBjb25maWcuY292YXJpYW5jZV9tb2RlO1xuICAgIGVsdCA9IHYucXVlcnlTZWxlY3RvcignI2Fic1JlZycpO1xuICAgIGVsdC52YWx1ZSA9IGNvbmZpZy5hYnNvbHV0ZV9yZWd1bGFyaXphdGlvbjtcbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNyZWxSZWcnKTtcbiAgICBlbHQudmFsdWUgPSBjb25maWcucmVsYXRpdmVfcmVndWxhcml6YXRpb247XG5cbiAgICBlbHQgPSB2LnF1ZXJ5U2VsZWN0b3IoJyNzdGF0ZXNTZWxlY3QnKTtcbiAgICBlbHQuc2VsZWN0ZWRJbmRleCA9IGNvbmZpZy5zdGF0ZXMgPyBjb25maWcuc3RhdGVzIC0gMSA6IDA7XG4gICAgZWx0ID0gdi5xdWVyeVNlbGVjdG9yKCcjdHJhbnNNb2RlU2VsZWN0Jyk7XG4gICAgZWx0LnNlbGVjdGVkSW5kZXggPSBjb25maWcudHJhbnNpdGlvbl9tb2RlID8gY29uZmlnLnRyYW5zaXRpb25fbW9kZSA6IDA7XG4gIH1cblxuICBfb25Nb2RlbEZpbHRlcihyZXMpIHtcbiAgICBjb25zdCBsaWtlbGlob29kcyA9IHJlcyA/IHJlcy5saWtlbGlob29kcyA6IFtdO1xuICAgIGNvbnN0IGxpa2VsaWVzdCA9IHJlcyA/IHJlcy5saWtlbGllc3RJbmRleCA6IC0xO1xuICAgIGNvbnN0IGxhYmVsID0gcmVzID8gcmVzLmxpa2VsaWVzdCA6ICd1bmtub3duJztcbiAgICBjb25zdCBhbHBoYXMgPSByZXMgPyByZXMuYWxwaGFzIDogW1tdXTsvLyByZXMuYWxwaGFzW2xpa2VsaWVzdF07XG5cbiAgICBjb25zdCBuZXdSZXMgPSB7XG4gICAgICBsYWJlbDogbGFiZWwsXG4gICAgICBsaWtlbGllc3Q6IGxpa2VsaWVzdCxcbiAgICAgIGxpa2VsaWhvb2RzOiBsaWtlbGlob29kc1xuICAgIH07XG5cbiAgICB0aGlzLnJlbmRlcmVyLnNldE1vZGVsUmVzdWx0cyhuZXdSZXMpO1xuXG4gICAgaWYgKHRoaXMubGlrZWxpZXN0ICE9PSBsYWJlbCkge1xuICAgICAgdGhpcy5saWtlbGllc3QgPSBsYWJlbDtcbiAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIGdlc3R1cmUgdG8gOiAnICsgbGFiZWwpO1xuICAgICAgY29uc3QgaSA9IHRoaXMubGFiZWxzLmluZGV4T2YobGFiZWwpO1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5mYWRlVG9OZXdTb3VuZChpKTtcbiAgICB9XG4gIH1cblxuICBfaW50ZW5zaXR5Q2FsbGJhY2soZnJhbWUpIHtcbiAgICB0aGlzLmF1ZGlvRW5naW5lLnNldEdhaW5Gcm9tSW50ZW5zaXR5KGZyYW1lLmRhdGFbMF0pO1xuICB9XG5cbiAgX2VuYWJsZVNvdW5kcyhvbk9mZikge1xuICAgIHRoaXMuYXVkaW9FbmdpbmUuZW5hYmxlU291bmRzKG9uT2ZmKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRGVzaWduZXJFeHBlcmllbmNlOyJdfQ==