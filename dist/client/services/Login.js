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

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SERVICE_ID = 'service:login';
var LOCAL_STORAGE_KEY = 'soundworks:' + SERVICE_ID;

/*
const viewTemplate = `
<% if (!logged) { %>
	<div class="section-top flex-middle">
    <p><%= instructions %></p>
  </div>
  <div class="section-center flex-center">
    <div>
      <input type="text" id="username" />
      <button class="btn" id="login"><%= login %></button>
    </div>
  </div>
  <div class="section-bottom"></div>
<% } else { %>
  <div class="section-top flex-middle">
    <p><%= welcomeMessage %><%= userName %></p>
  </div>
  <div class="section-center flex-center">
    <div>
      <button class="btn" id="confirm"><%= confirm %></button>
      <button class="btn" id="logout"><%= logout %></button>
    </div>
  </div>
  <div class="section-bottom"></div>
<% } %>`;

const viewModel = {
	instructions: 'Enter your user name',
	login : 'Log in',
	welcomeMessage: 'Logged in as ',
	userName: null,
  confirm: 'Confirm',
	logout: 'Log out',
	logged: false
};
//*/

/**
 * Interface for the client `login` service
 *
 * works in conjunction with the datastorage service
 * uses localStorage to check if the client is already logged in
 * if so, displays a welcome message
 * if not, provides a text input to specifiy a user name
 * if the user name doesn't already exist in the database, automatically creates a new entry
 * not secure : several users can be connected simultaneously using the same user name
 */

var Login = function (_Service) {
  (0, _inherits3.default)(Login, _Service);

  function Login(options) {
    (0, _classCallCheck3.default)(this, Login);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Login.__proto__ || (0, _getPrototypeOf2.default)(Login)).call(this, SERVICE_ID, true));

    var defaults = {
      viewPriority: 100
    };

    _this.configure(defaults);

    _this.platform = _this.require('platform', { features: ['web-audio'] });
    _this.checkin = _this.require('checkin');

    _this._username = null;

    _this._onLoginResponse = _this._onLoginResponse.bind(_this);
    _this._onLoginConfirmed = _this._onLoginConfirmed.bind(_this);
    _this._onLogoutResponse = _this._onLogoutResponse.bind(_this);

    _this._login = _this._login.bind(_this);
    _this._confirm = _this._confirm.bind(_this);
    _this._logout = _this._logout.bind(_this);
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Login, [{
    key: 'init',
    value: function init() {}
    // console.log('login init');


    /** @private */

  }, {
    key: 'start',
    value: function start() {
      (0, _get3.default)(Login.prototype.__proto__ || (0, _getPrototypeOf2.default)(Login.prototype), 'start', this).call(this);

      this.view.setLoginCallback(this._login);
      this.view.setConfirmCallback(this._confirm);
      this.view.setLogoutCallback(this._logout);

      this.receive('login', this._onLoginResponse);
      this.receive('confirm', this._onLoginConfirmed);
      this.receive('logout', this._onLogoutResponse);

      var storedUsername = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (storedUsername !== null) {
        this.view.model.logged = true;
        this.view.model.username = storedUsername;
        this._username = storedUsername;
      } else {
        this.view.model.logged = false;
        this.view.model.username = null;
      }

      this.show();
    }

    /** @private */

  }, {
    key: 'stop',
    value: function stop() {
      (0, _get3.default)(Login.prototype.__proto__ || (0, _getPrototypeOf2.default)(Login.prototype), 'stop', this).call(this);

      this.removeListener('login', this._onLoginResponse);
      this.removeListener('confirm', this._onLoginConfirmed);
      this.removeListener('logout', this._onLogoutResponse);

      this.hide();
    }
  }, {
    key: 'getUsername',
    value: function getUsername() {
      return localStorage.getItem(LOCAL_STORAGE_KEY);
    }
  }, {
    key: '_login',
    value: function _login(username) {
      this.send('login', username);
    }
  }, {
    key: '_confirm',
    value: function _confirm() {
      this.send('confirm', this._username);
    }
  }, {
    key: '_logout',
    value: function _logout() {
      this.send('logout', this._username);
    }
  }, {
    key: '_onLoginResponse',
    value: function _onLoginResponse(username) {
      this._username = username;
      localStorage.setItem(LOCAL_STORAGE_KEY, username);
      this.view.model.username = username;
      this.view.model.logged = true;
      this.view.render();
    }
  }, {
    key: '_onLoginConfirmed',
    value: function _onLoginConfirmed(username) {
      this.ready();
    }
  }, {
    key: '_onLogoutResponse',
    value: function _onLogoutResponse(username) {
      this._username = null;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      this.view.model.username = null;
      this.view.model.logged = false;
      this.view.render();
    }
  }]);
  return Login;
}(_client.Service);

_client.serviceManager.register(SERVICE_ID, Login);

exports.default = Login;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZ2luLmpzIl0sIm5hbWVzIjpbIlNFUlZJQ0VfSUQiLCJMT0NBTF9TVE9SQUdFX0tFWSIsIkxvZ2luIiwib3B0aW9ucyIsImRlZmF1bHRzIiwidmlld1ByaW9yaXR5IiwiY29uZmlndXJlIiwicGxhdGZvcm0iLCJyZXF1aXJlIiwiZmVhdHVyZXMiLCJjaGVja2luIiwiX3VzZXJuYW1lIiwiX29uTG9naW5SZXNwb25zZSIsImJpbmQiLCJfb25Mb2dpbkNvbmZpcm1lZCIsIl9vbkxvZ291dFJlc3BvbnNlIiwiX2xvZ2luIiwiX2NvbmZpcm0iLCJfbG9nb3V0IiwidmlldyIsInNldExvZ2luQ2FsbGJhY2siLCJzZXRDb25maXJtQ2FsbGJhY2siLCJzZXRMb2dvdXRDYWxsYmFjayIsInJlY2VpdmUiLCJzdG9yZWRVc2VybmFtZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJtb2RlbCIsImxvZ2dlZCIsInVzZXJuYW1lIiwic2hvdyIsInJlbW92ZUxpc3RlbmVyIiwiaGlkZSIsInNlbmQiLCJzZXRJdGVtIiwicmVuZGVyIiwicmVhZHkiLCJyZW1vdmVJdGVtIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUEsSUFBTUEsYUFBYSxlQUFuQjtBQUNBLElBQU1DLG9DQUFrQ0QsVUFBeEM7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQ0E7Ozs7Ozs7Ozs7O0lBV01FLEs7OztBQUNMLGlCQUFZQyxPQUFaLEVBQXFCO0FBQUE7O0FBQUEsb0lBQ2RILFVBRGMsRUFDRixJQURFOztBQUdwQixRQUFNSSxXQUFXO0FBQ2hCQyxvQkFBYztBQURFLEtBQWpCOztBQUlBLFVBQUtDLFNBQUwsQ0FBZUYsUUFBZjs7QUFFRSxVQUFLRyxRQUFMLEdBQWdCLE1BQUtDLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLEVBQUVDLFVBQVUsQ0FBQyxXQUFELENBQVosRUFBekIsQ0FBaEI7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VTtBQUMzQixXQUFLbEIsU0FBTCxHQUFpQixJQUFqQjtBQUNFYyxtQkFBYVksVUFBYixDQUF3QnBDLGlCQUF4QjtBQUNBLFdBQUtrQixJQUFMLENBQVVRLEtBQVYsQ0FBZ0JFLFFBQWhCLEdBQTJCLElBQTNCO0FBQ0EsV0FBS1YsSUFBTCxDQUFVUSxLQUFWLENBQWdCQyxNQUFoQixHQUF5QixLQUF6QjtBQUNBLFdBQUtULElBQUwsQ0FBVWdCLE1BQVY7QUFDRjs7Ozs7QUFHRix1QkFBZUcsUUFBZixDQUF3QnRDLFVBQXhCLEVBQW9DRSxLQUFwQzs7a0JBRWVBLEsiLCJmaWxlIjoiTG9naW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZXJ2aWNlLCBTZWdtZW50ZWRWaWV3LCBzZXJ2aWNlTWFuYWdlciB9IGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuY29uc3QgU0VSVklDRV9JRCA9ICdzZXJ2aWNlOmxvZ2luJztcbmNvbnN0IExPQ0FMX1NUT1JBR0VfS0VZID0gYHNvdW5kd29ya3M6JHtTRVJWSUNFX0lEfWA7XG5cbi8qXG5jb25zdCB2aWV3VGVtcGxhdGUgPSBgXG48JSBpZiAoIWxvZ2dlZCkgeyAlPlxuXHQ8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj5cbiAgICA8cD48JT0gaW5zdHJ1Y3Rpb25zICU+PC9wPlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPGRpdj5cbiAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPVwidXNlcm5hbWVcIiAvPlxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiIGlkPVwibG9naW5cIj48JT0gbG9naW4gJT48L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuPCUgfSBlbHNlIHsgJT5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgPHA+PCU9IHdlbGNvbWVNZXNzYWdlICU+PCU9IHVzZXJOYW1lICU+PC9wPlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgPGRpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIiBpZD1cImNvbmZpcm1cIj48JT0gY29uZmlybSAlPjwvYnV0dG9uPlxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiIGlkPVwibG9nb3V0XCI+PCU9IGxvZ291dCAlPjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG48JSB9ICU+YDtcblxuY29uc3Qgdmlld01vZGVsID0ge1xuXHRpbnN0cnVjdGlvbnM6ICdFbnRlciB5b3VyIHVzZXIgbmFtZScsXG5cdGxvZ2luIDogJ0xvZyBpbicsXG5cdHdlbGNvbWVNZXNzYWdlOiAnTG9nZ2VkIGluIGFzICcsXG5cdHVzZXJOYW1lOiBudWxsLFxuICBjb25maXJtOiAnQ29uZmlybScsXG5cdGxvZ291dDogJ0xvZyBvdXQnLFxuXHRsb2dnZWQ6IGZhbHNlXG59O1xuLy8qL1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGNsaWVudCBgbG9naW5gIHNlcnZpY2VcbiAqXG4gKiB3b3JrcyBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZSBkYXRhc3RvcmFnZSBzZXJ2aWNlXG4gKiB1c2VzIGxvY2FsU3RvcmFnZSB0byBjaGVjayBpZiB0aGUgY2xpZW50IGlzIGFscmVhZHkgbG9nZ2VkIGluXG4gKiBpZiBzbywgZGlzcGxheXMgYSB3ZWxjb21lIG1lc3NhZ2VcbiAqIGlmIG5vdCwgcHJvdmlkZXMgYSB0ZXh0IGlucHV0IHRvIHNwZWNpZml5IGEgdXNlciBuYW1lXG4gKiBpZiB0aGUgdXNlciBuYW1lIGRvZXNuJ3QgYWxyZWFkeSBleGlzdCBpbiB0aGUgZGF0YWJhc2UsIGF1dG9tYXRpY2FsbHkgY3JlYXRlcyBhIG5ldyBlbnRyeVxuICogbm90IHNlY3VyZSA6IHNldmVyYWwgdXNlcnMgY2FuIGJlIGNvbm5lY3RlZCBzaW11bHRhbmVvdXNseSB1c2luZyB0aGUgc2FtZSB1c2VyIG5hbWVcbiAqL1xuXG5jbGFzcyBMb2dpbiBleHRlbmRzIFNlcnZpY2Uge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0c3VwZXIoU0VSVklDRV9JRCwgdHJ1ZSk7XG5cblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdHZpZXdQcmlvcml0eTogMTAwLFxuXHRcdH07XG5cblx0XHR0aGlzLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG5cbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJ10gfSk7XG4gICAgdGhpcy5jaGVja2luID0gdGhpcy5yZXF1aXJlKCdjaGVja2luJyk7XG5cbiAgICB0aGlzLl91c2VybmFtZSA9IG51bGw7XG5cbiAgICB0aGlzLl9vbkxvZ2luUmVzcG9uc2UgPSB0aGlzLl9vbkxvZ2luUmVzcG9uc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkxvZ2luQ29uZmlybWVkID0gdGhpcy5fb25Mb2dpbkNvbmZpcm1lZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTG9nb3V0UmVzcG9uc2UgPSB0aGlzLl9vbkxvZ291dFJlc3BvbnNlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9sb2dpbiA9IHRoaXMuX2xvZ2luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY29uZmlybSA9IHRoaXMuX2NvbmZpcm0uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9sb2dvdXQgPSB0aGlzLl9sb2dvdXQuYmluZCh0aGlzKTtcblx0fVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuXHRpbml0KCkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdsb2dpbiBpbml0Jyk7XG5cdH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIHRoaXMudmlldy5zZXRMb2dpbkNhbGxiYWNrKHRoaXMuX2xvZ2luKTtcbiAgICB0aGlzLnZpZXcuc2V0Q29uZmlybUNhbGxiYWNrKHRoaXMuX2NvbmZpcm0pO1xuICAgIHRoaXMudmlldy5zZXRMb2dvdXRDYWxsYmFjayh0aGlzLl9sb2dvdXQpO1xuXG4gICAgdGhpcy5yZWNlaXZlKCdsb2dpbicsIHRoaXMuX29uTG9naW5SZXNwb25zZSk7XG4gICAgdGhpcy5yZWNlaXZlKCdjb25maXJtJywgdGhpcy5fb25Mb2dpbkNvbmZpcm1lZCk7XG4gICAgdGhpcy5yZWNlaXZlKCdsb2dvdXQnLCB0aGlzLl9vbkxvZ291dFJlc3BvbnNlKTtcblxuICAgIGNvbnN0IHN0b3JlZFVzZXJuYW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVkpO1xuXG4gICAgaWYgKHN0b3JlZFVzZXJuYW1lICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnZpZXcubW9kZWwubG9nZ2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMudmlldy5tb2RlbC51c2VybmFtZSA9IHN0b3JlZFVzZXJuYW1lO1xuICAgICAgdGhpcy5fdXNlcm5hbWUgPSBzdG9yZWRVc2VybmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52aWV3Lm1vZGVsLmxvZ2dlZCA9IGZhbHNlO1xuICAgICAgdGhpcy52aWV3Lm1vZGVsLnVzZXJuYW1lID0gbnVsbDsgIFxuICAgIH1cblxuICAgIHRoaXMuc2hvdygpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHN0b3AoKSB7XG4gIFx0c3VwZXIuc3RvcCgpO1xuXG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcignbG9naW4nLCB0aGlzLl9vbkxvZ2luUmVzcG9uc2UpO1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2NvbmZpcm0nLCB0aGlzLl9vbkxvZ2luQ29uZmlybWVkKTtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdsb2dvdXQnLCB0aGlzLl9vbkxvZ291dFJlc3BvbnNlKTtcblxuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgZ2V0VXNlcm5hbWUoKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKExPQ0FMX1NUT1JBR0VfS0VZKTtcbiAgfVxuXG5cdF9sb2dpbih1c2VybmFtZSkge1xuXHRcdHRoaXMuc2VuZCgnbG9naW4nLCB1c2VybmFtZSk7XG5cdH1cblxuICBfY29uZmlybSgpIHtcbiAgICB0aGlzLnNlbmQoJ2NvbmZpcm0nLCB0aGlzLl91c2VybmFtZSk7XG4gIH1cblxuXHRfbG9nb3V0KCkge1xuXHRcdHRoaXMuc2VuZCgnbG9nb3V0JywgdGhpcy5fdXNlcm5hbWUpO1xuXHR9XG5cblx0X29uTG9naW5SZXNwb25zZSh1c2VybmFtZSkge1xuICAgIHRoaXMuX3VzZXJuYW1lID0gdXNlcm5hbWU7XG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oTE9DQUxfU1RPUkFHRV9LRVksIHVzZXJuYW1lKTtcbiAgICB0aGlzLnZpZXcubW9kZWwudXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgICB0aGlzLnZpZXcubW9kZWwubG9nZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG5cdH1cblxuICBfb25Mb2dpbkNvbmZpcm1lZCh1c2VybmFtZSkge1xuICAgIHRoaXMucmVhZHkoKTtcbiAgfVxuXG5cdF9vbkxvZ291dFJlc3BvbnNlKHVzZXJuYW1lKSB7XG5cdFx0dGhpcy5fdXNlcm5hbWUgPSBudWxsO1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1NUT1JBR0VfS0VZKTtcbiAgICB0aGlzLnZpZXcubW9kZWwudXNlcm5hbWUgPSBudWxsO1xuICAgIHRoaXMudmlldy5tb2RlbC5sb2dnZWQgPSBmYWxzZTtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCk7XG5cdH1cbn1cblxuc2VydmljZU1hbmFnZXIucmVnaXN0ZXIoU0VSVklDRV9JRCwgTG9naW4pO1xuXG5leHBvcnQgZGVmYXVsdCBMb2dpbjtcbiJdfQ==