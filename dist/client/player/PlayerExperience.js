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

      // this.view.content = {
      //   models: this._models      
      // };
      this.view.model.models = this._models;
      this.view.render('#modelsDiv');

      var prevModels = (0, _keys2.default)(models);
      var prevModelIndex = prevModels.indexOf(this._currentModel);

      if (this._currentModel && prevModelIndex > -1) {
        this._currentModel = prevModels[prevModelIndex];
        this.view.setItem(this._currentModel);
      } else {
        this._currentModel = prevModels[0];
      }

      this._xmmDecoder.params.set('model', this._models[this._currentModel]);
      console.log('received models');
    }
  }, {
    key: '_onModelFilter',
    value: function _onModelFilter(res) {
      var likelihoods = res ? res.likelihoods : [];
      var likeliest = res ? res.likeliestIndex : -1;
      var label = res ? res.likeliest : 'unknown';
      var alphas = res ? res.alphas : [[]]; // res.alphas[likeliest];

      // const newRes = {
      //   label: label,
      //   likeliest: likeliest,
      //   likelihoods: likelihoods
      // };

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImxmbyIsImF1ZGlvQ29udGV4dCIsInZpZXdNb2RlbCIsIm1vZGVscyIsInZpZXdUZW1wbGF0ZSIsIlBsYXllclZpZXciLCJ0ZW1wbGF0ZSIsImNvbnRlbnQiLCJldmVudHMiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJpbnN0YWxsRXZlbnRzIiwicmVjIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaW5uZXJIVE1MIiwiYWRkIiwicmVtb3ZlIiwiaW5wdXRzIiwic2VsZWN0ZWRJbmRleCIsInZhbHVlIiwiaXRlbSIsImVsIiwiU2VnbWVudGVkVmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsImNoZWNraW4iLCJzaG93RGlhbG9nIiwiYXVkaW9CdWZmZXJNYW5hZ2VyIiwiZmlsZXMiLCJtb3Rpb25JbnB1dCIsImRlc2NyaXB0b3JzIiwibGFiZWxzIiwibGlrZWxpZXN0IiwidW5kZWZpbmVkIiwiX21vZGVscyIsIl9jdXJyZW50TW9kZWwiLCJfc2VuZE9zY0ZsYWciLCJfaW50ZW5zaXR5T24iLCJ2aWV3IiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY2xhc3NOYW1lIiwic2hvdyIsInRoZW4iLCJfb25SZWNlaXZlTW9kZWxzIiwiYmluZCIsIl9vbk1vZGVsQ2hhbmdlIiwiX29uTW9kZWxGaWx0ZXIiLCJfbW90aW9uQ2FsbGJhY2siLCJfaW50ZW5zaXR5Q2FsbGJhY2siLCJfb25Tb3VuZE9uT2ZmIiwiX29uSW50ZW5zaXR5T25PZmYiLCJvbk1vZGVsQ2hhbmdlIiwib25Tb3VuZE9uT2ZmIiwib25JbnRlbnNpdHlPbk9mZiIsIl94bW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsIl9wcmVQcm9jZXNzIiwiY29ubmVjdCIsInN0YXJ0IiwiYXVkaW9FbmdpbmUiLCJkYXRhIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsInJlY2VpdmUiLCJfb25SZWNlaXZlTW9kZWwiLCJldmVudFZhbHVlcyIsInZhbHVlcyIsInNsaWNlIiwiY29uY2F0IiwicHJvY2VzcyIsImN1cnJlbnRUaW1lIiwiZnJhbWUiLCJzZXRHYWluRnJvbUludGVuc2l0eSIsIm1vZGVsIiwicmVuZGVyIiwicHJldk1vZGVscyIsInByZXZNb2RlbEluZGV4IiwiaW5kZXhPZiIsInNldEl0ZW0iLCJwYXJhbXMiLCJzZXQiLCJjb25zb2xlIiwibG9nIiwicmVzIiwibGlrZWxpaG9vZHMiLCJsaWtlbGllc3RJbmRleCIsImxhYmVsIiwiYWxwaGFzIiwiaSIsImZhZGVUb05ld1NvdW5kIiwib25PZmYiLCJlbmFibGVTb3VuZHMiLCJFeHBlcmllbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7O0FBQ1o7O0lBQVlDLEc7O0FBQ1o7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQzs7QUFFQSxJQUFNQyxZQUFZLEVBQUVDLFFBQVEsSUFBVixFQUFsQjs7QUFFQSxJQUFNQyxrdkJBQU47O0lBNEJNQyxVOzs7QUFDSixzQkFBWUMsUUFBWixFQUFzQkMsT0FBdEIsRUFBK0JDLE1BQS9CLEVBQXVDQyxPQUF2QyxFQUFnRDtBQUFBO0FBQUEseUlBQ3hDSCxRQUR3QyxFQUM5QkMsT0FEOEIsRUFDckJDLE1BRHFCLEVBQ2JDLE9BRGE7QUFFL0M7Ozs7aUNBRVlDLFEsRUFBVTtBQUFBOztBQUNyQixXQUFLQyxhQUFMLENBQW1CO0FBQ2pCLDhCQUFzQiwyQkFBTTtBQUMxQixjQUFNQyxNQUFNLE9BQUtDLEdBQUwsQ0FBU0MsYUFBVCxDQUF1QixjQUF2QixDQUFaO0FBQ0EsY0FBSSxDQUFDRixJQUFJRyxTQUFKLENBQWNDLFFBQWQsQ0FBdUIsUUFBdkIsQ0FBTCxFQUF1QztBQUNyQ0osZ0JBQUlLLFNB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O0FBQ0Q7OztFQXpJNEJqRyxXQUFXbUcsVTs7QUEwSXpDOztrQkFFY3hFLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCB7IFhtbURlY29kZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCB7IGNsYXNzZXMgfSBmcm9tICAnLi4vc2hhcmVkL2NvbmZpZyc7XG5pbXBvcnQgUHJlUHJvY2VzcyBmcm9tICcuLi9zaGFyZWQvUHJlUHJvY2Vzcyc7XG5pbXBvcnQgQXVkaW9FbmdpbmUgZnJvbSAnLi4vc2hhcmVkL0F1ZGlvRW5naW5lJztcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmNvbnN0IHZpZXdNb2RlbCA9IHsgbW9kZWxzOiBudWxsIH07XG5cbmNvbnN0IHZpZXdUZW1wbGF0ZSA9IGBcbiAgPGRpdiBjbGFzcz1cImJhY2tncm91bmQgZml0LWNvbnRhaW5lclwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiZm9yZWdyb3VuZCBmaXQtY29udGFpbmVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICA8ZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3REaXZcIiBpZD1cIm1vZGVsc0RpdlwiPlxuICAgICAgICAgIDxsYWJlbD4gTW9kZWwgOiA8L2xhYmVsPlxuICAgICAgICAgIDxzZWxlY3QgaWQ9XCJtb2RlbFNlbGVjdFwiPlxuICAgICAgICAgICAgPCUgZm9yICh2YXIgcHJvcCBpbiBtb2RlbHMpIHsgJT5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjwlPSBwcm9wICU+XCI+XG4gICAgICAgICAgICAgICAgPCU9IHByb3AgJT5cbiAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICA8JSB9ICU+XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxidXR0b24gaWQ9XCJzb3VuZC1vbm9mZlwiPiBTT1VORCBPRkYgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gaWQ9XCJpbnRlbnNpdHktb25vZmZcIj4gSU5URU5TSVRZIE9GRiA8L2J1dHRvbj5cblxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj48L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG5jbGFzcyBQbGF5ZXJWaWV3IGV4dGVuZHMgc291bmR3b3Jrcy5TZWdtZW50ZWRWaWV3IHtcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgb25Tb3VuZE9uT2ZmKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjc291bmQtb25vZmYnOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlYyA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNzb3VuZC1vbm9mZicpO1xuICAgICAgICBpZiAoIXJlYy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgICAgICAgcmVjLmlubmVySFRNTCA9ICdTT1VORCBPTic7XG4gICAgICAgICAgcmVjLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlYy5pbm5lckhUTUwgPSAnU09VTkQgT0ZGJztcbiAgICAgICAgICByZWMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uSW50ZW5zaXR5T25PZmYoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrICNpbnRlbnNpdHktb25vZmYnOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlYyA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNpbnRlbnNpdHktb25vZmYnKTtcbiAgICAgICAgaWYgKCFyZWMuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgICAgICAgIHJlYy5pbm5lckhUTUwgPSAnSU5URU5TSVRZIE9OJztcbiAgICAgICAgICByZWMuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjLmlubmVySFRNTCA9ICdJTlRFTlNJVFkgT0ZGJztcbiAgICAgICAgICByZWMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uTW9kZWxDaGFuZ2UoY2FsbGJhY2spIHtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NoYW5nZSAjbW9kZWxTZWxlY3QnOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNtb2RlbFNlbGVjdCcpO1xuICAgICAgICBjYWxsYmFjayhpbnB1dHMub3B0aW9uc1tpbnB1dHMuc2VsZWN0ZWRJbmRleF0udmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0TW9kZWxJdGVtKGl0ZW0pIHtcbiAgICBjb25zdCBlbCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNtb2RlbFNlbGVjdCcpO1xuICAgIGVsLnZhbHVlID0gaXRlbTtcbiAgfVxufVxuXG5cbmNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbyddIH0pO1xuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicsIHsgc2hvd0RpYWxvZzogZmFsc2UgfSk7XG4gICAgdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLWJ1ZmZlci1tYW5hZ2VyJywge1xuICAgICAgYXNzZXRzRG9tYWluOiBhc3NldHNEb21haW4sXG4gICAgICBmaWxlczogY2xhc3NlcyxcbiAgICB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7XG4gICAgICBkZXNjcmlwdG9yczogWydkZXZpY2Vtb3Rpb24nXVxuICAgIH0pO1xuXG4gICAgdGhpcy5sYWJlbHMgPSBPYmplY3Qua2V5cyhjbGFzc2VzKTtcbiAgICB0aGlzLmxpa2VsaWVzdCA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuX21vZGVscyA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudE1vZGVsID0gbnVsbDtcbiAgICB0aGlzLl9zZW5kT3NjRmxhZyA9IGZhbHNlO1xuICAgIHRoaXMuX2ludGVuc2l0eU9uID0gZmFsc2U7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IFBsYXllclZpZXcodmlld1RlbXBsYXRlLCB2aWV3TW9kZWwsIHt9LCB7XG4gICAgICBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUsXG4gICAgICBjbGFzc05hbWU6ICdwbGF5ZXInXG4gICAgfSk7XG5cbiAgICAvLyBhcyBzaG93IGNhbiBiZSBhc3luYywgd2UgbWFrZSBzdXJlIHRoYXQgdGhlIHZpZXcgaXMgYWN0dWFsbHkgcmVuZGVyZWRcbiAgICB0aGlzLnNob3coKS50aGVuKCgpID0+IHtcblxuICAgICAgdGhpcy5fb25SZWNlaXZlTW9kZWxzID0gdGhpcy5fb25SZWNlaXZlTW9kZWxzLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbk1vZGVsQ2hhbmdlID0gdGhpcy5fb25Nb2RlbENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25Nb2RlbEZpbHRlciA9IHRoaXMuX29uTW9kZWxGaWx0ZXIuYmluZCh0aGlzKTsgICBcbiAgICAgIHRoaXMuX21vdGlvbkNhbGxiYWNrID0gdGhpcy5fbW90aW9uQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX2ludGVuc2l0eUNhbGxiYWNrID0gdGhpcy5faW50ZW5zaXR5Q2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uU291bmRPbk9mZiA9IHRoaXMuX29uU291bmRPbk9mZi5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25JbnRlbnNpdHlPbk9mZiA9IHRoaXMuX29uSW50ZW5zaXR5T25PZmYuYmluZCh0aGlzKTtcblxuICAgICAgdGhpcy52aWV3Lm9uTW9kZWxDaGFuZ2UodGhpcy5fb25Nb2RlbENoYW5nZSk7XG4gICAgICB0aGlzLnZpZXcub25Tb3VuZE9uT2ZmKHRoaXMuX29uU291bmRPbk9mZik7XG4gICAgICB0aGlzLnZpZXcub25JbnRlbnNpdHlPbk9mZih0aGlzLl9vbkludGVuc2l0eU9uT2ZmKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0gTEZPJ3MgLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMuX3htbURlY29kZXIgPSBuZXcgWG1tRGVjb2Rlckxmbyh7XG4gICAgICAgIGxpa2VsaWhvb2RXaW5kb3c6IDIwLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5fb25Nb2RlbEZpbHRlcixcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcHJlUHJvY2VzcyA9IG5ldyBQcmVQcm9jZXNzKHRoaXMuX2ludGVuc2l0eUNhbGxiYWNrKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3MuY29ubmVjdCh0aGlzLl94bW1EZWNvZGVyKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3Muc3RhcnQoKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0gQVVESU8gLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZSA9IG5ldyBBdWRpb0VuZ2luZSh0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlci5kYXRhKTtcbiAgICAgIHRoaXMuYXVkaW9FbmdpbmUuc3RhcnQoKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0gTU9USU9OIElOUFVUIC0tLS0tLS0tLS0tLS0vL1xuICAgICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ2RldmljZW1vdGlvbicpKSB7XG4gICAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ2RldmljZW1vdGlvbicsIHRoaXMuX21vdGlvbkNhbGxiYWNrKTtcbiAgICAgIH1cblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLSBSRUNFSVZFIC0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMucmVjZWl2ZSgnbW9kZWwnLCB0aGlzLl9vblJlY2VpdmVNb2RlbCk7XG4gICAgICB0aGlzLnJlY2VpdmUoJ21vZGVscycsIHRoaXMuX29uUmVjZWl2ZU1vZGVscyk7XG4gICAgfSk7XG4gIH1cblxuICBfbW90aW9uQ2FsbGJhY2soZXZlbnRWYWx1ZXMpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBldmVudFZhbHVlcy5zbGljZSgwLDMpLmNvbmNhdChldmVudFZhbHVlcy5zbGljZSgtMykpO1xuICAgIHRoaXMuX3ByZVByb2Nlc3MucHJvY2VzcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUsIHZhbHVlcyk7XG4gIH1cblxuICBfaW50ZW5zaXR5Q2FsbGJhY2soZnJhbWUpIHtcbiAgICBpZiAodGhpcy5faW50ZW5zaXR5T24pIHtcbiAgICAgIHRoaXMuYXVkaW9FbmdpbmUuc2V0R2FpbkZyb21JbnRlbnNpdHkoZnJhbWUuZGF0YVswXSk7ICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXVkaW9FbmdpbmUuc2V0R2FpbkZyb21JbnRlbnNpdHkoMSk7XG4gICAgfVxuICB9XG5cbiAgX29uUmVjZWl2ZU1vZGVscyhtb2RlbHMpIHtcbiAgICB0aGlzLl9tb2RlbHMgPSBtb2RlbHM7XG5cbiAgICAvLyB0aGlzLnZpZXcuY29udGVudCA9IHtcbiAgICAvLyAgIG1vZGVsczogdGhpcy5fbW9kZWxzICAgICAgXG4gICAgLy8gfTtcbiAgICB0aGlzLnZpZXcubW9kZWwubW9kZWxzID0gdGhpcy5fbW9kZWxzO1xuICAgIHRoaXMudmlldy5yZW5kZXIoJyNtb2RlbHNEaXYnKTtcblxuICAgIGNvbnN0IHByZXZNb2RlbHMgPSBPYmplY3Qua2V5cyhtb2RlbHMpO1xuICAgIGNvbnN0IHByZXZNb2RlbEluZGV4ID0gcHJldk1vZGVscy5pbmRleE9mKHRoaXMuX2N1cnJlbnRNb2RlbCk7XG5cbiAgICBpZiAodGhpcy5fY3VycmVudE1vZGVsICYmICBwcmV2TW9kZWxJbmRleCA+IC0xKSB7XG4gICAgICB0aGlzLl9jdXJyZW50TW9kZWwgPSBwcmV2TW9kZWxzW3ByZXZNb2RlbEluZGV4XTtcbiAgICAgIHRoaXMudmlldy5zZXRJdGVtKHRoaXMuX2N1cnJlbnRNb2RlbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRNb2RlbCA9IHByZXZNb2RlbHNbMF07XG4gICAgfVxuXG4gICAgdGhpcy5feG1tRGVjb2Rlci5wYXJhbXMuc2V0KCdtb2RlbCcsIHRoaXMuX21vZGVsc1t0aGlzLl9jdXJyZW50TW9kZWxdKTtcbiAgICBjb25zb2xlLmxvZygncmVjZWl2ZWQgbW9kZWxzJyk7XG4gIH1cblxuICBfb25Nb2RlbEZpbHRlcihyZXMpIHtcbiAgICBjb25zdCBsaWtlbGlob29kcyA9IHJlcyA/IHJlcy5saWtlbGlob29kcyA6IFtdO1xuICAgIGNvbnN0IGxpa2VsaWVzdCA9IHJlcyA/IHJlcy5saWtlbGllc3RJbmRleCA6IC0xO1xuICAgIGNvbnN0IGxhYmVsID0gcmVzID8gcmVzLmxpa2VsaWVzdCA6ICd1bmtub3duJztcbiAgICBjb25zdCBhbHBoYXMgPSByZXMgPyByZXMuYWxwaGFzIDogW1tdXTsvLyByZXMuYWxwaGFzW2xpa2VsaWVzdF07XG5cbiAgICAvLyBjb25zdCBuZXdSZXMgPSB7XG4gICAgLy8gICBsYWJlbDogbGFiZWwsXG4gICAgLy8gICBsaWtlbGllc3Q6IGxpa2VsaWVzdCxcbiAgICAvLyAgIGxpa2VsaWhvb2RzOiBsaWtlbGlob29kc1xuICAgIC8vIH07XG5cbiAgICBpZiAodGhpcy5saWtlbGllc3QgIT09IGxhYmVsKSB7XG4gICAgICB0aGlzLmxpa2VsaWVzdCA9IGxhYmVsO1xuICAgICAgY29uc29sZS5sb2coJ2NoYW5nZWQgZ2VzdHVyZSB0byA6ICcgKyBsYWJlbCk7XG4gICAgICBjb25zdCBpID0gdGhpcy5sYWJlbHMuaW5kZXhPZihsYWJlbCk7XG4gICAgICB0aGlzLmF1ZGlvRW5naW5lLmZhZGVUb05ld1NvdW5kKGkpO1xuICAgIH1cbiAgfVxuXG4gIF9vbk1vZGVsQ2hhbmdlKHZhbHVlKSB7XG4gICAgdGhpcy5fY3VycmVudE1vZGVsID0gdmFsdWU7XG4gICAgdGhpcy5feG1tRGVjb2Rlci5wYXJhbXMuc2V0KCdtb2RlbCcsIHRoaXMuX21vZGVsc1t0aGlzLl9jdXJyZW50TW9kZWxdKTtcbiAgfVxuXG4gIF9vblNvdW5kT25PZmYob25PZmYpIHtcbiAgICB0aGlzLmF1ZGlvRW5naW5lLmVuYWJsZVNvdW5kcyhvbk9mZik7XG4gIH1cblxuICBfb25JbnRlbnNpdHlPbk9mZihvbk9mZikge1xuICAgIHRoaXMuX2ludGVuc2l0eU9uID0gb25PZmY7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckV4cGVyaWVuY2U7XG4iXX0=