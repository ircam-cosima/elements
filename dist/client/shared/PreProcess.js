'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _client = require('waves-lfo/client');

var lfo = _interopRequireWildcard(_client);

var _FeaturizerLfo = require('./FeaturizerLfo');

var _FeaturizerLfo2 = _interopRequireDefault(_FeaturizerLfo);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PreProcess = function () {
  function PreProcess(intensityCallback) {
    (0, _classCallCheck3.default)(this, PreProcess);

    //--------------------------------- LFO's --------------------------------//
    this._devicemotionIn = new lfo.source.EventIn({
      frameType: 'vector',
      frameSize: 6,
      frameRate: 1, //this.motionInput.period doesn't seem available anymore
      description: ['accX', 'accY', 'accZ', 'gyrAlpha', 'gyrBeta', 'gyrGamma']
    });
    this._featurizer = new _FeaturizerLfo2.default({
      descriptors: ['accRaw', 'accIntensity']
      // descriptors: [ 'accRaw', 'gyrZcr', 'accIntensity' ],
      // gyrZcrNoiseThresh: 0.01,
      // gyrZcrFrameSize: 100,
      // gyrZcrHopSize: 10,
      // callback: this._intensityCallback
    });
    this._selectInput = new lfo.operator.Select({ indices: [0, 1, 2] });
    this._selectAccIntensity = new lfo.operator.Select({ index: 3 });
    this._intensityBridge = new lfo.sink.Bridge({
      processFrame: intensityCallback // the constructor's argument
    });

    this._devicemotionIn.connect(this._featurizer);

    this._featurizer.connect(this._selectInput);
    // this._selectInput.connect(this._xmmDecoder);

    this._featurizer.connect(this._selectAccIntensity);
    this._selectAccIntensity.connect(this._intensityBridge);
  }

  (0, _createClass3.default)(PreProcess, [{
    key: 'connect',
    value: function connect(targetLfo) {
      this._selectInput.connect(targetLfo);
    }
  }, {
    key: 'start',
    value: function start() {
      this._devicemotionIn.start();
    }
  }, {
    key: 'process',
    value: function process(time, values) {
      this._devicemotionIn.process(time, values);
    }
  }]);
  return PreProcess;
}();

exports.default = PreProcess;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByZVByb2Nlc3MuanMiXSwibmFtZXMiOlsibGZvIiwiUHJlUHJvY2VzcyIsImludGVuc2l0eUNhbGxiYWNrIiwiX2RldmljZW1vdGlvbkluIiwic291cmNlIiwiRXZlbnRJbiIsImZyYW1lVHlwZSIsImZyYW1lU2l6ZSIsImZyYW1lUmF0ZSIsImRlc2NyaXB0aW9uIiwiX2ZlYXR1cml6ZXIiLCJkZXNjcmlwdG9ycyIsIl9zZWxlY3RJbnB1dCIsIm9wZXJhdG9yIiwiU2VsZWN0IiwiaW5kaWNlcyIsIl9zZWxlY3RBY2NJbnRlbnNpdHkiLCJpbmRleCIsIl9pbnRlbnNpdHlCcmlkZ2UiLCJzaW5rIiwiQnJpZGdlIiwicHJvY2Vzc0ZyYW1lIiwiY29ubmVjdCIsInRhcmdldExmbyIsInN0YXJ0IiwidGltZSIsInZhbHVlcyIsInByb2Nlc3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7Ozs7Ozs7O0lBRXFCQyxVO0FBQ25CLHNCQUFZQyxpQkFBWixFQUErQjtBQUFBOztBQUM3QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUIsSUFBSUgsSUFBSUksTUFBSixDQUFXQyxPQUFmLENBQXVCO0FBQzVDQyxpQkFBVyxRQURpQztBQUU1Q0MsaUJBQVcsQ0FGaUM7QUFHNUNDLGlCQUFXLENBSGlDLEVBRy9CO0FBQ2JDLG1CQUFhLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsVUFBekIsRUFBcUMsU0FBckMsRUFBZ0QsVUFBaEQ7QUFKK0IsS0FBdkIsQ0FBdkI7QUFNQSxTQUFLQyxXQUFMLEdBQW1CLDRCQUFrQjtBQUNuQ0MsbUJBQWEsQ0FBRSxRQUFGLEVBQVksY0FBWjtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFObUMsS0FBbEIsQ0FBbkI7QUFRQSxTQUFLQyxZQUFMLEdBQW9CLElBQUlaLElBQUlhLFFBQUosQ0FBYUMsTUFBakIsQ0FBd0IsRUFBRUMsU0FBUyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFYLEVBQXhCLENBQXBCO0FBQ0EsU0FBS0MsbUJBQUwsR0FBMkIsSUFBSWhCLElBQUlhLFFBQUosQ0FBYUMsTUFBakIsQ0FBd0IsRUFBRUcsT0FBTyxDQUFULEVBQXhCLENBQTNCO0FBQ0EsU0FBS0MsZ0JBQUwsR0FBd0IsSUFBSWxCLElBQUltQixJQUFKLENBQVNDLE1BQWIsQ0FBb0I7QUFDMUNDLG9CQUFjbkIsaUJBRDRCLENBQ1Y7QUFEVSxLQUFwQixDQUF4Qjs7QUFJQSxTQUFLQyxlQUFMLENBQXFCbUIsT0FBckIsQ0FBNkIsS0FBS1osV0FBbEM7O0FBRUEsU0FBS0EsV0FBTCxDQUFpQlksT0FBakIsQ0FBeUIsS0FBS1YsWUFBOUI7QUFDQTs7QUFFQSxTQUFLRixXQUFMLENBQWlCWSxPQUFqQixDQUF5QixLQUFLTixtQkFBOUI7QUFDQSxTQUFLQSxtQkFBTCxDQUF5Qk0sT0FBekIsQ0FBaUMsS0FBS0osZ0JBQXRDO0FBQ0Q7Ozs7NEJBRU9LLFMsRUFBVztBQUNqQixXQUFLWCxZQUFMLENBQWtCVSxPQUFsQixDQUEwQkMsU0FBMUI7QUFDRDs7OzRCQUVPO0FBQ04sV0FBS3BCLGVBQUwsQ0FBcUJxQixLQUFyQjtBQUNEOzs7NEJBRU9DLEksRUFBTUMsTSxFQUFRO0FBQ3BCLFdBQUt2QixlQUFMLENBQXFCd0IsT0FBckIsQ0FBNkJGLElBQTdCLEVBQW1DQyxNQUFuQztBQUNEOzs7OztrQkExQ2tCekIsVSIsImZpbGUiOiJQcmVQcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0IEZlYXR1cml6ZXJMZm8gZnJvbSAnLi9GZWF0dXJpemVyTGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlUHJvY2VzcyB7XG4gIGNvbnN0cnVjdG9yKGludGVuc2l0eUNhbGxiYWNrKSB7XG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gTEZPJ3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgIHRoaXMuX2RldmljZW1vdGlvbkluID0gbmV3IGxmby5zb3VyY2UuRXZlbnRJbih7XG4gICAgICBmcmFtZVR5cGU6ICd2ZWN0b3InLFxuICAgICAgZnJhbWVTaXplOiA2LFxuICAgICAgZnJhbWVSYXRlOiAxLC8vdGhpcy5tb3Rpb25JbnB1dC5wZXJpb2QgZG9lc24ndCBzZWVtIGF2YWlsYWJsZSBhbnltb3JlXG4gICAgICBkZXNjcmlwdGlvbjogWydhY2NYJywgJ2FjY1knLCAnYWNjWicsICdneXJBbHBoYScsICdneXJCZXRhJywgJ2d5ckdhbW1hJ11cbiAgICB9KTtcbiAgICB0aGlzLl9mZWF0dXJpemVyID0gbmV3IEZlYXR1cml6ZXJMZm8oe1xuICAgICAgZGVzY3JpcHRvcnM6IFsgJ2FjY1JhdycsICdhY2NJbnRlbnNpdHknIF0sXG4gICAgICAvLyBkZXNjcmlwdG9yczogWyAnYWNjUmF3JywgJ2d5clpjcicsICdhY2NJbnRlbnNpdHknIF0sXG4gICAgICAvLyBneXJaY3JOb2lzZVRocmVzaDogMC4wMSxcbiAgICAgIC8vIGd5clpjckZyYW1lU2l6ZTogMTAwLFxuICAgICAgLy8gZ3lyWmNySG9wU2l6ZTogMTAsXG4gICAgICAvLyBjYWxsYmFjazogdGhpcy5faW50ZW5zaXR5Q2FsbGJhY2tcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RJbnB1dCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kaWNlczogWzAsIDEsIDJdIH0pO1xuICAgIHRoaXMuX3NlbGVjdEFjY0ludGVuc2l0eSA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDMgfSk7XG4gICAgdGhpcy5faW50ZW5zaXR5QnJpZGdlID0gbmV3IGxmby5zaW5rLkJyaWRnZSh7XG4gICAgICBwcm9jZXNzRnJhbWU6IGludGVuc2l0eUNhbGxiYWNrIC8vIHRoZSBjb25zdHJ1Y3RvcidzIGFyZ3VtZW50XG4gICAgfSk7XG5cbiAgICB0aGlzLl9kZXZpY2Vtb3Rpb25Jbi5jb25uZWN0KHRoaXMuX2ZlYXR1cml6ZXIpO1xuXG4gICAgdGhpcy5fZmVhdHVyaXplci5jb25uZWN0KHRoaXMuX3NlbGVjdElucHV0KTtcbiAgICAvLyB0aGlzLl9zZWxlY3RJbnB1dC5jb25uZWN0KHRoaXMuX3htbURlY29kZXIpO1xuXG4gICAgdGhpcy5fZmVhdHVyaXplci5jb25uZWN0KHRoaXMuX3NlbGVjdEFjY0ludGVuc2l0eSk7XG4gICAgdGhpcy5fc2VsZWN0QWNjSW50ZW5zaXR5LmNvbm5lY3QodGhpcy5faW50ZW5zaXR5QnJpZGdlKTtcbiAgfVxuXG4gIGNvbm5lY3QodGFyZ2V0TGZvKSB7XG4gICAgdGhpcy5fc2VsZWN0SW5wdXQuY29ubmVjdCh0YXJnZXRMZm8pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5fZGV2aWNlbW90aW9uSW4uc3RhcnQoKTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgdmFsdWVzKSB7XG4gICAgdGhpcy5fZGV2aWNlbW90aW9uSW4ucHJvY2Vzcyh0aW1lLCB2YWx1ZXMpO1xuICB9XG59Il19