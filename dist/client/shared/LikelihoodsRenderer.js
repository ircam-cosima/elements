'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

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

var LikelihoodsRenderer = function (_Canvas2dRenderer) {
  (0, _inherits3.default)(LikelihoodsRenderer, _Canvas2dRenderer);

  function LikelihoodsRenderer() {
    var msHeight = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
    (0, _classCallCheck3.default)(this, LikelihoodsRenderer);

    // update rate = 0: synchronize updates to frame rate

    var _this = (0, _possibleConstructorReturn3.default)(this, (LikelihoodsRenderer.__proto__ || (0, _getPrototypeOf2.default)(LikelihoodsRenderer)).call(this, 0));

    _this._resized = true; // to set canvas width to 100%

    _this._mRes = undefined;
    _this._features = undefined;

    _this._msHeight = msHeight;
    _this._msSpacer = 5;

    _this._mResRectangles = undefined;
    _this._featuresRectangles = undefined;

    _this._colors = ['#ff0000', '#00ff00', '#3355ff', '#999900', '#990099', '#009999'];
    return _this;
  }

  /**
   * Update filtering results
   * @param {Object} res - filtering result object
   */


  (0, _createClass3.default)(LikelihoodsRenderer, [{
    key: 'setModelResults',
    value: function setModelResults(res) {
      if (!this._mRes) {
        // init drawing vars, then update them in update
      }
      this._mRes = res;
    }
  }, {
    key: 'setFeatureValues',
    value: function setFeatureValues(values) {
      this._features = values.slice(0);
      //console.log(this._features);
    }

    /**
     * Override onResize method so that we can update the canvas size from here
     */

  }, {
    key: 'onResize',
    value: function onResize(canvasWidth, canvasHeight) {
      (0, _get3.default)(LikelihoodsRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(LikelihoodsRenderer.prototype), 'onResize', this).call(this, canvasWidth, canvasHeight);
      this._resized = true;
    }

    /**
     * Initialize renderer state.
     */

  }, {
    key: 'init',
    value: function init() {}

    /** @todo avoid code duplication in update function */

    /**
     * Update rederer state.
     * @param {Number} dt - time since last update in seconds.
     */

  }, {
    key: 'update',
    value: function update(dt) {
      if (this._mRes) {
        var n = this._mRes.likelihoods.length;
        var s = this._msSpacer;
        var sp = s * (n - 1);
        var w = (this.canvasWidth - sp) / n;

        this._mResRectangles = new Array(n);

        for (var i = 0; i < n; i++) {
          var v = this._mRes.likelihoods[i];
          this._mResRectangles[i] = {
            x: i * (w + s),
            y: this._msHeight * (1 - v),
            w: w,
            h: this._msHeight * v
          };
        }
      }

      if (this._features) {
        var _n = this._features.length;
        var _s = this._msSpacer;
        var _sp = _s * (_n - 1);
        var _w = (this.canvasWidth - _sp) / _n;

        this._featuresRectangles = new Array(_n);

        for (var _i = 0; _i < _n; _i++) {
          var _v = this._features[_i];
          if (typeof _v === 'boolean') {
            _v = _v ? 1 : 0;
          } else {
            _v = (0, _isNan2.default)(_v) ? 0 : _v;
          }
          this._featuresRectangles[_i] = {
            x: _i * (_w + _s),
            y: this._msHeight * (1 - _v),
            w: _w,
            h: this._msHeight * _v
          };
        }
      }
    }

    /**
     * Draw into canvas.
     * Method is called by animation frame loop in current frame rate.
     * @param {CanvasRenderingContext2D} ctx - canvas 2D rendering context
     */

  }, {
    key: 'render',
    value: function render(ctx) {

      if (this._resized) {
        ctx.canvas.style.width = '100%';
        this.canvasWidth = ctx.canvas.width; //clientWidth;
        this._resized = false;
      }

      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      if (this._features) {
        ctx.fillStyle = '#ffffff';
        this._drawMultislider(ctx, this._featuresRectangles, 0, 3 * this._msHeight);
      }

      if (!this._mRes) {
        return;
      }

      this._drawMultislider(ctx, this._mResRectangles, 0, 0);

      ctx.font = "50px Verdana";
      var c = Math.min(this._mRes.likeliest, this._colors.length);
      ctx.fillStyle = this._colors[c];
      ctx.fillText(this._mRes.label, 0, this._msHeight + 60);
    }

    /** @private */

  }, {
    key: '_drawMultislider',
    value: function _drawMultislider(ctx, rects, x, y) {
      for (var i = 0; i < rects.length; i++) {
        if (i < this._colors.length) {
          ctx.fillStyle = this._colors[i];
        } else {
          ctx.fillStyle = this._colors[this._colors.length];
        }
        var r = rects[i];
        ctx.fillRect(r.x + x, r.y + y, r.w, r.h);
      }
    }
  }]);
  return LikelihoodsRenderer;
}(_client.Canvas2dRenderer);

;

exports.default = LikelihoodsRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxpa2VsaWhvb2RzUmVuZGVyZXIuanMiXSwibmFtZXMiOlsiTGlrZWxpaG9vZHNSZW5kZXJlciIsIm1zSGVpZ2h0IiwiX3Jlc2l6ZWQiLCJfbVJlcyIsInVuZGVmaW5lZCIsIl9mZWF0dXJlcyIsIl9tc0hlaWdodCIsIl9tc1NwYWNlciIsIl9tUmVzUmVjdGFuZ2xlcyIsIl9mZWF0dXJlc1JlY3RhbmdsZXMiLCJfY29sb3JzIiwicmVzIiwidmFsdWVzIiwic2xpY2UiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsImR0IiwibiIsImxpa2VsaWhvb2RzIiwibGVuZ3RoIiwicyIsInNwIiwidyIsIkFycmF5IiwiaSIsInYiLCJ4IiwieSIsImgiLCJjdHgiLCJjYW52YXMiLCJzdHlsZSIsIndpZHRoIiwiY2xlYXJSZWN0IiwiZmlsbFN0eWxlIiwiX2RyYXdNdWx0aXNsaWRlciIsImZvbnQiLCJjIiwiTWF0aCIsIm1pbiIsImxpa2VsaWVzdCIsImZpbGxUZXh0IiwibGFiZWwiLCJyZWN0cyIsInIiLCJmaWxsUmVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0lBRU1BLG1COzs7QUFDSixpQ0FBNEI7QUFBQSxRQUFoQkMsUUFBZ0IsdUVBQUwsR0FBSztBQUFBOztBQUNoQjs7QUFEZ0IsZ0tBQ3BCLENBRG9COztBQUcxQixVQUFLQyxRQUFMLEdBQWdCLElBQWhCLENBSDBCLENBR0o7O0FBRXRCLFVBQUtDLEtBQUwsR0FBYUMsU0FBYjtBQUNBLFVBQUtDLFNBQUwsR0FBaUJELFNBQWpCOztBQUVBLFVBQUtFLFNBQUwsR0FBaUJMLFFBQWpCO0FBQ0EsVUFBS00sU0FBTCxHQUFpQixDQUFqQjs7QUFFQSxVQUFLQyxlQUFMLEdBQXVCSixTQUF2QjtBQUNBLFVBQUtLLG1CQUFMLEdBQTJCTCxTQUEzQjs7QUFFQSxVQUFLTSxPQUFMLEdBQWUsQ0FDYixTQURhLEVBRWIsU0FGYSxFQUdiLFNBSGEsRUFJYixT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Y0FBSUssU0FBSixHQUFnQixLQUFLeEIsT0FBTCxDQUFhLEtBQUtBLE9BQUwsQ0FBYVMsTUFBMUIsQ0FBaEI7QUFDRDtBQUNELFlBQU15QixJQUFJRCxNQUFNbkIsQ0FBTixDQUFWO0FBQ0FLLFlBQUlnQixRQUFKLENBQWFELEVBQUVsQixDQUFGLEdBQU1BLENBQW5CLEVBQXNCa0IsRUFBRWpCLENBQUYsR0FBTUEsQ0FBNUIsRUFBK0JpQixFQUFFdEIsQ0FBakMsRUFBb0NzQixFQUFFaEIsQ0FBdEM7QUFDRDtBQUNGOzs7OztBQUNGOztrQkFFYzVCLG1CIiwiZmlsZSI6Ikxpa2VsaWhvb2RzUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYW52YXMyZFJlbmRlcmVyIH0gZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG5jbGFzcyBMaWtlbGlob29kc1JlbmRlcmVyIGV4dGVuZHMgQ2FudmFzMmRSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKG1zSGVpZ2h0ID0gMTAwKSB7XG4gICAgc3VwZXIoMCk7IC8vIHVwZGF0ZSByYXRlID0gMDogc3luY2hyb25pemUgdXBkYXRlcyB0byBmcmFtZSByYXRlXG5cbiAgICB0aGlzLl9yZXNpemVkID0gdHJ1ZTsgLy8gdG8gc2V0IGNhbnZhcyB3aWR0aCB0byAxMDAlXG5cbiAgICB0aGlzLl9tUmVzID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2ZlYXR1cmVzID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5fbXNIZWlnaHQgPSBtc0hlaWdodDtcbiAgICB0aGlzLl9tc1NwYWNlciA9IDU7XG5cbiAgICB0aGlzLl9tUmVzUmVjdGFuZ2xlcyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9mZWF0dXJlc1JlY3RhbmdsZXMgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLl9jb2xvcnMgPSBbXG4gICAgICAnI2ZmMDAwMCcsXG4gICAgICAnIzAwZmYwMCcsXG4gICAgICAnIzMzNTVmZicsXG4gICAgICAnIzk5OTkwMCcsXG4gICAgICAnIzk5MDA5OScsXG4gICAgICAnIzAwOTk5OSdcbiAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBmaWx0ZXJpbmcgcmVzdWx0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzIC0gZmlsdGVyaW5nIHJlc3VsdCBvYmplY3RcbiAgICovXG4gIHNldE1vZGVsUmVzdWx0cyhyZXMpIHtcbiAgICBpZiAoIXRoaXMuX21SZXMpIHtcbiAgICAgIC8vIGluaXQgZHJhd2luZyB2YXJzLCB0aGVuIHVwZGF0ZSB0aGVtIGluIHVwZGF0ZVxuICAgIH1cbiAgICB0aGlzLl9tUmVzID0gcmVzO1xuICB9XG5cbiAgc2V0RmVhdHVyZVZhbHVlcyh2YWx1ZXMpIHtcbiAgICB0aGlzLl9mZWF0dXJlcyA9IHZhbHVlcy5zbGljZSgwKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2ZlYXR1cmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZSBvblJlc2l6ZSBtZXRob2Qgc28gdGhhdCB3ZSBjYW4gdXBkYXRlIHRoZSBjYW52YXMgc2l6ZSBmcm9tIGhlcmVcbiAgICovXG4gIG9uUmVzaXplKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcbiAgICBzdXBlci5vblJlc2l6ZShjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KTtcbiAgICB0aGlzLl9yZXNpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHJlbmRlcmVyIHN0YXRlLlxuICAgKi9cbiAgaW5pdCgpIHt9XG5cbiAgLyoqIEB0b2RvIGF2b2lkIGNvZGUgZHVwbGljYXRpb24gaW4gdXBkYXRlIGZ1bmN0aW9uICovXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSByZWRlcmVyIHN0YXRlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gZHQgLSB0aW1lIHNpbmNlIGxhc3QgdXBkYXRlIGluIHNlY29uZHMuXG4gICAqL1xuICB1cGRhdGUoZHQpIHtcbiAgICBpZiAodGhpcy5fbVJlcykge1xuICAgICAgY29uc3QgbiA9IHRoaXMuX21SZXMubGlrZWxpaG9vZHMubGVuZ3RoO1xuICAgICAgY29uc3QgcyA9IHRoaXMuX21zU3BhY2VyO1xuICAgICAgY29uc3Qgc3AgPSBzICogKG4gLSAxKTtcbiAgICAgIGNvbnN0IHcgPSAodGhpcy5jYW52YXNXaWR0aCAtIHNwKSAvIG47XG5cbiAgICAgIHRoaXMuX21SZXNSZWN0YW5nbGVzID0gbmV3IEFycmF5KG4pO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICBjb25zdCB2ID0gdGhpcy5fbVJlcy5saWtlbGlob29kc1tpXTtcbiAgICAgICAgdGhpcy5fbVJlc1JlY3RhbmdsZXNbaV0gPSB7XG4gICAgICAgICAgeDogaSAqICh3ICsgcyksXG4gICAgICAgICAgeTogdGhpcy5fbXNIZWlnaHQgKiAoMSAtIHYpLFxuICAgICAgICAgIHc6IHcsXG4gICAgICAgICAgaDogdGhpcy5fbXNIZWlnaHQgKiB2XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2ZlYXR1cmVzKSB7XG4gICAgICBjb25zdCBuID0gdGhpcy5fZmVhdHVyZXMubGVuZ3RoO1xuICAgICAgY29uc3QgcyA9IHRoaXMuX21zU3BhY2VyO1xuICAgICAgY29uc3Qgc3AgPSBzICogKG4gLSAxKTtcbiAgICAgIGNvbnN0IHcgPSAodGhpcy5jYW52YXNXaWR0aCAtIHNwKSAvIG47XG5cbiAgICAgIHRoaXMuX2ZlYXR1cmVzUmVjdGFuZ2xlcyA9IG5ldyBBcnJheShuKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgbGV0IHYgPSB0aGlzLl9mZWF0dXJlc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB2ID0gdiA/IDEgOiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHYgPSBOdW1iZXIuaXNOYU4odikgPyAwIDogdjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9mZWF0dXJlc1JlY3RhbmdsZXNbaV0gID0ge1xuICAgICAgICAgIHg6IGkgKiAodyArIHMpLFxuICAgICAgICAgIHk6IHRoaXMuX21zSGVpZ2h0ICogKDEgLSB2KSxcbiAgICAgICAgICB3OiB3LFxuICAgICAgICAgIGg6IHRoaXMuX21zSGVpZ2h0ICogdlxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3IGludG8gY2FudmFzLlxuICAgKiBNZXRob2QgaXMgY2FsbGVkIGJ5IGFuaW1hdGlvbiBmcmFtZSBsb29wIGluIGN1cnJlbnQgZnJhbWUgcmF0ZS5cbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGN0eCAtIGNhbnZhcyAyRCByZW5kZXJpbmcgY29udGV4dFxuICAgKi9cbiAgcmVuZGVyKGN0eCkge1xuXG4gICAgaWYgKHRoaXMuX3Jlc2l6ZWQpIHtcbiAgICAgIGN0eC5jYW52YXMuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICB0aGlzLmNhbnZhc1dpZHRoID0gY3R4LmNhbnZhcy53aWR0aDsvL2NsaWVudFdpZHRoO1xuICAgICAgdGhpcy5fcmVzaXplZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQpO1xuXG4gICAgaWYgKHRoaXMuX2ZlYXR1cmVzKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJyNmZmZmZmYnO1xuICAgICAgdGhpcy5fZHJhd011bHRpc2xpZGVyKGN0eCwgdGhpcy5fZmVhdHVyZXNSZWN0YW5nbGVzLCAwLCAzICogdGhpcy5fbXNIZWlnaHQpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fbVJlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2RyYXdNdWx0aXNsaWRlcihjdHgsIHRoaXMuX21SZXNSZWN0YW5nbGVzLCAwLCAwKTtcblxuICAgIGN0eC5mb250PVwiNTBweCBWZXJkYW5hXCI7XG4gICAgY29uc3QgYyA9IE1hdGgubWluKHRoaXMuX21SZXMubGlrZWxpZXN0LCB0aGlzLl9jb2xvcnMubGVuZ3RoKVxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLl9jb2xvcnNbY107XG4gICAgY3R4LmZpbGxUZXh0KHRoaXMuX21SZXMubGFiZWwsIDAsIHRoaXMuX21zSGVpZ2h0ICsgNjApO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9kcmF3TXVsdGlzbGlkZXIoY3R4LCByZWN0cywgeCwgeSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChpIDwgdGhpcy5fY29sb3JzLmxlbmd0aCkge1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5fY29sb3JzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuX2NvbG9yc1t0aGlzLl9jb2xvcnMubGVuZ3RoXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHIgPSByZWN0c1tpXTtcbiAgICAgIGN0eC5maWxsUmVjdChyLnggKyB4LCByLnkgKyB5LCByLncsIHIuaCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMaWtlbGlob29kc1JlbmRlcmVyOyJdfQ==