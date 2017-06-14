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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A simple canvas renderer.
 * The class renders a dot moving over the screen and rebouncing on the edges.
 */
var PlayerRenderer = function (_Canvas2dRenderer) {
  (0, _inherits3.default)(PlayerRenderer, _Canvas2dRenderer);

  function PlayerRenderer(vx, vy) {
    var collisionCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
    (0, _classCallCheck3.default)(this, PlayerRenderer);

    // update rate = 0: synchronize updates to frame rate

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerRenderer.__proto__ || (0, _getPrototypeOf2.default)(PlayerRenderer)).call(this, 0));

    _this.velocityX = vx; // px per seconds
    _this.velocityY = vy; // px per seconds

    _this.collisionCallback = collisionCallback;
    return _this;
  }

  /**
   * Initialize rederer state.
   * @param {Number} dt - time since last update in seconds.
   */


  (0, _createClass3.default)(PlayerRenderer, [{
    key: 'init',
    value: function init() {
      // set initial dot position
      if (!this.x || !this.y) {
        this.x = Math.random() * this.canvasWidth;
        this.y = Math.random() * this.canvasHeight;
      }
    }

    /**
     * Update rederer state.
     * @param {Number} dt - time since last update in seconds.
     */

  }, {
    key: 'update',
    value: function update(dt) {
      // rebounce at the edges
      if (this.x <= 0) {
        this.x = 0;
        this.velocityX *= -1;
        this.collisionCallback('left');
      } else if (this.x >= this.canvasWidth) {
        this.x = this.canvasWidth;
        this.velocityX *= -1;
        this.collisionCallback('right');
      }

      if (this.y <= 0) {
        this.y = 0;
        this.velocityY *= -1;
        this.collisionCallback('top');
      } else if (this.y >= this.canvasHeight) {
        this.y = this.canvasHeight;
        this.velocityY *= -1;
        this.collisionCallback('bottom');
      }

      // update position according to velocity
      this.x += this.velocityX * dt;
      this.y += this.velocityY * dt;
    }

    /**
     * Draw into canvas.
     * Method is called by animation frame loop in current frame rate.
     * @param {CanvasRenderingContext2D} ctx - canvas 2D rendering context
     */

  }, {
    key: 'render',
    value: function render(ctx) {
      // canvas operations
      ctx.save();
      ctx.beginPath();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    }
  }]);
  return PlayerRenderer;
}(_client.Canvas2dRenderer);

exports.default = PlayerRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllclJlbmRlcmVyLmpzIl0sIm5hbWVzIjpbIlBsYXllclJlbmRlcmVyIiwidngiLCJ2eSIsImNvbGxpc2lvbkNhbGxiYWNrIiwidmVsb2NpdHlYIiwidmVsb2NpdHlZIiwieCIsInkiLCJNYXRoIiwicmFuZG9tIiwiY2FudmFzV2lkdGgiLCJjYW52YXNIZWlnaHQiLCJkdCIsImN0eCIsInNhdmUiLCJiZWdpblBhdGgiLCJnbG9iYWxBbHBoYSIsImZpbGxTdHlsZSIsImFyYyIsIlBJIiwiZmlsbCIsImNsb3NlUGF0aCIsInJlc3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTs7OztJQUlNQSxjOzs7QUFDSiwwQkFBWUMsRUFBWixFQUFnQkMsRUFBaEIsRUFBdUQ7QUFBQSxRQUFuQ0MsaUJBQW1DLHVFQUFmLFlBQVcsQ0FBRSxDQUFFO0FBQUE7O0FBQzNDOztBQUQyQyxzSkFDL0MsQ0FEK0M7O0FBR3JELFVBQUtDLFNBQUwsR0FBaUJILEVBQWpCLENBSHFELENBR2hDO0FBQ3JCLFVBQUtJLFNBQUwsR0FBaUJILEVBQWpCLENBSnFELENBSWhDOztBQUVyQixVQUFLQyxpQkFBTCxHQUF5QkEsaUJBQXpCO0FBTnFEO0FBT3REOztBQUVEOzs7Ozs7OzsyQkFJTztBQUNMO0FBQ0EsVUFBSSxDQUFDLEtBQUtHLENBQU4sSUFBVyxDQUFDLEtBQUtDLENBQXJCLEVBQXdCO0FBQ3RCLGFBQUtELENBQUwsR0FBU0UsS0FBS0MsTUFBTCxLQUFnQixLQUFLQyxXQUE5QjtBQUNBLGFBQUtILENBQUwsR0FBU0MsS0FBS0MsTUFBTCxLQUFnQixLQUFLRSxZQUE5QjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7MkJBSU9DLEUsRUFBSTtBQUNUO0FBQ0EsVUFBSSxLQUFLTixDQUFMLElBQVUsQ0FBZCxFQUFpQjtBQUNmLGFBQUtBLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBS0YsU0FBTCxJQUFrQixDQUFDLENBQW5CO0FBQ0EsYUFBS0QsaUJBQUwsQ0FBdUIsTUFBdkI7QUFDRCxPQUpELE1BSU8sSUFBSSxLQUFLRyxDQUFMLElBQVUsS0FBS0ksV0FBbkIsRUFBZ0M7QUFDckMsYUFBS0osQ0FBTCxHQUFTLEtBQUtJLFdBQWQ7QUFDQSxhQUFLTixTQUFMLElBQWtCLENBQUMsQ0FBbkI7QUFDQSxhQUFLRCxpQkFBTCxDQUF1QixPQUF2QjtBQUNEOztBQUVELFVBQUksS0FBS0ksQ0FBTCxJQUFVLENBQWQsRUFBaUI7QUFDZixhQUFLQSxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUtGLFNBQUwsSUFBa0IsQ0FBQyxDQUFuQjtBQUNBLGFBQUtGLGlCQUFMLENBQXVCLEtBQXZCO0FBQ0QsT0FKRCxNQUlPLElBQUksS0FBS0ksQ0FBTCxJQUFVLEtBQUtJLFlBQW5CLEVBQWlDO0FBQ3RDLGFBQUtKLENBQUwsR0FBUyxLQUFLSSxZQUFkO0FBQ0EsYUFBS04sU0FBTCxJQUFrQixDQUFDLENBQW5CO0FBQ0EsYUFBS0YsaUJBQUwsQ0FBdUIsUUFBdkI7QUFDRDs7QUFFRDtBQUNBLFdBQUtHLENBQUwsSUFBVyxLQUFLRixTQUFMLEdBQWlCUSxFQUE1QjtBQUNBLFdBQUtMLENBQUwsSUFBVyxLQUFLRixTQUFMLEdBQWlCTyxFQUE1QjtBQUNEOztBQUVEOzs7Ozs7OzsyQkFLT0MsRyxFQUFLO0FBQ1Y7QUFDQUEsVUFBSUMsSUFBSjtBQUNBRCxVQUFJRSxTQUFKO0FBQ0FGLFVBQUlHLFdBQUosR0FBa0IsR0FBbEI7QUFDQUgsVUFBSUksU0FBSixHQUFnQixTQUFoQjtBQUNBSixVQUFJSyxHQUFKLENBQVEsS0FBS1osQ0FBYixFQUFnQixLQUFLQyxDQUFyQixFQUF3QixDQUF4QixFQUEyQixDQUEzQixFQUE4QkMsS0FBS1csRUFBTCxHQUFVLENBQXhDLEVBQTJDLEtBQTNDO0FBQ0FOLFVBQUlPLElBQUo7QUFDQVAsVUFBSVEsU0FBSjtBQUNBUixVQUFJUyxPQUFKO0FBQ0Q7Ozs7O2tCQUdZdEIsYyIsImZpbGUiOiJQbGF5ZXJSZW5kZXJlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhbnZhczJkUmVuZGVyZXIgfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbi8qKlxuICogQSBzaW1wbGUgY2FudmFzIHJlbmRlcmVyLlxuICogVGhlIGNsYXNzIHJlbmRlcnMgYSBkb3QgbW92aW5nIG92ZXIgdGhlIHNjcmVlbiBhbmQgcmVib3VuY2luZyBvbiB0aGUgZWRnZXMuXG4gKi9cbmNsYXNzIFBsYXllclJlbmRlcmVyIGV4dGVuZHMgQ2FudmFzMmRSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKHZ4LCB2eSwgY29sbGlzaW9uQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHt9KSB7XG4gICAgc3VwZXIoMCk7IC8vIHVwZGF0ZSByYXRlID0gMDogc3luY2hyb25pemUgdXBkYXRlcyB0byBmcmFtZSByYXRlXG5cbiAgICB0aGlzLnZlbG9jaXR5WCA9IHZ4OyAvLyBweCBwZXIgc2Vjb25kc1xuICAgIHRoaXMudmVsb2NpdHlZID0gdnk7IC8vIHB4IHBlciBzZWNvbmRzXG5cbiAgICB0aGlzLmNvbGxpc2lvbkNhbGxiYWNrID0gY29sbGlzaW9uQ2FsbGJhY2s7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSByZWRlcmVyIHN0YXRlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gZHQgLSB0aW1lIHNpbmNlIGxhc3QgdXBkYXRlIGluIHNlY29uZHMuXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIHNldCBpbml0aWFsIGRvdCBwb3NpdGlvblxuICAgIGlmICghdGhpcy54IHx8ICF0aGlzLnkpIHtcbiAgICAgIHRoaXMueCA9IE1hdGgucmFuZG9tKCkgKiB0aGlzLmNhbnZhc1dpZHRoO1xuICAgICAgdGhpcy55ID0gTWF0aC5yYW5kb20oKSAqIHRoaXMuY2FudmFzSGVpZ2h0O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgcmVkZXJlciBzdGF0ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGR0IC0gdGltZSBzaW5jZSBsYXN0IHVwZGF0ZSBpbiBzZWNvbmRzLlxuICAgKi9cbiAgdXBkYXRlKGR0KSB7XG4gICAgLy8gcmVib3VuY2UgYXQgdGhlIGVkZ2VzXG4gICAgaWYgKHRoaXMueCA8PSAwKSB7XG4gICAgICB0aGlzLnggPSAwO1xuICAgICAgdGhpcy52ZWxvY2l0eVggKj0gLTE7XG4gICAgICB0aGlzLmNvbGxpc2lvbkNhbGxiYWNrKCdsZWZ0Jyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnggPj0gdGhpcy5jYW52YXNXaWR0aCkge1xuICAgICAgdGhpcy54ID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICAgIHRoaXMudmVsb2NpdHlYICo9IC0xO1xuICAgICAgdGhpcy5jb2xsaXNpb25DYWxsYmFjaygncmlnaHQnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy55IDw9IDApIHtcbiAgICAgIHRoaXMueSA9IDA7XG4gICAgICB0aGlzLnZlbG9jaXR5WSAqPSAtMTtcbiAgICAgIHRoaXMuY29sbGlzaW9uQ2FsbGJhY2soJ3RvcCcpO1xuICAgIH0gZWxzZSBpZiAodGhpcy55ID49IHRoaXMuY2FudmFzSGVpZ2h0KSB7XG4gICAgICB0aGlzLnkgPSB0aGlzLmNhbnZhc0hlaWdodDtcbiAgICAgIHRoaXMudmVsb2NpdHlZICo9IC0xO1xuICAgICAgdGhpcy5jb2xsaXNpb25DYWxsYmFjaygnYm90dG9tJyk7XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIHBvc2l0aW9uIGFjY29yZGluZyB0byB2ZWxvY2l0eVxuICAgIHRoaXMueCArPSAodGhpcy52ZWxvY2l0eVggKiBkdCk7XG4gICAgdGhpcy55ICs9ICh0aGlzLnZlbG9jaXR5WSAqIGR0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3IGludG8gY2FudmFzLlxuICAgKiBNZXRob2QgaXMgY2FsbGVkIGJ5IGFuaW1hdGlvbiBmcmFtZSBsb29wIGluIGN1cnJlbnQgZnJhbWUgcmF0ZS5cbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIGNhbnZhcyAyRCByZW5kZXJpbmcgY29udGV4dFxuICAgKi9cbiAgcmVuZGVyKGN0eCkge1xuICAgIC8vIGNhbnZhcyBvcGVyYXRpb25zXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lmdsb2JhbEFscGhhID0gMC42O1xuICAgIGN0eC5maWxsU3R5bGUgPSAnI2ZmZmZmZic7XG4gICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgNCwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllclJlbmRlcmVyO1xuIl19