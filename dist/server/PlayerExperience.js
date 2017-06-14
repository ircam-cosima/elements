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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

      var modelPath = './public/exports/models/';
      var models = {};
      _fs2.default.readdir(modelPath, function (err, files) {
        if (!files) {
          _this2.send(client, 'models', null);
          return;
        }

        files.forEach(function (file) {
          if (file !== '.DS_Store' && file !== 'Thumbs.db') {
            var modelName = file.split('Model.json')[0];
            models[modelName] = JSON.parse(_fs2.default.readFileSync(modelPath + file));
          }
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiUGxheWVyRXhwZXJpZW5jZSIsImNsaWVudFR5cGUiLCJjaGVja2luIiwicmVxdWlyZSIsInNoYXJlZENvbmZpZyIsImF1ZGlvQnVmZmVyTWFuYWdlciIsImNsaWVudCIsImJyb2FkY2FzdCIsInR5cGUiLCJtb2RlbFBhdGgiLCJtb2RlbHMiLCJyZWFkZGlyIiwiZXJyIiwiZmlsZXMiLCJzZW5kIiwiZm9yRWFjaCIsImZpbGUiLCJtb2RlbE5hbWUiLCJzcGxpdCIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7OztJQUVxQkEsZ0I7OztBQUNuQiw0QkFBWUMsVUFBWixFQUF3QjtBQUFBOztBQUFBLDBKQUNoQkEsVUFEZ0I7O0FBR3RCLFVBQUtDLE9BQUwsR0FBZSxNQUFLQyxPQUFMLENBQWEsU0FBYixDQUFmO0FBQ0EsVUFBS0MsWUFBTCxHQUFvQixNQUFLRCxPQUFMLENBQWEsZUFBYixDQUFwQjtBQUNBLFVBQUtFLGtCQUFMLEdBQTBCLE1BQUtGLE9BQUwsQ0FBYSxzQkFBYixDQUExQjtBQUxzQjtBQU12Qjs7Ozs0QkFFTyxDQUFFOzs7MEJBRUpHLE0sRUFBUTtBQUFBOztBQUNaLHNKQUFZQSxNQUFaO0FBQ0E7QUFDQSxXQUFLQyxTQUFMLENBQWVELE9BQU9FLElBQXRCLEVBQTRCRixNQUE1QixFQUFvQyxPQUFwQzs7QUFFQSxVQUFNRyxZQUFZLDBCQUFsQjtBQUNBLFVBQU1DLFNBQVMsRUFBZjtBQUNBLG1CQUFHQyxPQUFILENBQVdGLFNBQVgsRUFBc0IsVUFBQ0csR0FBRCxFQUFNQyxLQUFOLEVBQWdCO0FBQ3BDLFlBQUksQ0FBQ0EsS0FBTCxFQUFZO0FBQ1YsaUJBQUtDLElBQUwsQ0FBVVIsTUFBVixFQUFrQixRQUFsQixFQUE0QixJQUE1QjtBQUNBO0FBQ0Q7O0FBRURPLGNBQU1FLE9BQU4sQ0FBYyxnQkFBUTtBQUNwQixjQUFJQyxTQUFTLFdBQVQsSUFBd0JBLFNBQVMsV0FBckMsRUFBa0Q7QUFDaEQsZ0JBQU1DLFlBQVlELEtBQUtFLEtBQUwsQ0FBVyxZQUFYLEVBQXlCLENBQXpCLENBQWxCO0FBQ0FSLG1CQUFPTyxTQUFQLElBQW9CRSxLQUFLQyxLQUFMLENBQVcsYUFBR0MsWUFBSCxDQUFnQlosWUFBWU8sSUFBNUIsQ0FBWCxDQUFwQjtBQUNEO0FBQ0YsU0FMRDtBQU1BLGVBQUtGLElBQUwsQ0FBVVIsTUFBVixFQUFrQixRQUFsQixFQUE0QkksTUFBNUI7QUFDRCxPQWJEO0FBY0Q7Ozt5QkFFSUosTSxFQUFRO0FBQ1gscUpBQVdBLE1BQVg7QUFDQTtBQUNBLFdBQUtDLFNBQUwsQ0FBZUQsT0FBT0UsSUFBdEIsRUFBNEJGLE1BQTVCLEVBQW9DLFNBQXBDO0FBQ0Q7Ozs7O2tCQXRDa0JOLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyRXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcihjbGllbnRUeXBlKSB7XG4gICAgc3VwZXIoY2xpZW50VHlwZSk7XG5cbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nKTtcbiAgICB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuICAgIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicpO1xuICB9XG5cbiAgc3RhcnQoKSB7fVxuXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG4gICAgLy8gc2VuZCBhICdoZWxsbycgbWVzc2FnZSB0byBhbGwgdGhlIG90aGVyIGNsaWVudHMgb2YgdGhlIHNhbWUgdHlwZVxuICAgIHRoaXMuYnJvYWRjYXN0KGNsaWVudC50eXBlLCBjbGllbnQsICdoZWxsbycpO1xuXG4gICAgY29uc3QgbW9kZWxQYXRoID0gJy4vcHVibGljL2V4cG9ydHMvbW9kZWxzLyc7XG4gICAgY29uc3QgbW9kZWxzID0ge307XG4gICAgZnMucmVhZGRpcihtb2RlbFBhdGgsIChlcnIsIGZpbGVzKSA9PiB7XG4gICAgICBpZiAoIWZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2VuZChjbGllbnQsICdtb2RlbHMnLCBudWxsKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICBpZiAoZmlsZSAhPT0gJy5EU19TdG9yZScgJiYgZmlsZSAhPT0gJ1RodW1icy5kYicpIHtcbiAgICAgICAgICBjb25zdCBtb2RlbE5hbWUgPSBmaWxlLnNwbGl0KCdNb2RlbC5qc29uJylbMF07XG4gICAgICAgICAgbW9kZWxzW21vZGVsTmFtZV0gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhtb2RlbFBhdGggKyBmaWxlKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5zZW5kKGNsaWVudCwgJ21vZGVscycsIG1vZGVscyk7XG4gICAgfSk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcbiAgICAvLyBzZW5kIGEgJ2dvb2RieWUnIG1lc3NhZ2UgdG8gYWxsIHRoZSBvdGhlciBjbGllbnRzIG9mIHRoZSBzYW1lIHR5cGVcbiAgICB0aGlzLmJyb2FkY2FzdChjbGllbnQudHlwZSwgY2xpZW50LCAnZ29vZGJ5ZScpO1xuICB9XG59XG4iXX0=