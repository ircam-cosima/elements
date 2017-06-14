'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _server = require('soundworks/server');

var _ModelsRetriever = require('./shared/ModelsRetriever');

var _ModelsRetriever2 = _interopRequireDefault(_ModelsRetriever);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import fs from 'fs';

var PlayerExperience = function (_Experience) {
  (0, _inherits3.default)(PlayerExperience, _Experience);

  function PlayerExperience(clientType) {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this, clientType));

    _this.checkin = _this.require('checkin');
    _this.sharedConfig = _this.require('shared-config');
    _this.audioBufferManager = _this.require('audio-buffer-manager');
    return _this;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'enter',
    value: function enter(client) {
      var _this2 = this;

      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'enter', this).call(this, client);
      // send a 'hello' message to all the other clients of the same type
      this.broadcast(client.type, client, 'hello');

      // const modelPath = './public/exports/models/';
      // const models = {};
      // fs.readdir(modelPath, (err, files) => {
      //   if (!files) {
      //     this.send(client, 'models', null);
      //     return;
      //   }

      //   files.forEach(file => {
      //     if (file !== '.DS_Store' && file !== 'Thumbs.db') {
      //       const modelName = file.split('Model.json')[0];
      //       models[modelName] = JSON.parse(fs.readFileSync(modelPath + file));
      //     }
      //   });
      //   this.send(client, 'models', models);
      // });

      _ModelsRetriever2.default.getModels(function (err, models) {
        _this2.send(client, 'models', models);
      });
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'exit', this).call(this, client);
      // send a 'goodbye' message to all the other clients of the same type
      this.broadcast(client.type, client, 'goodbye');
    }
  }]);
  return PlayerExperience;
}(_server.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiUGxheWVyRXhwZXJpZW5jZSIsImNsaWVudFR5cGUiLCJjaGVja2luIiwicmVxdWlyZSIsInNoYXJlZENvbmZpZyIsImF1ZGlvQnVmZmVyTWFuYWdlciIsImNsaWVudCIsImJyb2FkY2FzdCIsInR5cGUiLCJnZXRNb2RlbHMiLCJlcnIiLCJtb2RlbHMiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O0FBQ0E7O0lBRXFCQSxnQjs7O0FBQ25CLDRCQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBQUEsMEpBQ2hCQSxVQURnQjs7QUFHdEIsVUFBS0MsT0FBTCxHQUFlLE1BQUtDLE9BQUwsQ0FBYSxTQUFiLENBQWY7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLE1BQUtELE9BQUwsQ0FBYSxlQUFiLENBQXBCO0FBQ0EsVUFBS0Usa0JBQUwsR0FBMEIsTUFBS0YsT0FBTCxDQUFhLHNCQUFiLENBQTFCO0FBTHNCO0FBTXZCOzs7OzRCQUVPLENBQUU7OzswQkFFSkcsTSxFQUFRO0FBQUE7O0FBQ1osc0pBQVlBLE1BQVo7QUFDQTtBQUNBLFdBQUtDLFNBQUwsQ0FBZUQsT0FBT0UsSUFBdEIsRUFBNEJGLE1BQTVCLEVBQW9DLE9BQXBDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0NBQWdCRyxTQUFoQixDQUEwQixVQUFDQyxHQUFELEVBQU1DLE1BQU4sRUFBaUI7QUFDekMsZUFBS0MsSUFBTCxDQUFVTixNQUFWLEVBQWtCLFFBQWxCLEVBQTRCSyxNQUE1QjtBQUNELE9BRkQ7QUFHRDs7O3lCQUVJTCxNLEVBQVE7QUFDWCxxSkFBV0EsTUFBWDtBQUNBO0FBQ0EsV0FBS0MsU0FBTCxDQUFlRCxPQUFPRSxJQUF0QixFQUE0QkYsTUFBNUIsRUFBb0MsU0FBcEM7QUFDRDs7Ozs7a0JBMUNrQk4sZ0IiLCJmaWxlIjoiUGxheWVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV4cGVyaWVuY2UgfSBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5pbXBvcnQgTW9kZWxzUmV0cmlldmVyIGZyb20gJy4vc2hhcmVkL01vZGVsc1JldHJpZXZlcic7XG4vLyBpbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcbiAgICBzdXBlcihjbGllbnRUeXBlKTtcblxuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicpO1xuICAgIHRoaXMuc2hhcmVkQ29uZmlnID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtY29uZmlnJyk7XG4gICAgdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLWJ1ZmZlci1tYW5hZ2VyJyk7XG4gIH1cblxuICBzdGFydCgpIHt9XG5cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcbiAgICAvLyBzZW5kIGEgJ2hlbGxvJyBtZXNzYWdlIHRvIGFsbCB0aGUgb3RoZXIgY2xpZW50cyBvZiB0aGUgc2FtZSB0eXBlXG4gICAgdGhpcy5icm9hZGNhc3QoY2xpZW50LnR5cGUsIGNsaWVudCwgJ2hlbGxvJyk7XG5cbiAgICAvLyBjb25zdCBtb2RlbFBhdGggPSAnLi9wdWJsaWMvZXhwb3J0cy9tb2RlbHMvJztcbiAgICAvLyBjb25zdCBtb2RlbHMgPSB7fTtcbiAgICAvLyBmcy5yZWFkZGlyKG1vZGVsUGF0aCwgKGVyciwgZmlsZXMpID0+IHtcbiAgICAvLyAgIGlmICghZmlsZXMpIHtcbiAgICAvLyAgICAgdGhpcy5zZW5kKGNsaWVudCwgJ21vZGVscycsIG51bGwpO1xuICAgIC8vICAgICByZXR1cm47XG4gICAgLy8gICB9XG4gICAgICBcbiAgICAvLyAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgLy8gICAgIGlmIChmaWxlICE9PSAnLkRTX1N0b3JlJyAmJiBmaWxlICE9PSAnVGh1bWJzLmRiJykge1xuICAgIC8vICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGZpbGUuc3BsaXQoJ01vZGVsLmpzb24nKVswXTtcbiAgICAvLyAgICAgICBtb2RlbHNbbW9kZWxOYW1lXSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKG1vZGVsUGF0aCArIGZpbGUpKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSk7XG4gICAgLy8gICB0aGlzLnNlbmQoY2xpZW50LCAnbW9kZWxzJywgbW9kZWxzKTtcbiAgICAvLyB9KTtcblxuICAgIE1vZGVsc1JldHJpZXZlci5nZXRNb2RlbHMoKGVyciwgbW9kZWxzKSA9PiB7XG4gICAgICB0aGlzLnNlbmQoY2xpZW50LCAnbW9kZWxzJywgbW9kZWxzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuICAgIC8vIHNlbmQgYSAnZ29vZGJ5ZScgbWVzc2FnZSB0byBhbGwgdGhlIG90aGVyIGNsaWVudHMgb2YgdGhlIHNhbWUgdHlwZVxuICAgIHRoaXMuYnJvYWRjYXN0KGNsaWVudC50eXBlLCBjbGllbnQsICdnb29kYnllJyk7XG4gIH1cbn1cbiJdfQ==