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

var _client2 = require('waves-lfo/client');

var lfo = _interopRequireWildcard(_client2);

var _xmmLfo = require('xmm-lfo');

var _config = require('../shared/config');

var _PreProcess = require('../shared/PreProcess');

var _PreProcess2 = _interopRequireDefault(_PreProcess);

var _AudioEngine = require('../shared/AudioEngine');

var _AudioEngine2 = _interopRequireDefault(_AudioEngine);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

var viewModel = { models: null };

var viewTemplate = '\n  <div class="background fit-container"></div>\n  <div class="foreground fit-container">\n    <div class="section-top flex-middle">\n      <div>\n\n        <div class="selectDiv" id="modelsDiv">\n          <label> Model : </label>\n          <select id="modelSelect">\n            <% for (var prop in models) { %>\n              <option value="<%= prop %>">\n                <%= prop %>\n              </option>\n            <% } %>\n          </select>\n        </div>\n\n        <button id="sound-onoff"> SOUND OFF </button>\n        <button id="intensity-onoff"> INTENSITY OFF </button>\n\n      </div>\n    </div>\n\n    <div class="section-center flex-center"></div>\n    <div class="section-bottom flex-middle"></div>\n  </div>\n';

var PlayerView = function (_soundworks$Segmented) {
  (0, _inherits3.default)(PlayerView, _soundworks$Segmented);

  function PlayerView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, PlayerView);
    return (0, _possibleConstructorReturn3.default)(this, (PlayerView.__proto__ || (0, _getPrototypeOf2.default)(PlayerView)).call(this, template, content, events, options));
  }

  (0, _createClass3.default)(PlayerView, [{
    key: 'onSoundOnOff',
    value: function onSoundOnOff(callback) {
      var _this2 = this;

      this.installEvents({
        'click #sound-onoff': function clickSoundOnoff() {
          var rec = _this2.$el.querySelector('#sound-onoff');
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
  }, {
    key: 'onIntensityOnOff',
    value: function onIntensityOnOff(callback) {
      var _this3 = this;

      this.installEvents({
        'click #intensity-onoff': function clickIntensityOnoff() {
          var rec = _this3.$el.querySelector('#intensity-onoff');
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
  }, {
    key: 'onModelChange',
    value: function onModelChange(callback) {
      var _this4 = this;

      this.installEvents({
        'change #modelSelect': function changeModelSelect() {
          var inputs = _this4.$el.querySelector('#modelSelect');
          callback(inputs.options[inputs.selectedIndex].value);
        }
      });
    }
  }, {
    key: 'setModelItem',
    value: function setModelItem(item) {
      var el = this.$el.querySelector('#modelSelect');
      el.value = item;
    }
  }]);
  return PlayerView;
}(soundworks.SegmentedView);

var PlayerExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(PlayerExperience, _soundworks$Experienc);

  function PlayerExperience(assetsDomain) {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this));

    _this5.platform = _this5.require('platform', { features: ['web-audio'] });
    _this5.checkin = _this5.require('checkin', { showDialog: false });
    _this5.audioBufferManager = _this5.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: _config.classes
    });
    _this5.motionInput = _this5.require('motion-input', {
      descriptors: ['devicemotion']
    });

    _this5.labels = (0, _keys2.default)(_config.classes);
    _this5.likeliest = undefined;

    _this5._models = null;
    _this5._currentModel = null;
    _this5._sendOscFlag = false;
    _this5._intensityOn = false;
    return _this5;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {
      var _this6 = this;

      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'start', this).call(this); // don't forget this

      this.view = new PlayerView(viewTemplate, viewModel, {}, {
        preservePixelRatio: true,
        className: 'player'
      });

      // as show can be async, we make sure that the view is actually rendered
      this.show().then(function () {

        _this6._onReceiveModels = _this6._onReceiveModels.bind(_this6);
        _this6._onModelChange = _this6._onModelChange.bind(_this6);
        _this6._onModelFilter = _this6._onModelFilter.bind(_this6);
        _this6._motionCallback = _this6._motionCallback.bind(_this6);
        _this6._intensityCallback = _this6._intensityCallback.bind(_this6);
        _this6._onSoundOnOff = _this6._onSoundOnOff.bind(_this6);
        _this6._onIntensityOnOff = _this6._onIntensityOnOff.bind(_this6);

        _this6.view.onModelChange(_this6._onModelChange);
        _this6.view.onSoundOnOff(_this6._onSoundOnOff);
        _this6.view.onIntensityOnOff(_this6._onIntensityOnOff);

        //------------------ LFO's ------------------//
        _this6._xmmDecoder = new _xmmLfo.XmmDecoderLfo({
          likelihoodWindow: 20,
          callback: _this6._onModelFilter
        });
        _this6._preProcess = new _PreProcess2.default(_this6._intensityCallback);
        _this6._preProcess.connect(_this6._xmmDecoder);
        _this6._preProcess.start();

        //------------------ AUDIO -----------------//
        _this6.audioEngine = new _AudioEngine2.default(_this6.audioBufferManager.data);
        _this6.audioEngine.start();

        //--------------- MOTION INPUT -------------//
        if (_this6.motionInput.isAvailable('devicemotion')) {
          _this6.motionInput.addListener('devicemotion', _this6._motionCallback);
        }

        //----------------- RECEIVE -----------------//
        _this6.receive('model', _this6._onReceiveModel);
        _this6.receive('models', _this6._onReceiveModels);
      });
    }
  }, {
    key: '_motionCallback',
    value: function _motionCallback(eventValues) {
      var values = eventValues.slice(0, 3).concat(eventValues.slice(-3));
      this._preProcess.process(audioContext.currentTime, values);
    }
  }, {
    key: '_intensityCallback',
    value: function _intensityCallback(frame) {
      if (this._intensityOn) {
        this.audioEngine.setGainFromIntensity(frame.data[0]);
      } else {
        this.audioEngine.setGainFromIntensity(1);
      }
    }
  }, {
    key: '_onReceiveModels',
    value: function _onReceiveModels(models) {
      this._models = models;

      this.view.model.models = this._models;
      this.view.render('#modelsDiv');

      var prevModels = (0, _keys2.default)(models);
      var prevModelIndex = prevModels.indexOf(this._currentModel);

      console.log(this._currentModel + ' ' + prevModelIndex);

      if (this._currentModel && prevModelIndex > -1) {
        this._currentModel = prevModels[prevModelIndex];
        this.view.setModelItem(this._currentModel);
      } else {
        this._currentModel = prevModels[0];
      }

      this._xmmDecoder.params.set('model', this._models[this._currentModel]);
    }
  }, {
    key: '_onModelFilter',
    value: function _onModelFilter(res) {
      var likelihoods = res ? res.likelihoods : [];
      var likeliest = res ? res.likeliestIndex : -1;
      var label = res ? res.likeliest : 'unknown';
      var alphas = res ? res.alphas : [[]]; // res.alphas[likeliest];

      if (this.likeliest !== label) {
        this.likeliest = label;
        console.log('changed gesture to : ' + label);
        var i = this.labels.indexOf(label);
        this.audioEngine.fadeToNewSound(i);
      }
    }
  }, {
    key: '_onModelChange',
    value: function _onModelChange(value) {
      this._currentModel = value;
      this._xmmDecoder.params.set('model', this._models[this._currentModel]);
    }
  }, {
    key: '_onSoundOnOff',
    value: function _onSoundOnOff(onOff) {
      this.audioEngine.enableSounds(onOff);
    }
  }, {
    key: '_onIntensityOnOff',
    value: function _onIntensityOnOff(onOff) {
      this._intensityOn = onOff;
    }
  }]);
  return PlayerExperience;
}(soundworks.Experience);

;

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImxmbyIsImF1ZGlvQ29udGV4dCIsInZpZXdNb2RlbCIsIm1vZGVscyIsInZpZXdUZW1wbGF0ZSIsIlBsYXllclZpZXciLCJ0ZW1wbGF0ZSIsImNvbnRlbnQiLCJldmVudHMiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJpbnN0YWxsRXZlbnRzIiwicmVjIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaW5uZXJIVE1MIiwiYWRkIiwicmVtb3ZlIiwiaW5wdXRzIiwic2VsZWN0ZWRJbmRleCIsInZhbHVlIiwiaXRlbSIsImVsIiwiU2VnbWVudGVkVmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsImNoZWNraW4iLCJzaG93RGlhbG9nIiwiYXVkaW9CdWZmZXJNYW5hZ2VyIiwiZmlsZXMiLCJtb3Rpb25JbnB1dCIsImRlc2NyaXB0b3JzIiwibGFiZWxzIiwibGlrZWxpZXN0IiwidW5kZWZpbmVkIiwiX21vZGVscyIsIl9jdXJyZW50TW9kZWwiLCJfc2VuZE9zY0ZsYWciLCJfaW50ZW5zaXR5T24iLCJ2aWV3IiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY2xhc3NOYW1lIiwic2hvdyIsInRoZW4iLCJfb25SZWNlaXZlTW9kZWxzIiwiYmluZCIsIl9vbk1vZGVsQ2hhbmdlIiwiX29uTW9kZWxGaWx0ZXIiLCJfbW90aW9uQ2FsbGJhY2siLCJfaW50ZW5zaXR5Q2FsbGJhY2siLCJfb25Tb3VuZE9uT2ZmIiwiX29uSW50ZW5zaXR5T25PZmYiLCJvbk1vZGVsQ2hhbmdlIiwib25Tb3VuZE9uT2ZmIiwib25JbnRlbnNpdHlPbk9mZiIsIl94bW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsIl9wcmVQcm9jZXNzIiwiY29ubmVjdCIsInN0YXJ0IiwiYXVkaW9FbmdpbmUiLCJkYXRhIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsInJlY2VpdmUiLCJfb25SZWNlaXZlTW9kZWwiLCJldmVudFZhbHVlcyIsInZhbHVlcyIsInNsaWNlIiwiY29uY2F0IiwicHJvY2VzcyIsImN1cnJlbnRUaW1lIiwiZnJhbWUiLCJzZXRHYWluRnJvbUludGVuc2l0eSIsIm1vZGVsIiwicmVuZGVyIiwicHJldk1vZGVscyIsInByZXZNb2RlbEluZGV4IiwiaW5kZXhPZiIsImNvbnNvbGUiLCJsb2ciLCJzZXRNb2RlbEl0ZW0iLCJwYXJhbXMiLCJzZXQiLCJyZXMiLCJsaWtlbGlob29kcyIsImxpa2VsaWVzdEluZGV4IiwibGFiZWwiLCJhbHBoYXMiLCJpIiwiZmFkZVRvTmV3U291bmQiLCJvbk9mZiIsImVuYWJsZVNvdW5kcyIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7SUFBWUMsRzs7QUFDWjs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU1DLGVBQWVGLFdBQVdFLFlBQWhDOztBQUVBLElBQU1DLFlBQVksRUFBRUMsUUFBUSxJQUFWLEVBQWxCOztBQUVBLElBQU1DLGt2QkFBTjs7SUE0Qk1DLFU7OztBQUNKLHNCQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQkMsTUFBL0IsRUFBdUNDLE9BQXZDLEVBQWdEO0FBQUE7QUFBQSx5SUFDeENILFFBRHdDLEVBQzlCQyxPQUQ4QixFQUNyQkMsTUFEcUIsRUFDYkMsT0FEYTtBQUUvQzs7OztpQ0FFWUMsUSxFQUFVO0FBQUE7O0FBQ3JCLFdBQUtDLGFBQUwsQ0FBbUI7QUFDakIsOEJBQXNCLDJCQUFNO0FBQzFCLGNBQU1DLE1BQU0sT0FBS0MsR0FBTCxDQUFTQyxhQUFULENBQXVCLGNBQXZCLENBQVo7QUFDQSxjQUFJLENBQUNGLElBQUlHLFNBQUosQ0FBY0MsUUFBZCxDQUF1QixRQUF2QixDQUFMLEVBQXVDO0FBQ3JDSixnQkFB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QUFDRDs7O0VBakk0QmpHLFdBQVdtRyxVOztBQWtJekM7O2tCQUVjeEUsZ0IiLCJmaWxlIjoiUGxheWVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0IHsgWG1tRGVjb2RlckxmbyB9IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0IHsgY2xhc3NlcyB9IGZyb20gICcuLi9zaGFyZWQvY29uZmlnJztcbmltcG9ydCBQcmVQcm9jZXNzIGZyb20gJy4uL3NoYXJlZC9QcmVQcm9jZXNzJztcbmltcG9ydCBBdWRpb0VuZ2luZSBmcm9tICcuLi9zaGFyZWQvQXVkaW9FbmdpbmUnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuY29uc3Qgdmlld01vZGVsID0geyBtb2RlbHM6IG51bGwgfTtcblxuY29uc3Qgdmlld1RlbXBsYXRlID0gYFxuICA8ZGl2IGNsYXNzPVwiYmFja2dyb3VuZCBmaXQtY29udGFpbmVyXCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmb3JlZ3JvdW5kIGZpdC1jb250YWluZXJcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj5cbiAgICAgIDxkaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlbGVjdERpdlwiIGlkPVwibW9kZWxzRGl2XCI+XG4gICAgICAgICAgPGxhYmVsPiBNb2RlbCA6IDwvbGFiZWw+XG4gICAgICAgICAgPHNlbGVjdCBpZD1cIm1vZGVsU2VsZWN0XCI+XG4gICAgICAgICAgICA8JSBmb3IgKHZhciBwcm9wIGluIG1vZGVscykgeyAlPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiPCU9IHByb3AgJT5cIj5cbiAgICAgICAgICAgICAgICA8JT0gcHJvcCAlPlxuICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGJ1dHRvbiBpZD1cInNvdW5kLW9ub2ZmXCI+IFNPVU5EIE9GRiA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBpZD1cImludGVuc2l0eS1vbm9mZlwiPiBJTlRFTlNJVFkgT0ZGIDwvYnV0dG9uPlxuXG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICA8L2Rpdj5cbmA7XG5cbmNsYXNzIFBsYXllclZpZXcgZXh0ZW5kcyBzb3VuZHdvcmtzLlNlZ21lbnRlZFZpZXcge1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cblxuICBvblNvdW5kT25PZmYoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNzb3VuZC1vbm9mZic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVjID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3NvdW5kLW9ub2ZmJyk7XG4gICAgICAgIGlmICghcmVjLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgICAgICByZWMuaW5uZXJIVE1MID0gJ1NPVU5EIE9OJztcbiAgICAgICAgICByZWMuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjLmlubmVySFRNTCA9ICdTT1VORCBPRkYnO1xuICAgICAgICAgIHJlYy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH0gICAgICAgIFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25JbnRlbnNpdHlPbk9mZihjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI2ludGVuc2l0eS1vbm9mZic6ICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVjID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI2ludGVuc2l0eS1vbm9mZicpO1xuICAgICAgICBpZiAoIXJlYy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgICAgICAgcmVjLmlubmVySFRNTCA9ICdJTlRFTlNJVFkgT04nO1xuICAgICAgICAgIHJlYy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWMuaW5uZXJIVE1MID0gJ0lOVEVOU0lUWSBPRkYnO1xuICAgICAgICAgIHJlYy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH0gICAgICAgIFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25Nb2RlbENoYW5nZShjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2hhbmdlICNtb2RlbFNlbGVjdCc6ICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXRzID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI21vZGVsU2VsZWN0Jyk7XG4gICAgICAgIGNhbGxiYWNrKGlucHV0cy5vcHRpb25zW2lucHV0cy5zZWxlY3RlZEluZGV4XS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzZXRNb2RlbEl0ZW0oaXRlbSkge1xuICAgIGNvbnN0IGVsID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI21vZGVsU2VsZWN0Jyk7XG4gICAgZWwudmFsdWUgPSBpdGVtO1xuICB9XG59XG5cblxuY2xhc3MgUGxheWVyRXhwZXJpZW5jZSBleHRlbmRzIHNvdW5kd29ya3MuRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGFzc2V0c0RvbWFpbikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJ10gfSk7XG4gICAgdGhpcy5jaGVja2luID0gdGhpcy5yZXF1aXJlKCdjaGVja2luJywgeyBzaG93RGlhbG9nOiBmYWxzZSB9KTtcbiAgICB0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlciA9IHRoaXMucmVxdWlyZSgnYXVkaW8tYnVmZmVyLW1hbmFnZXInLCB7XG4gICAgICBhc3NldHNEb21haW46IGFzc2V0c0RvbWFpbixcbiAgICAgIGZpbGVzOiBjbGFzc2VzLFxuICAgIH0pO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHtcbiAgICAgIGRlc2NyaXB0b3JzOiBbJ2RldmljZW1vdGlvbiddXG4gICAgfSk7XG5cbiAgICB0aGlzLmxhYmVscyA9IE9iamVjdC5rZXlzKGNsYXNzZXMpO1xuICAgIHRoaXMubGlrZWxpZXN0ID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5fbW9kZWxzID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50TW9kZWwgPSBudWxsO1xuICAgIHRoaXMuX3NlbmRPc2NGbGFnID0gZmFsc2U7XG4gICAgdGhpcy5faW50ZW5zaXR5T24gPSBmYWxzZTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7IC8vIGRvbid0IGZvcmdldCB0aGlzXG5cbiAgICB0aGlzLnZpZXcgPSBuZXcgUGxheWVyVmlldyh2aWV3VGVtcGxhdGUsIHZpZXdNb2RlbCwge30sIHtcbiAgICAgIHByZXNlcnZlUGl4ZWxSYXRpbzogdHJ1ZSxcbiAgICAgIGNsYXNzTmFtZTogJ3BsYXllcidcbiAgICB9KTtcblxuICAgIC8vIGFzIHNob3cgY2FuIGJlIGFzeW5jLCB3ZSBtYWtlIHN1cmUgdGhhdCB0aGUgdmlldyBpcyBhY3R1YWxseSByZW5kZXJlZFxuICAgIHRoaXMuc2hvdygpLnRoZW4oKCkgPT4ge1xuXG4gICAgICB0aGlzLl9vblJlY2VpdmVNb2RlbHMgPSB0aGlzLl9vblJlY2VpdmVNb2RlbHMuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uTW9kZWxDaGFuZ2UgPSB0aGlzLl9vbk1vZGVsQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbk1vZGVsRmlsdGVyID0gdGhpcy5fb25Nb2RlbEZpbHRlci5iaW5kKHRoaXMpOyAgIFxuICAgICAgdGhpcy5fbW90aW9uQ2FsbGJhY2sgPSB0aGlzLl9tb3Rpb25DYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5faW50ZW5zaXR5Q2FsbGJhY2sgPSB0aGlzLl9pbnRlbnNpdHlDYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25Tb3VuZE9uT2ZmID0gdGhpcy5fb25Tb3VuZE9uT2ZmLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbkludGVuc2l0eU9uT2ZmID0gdGhpcy5fb25JbnRlbnNpdHlPbk9mZi5iaW5kKHRoaXMpO1xuXG4gICAgICB0aGlzLnZpZXcub25Nb2RlbENoYW5nZSh0aGlzLl9vbk1vZGVsQ2hhbmdlKTtcbiAgICAgIHRoaXMudmlldy5vblNvdW5kT25PZmYodGhpcy5fb25Tb3VuZE9uT2ZmKTtcbiAgICAgIHRoaXMudmlldy5vbkludGVuc2l0eU9uT2ZmKHRoaXMuX29uSW50ZW5zaXR5T25PZmYpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLSBMRk8ncyAtLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgICAgdGhpcy5feG1tRGVjb2RlciA9IG5ldyBYbW1EZWNvZGVyTGZvKHtcbiAgICAgICAgbGlrZWxpaG9vZFdpbmRvdzogMjAsXG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLl9vbk1vZGVsRmlsdGVyLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcmVQcm9jZXNzID0gbmV3IFByZVByb2Nlc3ModGhpcy5faW50ZW5zaXR5Q2FsbGJhY2spO1xuICAgICAgdGhpcy5fcHJlUHJvY2Vzcy5jb25uZWN0KHRoaXMuX3htbURlY29kZXIpO1xuICAgICAgdGhpcy5fcHJlUHJvY2Vzcy5zdGFydCgpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLSBBVURJTyAtLS0tLS0tLS0tLS0tLS0tLS8vXG4gICAgICB0aGlzLmF1ZGlvRW5naW5lID0gbmV3IEF1ZGlvRW5naW5lKHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyLmRhdGEpO1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5zdGFydCgpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLSBNT1RJT04gSU5QVVQgLS0tLS0tLS0tLS0tLS8vXG4gICAgICBpZiAodGhpcy5tb3Rpb25JbnB1dC5pc0F2YWlsYWJsZSgnZGV2aWNlbW90aW9uJykpIHtcbiAgICAgICAgdGhpcy5tb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignZGV2aWNlbW90aW9uJywgdGhpcy5fbW90aW9uQ2FsbGJhY2spO1xuICAgICAgfVxuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tIFJFQ0VJVkUgLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgICAgdGhpcy5yZWNlaXZlKCdtb2RlbCcsIHRoaXMuX29uUmVjZWl2ZU1vZGVsKTtcbiAgICAgIHRoaXMucmVjZWl2ZSgnbW9kZWxzJywgdGhpcy5fb25SZWNlaXZlTW9kZWxzKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9tb3Rpb25DYWxsYmFjayhldmVudFZhbHVlcykge1xuICAgIGNvbnN0IHZhbHVlcyA9IGV2ZW50VmFsdWVzLnNsaWNlKDAsMykuY29uY2F0KGV2ZW50VmFsdWVzLnNsaWNlKC0zKSk7XG4gICAgdGhpcy5fcHJlUHJvY2Vzcy5wcm9jZXNzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgdmFsdWVzKTtcbiAgfVxuXG4gIF9pbnRlbnNpdHlDYWxsYmFjayhmcmFtZSkge1xuICAgIGlmICh0aGlzLl9pbnRlbnNpdHlPbikge1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5zZXRHYWluRnJvbUludGVuc2l0eShmcmFtZS5kYXRhWzBdKTsgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5zZXRHYWluRnJvbUludGVuc2l0eSgxKTtcbiAgICB9XG4gIH1cblxuICBfb25SZWNlaXZlTW9kZWxzKG1vZGVscykge1xuICAgIHRoaXMuX21vZGVscyA9IG1vZGVscztcblxuICAgIHRoaXMudmlldy5tb2RlbC5tb2RlbHMgPSB0aGlzLl9tb2RlbHM7XG4gICAgdGhpcy52aWV3LnJlbmRlcignI21vZGVsc0RpdicpO1xuXG4gICAgY29uc3QgcHJldk1vZGVscyA9IE9iamVjdC5rZXlzKG1vZGVscyk7XG4gICAgY29uc3QgcHJldk1vZGVsSW5kZXggPSBwcmV2TW9kZWxzLmluZGV4T2YodGhpcy5fY3VycmVudE1vZGVsKTtcblxuICAgIGNvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNb2RlbCArICcgJyArIHByZXZNb2RlbEluZGV4KTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50TW9kZWwgJiYgIHByZXZNb2RlbEluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRNb2RlbCA9IHByZXZNb2RlbHNbcHJldk1vZGVsSW5kZXhdO1xuICAgICAgdGhpcy52aWV3LnNldE1vZGVsSXRlbSh0aGlzLl9jdXJyZW50TW9kZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jdXJyZW50TW9kZWwgPSBwcmV2TW9kZWxzWzBdO1xuICAgIH1cblxuICAgIHRoaXMuX3htbURlY29kZXIucGFyYW1zLnNldCgnbW9kZWwnLCB0aGlzLl9tb2RlbHNbdGhpcy5fY3VycmVudE1vZGVsXSk7XG4gIH1cblxuICBfb25Nb2RlbEZpbHRlcihyZXMpIHtcbiAgICBjb25zdCBsaWtlbGlob29kcyA9IHJlcyA/IHJlcy5saWtlbGlob29kcyA6IFtdO1xuICAgIGNvbnN0IGxpa2VsaWVzdCA9IHJlcyA/IHJlcy5saWtlbGllc3RJbmRleCA6IC0xO1xuICAgIGNvbnN0IGxhYmVsID0gcmVzID8gcmVzLmxpa2VsaWVzdCA6ICd1bmtub3duJztcbiAgICBjb25zdCBhbHBoYXMgPSByZXMgPyByZXMuYWxwaGFzIDogW1tdXTsvLyByZXMuYWxwaGFzW2xpa2VsaWVzdF07XG5cbiAgICBpZiAodGhpcy5saWtlbGllc3QgIT09IGxhYmVsKSB7XG4gICAgICB0aGlzLmxpa2VsaWVzdCA9IGxhYmVsO1xuICAgICAgY29uc29sZS5sb2coJ2NoYW5nZWQgZ2VzdHVyZSB0byA6ICcgKyBsYWJlbCk7XG4gICAgICBjb25zdCBpID0gdGhpcy5sYWJlbHMuaW5kZXhPZihsYWJlbCk7XG4gICAgICB0aGlzLmF1ZGlvRW5naW5lLmZhZGVUb05ld1NvdW5kKGkpO1xuICAgIH1cbiAgfVxuXG4gIF9vbk1vZGVsQ2hhbmdlKHZhbHVlKSB7XG4gICAgdGhpcy5fY3VycmVudE1vZGVsID0gdmFsdWU7XG4gICAgdGhpcy5feG1tRGVjb2Rlci5wYXJhbXMuc2V0KCdtb2RlbCcsIHRoaXMuX21vZGVsc1t0aGlzLl9jdXJyZW50TW9kZWxdKTtcbiAgfVxuXG4gIF9vblNvdW5kT25PZmYob25PZmYpIHtcbiAgICB0aGlzLmF1ZGlvRW5naW5lLmVuYWJsZVNvdW5kcyhvbk9mZik7XG4gIH1cblxuICBfb25JbnRlbnNpdHlPbk9mZihvbk9mZikge1xuICAgIHRoaXMuX2ludGVuc2l0eU9uID0gb25PZmY7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckV4cGVyaWVuY2U7XG4iXX0=