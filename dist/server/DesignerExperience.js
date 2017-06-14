'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

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

var _Login = require('./services/Login');

var _ModelsRetriever = require('./shared/ModelsRetriever');

var _ModelsRetriever2 = _interopRequireDefault(_ModelsRetriever);

var _xmmNode = require('xmm-node');

var _xmmNode2 = _interopRequireDefault(_xmmNode);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// server-side 'designer' experience.
var DesignerExperience = function (_Experience) {
  (0, _inherits3.default)(DesignerExperience, _Experience);

  function DesignerExperience(clientType) {
    (0, _classCallCheck3.default)(this, DesignerExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DesignerExperience.__proto__ || (0, _getPrototypeOf2.default)(DesignerExperience)).call(this, clientType));

    _this.checkin = _this.require('checkin');
    _this.sharedConfig = _this.require('shared-config');
    _this.audioBufferManager = _this.require('audio-buffer-manager');
    _this.login = _this.require('login');

    _this.xmms = new _map2.default();
    return _this;
  }

  (0, _createClass3.default)(DesignerExperience, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'enter',
    value: function enter(client) {
      (0, _get3.default)(DesignerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerExperience.prototype), 'enter', this).call(this, client);

      this._getModel(client);

      this.receive(client, 'configuration', this._onNewConfig(client));
      this.receive(client, 'phrase', this._onNewPhrase(client));
      this.receive(client, 'clear', this._onClearOperation(client));
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(DesignerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerExperience.prototype), 'exit', this).call(this, client);
    }
  }, {
    key: '_getModel',
    value: function _getModel(client) {
      var username = client.activities['service:login'].username;

      var set = {};
      try {
        set = JSON.parse(_fs2.default.readFileSync('./public/exports/sets/' + username + 'TrainingSet.json', 'utf-8'));
      } catch (e) {
        if (e.code === 'ENOENT') {
          // no file found, do nothing (let _updateModelAndSet do its job)
        } else throw e;
      }

      var config = {};
      try {
        config = JSON.parse(_fs2.default.readFileSync('./public/exports/configs/' + username + 'ModelConfig.json', 'utf-8'));
      } catch (e) {
        if (e.code === 'ENOENT') {
          // do nothing
        } else throw e;
      }

      this.xmms[client] = new _xmmNode2.default(config.states ? 'hhmm' : 'gmm', config);
      this.xmms[client].setTrainingSet(set);
      this._updateModelAndSet(client);
    }
  }, {
    key: '_onNewPhrase',
    value: function _onNewPhrase(client) {
      var _this2 = this;

      return function (args) {
        var phrase = args.data;
        _this2.xmms[client].addPhrase(phrase);
        _this2._updateModelAndSet(client);
      };
    }
  }, {
    key: '_onNewConfig',
    value: function _onNewConfig(client) {
      var _this3 = this;

      return function (args) {
        var type = args.type;
        var config = args.config;
        var trainingSet = _this3.xmms[client].getTrainingSet();

        _this3.xmms[client] = new _xmmNode2.default(type, config);
        _this3.xmms[client].setTrainingSet(trainingSet);
        _this3._updateModelAndSet(client);
      };
    }
  }, {
    key: '_onClearOperation',
    value: function _onClearOperation(client) {
      var _this4 = this;

      return function (args) {
        var cmd = args.cmd;

        switch (cmd) {
          case 'label':
            {
              _this4.xmms[client].removePhrasesOfLabel(args.data);
            }
            break;

          case 'model':
            {
              _this4.xmms[client].clearTrainingSet();
            }
            break;

          default:
            break;
        }

        _this4._updateModelAndSet(client);
      };
    }
  }, {
    key: '_updateModelAndSet',
    value: function _updateModelAndSet(client) {
      var _this5 = this;

      var username = client.activities['service:login'].username;

      this.xmms[client].train(function (err, model) {
        _fs2.default.writeFileSync('./public/exports/sets/' + username + 'TrainingSet.json', (0, _stringify2.default)(_this5.xmms[client].getTrainingSet(), null, 2), 'utf-8');

        _fs2.default.writeFileSync('./public/exports/configs/' + username + 'ModelConfig.json', (0, _stringify2.default)(_this5.xmms[client].getConfig(), null, 2), 'utf-8');

        _fs2.default.writeFileSync('./public/exports/models/' + username + 'Model.json', (0, _stringify2.default)(_this5.xmms[client].getModel(), null, 2), 'utf-8');

        _this5.send(client, 'model', model);

        _ModelsRetriever2.default.getModels(function (err, models) {
          _this5.broadcast('player', null, 'models', models);
        });
      });
    }
  }]);
  return DesignerExperience;
}(_server.Experience);

exports.default = DesignerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJEZXNpZ25lckV4cGVyaWVuY2UiLCJjbGllbnRUeXBlIiwiY2hlY2tpbiIsInJlcXVpcmUiLCJzaGFyZWRDb25maWciLCJhdWRpb0J1ZmZlck1hbmFnZXIiLCJsb2dpbiIsInhtbXMiLCJjbGllbnQiLCJfZ2V0TW9kZWwiLCJyZWNlaXZlIiwiX29uTmV3Q29uZmlnIiwiX29uTmV3UGhyYXNlIiwiX29uQ2xlYXJPcGVyYXRpb24iLCJ1c2VybmFtZSIsImFjdGl2aXRpZXMiLCJzZXQiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlIiwiY29kZSIsImNvbmZpZyIsInN0YXRlcyIsInNldFRyYWluaW5nU2V0IiwiX3VwZGF0ZU1vZGVsQW5kU2V0IiwiYXJncyIsInBocmFzZSIsImRhdGEiLCJhZGRQaHJhc2UiLCJ0eXBlIiwidHJhaW5pbmdTZXQiLCJnZXRUcmFpbmluZ1NldCIsImNtZCIsInJlbW92ZVBocmFzZXNPZkxhYmVsIiwiY2xlYXJUcmFpbmluZ1NldCIsInRyYWluIiwiZXJyIiwibW9kZWwiLCJ3cml0ZUZpbGVTeW5jIiwiZ2V0Q29uZmlnIiwiZ2V0TW9kZWwiLCJzZW5kIiwiZ2V0TW9kZWxzIiwibW9kZWxzIiwiYnJvYWRjYXN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7SUFDcUJBLGtCOzs7QUFDbkIsOEJBQVlDLFVBQVosRUFBd0I7QUFBQTs7QUFBQSw4SkFDaEJBLFVBRGdCOztBQUd0QixVQUFLQyxPQUFMLEdBQWUsTUFBS0MsT0FBTCxDQUFhLFNBQWIsQ0FBZjtBQUNBLFVBQUtDLFlBQUwsR0FBb0IsTUFBS0QsT0FBTCxDQUFhLGVBQWIsQ0FBcEI7QUFDQSxVQUFLRSxrQkFBTCxHQUEwQixNQUFLRixPQUFMLENBQWEsc0JBQWIsQ0FBMUI7QUFD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bGUiOiJEZXNpZ25lckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuaW1wb3J0IHsgTG9naW4gfSBmcm9tICcuL3NlcnZpY2VzL0xvZ2luJztcbmltcG9ydCBNb2RlbHNSZXRyaWV2ZXIgZnJvbSAnLi9zaGFyZWQvTW9kZWxzUmV0cmlldmVyJztcbmltcG9ydCB4bW0gZnJvbSAneG1tLW5vZGUnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuLy8gc2VydmVyLXNpZGUgJ2Rlc2lnbmVyJyBleHBlcmllbmNlLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVzaWduZXJFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcbiAgICBzdXBlcihjbGllbnRUeXBlKTtcblxuICAgIHRoaXMuY2hlY2tpbiA9IHRoaXMucmVxdWlyZSgnY2hlY2tpbicpO1xuICAgIHRoaXMuc2hhcmVkQ29uZmlnID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtY29uZmlnJyk7XG4gICAgdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIgPSB0aGlzLnJlcXVpcmUoJ2F1ZGlvLWJ1ZmZlci1tYW5hZ2VyJyk7XG4gICAgdGhpcy5sb2dpbiA9IHRoaXMucmVxdWlyZSgnbG9naW4nKTtcblxuICAgIHRoaXMueG1tcyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIHN0YXJ0KCkge31cblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgdGhpcy5fZ2V0TW9kZWwoY2xpZW50KTtcblxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdjb25maWd1cmF0aW9uJywgdGhpcy5fb25OZXdDb25maWcoY2xpZW50KSk7XG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ3BocmFzZScsIHRoaXMuX29uTmV3UGhyYXNlKGNsaWVudCkpO1xuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdjbGVhcicsIHRoaXMuX29uQ2xlYXJPcGVyYXRpb24oY2xpZW50KSk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcbiAgfVxuXG4gIF9nZXRNb2RlbChjbGllbnQpIHtcbiAgICBjb25zdCB1c2VybmFtZSA9IGNsaWVudC5hY3Rpdml0aWVzWydzZXJ2aWNlOmxvZ2luJ10udXNlcm5hbWU7XG5cbiAgICBsZXQgc2V0ID0ge307XG4gICAgdHJ5IHtcbiAgICAgIHNldCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFxuICAgICAgICBgLi9wdWJsaWMvZXhwb3J0cy9zZXRzLyR7dXNlcm5hbWV9VHJhaW5pbmdTZXQuanNvbmAsXG4gICAgICAgICd1dGYtOCdcbiAgICAgICkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIC8vIG5vIGZpbGUgZm91bmQsIGRvIG5vdGhpbmcgKGxldCBfdXBkYXRlTW9kZWxBbmRTZXQgZG8gaXRzIGpvYilcbiAgICAgIH0gZWxzZSB0aHJvdyBlO1xuICAgIH1cblxuICAgIGxldCBjb25maWcgPSB7fTtcbiAgICB0cnkge1xuICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoXG4gICAgICAgIGAuL3B1YmxpYy9leHBvcnRzL2NvbmZpZ3MvJHt1c2VybmFtZX1Nb2RlbENvbmZpZy5qc29uYCxcbiAgICAgICAgJ3V0Zi04J1xuICAgICAgKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgfSBlbHNlIHRocm93IGU7XG4gICAgfVxuXG4gICAgdGhpcy54bW1zW2NsaWVudF0gPSBuZXcgeG1tKGNvbmZpZy5zdGF0ZXMgPyAnaGhtbScgOiAnZ21tJywgY29uZmlnKVxuICAgIHRoaXMueG1tc1tjbGllbnRdLnNldFRyYWluaW5nU2V0KHNldCk7XG4gICAgdGhpcy5fdXBkYXRlTW9kZWxBbmRTZXQoY2xpZW50KTtcbiAgfVxuXG4gIF9vbk5ld1BocmFzZShjbGllbnQpIHtcbiAgICByZXR1cm4gKGFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IHBocmFzZSA9IGFyZ3MuZGF0YTtcbiAgICAgIHRoaXMueG1tc1tjbGllbnRdLmFkZFBocmFzZShwaHJhc2UpO1xuICAgICAgdGhpcy5fdXBkYXRlTW9kZWxBbmRTZXQoY2xpZW50KTtcbiAgICB9XG4gIH1cblxuICBfb25OZXdDb25maWcoY2xpZW50KSB7XG4gICAgcmV0dXJuIChhcmdzKSA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gYXJncy50eXBlO1xuICAgICAgY29uc3QgY29uZmlnID0gYXJncy5jb25maWc7XG4gICAgICBjb25zdCB0cmFpbmluZ1NldCA9IHRoaXMueG1tc1tjbGllbnRdLmdldFRyYWluaW5nU2V0KCk7XG5cbiAgICAgIHRoaXMueG1tc1tjbGllbnRdID0gbmV3IHhtbSh0eXBlLCBjb25maWcpO1xuICAgICAgdGhpcy54bW1zW2NsaWVudF0uc2V0VHJhaW5pbmdTZXQodHJhaW5pbmdTZXQpO1xuICAgICAgdGhpcy5fdXBkYXRlTW9kZWxBbmRTZXQoY2xpZW50KTtcbiAgICB9O1xuICB9XG5cbiAgX29uQ2xlYXJPcGVyYXRpb24oY2xpZW50KSB7XG4gICAgcmV0dXJuIChhcmdzKSA9PiB7XG4gICAgICBjb25zdCBjbWQgPSBhcmdzLmNtZDtcblxuICAgICAgc3dpdGNoIChjbWQpIHtcbiAgICAgICAgY2FzZSAnbGFiZWwnOiB7XG4gICAgICAgICAgdGhpcy54bW1zW2NsaWVudF0ucmVtb3ZlUGhyYXNlc09mTGFiZWwoYXJncy5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdtb2RlbCc6IHtcbiAgICAgICAgICB0aGlzLnhtbXNbY2xpZW50XS5jbGVhclRyYWluaW5nU2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3VwZGF0ZU1vZGVsQW5kU2V0KGNsaWVudCk7XG4gICAgfTtcbiAgfVxuXG4gIF91cGRhdGVNb2RlbEFuZFNldChjbGllbnQpIHtcbiAgICBjb25zdCB1c2VybmFtZSA9IGNsaWVudC5hY3Rpdml0aWVzWydzZXJ2aWNlOmxvZ2luJ10udXNlcm5hbWU7XG5cbiAgICB0aGlzLnhtbXNbY2xpZW50XS50cmFpbigoZXJyLCBtb2RlbCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICBgLi9wdWJsaWMvZXhwb3J0cy9zZXRzLyR7dXNlcm5hbWV9VHJhaW5pbmdTZXQuanNvbmAsXG4gICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy54bW1zW2NsaWVudF0uZ2V0VHJhaW5pbmdTZXQoKSwgbnVsbCwgMiksXG4gICAgICAgJ3V0Zi04J1xuICAgICAgKTtcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICBgLi9wdWJsaWMvZXhwb3J0cy9jb25maWdzLyR7dXNlcm5hbWV9TW9kZWxDb25maWcuanNvbmAsXG4gICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy54bW1zW2NsaWVudF0uZ2V0Q29uZmlnKCksIG51bGwsIDIpLFxuICAgICAgICd1dGYtOCdcbiAgICAgICk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgYC4vcHVibGljL2V4cG9ydHMvbW9kZWxzLyR7dXNlcm5hbWV9TW9kZWwuanNvbmAsXG4gICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy54bW1zW2NsaWVudF0uZ2V0TW9kZWwoKSwgbnVsbCwgMiksXG4gICAgICAgJ3V0Zi04J1xuICAgICAgKTtcblxuICAgICAgdGhpcy5zZW5kKGNsaWVudCwgJ21vZGVsJywgbW9kZWwpO1xuXG4gICAgICBNb2RlbHNSZXRyaWV2ZXIuZ2V0TW9kZWxzKChlcnIsIG1vZGVscykgPT4ge1xuICAgICAgICB0aGlzLmJyb2FkY2FzdCgncGxheWVyJywgbnVsbCwgJ21vZGVscycsIG1vZGVscyk7XG4gICAgICB9KTtcbiAgICB9KTsgICAgXG4gIH1cbn1cbiJdfQ==