'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

// simple moving average filter to smooth energy input

var MvAvrg = function () {
  function MvAvrg() {
    (0, _classCallCheck3.default)(this, MvAvrg);

    this.value = 0;
    this.avgFilterSize = 20;
    this.avgFilter = [];
    for (var i = 0; i < this.avgFilterSize; i++) {
      this.avgFilter.push(0);
    }
    this.filterIndex = 0;
  }

  (0, _createClass3.default)(MvAvrg, [{
    key: 'filter',
    value: function filter(value) {
      this.value = value;
      // apply filter on the time progression :
      this.avgFilter[this.filterIndex] = value;
      var filteredValue = 0;
      for (var i = 0; i < this.avgFilterSize; i++) {
        filteredValue += this.avgFilter[i];
      }
      filteredValue /= this.avgFilterSize;
      this.filterIndex = (this.filterIndex + 1) % this.avgFilterSize;
      return filteredValue;
    }
  }, {
    key: 'reset',
    value: function reset() {
      for (var i = 0; i < this.avgFilterSize; i++) {
        this.avgFilter[i] = this.value;
      }
    }
  }]);
  return MvAvrg;
}();

//========================= the audio engine class : =========================//

var AudioEngine = function () {
  function AudioEngine(classes) {
    (0, _classCallCheck3.default)(this, AudioEngine);

    this._fadeInTime = 0.5;
    this._fadeOutTime = 1;

    this.labels = (0, _keys2.default)(classes);
    this.buffers = classes;
    this.audioContext = audioContext;

    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);

    this.gain = audioContext.createGain();
    this.gain.connect(this.master);

    this.mute = audioContext.createGain();
    this.mute.connect(this.gain);

    this.mvAvrg = new MvAvrg();
  }

  (0, _createClass3.default)(AudioEngine, [{
    key: 'start',
    value: function start() {
      this.fades = [];
      for (var i = 0; i < this.labels.length; i++) {
        var src = audioContext.createBufferSource();
        src.buffer = this.buffers[this.labels[i]];

        var fade = audioContext.createGain();

        src.connect(fade);
        fade.connect(this.mute);

        fade.gain.value = 0;
        src.loop = true;
        src.start(audioContext.currentTime);

        this.fades.push(fade);
      }

      this.gain.gain.value = 0;
      this.mute.gain.value = 0;
      this.master.gain.value = 1;

      this.fadeToNewSound(-1);
    }
  }, {
    key: 'fadeToNewSound',
    value: function fadeToNewSound(index) {
      var now = audioContext.currentTime;
      for (var i = 0; i < this.labels.length; i++) {
        var currentValue = this.fades[i].gain.value;
        this.fades[i].gain.cancelScheduledValues(now);
        this.fades[i].gain.setValueAtTime(currentValue, now);
        this.fades[i].gain.linearRampToValueAtTime(0, now + this._fadeOutTime);
      }

      if (index > -1 && index < this.labels.length) {
        var _currentValue = this.fades[index].gain.value;
        this.fades[index].gain.cancelScheduledValues(now);
        this.fades[index].gain.setValueAtTime(_currentValue, now);
        this.fades[index].gain.linearRampToValueAtTime(1, now + this._fadeInTime);
      }
    }
  }, {
    key: 'enableSounds',
    value: function enableSounds(onOff) {
      var now = audioContext.currentTime;
      var val = onOff ? 1.0 : 0;
      var currentValue = this.mute.gain.value;
      this.mute.gain.cancelScheduledValues(now);
      this.mute.gain.setValueAtTime(currentValue, now);
      this.mute.gain.linearRampToValueAtTime(val, now + 1);
    }
  }, {
    key: 'setMasterVolume',
    value: function setMasterVolume(volVal) {
      this.master.gain.setValueAtTime(volVal, audioContext.currentTime);
    }
  }, {
    key: 'setGainFromIntensity',
    value: function setGainFromIntensity(value) {
      var eventValue = this.mvAvrg.filter(value);
      var minIn = 0.;
      var maxIn = 5.;
      var minOut = 0;
      var maxOut = 1;
      var factor = 1.;
      var scaledVal = this._scaleValue(eventValue, minIn, maxIn, minOut, maxOut);

      this.gain.gain.value = this._clip(scaledVal, 0, 1);
    }
  }, {
    key: '_scaleValue',
    value: function _scaleValue(val, minIn, maxIn, minOut, maxOut) {
      var factor = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
      var sigmoid = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

      var scaledVal = void 0;

      if (sigmoid || factor !== 1) {
        scaledVal = this._scale(val, minIn, maxIn, 0, 1);

        if (sigmoid) {
          scaledVal = scaledVal * Math.PI + Math.PI; // map to [ PI ; 2PI ]
          scaledVal = Math.cos(scaledVal); // sigmoid from -1 to 1
          scaledVal = (scaledVal + 1) * 0.5; // remap to [ 0 ; 1 ]
        }

        if (factor !== 1) {
          scaledVal = Math.pow(scaledVal, factor); // apply pow factor
        }

        return this._scale(scaledVal, 0, 1, minOut, maxOut);
      } else {
        return this._scale(val, minIn, maxIn, minOut, maxOut);
      }
    }
  }, {
    key: '_scale',
    value: function _scale(val, minIn, maxIn, minOut, maxOut) {
      var a = (maxOut - minOut) / (maxIn - minIn);
      var b = maxOut - a * maxIn;
      return a * val + b;
    }
  }, {
    key: '_clip',
    value: function _clip(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }
  }]);
  return AudioEngine;
}();

exports.default = AudioEngine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvRW5naW5lLmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJhdWRpb0NvbnRleHQiLCJNdkF2cmciLCJ2YWx1ZSIsImF2Z0ZpbHRlclNpemUiLCJhdmdGaWx0ZXIiLCJpIiwicHVzaCIsImZpbHRlckluZGV4IiwiZmlsdGVyZWRWYWx1ZSIsIkF1ZGlvRW5naW5lIiwiY2xhc3NlcyIsIl9mYWRlSW5UaW1lIiwiX2ZhZGVPdXRUaW1lIiwibGFiZWxzIiwiYnVmZmVycyIsIm1hc3RlciIsImNyZWF0ZUdhaW4iLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJnYWluIiwibXV0ZSIsIm12QXZyZyIsImZhZGVzIiwibGVuZ3RoIiwic3JjIiwiY3JlYXRlQnVmZmVyU291cmNlIiwiYnVmZmVyIiwiZmFkZSIsImxvb3AiLCJzdGFydCIsImN1cnJlbnRUaW1lIiwiZmFkZVRvTmV3U291bmQiLCJpbmRleCIsIm5vdyIsImN1cnJlbnRWYWx1ZSIsImNhbmNlbFNjaGVkdWxlZFZhbHVlcyIsInNldFZhbHVlQXRUaW1lIiwibGluZWFyUmFtcFRvVmFsdWVBdFRpbWUiLCJvbk9mZiIsInZhbCIsInZvbFZhbCIsImV2ZW50VmFsdWUiLCJmaWx0ZXIiLCJtaW5JbiIsIm1heEluIiwibWluT3V0IiwibWF4T3V0IiwiZmFjdG9yIiwic2NhbGVkVmFsIiwiX3NjYWxlVmFsdWUiLCJfY2xpcCIsInNpZ21vaWQiLCJfc2NhbGUiLCJNYXRoIiwiUEkiLCJjb3MiLCJwb3ciLCJhIiwiYiIsIm1pbiIsIm1heCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7Ozs7OztBQUVaLElBQU1DLGVBQWVELFdBQVdDLFlBQWhDOztBQUVBOztJQUNNQyxNO0FBQ0wsb0JBQWM7QUFBQTs7QUFDYixTQUFLQyxLQUFMLEdBQWEsQ0FBYjtBQUNFLFNBQUtDLGFBQUwsR0FBcUIsRUFBckI7QUFDRixTQUFLQyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsU0FBSyxJQUFJ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Ozs7O2tCQXRIa0JuRCxXIiwiZmlsZSI6IkF1ZGlvRW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuXG4vLyBzaW1wbGUgbW92aW5nIGF2ZXJhZ2UgZmlsdGVyIHRvIHNtb290aCBlbmVyZ3kgaW5wdXRcbmNsYXNzIE12QXZyZ3tcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5hdmdGaWx0ZXJTaXplID0gMjA7XG5cdFx0dGhpcy5hdmdGaWx0ZXIgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXZnRmlsdGVyU2l6ZTsgaSsrKSB7XG5cdFx0XHR0aGlzLmF2Z0ZpbHRlci5wdXNoKDApO1xuXHRcdH1cblx0XHR0aGlzLmZpbHRlckluZGV4ID0gMDtcblx0fVxuXG5cdGZpbHRlcih2YWx1ZSkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0XHQvLyBhcHBseSBmaWx0ZXIgb24gdGhlIHRpbWUgcHJvZ3Jlc3Npb24gOlxuXHRcdHRoaXMuYXZnRmlsdGVyW3RoaXMuZmlsdGVySW5kZXhdID0gdmFsdWU7XG5cdFx0bGV0IGZpbHRlcmVkVmFsdWUgPSAwO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hdmdGaWx0ZXJTaXplOyBpKyspIHtcblx0XHRcdGZpbHRlcmVkVmFsdWUgKz0gdGhpcy5hdmdGaWx0ZXJbaV07XG5cdFx0fVxuXHRcdGZpbHRlcmVkVmFsdWUgLz0gdGhpcy5hdmdGaWx0ZXJTaXplO1xuXHRcdHRoaXMuZmlsdGVySW5kZXggPSAodGhpcy5maWx0ZXJJbmRleCArIDEpICUgdGhpcy5hdmdGaWx0ZXJTaXplO1xuXHRcdHJldHVybiBmaWx0ZXJlZFZhbHVlO1xuXHR9XG5cblx0cmVzZXQoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmF2Z0ZpbHRlclNpemU7IGkrKykge1xuXHRcdFx0dGhpcy5hdmdGaWx0ZXJbaV0gPSB0aGlzLnZhbHVlO1xuXHRcdH1cdFx0XG5cdH1cbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09IHRoZSBhdWRpbyBlbmdpbmUgY2xhc3MgOiA9PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9FbmdpbmUge1xuXHRjb25zdHJ1Y3RvcihjbGFzc2VzKSB7XG5cdFx0dGhpcy5fZmFkZUluVGltZSA9IDAuNTtcbiAgICB0aGlzLl9mYWRlT3V0VGltZSA9IDE7XG5cbiAgICB0aGlzLmxhYmVscyA9IE9iamVjdC5rZXlzKGNsYXNzZXMpO1xuICAgIHRoaXMuYnVmZmVycyA9IGNsYXNzZXM7XG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLm1hc3RlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5tYXN0ZXIuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgdGhpcy5nYWluID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLmdhaW4uY29ubmVjdCh0aGlzLm1hc3Rlcik7XG5cbiAgICB0aGlzLm11dGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMubXV0ZS5jb25uZWN0KHRoaXMuZ2Fpbik7XG5cbiAgICB0aGlzLm12QXZyZyA9IG5ldyBNdkF2cmcoKTtcblx0fVxuXG5cdHN0YXJ0KCkge1xuICAgIHRoaXMuZmFkZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgXHRjb25zdCBzcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgXHRzcmMuYnVmZmVyID0gdGhpcy5idWZmZXJzW3RoaXMubGFiZWxzW2ldXTtcblxuICAgIFx0Y29uc3QgZmFkZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG5cbiAgICBcdHNyYy5jb25uZWN0KGZhZGUpO1xuICAgIFx0ZmFkZS5jb25uZWN0KHRoaXMubXV0ZSk7XG5cbiAgICBcdGZhZGUuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgXHRzcmMubG9vcCA9IHRydWU7XG4gICAgXHRzcmMuc3RhcnQoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcblxuICAgIFx0dGhpcy5mYWRlcy5wdXNoKGZhZGUpO1xuICAgIH1cblxuICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gMDtcbiAgICB0aGlzLm11dGUuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgdGhpcy5tYXN0ZXIuZ2Fpbi52YWx1ZSA9IDE7XG5cbiAgICB0aGlzLmZhZGVUb05ld1NvdW5kKC0xKTtcblx0fVxuXG4gIGZhZGVUb05ld1NvdW5kKGluZGV4KSB7XG4gICAgY29uc3Qgbm93ID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRoaXMuZmFkZXNbaV0uZ2Fpbi52YWx1ZTtcbiAgICAgIHRoaXMuZmFkZXNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMobm93KVxuICAgICAgdGhpcy5mYWRlc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGN1cnJlbnRWYWx1ZSwgbm93KTtcbiAgICAgIHRoaXMuZmFkZXNbaV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBub3cgKyB0aGlzLl9mYWRlT3V0VGltZSk7XG4gICAgfVxuXG4gICAgaWYgKGluZGV4ID4gLTEgJiYgaW5kZXggPCB0aGlzLmxhYmVscy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRoaXMuZmFkZXNbaW5kZXhdLmdhaW4udmFsdWU7XG4gICAgICB0aGlzLmZhZGVzW2luZGV4XS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhub3cpICAgICAgICBcbiAgICAgIHRoaXMuZmFkZXNbaW5kZXhdLmdhaW4uc2V0VmFsdWVBdFRpbWUoY3VycmVudFZhbHVlLCBub3cpO1xuICAgICAgdGhpcy5mYWRlc1tpbmRleF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCBub3cgKyB0aGlzLl9mYWRlSW5UaW1lKTtcbiAgICB9XG4gIH1cblxuICBlbmFibGVTb3VuZHMob25PZmYpIHtcbiAgICBjb25zdCBub3cgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgY29uc3QgdmFsID0gb25PZmYgPyAxLjAgOiAwO1xuICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRoaXMubXV0ZS5nYWluLnZhbHVlO1xuICAgIHRoaXMubXV0ZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhub3cpO1xuICAgIHRoaXMubXV0ZS5nYWluLnNldFZhbHVlQXRUaW1lKGN1cnJlbnRWYWx1ZSwgbm93KTtcbiAgICB0aGlzLm11dGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWwsIG5vdyArIDEpO1xuICB9XG5cbiAgc2V0TWFzdGVyVm9sdW1lKHZvbFZhbCkge1xuICBcdHRoaXMubWFzdGVyLmdhaW4uc2V0VmFsdWVBdFRpbWUodm9sVmFsLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICB9XG5cbiAgc2V0R2FpbkZyb21JbnRlbnNpdHkodmFsdWUpIHtcbiAgICBjb25zdCBldmVudFZhbHVlID0gdGhpcy5tdkF2cmcuZmlsdGVyKHZhbHVlKTtcbiAgICBjb25zdCBtaW5JbiA9IDAuO1xuICAgIGNvbnN0IG1heEluID0gNS47XG4gICAgY29uc3QgbWluT3V0ID0gMDtcbiAgICBjb25zdCBtYXhPdXQgPSAxO1xuICAgIGNvbnN0IGZhY3RvciA9IDEuO1xuICAgIGxldCBzY2FsZWRWYWwgPSB0aGlzLl9zY2FsZVZhbHVlKGV2ZW50VmFsdWUsIG1pbkluLCBtYXhJbiwgbWluT3V0LCBtYXhPdXQpO1xuXG4gICAgdGhpcy5nYWluLmdhaW4udmFsdWUgPSB0aGlzLl9jbGlwKHNjYWxlZFZhbCwgMCwgMSk7XG4gIH1cblxuICBfc2NhbGVWYWx1ZSh2YWwsIG1pbkluLCBtYXhJbiwgbWluT3V0LCBtYXhPdXQsIGZhY3RvciA9IDEsIHNpZ21vaWQgPSBmYWxzZSkge1xuICAgIGxldCBzY2FsZWRWYWw7XG5cbiAgICBpZiAoc2lnbW9pZCB8fCBmYWN0b3IgIT09IDEpIHtcbiAgICAgIHNjYWxlZFZhbCA9IHRoaXMuX3NjYWxlKHZhbCwgbWluSW4sIG1heEluLCAwLCAxKTtcblxuICAgICAgaWYgKHNpZ21vaWQpIHtcbiAgICAgICAgc2NhbGVkVmFsID0gc2NhbGVkVmFsICogTWF0aC5QSSArIE1hdGguUEk7IC8vIG1hcCB0byBbIFBJIDsgMlBJIF1cbiAgICAgICAgc2NhbGVkVmFsID0gTWF0aC5jb3Moc2NhbGVkVmFsKTsgLy8gc2lnbW9pZCBmcm9tIC0xIHRvIDFcbiAgICAgICAgc2NhbGVkVmFsID0gKHNjYWxlZFZhbCArIDEpICogMC41OyAvLyByZW1hcCB0byBbIDAgOyAxIF1cbiAgICAgIH1cblxuICAgICAgaWYgKGZhY3RvciAhPT0gMSkge1xuICAgICAgICBzY2FsZWRWYWwgPSBNYXRoLnBvdyhzY2FsZWRWYWwsIGZhY3Rvcik7IC8vIGFwcGx5IHBvdyBmYWN0b3JcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3NjYWxlKHNjYWxlZFZhbCwgMCwgMSwgbWluT3V0LCBtYXhPdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2NhbGUodmFsLCBtaW5JbiwgbWF4SW4sIG1pbk91dCwgbWF4T3V0KTtcbiAgICB9IFxuICB9XG5cbiAgX3NjYWxlKHZhbCwgbWluSW4sIG1heEluLCBtaW5PdXQsIG1heE91dCkge1xuICAgIGNvbnN0IGEgPSAobWF4T3V0IC0gbWluT3V0KSAvIChtYXhJbiAtIG1pbkluKTtcbiAgICBjb25zdCBiID0gbWF4T3V0IC0gYSAqIG1heEluO1xuICAgIHJldHVybiBhICogdmFsICsgYjtcbiAgfVxuXG4gIF9jbGlwKHZhbCwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsLCBtaW4pLCBtYXgpO1xuICB9XG59Il19