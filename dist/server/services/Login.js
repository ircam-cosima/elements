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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:login';

var Login = function (_Service) {
  (0, _inherits3.default)(Login, _Service);

  function Login() {
    (0, _classCallCheck3.default)(this, Login);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Login.__proto__ || (0, _getPrototypeOf2.default)(Login)).call(this, SERVICE_ID));

    var defaults = {};
    _this.configure(defaults);

    _this.checkin = _this.require('checkin');
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Login, [{
    key: 'configure',
    value: function configure(options) {
      (0, _get3.default)(Login.prototype.__proto__ || (0, _getPrototypeOf2.default)(Login.prototype), 'configure', this).call(this, options);
    }

    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Login.prototype.__proto__ || (0, _getPrototypeOf2.default)(Login.prototype), 'start', this).call(this);
    }

    /** @private */

  }, {
    key: 'connect',
    value: function connect(client) {
      (0, _get3.default)(Login.prototype.__proto__ || (0, _getPrototypeOf2.default)(Login.prototype), 'connect', this).call(this, client);
      client.activities['service:login'] = { username: null };
      this.receive(client, 'login', this._onLogin(client));
      this.receive(client, 'confirm', this._onConfirm(client));
      this.receive(client, 'logout', this._onLogout(client));
    }

    /** @private */

  }, {
    key: '_onLogin',
    value: function _onLogin(client) {
      var _this2 = this;

      return function (username) {
        // check if user exists in db if needed
        _this2.send(client, 'login', username);
      };
    }

    /** @private */

  }, {
    key: '_onConfirm',
    value: function _onConfirm(client) {
      var _this3 = this;

      return function (username) {
        client.activities['service:login'].username = username;
        _this3.send(client, 'confirm', username);
      };
    }

    /** @private */

  }, {
    key: '_onLogout',
    value: function _onLogout(client) {
      var _this4 = this;

      return function (username) {
        client.activities['service:login'].username = null;
        _this4.send(client, 'logout', username);
      };
    }
  }]);
  return Login;
}(_server.Service);

_server.serviceManager.register(SERVICE_ID, Login);

exports.default = Login;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZ2luLmpzIl0sIm5hbWVzIjpbIlNFUlZJQ0VfSUQiLCJMb2dpbiIsImRlZmF1bHRzIiwiY29uZmlndXJlIiwiY2hlY2tpbiIsInJlcXVpcmUiLCJvcHRpb25zIiwiY2xpZW50IiwiYWN0aXZpdGllcyIsInVzZXJuYW1lIiwicmVjZWl2ZSIsIl9vbkxvZ2luIiwiX29uQ29uZmlybSIsIl9vbkxvZ291dCIsInNlbmQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQSxJQUFNQSxhQUFhLGVBQW5COztJQUVNQyxLOzs7QUFDTCxtQkFBYztBQUFBOztBQUFBLG9JQUNMRCxVQURLOztBQUdYLFFBQU1FLFdBQVcsRUFBakI7QUFDQSxVQUFLQyxTQUFMLENBQWVELFFBQWY7O0FBRUEsVUFBS0UsT0FBTCxHQUFlLE1BQUtDLE9BQUwsQ0FBYSxTQUFiLENBQWY7QUFOVztBQU9iOztBQUVBOzs7Ozs4QkFDVUMsTyxFQUFTO0FBQ2pCLG9JQUFnQkEsT0FBaEI7QUFDRDs7QUFFRDs7Ozs0QkFDUTtBQUNOO0FBQ0Q7O0FBRUQ7Ozs7NEJBQ1FDLE0sRUFBUTtBQUNmLGtJQUFjQSxNQUFkO0FBQ0FBLGFBQU9DLFVBQVAsQ0FBa0IsZUFBbEIsSUFBcUMsRUFBRUMsVUFBVSxJQUFaLEVBQXJDO0FBQ0MsV0FBS0MsT0FBTCxDQUFhSCxNQUFiLEVBQXFCLE9BQXJCLEVBQThCLEtBQUtJLFFBQUwsQ0FBY0osTUFBZCxDQUE5QjtBQUNBLFdBQUtHLE9BQUwsQ0FBYUgsTUFBYixFQUFxQixTQUFyQixFQUFnQyxLQUFLSyxVQUFMLENBQWdCTCxNQUFoQixDQUFoQztBQUNBLFdBQUtHLE9BQUwsQ0FBYUgsTUFBYixFQUFxQixRQUFyQixFQUErQixLQUFLTSxTQUFMLENBQWVOLE1BQWYsQ0FBL0I7QUFDRDs7QUFFRDs7Ozs2QkFDUUEsTSxFQUFRO0FBQUE7O0FBQ2hCLGFBQU8sVUFBQ0UsUUFBRCxFQUFjO0FBQ2pCO0FBQ0gsZUFBS0ssSUFBTCxDQUFVUCxNQUFWLEVBQWtCLE9BQWxCLEVBQTJCRSxRQUEzQjtBQUNBLE9BSEQ7QUFJQTs7QUFFRDs7OzsrQkFDV0YsTSxFQUFRO0FBQUE7O0FBQ2xCLGFBQU8sVUFBQ0UsUUFBRCxFQUFjO0FBQ3BCRixlQUFPQyxVQUFQLENBQWtCLGVBQWxCLEVBQW1DQyxRQUFuQyxHQUE4Q0EsUUFBOUM7QUFDQSxlQUFLSyxJQUFMLENBQVVQLE1BQVYsRUFBa0IsU0FBbEIsRUFBNkJFLFFBQTdCO0FBQ0EsT0FIRDtBQUlBOztBQUVBOzs7OzhCQUNTRixNLEVBQVE7QUFBQTs7QUFDakIsYUFBTyxVQUFDRSxRQUFELEVBQWM7QUFDcEJGLGVBQU9DLFVBQVAsQ0FBa0IsZUFBbEIsRUFBbUNDLFFBQW5DLEdBQThDLElBQTlDO0FBQ0EsZUFBS0ssSUFBTCxDQUFVUCxNQUFWLEVBQWtCLFFBQWxCLEVBQTRCRSxRQUE1QjtBQUNBLE9BSEQ7QUFJQTs7Ozs7QUFHRix1QkFBZU0sUUFBZixDQUF3QmYsVUFBeEIsRUFBb0NDLEtBQXBDOztrQkFFZUEsSyIsImZpbGUiOiJMb2dpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNlcnZpY2UsIHNlcnZpY2VNYW5hZ2VyIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuXG5jb25zdCBTRVJWSUNFX0lEID0gJ3NlcnZpY2U6bG9naW4nO1xuXG5jbGFzcyBMb2dpbiBleHRlbmRzIFNlcnZpY2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihTRVJWSUNFX0lEKTtcblxuICAgIGNvbnN0IGRlZmF1bHRzID0ge307XG4gICAgdGhpcy5jb25maWd1cmUoZGVmYXVsdHMpO1xuXG4gICAgdGhpcy5jaGVja2luID0gdGhpcy5yZXF1aXJlKCdjaGVja2luJyk7XG5cdH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgY29uZmlndXJlKG9wdGlvbnMpIHtcbiAgICBzdXBlci5jb25maWd1cmUob3B0aW9ucyk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBjb25uZWN0KGNsaWVudCkge1xuICBcdHN1cGVyLmNvbm5lY3QoY2xpZW50KTtcbiAgXHRjbGllbnQuYWN0aXZpdGllc1snc2VydmljZTpsb2dpbiddID0geyB1c2VybmFtZTogbnVsbCB9O1xuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdsb2dpbicsIHRoaXMuX29uTG9naW4oY2xpZW50KSk7XG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2NvbmZpcm0nLCB0aGlzLl9vbkNvbmZpcm0oY2xpZW50KSk7XG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2xvZ291dCcsIHRoaXMuX29uTG9nb3V0KGNsaWVudCkpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG5cdF9vbkxvZ2luKGNsaWVudCkge1xuXHRcdHJldHVybiAodXNlcm5hbWUpID0+IHtcbiAgICAgIC8vIGNoZWNrIGlmIHVzZXIgZXhpc3RzIGluIGRiIGlmIG5lZWRlZFxuXHRcdFx0dGhpcy5zZW5kKGNsaWVudCwgJ2xvZ2luJywgdXNlcm5hbWUpO1xuXHRcdH07XG5cdH1cblxuXHQvKiogQHByaXZhdGUgKi9cblx0X29uQ29uZmlybShjbGllbnQpIHtcblx0XHRyZXR1cm4gKHVzZXJuYW1lKSA9PiB7XG5cdFx0XHRjbGllbnQuYWN0aXZpdGllc1snc2VydmljZTpsb2dpbiddLnVzZXJuYW1lID0gdXNlcm5hbWU7XG5cdFx0XHR0aGlzLnNlbmQoY2xpZW50LCAnY29uZmlybScsIHVzZXJuYW1lKTtcblx0XHR9XG5cdH1cblxuICAvKiogQHByaXZhdGUgKi9cblx0X29uTG9nb3V0KGNsaWVudCkge1xuXHRcdHJldHVybiAodXNlcm5hbWUpID0+IHtcblx0XHRcdGNsaWVudC5hY3Rpdml0aWVzWydzZXJ2aWNlOmxvZ2luJ10udXNlcm5hbWUgPSBudWxsO1xuXHRcdFx0dGhpcy5zZW5kKGNsaWVudCwgJ2xvZ291dCcsIHVzZXJuYW1lKTtcblx0XHR9O1xuXHR9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIExvZ2luKTtcblxuZXhwb3J0IGRlZmF1bHQgTG9naW47Il19