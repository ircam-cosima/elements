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
      files: _config.sounds
    });
    _this5.motionInput = _this5.require('motion-input', {
      descriptors: ['devicemotion']
    });

    _this5.labels = (0, _keys2.default)(_config.sounds);
    _this5.likeliest = undefined;

    _this5._models = null;
    _this5._currentModel = null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImxmbyIsImF1ZGlvQ29udGV4dCIsInZpZXdNb2RlbCIsIm1vZGVscyIsInZpZXdUZW1wbGF0ZSIsIlBsYXllclZpZXciLCJ0ZW1wbGF0ZSIsImNvbnRlbnQiLCJldmVudHMiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJpbnN0YWxsRXZlbnRzIiwicmVjIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaW5uZXJIVE1MIiwiYWRkIiwicmVtb3ZlIiwiaW5wdXRzIiwic2VsZWN0ZWRJbmRleCIsInZhbHVlIiwiaXRlbSIsImVsIiwiU2VnbWVudGVkVmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsImNoZWNraW4iLCJzaG93RGlhbG9nIiwiYXVkaW9CdWZmZXJNYW5hZ2VyIiwiZmlsZXMiLCJtb3Rpb25JbnB1dCIsImRlc2NyaXB0b3JzIiwibGFiZWxzIiwibGlrZWxpZXN0IiwidW5kZWZpbmVkIiwiX21vZGVscyIsIl9jdXJyZW50TW9kZWwiLCJfaW50ZW5zaXR5T24iLCJ2aWV3IiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY2xhc3NOYW1lIiwic2hvdyIsInRoZW4iLCJfb25SZWNlaXZlTW9kZWxzIiwiYmluZCIsIl9vbk1vZGVsQ2hhbmdlIiwiX29uTW9kZWxGaWx0ZXIiLCJfbW90aW9uQ2FsbGJhY2siLCJfaW50ZW5zaXR5Q2FsbGJhY2siLCJfb25Tb3VuZE9uT2ZmIiwiX29uSW50ZW5zaXR5T25PZmYiLCJvbk1vZGVsQ2hhbmdlIiwib25Tb3VuZE9uT2ZmIiwib25JbnRlbnNpdHlPbk9mZiIsIl94bW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsIl9wcmVQcm9jZXNzIiwiY29ubmVjdCIsInN0YXJ0IiwiYXVkaW9FbmdpbmUiLCJkYXRhIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsInJlY2VpdmUiLCJldmVudFZhbHVlcyIsInZhbHVlcyIsInNsaWNlIiwiY29uY2F0IiwicHJvY2VzcyIsImN1cnJlbnRUaW1lIiwiZnJhbWUiLCJzZXRHYWluRnJvbUludGVuc2l0eSIsIm1vZGVsIiwicmVuZGVyIiwicHJldk1vZGVscyIsInByZXZNb2RlbEluZGV4IiwiaW5kZXhPZiIsInNldE1vZGVsSXRlbSIsInBhcmFtcyIsInNldCIsInJlcyIsImxpa2VsaWhvb2RzIiwibGlrZWxpZXN0SW5kZXgiLCJsYWJlbCIsImFscGhhcyIsImNvbnNvbGUiLCJsb2ciLCJpIiwiZmFkZVRvTmV3U291bmQiLCJvbk9mZiIsImVuYWJsZVNvdW5kcyIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7SUFBWUMsRzs7QUFDWjs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU1DLGVBQWVGLFdBQVdFLFlBQWhDOztBQUVBLElBQU1DLFlBQVksRUFBRUMsUUFBUSxJQUFWLEVBQWxCOztBQUVBLElBQU1DLGt2QkFBTjs7SUE0Qk1DLFU7OztBQUNKLHNCQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQkMsTUFBL0IsRUFBdUNDLE9BQXZDLEVBQWdEO0FBQUE7QUFBQSx5SUFDeENILFFBRHdDLEVBQzlCQyxPQUQ4QixFQUNyQkMsTUFEcUIsRUFDYkMsT0FEYTtBQUUvQzs7OztpQ0FFWUMsUSxFQUFVO0FBQUE7O0FBQ3JCLFdBQUtDLGFBQUwsQ0FBbUI7QUFDakIsOEJBQXNCLDJCQUFNO0FBQzFCLGNBQU1DLE1BQU0sT0FBS0MsR0FBTCxDQUFTQyxhQUFULENBQXVCLGNBQXZCLENBQVo7QUFDQSxjQUFJLENBQUNGLElBQUlHLFNBQUosQ0FBY0MsUUFBZCxDQUF1QixRQUF2QixDQUFMLEVBQXVDO0FBQ3JDSixnQkFBSUssU0FBSixHQUFnQixVQUFoQjtBQUNBTCxnQkFBSUcs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QztBQUNEOzs7bUNBRWM0QyxHLEVBQUs7QUFDbEIsVUFBTUMsY0FBY0QsTUFBTUEsSUFBSUMsV0FBVixHQUF3QixFQUE1QztBQUNBLFVBQU1oRCxZQUFZK0MsTUFBTUEsSUFBSUUsY0FBVixHQUEyQixDQUFDLENBQTlDO0FBQ0EsVUFBTUMsUUFBUUgsTUFBTUEsSUFBSS9DLFNBQVYsR0FBc0IsU0FBcEM7QUFDQSxVQUFNbUQsU0FBU0osTUFBTUEsSUFBSUksTUFBVixHQUFtQixDQUFDLEVBQUQsQ0FBbEMsQ0FKa0IsQ0FJcUI7O0FBRXZDLFVBQUksS0FBS25ELFNBQUwsS0FBbUJrRCxLQUF2QixFQUE4QjtBQUM1QixhQUFLbEQsU0FBTCxHQUFpQmtELEtBQWpCO0FBQ0FFLGdCQUFRQyxHQUFSLENBQVksMEJBQTBCSCxLQUF0QztBQUNBLFlBQU1JLElBQUksS0FBS3ZELE1BQUwsQ0FBWTRDLE9BQVosQ0FBb0JPLEtBQXBCLENBQVY7QUFDQSxhQUFLeEIsV0FBTCxDQUFpQjZCLGNBQWpCLENBQWdDRCxDQUFoQztBQUNEO0FBQ0Y7OzttQ0FFY3RFLEssRUFBTztBQUNwQixXQUFLbUIsYUFBTCxHQUFxQm5CLEtBQXJCO0FBQ0EsV0FBS3FDLFdBQUwsQ0FBaUJ3QixNQUFqQixDQUF3QkMsR0FBeEIsQ0FBNEIsT0FBNUIsRUFBcUMsS0FBSzVDLE9BQUwsQ0FBYSxLQUFLQyxhQUFsQixDQUFyQztBQUNEOzs7a0NBRWFxRCxLLEVBQU87QUFDbkIsV0FBSzlCLFdBQUwsQ0FBaUIrQixZQUFqQixDQUE4QkQsS0FBOUI7QUFDRDs7O3NDQUVpQkEsSyxFQUFPO0FBQ3ZCLFdBQUtwRCxZQUFMLEdBQW9Cb0QsS0FBcEI7QUFDRDs7O0VBN0g0Qi9GLFdBQVdpRyxVOztBQThIekM7O2tCQUVjdEUsZ0IiLCJmaWxlIjoiUGxheWVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0IHsgWG1tRGVjb2RlckxmbyB9IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0IHsgc291bmRzIH0gZnJvbSAgJy4uL3NoYXJlZC9jb25maWcnO1xuaW1wb3J0IFByZVByb2Nlc3MgZnJvbSAnLi4vc2hhcmVkL1ByZVByb2Nlc3MnO1xuaW1wb3J0IEF1ZGlvRW5naW5lIGZyb20gJy4uL3NoYXJlZC9BdWRpb0VuZ2luZSc7XG5cbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuXG5jb25zdCB2aWV3TW9kZWwgPSB7IG1vZGVsczogbnVsbCB9O1xuXG5jb25zdCB2aWV3VGVtcGxhdGUgPSBgXG4gIDxkaXYgY2xhc3M9XCJiYWNrZ3JvdW5kIGZpdC1jb250YWluZXJcIj48L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmQgZml0LWNvbnRhaW5lclwiPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPlxuICAgICAgPGRpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0RGl2XCIgaWQ9XCJtb2RlbHNEaXZcIj5cbiAgICAgICAgICA8bGFiZWw+IE1vZGVsIDogPC9sYWJlbD5cbiAgICAgICAgICA8c2VsZWN0IGlkPVwibW9kZWxTZWxlY3RcIj5cbiAgICAgICAgICAgIDwlIGZvciAodmFyIHByb3AgaW4gbW9kZWxzKSB7ICU+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI8JT0gcHJvcCAlPlwiPlxuICAgICAgICAgICAgICAgIDwlPSBwcm9wICU+XG4gICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgPCUgfSAlPlxuICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8YnV0dG9uIGlkPVwic291bmQtb25vZmZcIj4gU09VTkQgT0ZGIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGlkPVwiaW50ZW5zaXR5LW9ub2ZmXCI+IElOVEVOU0lUWSBPRkYgPC9idXR0b24+XG5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+PC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuY2xhc3MgUGxheWVyVmlldyBleHRlbmRzIHNvdW5kd29ya3MuU2VnbWVudGVkVmlldyB7XG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKTtcbiAgfVxuXG4gIG9uU291bmRPbk9mZihjYWxsYmFjaykge1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgI3NvdW5kLW9ub2ZmJzogKCkgPT4ge1xuICAgICAgICBjb25zdCByZWMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjc291bmQtb25vZmYnKTtcbiAgICAgICAgaWYgKCFyZWMuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgICAgICAgIHJlYy5pbm5lckhUTUwgPSAnU09VTkQgT04nO1xuICAgICAgICAgIHJlYy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWMuaW5uZXJIVE1MID0gJ1NPVU5EIE9GRic7XG4gICAgICAgICAgcmVjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgfSAgICAgICAgXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbkludGVuc2l0eU9uT2ZmKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayAjaW50ZW5zaXR5LW9ub2ZmJzogKCkgPT4ge1xuICAgICAgICBjb25zdCByZWMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjaW50ZW5zaXR5LW9ub2ZmJyk7XG4gICAgICAgIGlmICghcmVjLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgICAgICByZWMuaW5uZXJIVE1MID0gJ0lOVEVOU0lUWSBPTic7XG4gICAgICAgICAgcmVjLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlYy5pbm5lckhUTUwgPSAnSU5URU5TSVRZIE9GRic7XG4gICAgICAgICAgcmVjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgfSAgICAgICAgXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbk1vZGVsQ2hhbmdlKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjaGFuZ2UgI21vZGVsU2VsZWN0JzogKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dHMgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjbW9kZWxTZWxlY3QnKTtcbiAgICAgICAgY2FsbGJhY2soaW5wdXRzLm9wdGlvbnNbaW5wdXRzLnNlbGVjdGVkSW5kZXhdLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNldE1vZGVsSXRlbShpdGVtKSB7XG4gICAgY29uc3QgZWwgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcjbW9kZWxTZWxlY3QnKTtcbiAgICBlbC52YWx1ZSA9IGl0ZW07XG4gIH1cbn1cblxuXG5jbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5FeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoYXNzZXRzRG9tYWluKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMucGxhdGZvcm0gPSB0aGlzLnJlcXVpcmUoJ3BsYXRmb3JtJywgeyBmZWF0dXJlczogWyd3ZWItYXVkaW8nXSB9KTtcbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nLCB7IHNob3dEaWFsb2c6IGZhbHNlIH0pO1xuICAgIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicsIHtcbiAgICAgIGFzc2V0c0RvbWFpbjogYXNzZXRzRG9tYWluLFxuICAgICAgZmlsZXM6IHNvdW5kcyxcbiAgICB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7XG4gICAgICBkZXNjcmlwdG9yczogWydkZXZpY2Vtb3Rpb24nXVxuICAgIH0pO1xuXG4gICAgdGhpcy5sYWJlbHMgPSBPYmplY3Qua2V5cyhzb3VuZHMpO1xuICAgIHRoaXMubGlrZWxpZXN0ID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5fbW9kZWxzID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50TW9kZWwgPSBudWxsO1xuICAgIHRoaXMuX2ludGVuc2l0eU9uID0gZmFsc2U7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IFBsYXllclZpZXcodmlld1RlbXBsYXRlLCB2aWV3TW9kZWwsIHt9LCB7XG4gICAgICBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUsXG4gICAgICBjbGFzc05hbWU6ICdwbGF5ZXInXG4gICAgfSk7XG5cbiAgICAvLyBhcyBzaG93IGNhbiBiZSBhc3luYywgd2UgbWFrZSBzdXJlIHRoYXQgdGhlIHZpZXcgaXMgYWN0dWFsbHkgcmVuZGVyZWRcbiAgICB0aGlzLnNob3coKS50aGVuKCgpID0+IHtcblxuICAgICAgdGhpcy5fb25SZWNlaXZlTW9kZWxzID0gdGhpcy5fb25SZWNlaXZlTW9kZWxzLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbk1vZGVsQ2hhbmdlID0gdGhpcy5fb25Nb2RlbENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25Nb2RlbEZpbHRlciA9IHRoaXMuX29uTW9kZWxGaWx0ZXIuYmluZCh0aGlzKTsgICBcbiAgICAgIHRoaXMuX21vdGlvbkNhbGxiYWNrID0gdGhpcy5fbW90aW9uQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX2ludGVuc2l0eUNhbGxiYWNrID0gdGhpcy5faW50ZW5zaXR5Q2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29uU291bmRPbk9mZiA9IHRoaXMuX29uU291bmRPbk9mZi5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb25JbnRlbnNpdHlPbk9mZiA9IHRoaXMuX29uSW50ZW5zaXR5T25PZmYuYmluZCh0aGlzKTtcblxuICAgICAgdGhpcy52aWV3Lm9uTW9kZWxDaGFuZ2UodGhpcy5fb25Nb2RlbENoYW5nZSk7XG4gICAgICB0aGlzLnZpZXcub25Tb3VuZE9uT2ZmKHRoaXMuX29uU291bmRPbk9mZik7XG4gICAgICB0aGlzLnZpZXcub25JbnRlbnNpdHlPbk9mZih0aGlzLl9vbkludGVuc2l0eU9uT2ZmKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0gTEZPJ3MgLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMuX3htbURlY29kZXIgPSBuZXcgWG1tRGVjb2Rlckxmbyh7XG4gICAgICAgIGxpa2VsaWhvb2RXaW5kb3c6IDIwLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5fb25Nb2RlbEZpbHRlcixcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcHJlUHJvY2VzcyA9IG5ldyBQcmVQcm9jZXNzKHRoaXMuX2ludGVuc2l0eUNhbGxiYWNrKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3MuY29ubmVjdCh0aGlzLl94bW1EZWNvZGVyKTtcbiAgICAgIHRoaXMuX3ByZVByb2Nlc3Muc3RhcnQoKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0gQVVESU8gLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZSA9IG5ldyBBdWRpb0VuZ2luZSh0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlci5kYXRhKTtcbiAgICAgIHRoaXMuYXVkaW9FbmdpbmUuc3RhcnQoKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0gTU9USU9OIElOUFVUIC0tLS0tLS0tLS0tLS0vL1xuICAgICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ2RldmljZW1vdGlvbicpKSB7XG4gICAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ2RldmljZW1vdGlvbicsIHRoaXMuX21vdGlvbkNhbGxiYWNrKTtcbiAgICAgIH1cblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLSBSRUNFSVZFIC0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgIHRoaXMucmVjZWl2ZSgnbW9kZWxzJywgdGhpcy5fb25SZWNlaXZlTW9kZWxzKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9tb3Rpb25DYWxsYmFjayhldmVudFZhbHVlcykge1xuICAgIGNvbnN0IHZhbHVlcyA9IGV2ZW50VmFsdWVzLnNsaWNlKDAsMykuY29uY2F0KGV2ZW50VmFsdWVzLnNsaWNlKC0zKSk7XG4gICAgdGhpcy5fcHJlUHJvY2Vzcy5wcm9jZXNzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgdmFsdWVzKTtcbiAgfVxuXG4gIF9pbnRlbnNpdHlDYWxsYmFjayhmcmFtZSkge1xuICAgIGlmICh0aGlzLl9pbnRlbnNpdHlPbikge1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5zZXRHYWluRnJvbUludGVuc2l0eShmcmFtZS5kYXRhWzBdKTsgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hdWRpb0VuZ2luZS5zZXRHYWluRnJvbUludGVuc2l0eSgxKTtcbiAgICB9XG4gIH1cblxuICBfb25SZWNlaXZlTW9kZWxzKG1vZGVscykge1xuICAgIHRoaXMuX21vZGVscyA9IG1vZGVscztcblxuICAgIHRoaXMudmlldy5tb2RlbC5tb2RlbHMgPSB0aGlzLl9tb2RlbHM7XG4gICAgdGhpcy52aWV3LnJlbmRlcignI21vZGVsc0RpdicpO1xuXG4gICAgY29uc3QgcHJldk1vZGVscyA9IE9iamVjdC5rZXlzKG1vZGVscyk7XG4gICAgY29uc3QgcHJldk1vZGVsSW5kZXggPSBwcmV2TW9kZWxzLmluZGV4T2YodGhpcy5fY3VycmVudE1vZGVsKTtcblxuICAgIGlmICh0aGlzLl9jdXJyZW50TW9kZWwgJiYgIHByZXZNb2RlbEluZGV4ID4gLTEpIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRNb2RlbCA9IHByZXZNb2RlbHNbcHJldk1vZGVsSW5kZXhdO1xuICAgICAgdGhpcy52aWV3LnNldE1vZGVsSXRlbSh0aGlzLl9jdXJyZW50TW9kZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jdXJyZW50TW9kZWwgPSBwcmV2TW9kZWxzWzBdO1xuICAgIH1cblxuICAgIHRoaXMuX3htbURlY29kZXIucGFyYW1zLnNldCgnbW9kZWwnLCB0aGlzLl9tb2RlbHNbdGhpcy5fY3VycmVudE1vZGVsXSk7XG4gIH1cblxuICBfb25Nb2RlbEZpbHRlcihyZXMpIHtcbiAgICBjb25zdCBsaWtlbGlob29kcyA9IHJlcyA/IHJlcy5saWtlbGlob29kcyA6IFtdO1xuICAgIGNvbnN0IGxpa2VsaWVzdCA9IHJlcyA/IHJlcy5saWtlbGllc3RJbmRleCA6IC0xO1xuICAgIGNvbnN0IGxhYmVsID0gcmVzID8gcmVzLmxpa2VsaWVzdCA6ICd1bmtub3duJztcbiAgICBjb25zdCBhbHBoYXMgPSByZXMgPyByZXMuYWxwaGFzIDogW1tdXTsvLyByZXMuYWxwaGFzW2xpa2VsaWVzdF07XG5cbiAgICBpZiAodGhpcy5saWtlbGllc3QgIT09IGxhYmVsKSB7XG4gICAgICB0aGlzLmxpa2VsaWVzdCA9IGxhYmVsO1xuICAgICAgY29uc29sZS5sb2coJ2NoYW5nZWQgZ2VzdHVyZSB0byA6ICcgKyBsYWJlbCk7XG4gICAgICBjb25zdCBpID0gdGhpcy5sYWJlbHMuaW5kZXhPZihsYWJlbCk7XG4gICAgICB0aGlzLmF1ZGlvRW5naW5lLmZhZGVUb05ld1NvdW5kKGkpO1xuICAgIH1cbiAgfVxuXG4gIF9vbk1vZGVsQ2hhbmdlKHZhbHVlKSB7XG4gICAgdGhpcy5fY3VycmVudE1vZGVsID0gdmFsdWU7XG4gICAgdGhpcy5feG1tRGVjb2Rlci5wYXJhbXMuc2V0KCdtb2RlbCcsIHRoaXMuX21vZGVsc1t0aGlzLl9jdXJyZW50TW9kZWxdKTtcbiAgfVxuXG4gIF9vblNvdW5kT25PZmYob25PZmYpIHtcbiAgICB0aGlzLmF1ZGlvRW5naW5lLmVuYWJsZVNvdW5kcyhvbk9mZik7XG4gIH1cblxuICBfb25JbnRlbnNpdHlPbk9mZihvbk9mZikge1xuICAgIHRoaXMuX2ludGVuc2l0eU9uID0gb25PZmY7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckV4cGVyaWVuY2U7XG4iXX0=