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
      });
    }
  }]);
  return DesignerExperience;
}(_server.Experience);

exports.default = DesignerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJEZXNpZ25lckV4cGVyaWVuY2UiLCJjbGllbnRUeXBlIiwiY2hlY2tpbiIsInJlcXVpcmUiLCJzaGFyZWRDb25maWciLCJhdWRpb0J1ZmZlck1hbmFnZXIiLCJsb2dpbiIsInhtbXMiLCJjbGllbnQiLCJfZ2V0TW9kZWwiLCJyZWNlaXZlIiwiX29uTmV3Q29uZmlnIiwiX29uTmV3UGhyYXNlIiwiX29uQ2xlYXJPcGVyYXRpb24iLCJ1c2VybmFtZSIsImFjdGl2aXRpZXMiLCJzZXQiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlIiwiY29kZSIsImNvbmZpZyIsInN0YXRlcyIsInNldFRyYWluaW5nU2V0IiwiX3VwZGF0ZU1vZGVsQW5kU2V0IiwiYXJncyIsInBocmFzZSIsImRhdGEiLCJhZGRQaHJhc2UiLCJ0eXBlIiwidHJhaW5pbmdTZXQiLCJnZXRUcmFpbmluZ1NldCIsImNtZCIsInJlbW92ZVBocmFzZXNPZkxhYmVsIiwiY2xlYXJUcmFpbmluZ1NldCIsInRyYWluIiwiZXJyIiwibW9kZWwiLCJ3cml0ZUZpbGVTeW5jIiwiZ2V0Q29uZmlnIiwiZ2V0TW9kZWwiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBO0lBQ3FCQSxrQjs7O0FBQ25CLDhCQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBQUEsOEpBQ2hCQSxVQURnQjs7QUFHdEIsVUFBS0MsT0FBTCxHQUFlLE1BQUtDLE9BQUwsQ0FBYSxTQUFiLENBQWY7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLE1BQUtELE9BQUwsQ0FBYSxlQUFiLENBQXBCO0FBQ0EsVUFBS0Usa0JBQUwsR0FBMEIsTUFBS0YsT0FBTCxDQUFhLHNCQUFiLENBQTFCO0FBQ0EsVUFBS0csS0FBTCxHQUFhLE1BQUtILE9BQUwsQ0FBYSxPQUFiLENB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ckIsSUFBTCxDQUFVQyxNQUFWLEVBQWtCMkIsZ0JBQWxCO0FBQ0Q7QUFDRDs7QUFFQTtBQUNBO0FBWkY7O0FBZUEsZUFBS1Ysa0JBQUwsQ0FBd0JqQixNQUF4QjtBQUNELE9BbkJEO0FBb0JEOzs7dUNBRWtCQSxNLEVBQVE7QUFBQTs7QUFDekIsVUFBTU0sV0FBV04sT0FBT08sVUFBUCxDQUFrQixlQUFsQixFQUFtQ0QsUUFBcEQ7O0FBRUEsV0FBS1AsSUFBTCxDQUFVQyxNQUFWLEVBQWtCNEIsS0FBbEIsQ0FBd0IsVUFBQ0MsR0FBRCxFQUFNQyxLQUFOLEVBQWdCO0FBQ3RDLHFCQUFHQyxhQUFILDRCQUMwQnpCLFFBRDFCLHVCQUVDLHlCQUFlLE9BQUtQLElBQUwsQ0FBVUMsTUFBVixFQUFrQndCLGNBQWxCLEVBQWYsRUFBbUQsSUFBbkQsRUFBeUQsQ0FBekQsQ0FGRCxFQUdDLE9BSEQ7O0FBTUEscUJBQUdPLGFBQUgsK0JBQzZCekIsUUFEN0IsdUJBRUMseUJBQWUsT0FBS1AsSUFBTCxDQUFVQyxNQUFWLEVBQWtCZ0MsU0FBbEIsRUFBZixFQUE4QyxJQUE5QyxFQUFvRCxDQUFwRCxDQUZELEVBR0MsT0FIRDs7QUFNQSxxQkFBR0QsYUFBSCw4QkFDNEJ6QixRQUQ1QixpQkFFQyx5QkFBZSxPQUFLUCxJQUFMLENBQVVDLE1BQVYsRUFBa0JpQyxRQUFsQixFQUFmLEVBQTZDLElBQTdDLEVBQW1ELENBQW5ELENBRkQsRUFHQyxPQUhEOztBQU1BLGVBQUtDLElBQUwsQ0FBVWxDLE1BQVYsRUFBa0IsT0FBbEIsRUFBMkI4QixLQUEzQjtBQUNELE9BcEJEO0FBcUJEOzs7OztrQkEvSGtCdEMsa0IiLCJmaWxlIjoiRGVzaWduZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXhwZXJpZW5jZSB9IGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCB7IExvZ2luIH0gZnJvbSAnLi9zZXJ2aWNlcy9Mb2dpbic7XG5pbXBvcnQgeG1tIGZyb20gJ3htbS1ub2RlJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbi8vIHNlcnZlci1zaWRlICdkZXNpZ25lcicgZXhwZXJpZW5jZS5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc2lnbmVyRXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcihjbGllbnRUeXBlKSB7XG4gICAgc3VwZXIoY2xpZW50VHlwZSk7XG5cbiAgICB0aGlzLmNoZWNraW4gPSB0aGlzLnJlcXVpcmUoJ2NoZWNraW4nKTtcbiAgICB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuICAgIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicpO1xuICAgIHRoaXMubG9naW4gPSB0aGlzLnJlcXVpcmUoJ2xvZ2luJyk7XG5cbiAgICB0aGlzLnhtbXMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBzdGFydCgpIHt9XG5cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIHRoaXMuX2dldE1vZGVsKGNsaWVudCk7XG5cbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAnY29uZmlndXJhdGlvbicsIHRoaXMuX29uTmV3Q29uZmlnKGNsaWVudCkpO1xuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdwaHJhc2UnLCB0aGlzLl9vbk5ld1BocmFzZShjbGllbnQpKTtcbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAnY2xlYXInLCB0aGlzLl9vbkNsZWFyT3BlcmF0aW9uKGNsaWVudCkpO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG4gIH1cblxuICBfZ2V0TW9kZWwoY2xpZW50KSB7XG4gICAgY29uc3QgdXNlcm5hbWUgPSBjbGllbnQuYWN0aXZpdGllc1snc2VydmljZTpsb2dpbiddLnVzZXJuYW1lO1xuXG4gICAgbGV0IHNldCA9IHt9O1xuICAgIHRyeSB7XG4gICAgICBzZXQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhcbiAgICAgICAgYC4vcHVibGljL2V4cG9ydHMvc2V0cy8ke3VzZXJuYW1lfVRyYWluaW5nU2V0Lmpzb25gLFxuICAgICAgICAndXRmLTgnXG4gICAgICApKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAvLyBubyBmaWxlIGZvdW5kLCBkbyBub3RoaW5nIChsZXQgX3VwZGF0ZU1vZGVsQW5kU2V0IGRvIGl0cyBqb2IpXG4gICAgICB9IGVsc2UgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBsZXQgY29uZmlnID0ge307XG4gICAgdHJ5IHtcbiAgICAgIGNvbmZpZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFxuICAgICAgICBgLi9wdWJsaWMvZXhwb3J0cy9jb25maWdzLyR7dXNlcm5hbWV9TW9kZWxDb25maWcuanNvbmAsXG4gICAgICAgICd1dGYtOCdcbiAgICAgICkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgIH0gZWxzZSB0aHJvdyBlO1xuICAgIH1cblxuICAgIHRoaXMueG1tc1tjbGllbnRdID0gbmV3IHhtbShjb25maWcuc3RhdGVzID8gJ2hobW0nIDogJ2dtbScsIGNvbmZpZylcbiAgICB0aGlzLnhtbXNbY2xpZW50XS5zZXRUcmFpbmluZ1NldChzZXQpO1xuICAgIHRoaXMuX3VwZGF0ZU1vZGVsQW5kU2V0KGNsaWVudCk7XG4gIH1cblxuICBfb25OZXdQaHJhc2UoY2xpZW50KSB7XG4gICAgcmV0dXJuIChhcmdzKSA9PiB7XG4gICAgICBjb25zdCBwaHJhc2UgPSBhcmdzLmRhdGE7XG4gICAgICB0aGlzLnhtbXNbY2xpZW50XS5hZGRQaHJhc2UocGhyYXNlKTtcbiAgICAgIHRoaXMuX3VwZGF0ZU1vZGVsQW5kU2V0KGNsaWVudCk7XG4gICAgfVxuICB9XG5cbiAgX29uTmV3Q29uZmlnKGNsaWVudCkge1xuICAgIHJldHVybiAoYXJncykgPT4ge1xuICAgICAgY29uc3QgdHlwZSA9IGFyZ3MudHlwZTtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IGFyZ3MuY29uZmlnO1xuICAgICAgY29uc3QgdHJhaW5pbmdTZXQgPSB0aGlzLnhtbXNbY2xpZW50XS5nZXRUcmFpbmluZ1NldCgpO1xuXG4gICAgICB0aGlzLnhtbXNbY2xpZW50XSA9IG5ldyB4bW0odHlwZSwgY29uZmlnKTtcbiAgICAgIHRoaXMueG1tc1tjbGllbnRdLnNldFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KTtcbiAgICAgIHRoaXMuX3VwZGF0ZU1vZGVsQW5kU2V0KGNsaWVudCk7XG4gICAgfTtcbiAgfVxuXG4gIF9vbkNsZWFyT3BlcmF0aW9uKGNsaWVudCkge1xuICAgIHJldHVybiAoYXJncykgPT4ge1xuICAgICAgY29uc3QgY21kID0gYXJncy5jbWQ7XG5cbiAgICAgIHN3aXRjaCAoY21kKSB7XG4gICAgICAgIGNhc2UgJ2xhYmVsJzoge1xuICAgICAgICAgIHRoaXMueG1tc1tjbGllbnRdLnJlbW92ZVBocmFzZXNPZkxhYmVsKGFyZ3MuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbW9kZWwnOiB7XG4gICAgICAgICAgdGhpcy54bW1zW2NsaWVudF0uY2xlYXJUcmFpbmluZ1NldCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl91cGRhdGVNb2RlbEFuZFNldChjbGllbnQpO1xuICAgIH07XG4gIH1cblxuICBfdXBkYXRlTW9kZWxBbmRTZXQoY2xpZW50KSB7XG4gICAgY29uc3QgdXNlcm5hbWUgPSBjbGllbnQuYWN0aXZpdGllc1snc2VydmljZTpsb2dpbiddLnVzZXJuYW1lO1xuXG4gICAgdGhpcy54bW1zW2NsaWVudF0udHJhaW4oKGVyciwgbW9kZWwpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgYC4vcHVibGljL2V4cG9ydHMvc2V0cy8ke3VzZXJuYW1lfVRyYWluaW5nU2V0Lmpzb25gLFxuICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMueG1tc1tjbGllbnRdLmdldFRyYWluaW5nU2V0KCksIG51bGwsIDIpLFxuICAgICAgICd1dGYtOCdcbiAgICAgICk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgICAgYC4vcHVibGljL2V4cG9ydHMvY29uZmlncy8ke3VzZXJuYW1lfU1vZGVsQ29uZmlnLmpzb25gLFxuICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMueG1tc1tjbGllbnRdLmdldENvbmZpZygpLCBudWxsLCAyKSxcbiAgICAgICAndXRmLTgnXG4gICAgICApO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKFxuICAgICAgIGAuL3B1YmxpYy9leHBvcnRzL21vZGVscy8ke3VzZXJuYW1lfU1vZGVsLmpzb25gLFxuICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMueG1tc1tjbGllbnRdLmdldE1vZGVsKCksIG51bGwsIDIpLFxuICAgICAgICd1dGYtOCdcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuc2VuZChjbGllbnQsICdtb2RlbCcsIG1vZGVsKTtcbiAgICB9KTsgICAgXG4gIH1cbn1cbiJdfQ==