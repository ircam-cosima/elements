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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiUGxheWVyRXhwZXJpZW5jZSIsImNsaWVudFR5cGUiLCJjaGVja2luIiwicmVxdWlyZSIsInNoYXJlZENvbmZpZyIsImF1ZGlvQnVmZmVyTWFuYWdlciIsImNsaWVudCIsImJyb2FkY2FzdCIsInR5cGUiLCJnZXRNb2RlbHMiLCJlcnIiLCJtb2RlbHMiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O0FBQ0E7O0lBRXFCQSxnQjs7O0FBQ25CLDRCQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBQUEsMEpBQ2hCQSxVQURnQjs7QUFHdEIsVUFBS0MsT0FBTCxHQUFlLE1BQUtDLE9BQUwsQ0FBYSxTQUFiLENBQWY7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLE1BQUtELE9BQUwsQ0FBYSxlQUFiLENBQXBCO0FBQ0EsVUFBS0Usa0JBQUwsR0FBMEIsTUFBS0YsT0FBTCxDQUFhLHNCQUFiLENBQTFCO0FBTHNCO0FBTXZCOzs7OzRCQUVPLENBQUU7OzswQkFFSkcsTSxFQUFRO0FBQUE7O0FBQ1osc0pBQVlBLE1BQVo7QUFDQTtBQUNBLFdBQUtDLFNBQUwsQ0FBZUQsT0FBT0UsSUFBdEIsRUFBNEJGLE1BQTVCLEVBQW9DLE9BQXBDOztBQUVBLGdDQUFnQkcsU0FBaEIsQ0FBMEIsVUFBQ0MsR0FBRCxFQUFNQyxNQUFOLEVBQWlCO0FBQ3pDLGVBQUtDLElBQUwsQ0FBVU4sTUFBVixFQUFrQixRQUFsQixFQUE0QkssTUFBNUI7QUFDRCxPQUZEO0FBR0Q7Ozt5QkFFSUwsTSxFQUFRO0FBQ1gscUpBQVdBLE1BQVg7QUFDQTtBQUNBLFdBQUtDLFNBQUwsQ0FBZUQsT0FBT0UsSUFBdEIsRUFBNEJGLE1BQTVCLEVBQW9DLFNBQXBDO0FBQ0Q7Ozs7O2tCQXpCa0JOLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuaW1wb3J0IE1vZGVsc1JldHJpZXZlciBmcm9tICcuL3NoYXJlZC9Nb2RlbHNSZXRyaWV2ZXInO1xuLy8gaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyRXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcihjbGllbnRUeXBlKSB7XG4gICAgc3VwZXIoY2xpZW50VHlwZSk7XG5cbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nKTtcbiAgICB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuICAgIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicpO1xuICB9XG5cbiAgc3RhcnQoKSB7fVxuXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG4gICAgLy8gc2VuZCBhICdoZWxsbycgbWVzc2FnZSB0byBhbGwgdGhlIG90aGVyIGNsaWVudHMgb2YgdGhlIHNhbWUgdHlwZVxuICAgIHRoaXMuYnJvYWRjYXN0KGNsaWVudC50eXBlLCBjbGllbnQsICdoZWxsbycpO1xuXG4gICAgTW9kZWxzUmV0cmlldmVyLmdldE1vZGVscygoZXJyLCBtb2RlbHMpID0+IHtcbiAgICAgIHRoaXMuc2VuZChjbGllbnQsICdtb2RlbHMnLCBtb2RlbHMpO1xuICAgIH0pO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG4gICAgLy8gc2VuZCBhICdnb29kYnllJyBtZXNzYWdlIHRvIGFsbCB0aGUgb3RoZXIgY2xpZW50cyBvZiB0aGUgc2FtZSB0eXBlXG4gICAgdGhpcy5icm9hZGNhc3QoY2xpZW50LnR5cGUsIGNsaWVudCwgJ2dvb2RieWUnKTtcbiAgfVxufVxuIl19