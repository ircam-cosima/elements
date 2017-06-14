'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _core = require('waves-lfo/core');

var _motionFeatures = require('motion-features');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// motion-input indices :
// 0,1,2 -> accelerationIncludingGravity
// 3,4,5 -> acceleration
// 6,7,8 -> rotationRate

// but, as they are preprocessed by parent class,
// indices for acc + gyro are 0, 1, 2, 3, 4, 5 (see below)

var definitions = {
  descriptors: {
    type: 'any',
    default: ['accRaw', 'gyrRaw', 'accIntensity', 'gyrIntensity', 'freefall', 'kick', 'shake', 'spin', 'still'],
    constant: true
  },
  accIndices: {
    type: 'any',
    default: [0, 1, 2],
    constant: true
  },
  gyrIndices: {
    type: 'any',
    default: [3, 4, 5],
    constant: true
  },
  callback: {
    type: 'any',
    default: null,
    constant: false,
    metas: { kind: 'dynamic' }
  }
};

var Featurizer = function (_BaseLfo) {
  (0, _inherits3.default)(Featurizer, _BaseLfo);

  function Featurizer() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Featurizer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Featurizer.__proto__ || (0, _getPrototypeOf2.default)(Featurizer)).call(this, definitions, options));

    _this._features = new _motionFeatures.MotionFeatures({
      descriptors: _this.params.get('descriptors'),
      spinThresh: 0.5, // original : 200
      stillThresh: 2, // original : 5000
      accIntensityParam1: 0.8,
      accIntensityParam2: 0.1
    });
    // this._callback = this.params.get('callback');

    _this._descriptorsInfo = {
      accRaw: ['x', 'y', 'z'],
      gyrRaw: ['x', 'y', 'z'],
      accIntensity: ['norm', 'x', 'y', 'z'],
      gyrIntensity: ['norm', 'x', 'y', 'z'],
      freefall: ['accNorm', 'falling', 'duration'],
      kick: ['intensity', 'kicking'],
      shake: ['shaking'],
      spin: ['spinning', 'duration', 'gyrNorm'],
      still: ['still', 'slide'],
      gyrZcr: ['amplitude', 'frequency', 'periodicity'],
      accZcr: ['amplitude', 'frequency', 'periodicity']
    };
    return _this;
  }

  /** @private */


  (0, _createClass3.default)(Featurizer, [{
    key: 'onParamUpdate',
    value: function onParamUpdate(name, value, metas) {}
    // do something ? should not happen as everybody is constant
    // except the callback which is managed in the processVector method


    /** @private */

  }, {
    key: 'processStreamParams',
    value: function processStreamParams() {
      var prevStreamParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.prepareStreamParams(prevStreamParams);

      var descriptors = this.params.get('descriptors');

      var len = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(descriptors), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var d = _step.value;

          len += this._descriptorsInfo[d].length;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.streamParams.frameSize = len;

      this.propagateStreamParams();
    }

    /** @private */

  }, {
    key: 'processVector',
    value: function processVector(frame) {
      var descriptors = this.params.get('descriptors');
      var callback = this.params.get('callback');
      var inData = frame.data;
      var outData = this.frame.data;
      var accIndices = this.params.get('accIndices');
      var gyrIndices = this.params.get('gyrIndices');

      this._features.setAccelerometer(inData[accIndices[0]], inData[accIndices[1]], inData[accIndices[2]]);

      this._features.setGyroscope(inData[gyrIndices[0]], inData[gyrIndices[1]], inData[gyrIndices[2]]);

      // this._features.update((err, values) => {
      //   if (err !== null) {
      //     // throw new Error(`Error computing motion features : ${err}`);
      //     return;
      //   }

      //   let i = 0;
      //   // let prnt = '';
      //   for (let d of descriptors) {
      //     const subDesc = this._descriptorsInfo[d]; // the array of the current descriptor's dimensions names
      //     const subValues = values[d];

      //     for (let subd of subDesc) {
      //       if (subd === 'duration' || subd === 'slide') {
      //         subValues[subd] = 0;
      //       }
      //       outData[i] = subValues[subd]; // here we fill the output frame (data)
      //       i++;
      //       // prnt += subd + ':' + subValues[subd] + ', ';
      //     }
      //   }
      //   //console.log(prnt);

      //   if (callback) {
      //     const desc = new Array(this.streamParams.frameSize);
      //     for (let j = 0; j < desc.length; j++) {
      //       desc[j] = outData[j];
      //     }
      //     callback(desc);
      //   }

      //   this.propagateFrame();
      // });

      var values = this._features.update();

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(descriptors), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var d = _step2.value;

          var subDesc = this._descriptorsInfo[d]; // the array of the current descriptor's dimensions names
          var subValues = values[d];

          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = (0, _getIterator3.default)(subDesc), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var subd = _step3.value;

              if (subd === 'duration' || subd === 'slide') {
                subValues[subd] = 0;
              }
              outData[i] = subValues[subd]; // here we fill the output frame (data)
              i++;
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (callback) {
        var desc = new Array(this.streamParams.frameSize);
        for (var j = 0; j < desc.length; j++) {
          desc[j] = outData[j];
        }
        callback(desc);
      }
    }

    /** @private */
    // processFrame(frame) {
    //   this.prepareFrame(frame);
    //   this.processFunction(frame);
    // }

  }]);
  return Featurizer;
}(_core.BaseLfo);

exports.default = Featurizer;
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZlYXR1cml6ZXJMZm8uanMiXSwibmFtZXMiOlsiZGVmaW5pdGlvbnMiLCJkZXNjcmlwdG9ycyIsInR5cGUiLCJkZWZhdWx0IiwiY29uc3RhbnQiLCJhY2NJbmRpY2VzIiwiZ3lySW5kaWNlcyIsImNhbGxiYWNrIiwibWV0YXMiLCJraW5kIiwiRmVhdHVyaXplciIsIm9wdGlvbnMiLCJfZmVhdHVyZXMiLCJwYXJhbXMiLCJnZXQiLCJzcGluVGhyZXNoIiwic3RpbGxUaHJlc2giLCJhY2NJbnRlbnNpdHlQYXJhbTEiLCJhY2NJbnRlbnNpdHlQYXJhbTIiLCJfZGVzY3JpcHRvcnNJbmZvIiwiYWNjUmF3IiwiZ3lyUmF3IiwiYWNjSW50ZW5zaXR5IiwiZ3lySW50ZW5zaXR5IiwiZnJlZWZhbGwiLCJraWNrIiwic2hha2UiLCJzcGluIiwic3RpbGwiLCJneXJaY3IiLCJhY2NaY3IiLCJuYW1lIiwidmFsdWUiLCJwcmV2U3RyZWFtUGFyYW1zIiwicHJlcGFyZVN0cmVhbVBhcmFtcyIsImxlbiIsImQiLCJsZW5ndGgiLCJzdHJlYW1QYXJhbXMiLCJmcmFtZVNpemUiLCJwcm9wYWdhdGVTdHJlYW1QYXJhbXMiLCJmcmFtZSIsImluRGF0YSIsImRhdGEiLCJvdXREYXRhIiwic2V0QWNjZWxlcm9tZXRlciIsInNldEd5cm9zY29wZSIsInZhbHVlcyIsInVwZGF0ZSIsImkiLCJzdWJEZXNjIiwic3ViVmFsdWVzIiwic3ViZCIsImRlc2MiLCJBcnJheSIsImoiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxJQUFNQSxjQUFjO0FBQ2xCQyxlQUFhO0FBQ1hDLFVBQU0sS0FESztBQUVYQyxhQUFTLENBQ1AsUUFETyxFQUVQLFFBRk8sRUFHUCxjQUhPLEVBSVAsY0FKTyxFQUtQLFVBTE8sRUFNUCxNQU5PLEVBT1AsT0FQTyxFQVFQLE1BUk8sRUFTUCxP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LFVBQVQsSUFBdUJBLFNBQVMsT0FBcEMsRUFBNkM7QUFDM0NELDBCQUFVQyxJQUFWLElBQWtCLENBQWxCO0FBQ0Q7QUFDRFIsc0JBQVFLLENBQVIsSUFBYUUsVUFBVUMsSUFBVixDQUFiLENBSndCLENBSU07QUFDOUJIO0FBQ0Q7QUFWd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVcxQjtBQXBFa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFzRW5CLFVBQUkxQyxRQUFKLEVBQWM7QUFDWixZQUFNOEMsT0FBTyxJQUFJQyxLQUFKLENBQVUsS0FBS2hCLFlBQUwsQ0FBa0JDLFNBQTVCLENBQWI7QUFDQSxhQUFLLElBQUlnQixJQUFJLENBQWIsRUFBZ0JBLElBQUlGLEtBQUtoQixNQUF6QixFQUFpQ2tCLEdBQWpDLEVBQXNDO0FBQ3BDRixlQUFLRSxDQUFMLElBQVVYLFFBQVFXLENBQVIsQ0FBVjtBQUNEO0FBQ0RoRCxpQkFBUzhDLElBQVQ7QUFDRDtBQUNGOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztrQkF0SW1CM0MsVTtBQXVJcEIiLCJmaWxlIjoiRmVhdHVyaXplckxmby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhc2VMZm8gfSBmcm9tICd3YXZlcy1sZm8vY29yZSc7XG5pbXBvcnQgeyBNb3Rpb25GZWF0dXJlcyB9IGZyb20gJ21vdGlvbi1mZWF0dXJlcyc7XG5cbi8vIG1vdGlvbi1pbnB1dCBpbmRpY2VzIDpcbi8vIDAsMSwyIC0+IGFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHlcbi8vIDMsNCw1IC0+IGFjY2VsZXJhdGlvblxuLy8gNiw3LDggLT4gcm90YXRpb25SYXRlXG5cbi8vIGJ1dCwgYXMgdGhleSBhcmUgcHJlcHJvY2Vzc2VkIGJ5IHBhcmVudCBjbGFzcyxcbi8vIGluZGljZXMgZm9yIGFjYyArIGd5cm8gYXJlIDAsIDEsIDIsIDMsIDQsIDUgKHNlZSBiZWxvdylcblxuY29uc3QgZGVmaW5pdGlvbnMgPSB7XG4gIGRlc2NyaXB0b3JzOiB7XG4gICAgdHlwZTogJ2FueScsXG4gICAgZGVmYXVsdDogW1xuICAgICAgJ2FjY1JhdycsXG4gICAgICAnZ3lyUmF3JyxcbiAgICAgICdhY2NJbnRlbnNpdHknLFxuICAgICAgJ2d5ckludGVuc2l0eScsXG4gICAgICAnZnJlZWZhbGwnLFxuICAgICAgJ2tpY2snLFxuICAgICAgJ3NoYWtlJyxcbiAgICAgICdzcGluJyxcbiAgICAgICdzdGlsbCcsXG4gICAgXSxcbiAgICBjb25zdGFudDogdHJ1ZSxcbiAgfSxcbiAgYWNjSW5kaWNlczoge1xuICAgIHR5cGU6ICdhbnknLFxuICAgIGRlZmF1bHQ6IFswLCAxLCAyXSxcbiAgICBjb25zdGFudDogdHJ1ZSxcbiAgfSxcbiAgZ3lySW5kaWNlczoge1xuICAgIHR5cGU6ICdhbnknLFxuICAgIGRlZmF1bHQ6IFszLCA0LCA1XSxcbiAgICBjb25zdGFudDogdHJ1ZSxcbiAgfSxcbiAgY2FsbGJhY2s6IHtcbiAgICB0eXBlOiAnYW55JyxcbiAgICBkZWZhdWx0OiBudWxsLFxuICAgIGNvbnN0YW50OiBmYWxzZSxcbiAgICBtZXRhczogeyBraW5kOiAnZHluYW1pYycgfSxcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJpemVyIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKGRlZmluaXRpb25zLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2ZlYXR1cmVzID0gbmV3IE1vdGlvbkZlYXR1cmVzKHtcbiAgICAgIGRlc2NyaXB0b3JzOiB0aGlzLnBhcmFtcy5nZXQoJ2Rlc2NyaXB0b3JzJyksXG4gICAgICBzcGluVGhyZXNoOiAwLjUsIC8vIG9yaWdpbmFsIDogMjAwXG4gICAgICBzdGlsbFRocmVzaDogMiwgLy8gb3JpZ2luYWwgOiA1MDAwXG4gICAgICBhY2NJbnRlbnNpdHlQYXJhbTE6IDAuOCxcbiAgICAgIGFjY0ludGVuc2l0eVBhcmFtMjogMC4xLFxuICAgIH0pO1xuICAgIC8vIHRoaXMuX2NhbGxiYWNrID0gdGhpcy5wYXJhbXMuZ2V0KCdjYWxsYmFjaycpO1xuXG4gICAgdGhpcy5fZGVzY3JpcHRvcnNJbmZvID0ge1xuICAgICAgYWNjUmF3OiBbICd4JywgJ3knLCAneicgXSxcbiAgICAgIGd5clJhdzogWyAneCcsICd5JywgJ3onIF0sXG4gICAgICBhY2NJbnRlbnNpdHk6IFsgJ25vcm0nLCAneCcsICd5JywgJ3onIF0sXG4gICAgICBneXJJbnRlbnNpdHk6IFsgJ25vcm0nLCAneCcsICd5JywgJ3onIF0sXG4gICAgICBmcmVlZmFsbDogWyAnYWNjTm9ybScsICdmYWxsaW5nJywgJ2R1cmF0aW9uJyBdLFxuICAgICAga2ljazogWyAnaW50ZW5zaXR5JywgJ2tpY2tpbmcnIF0sXG4gICAgICBzaGFrZTogWyAnc2hha2luZycgXSxcbiAgICAgIHNwaW46IFsgJ3NwaW5uaW5nJywgJ2R1cmF0aW9uJywgJ2d5ck5vcm0nIF0sXG4gICAgICBzdGlsbDogWyAnc3RpbGwnLCAnc2xpZGUnIF0sXG4gICAgICBneXJaY3I6IFsgJ2FtcGxpdHVkZScsICdmcmVxdWVuY3knLCAncGVyaW9kaWNpdHknIF0sXG4gICAgICBhY2NaY3I6IFsgJ2FtcGxpdHVkZScsICdmcmVxdWVuY3knLCAncGVyaW9kaWNpdHknIF0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBvblBhcmFtVXBkYXRlKG5hbWUsIHZhbHVlLCBtZXRhcykge1xuICAgIC8vIGRvIHNvbWV0aGluZyA/IHNob3VsZCBub3QgaGFwcGVuIGFzIGV2ZXJ5Ym9keSBpcyBjb25zdGFudFxuICAgIC8vIGV4Y2VwdCB0aGUgY2FsbGJhY2sgd2hpY2ggaXMgbWFuYWdlZCBpbiB0aGUgcHJvY2Vzc1ZlY3RvciBtZXRob2RcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBwcm9jZXNzU3RyZWFtUGFyYW1zKHByZXZTdHJlYW1QYXJhbXMgPSB7fSkge1xuICAgIHRoaXMucHJlcGFyZVN0cmVhbVBhcmFtcyhwcmV2U3RyZWFtUGFyYW1zKTtcblxuICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gdGhpcy5wYXJhbXMuZ2V0KCdkZXNjcmlwdG9ycycpO1xuXG4gICAgbGV0IGxlbiA9IDA7XG4gICAgZm9yIChsZXQgZCBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgbGVuICs9IHRoaXMuX2Rlc2NyaXB0b3JzSW5mb1tkXS5sZW5ndGg7XG4gICAgfVxuXG4gICAgdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gbGVuO1xuXG4gICAgdGhpcy5wcm9wYWdhdGVTdHJlYW1QYXJhbXMoKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBwcm9jZXNzVmVjdG9yKGZyYW1lKSB7XG4gICAgY29uc3QgZGVzY3JpcHRvcnMgPSB0aGlzLnBhcmFtcy5nZXQoJ2Rlc2NyaXB0b3JzJyk7XG4gICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLnBhcmFtcy5nZXQoJ2NhbGxiYWNrJyk7XG4gICAgY29uc3QgaW5EYXRhID0gZnJhbWUuZGF0YTtcbiAgICBjb25zdCBvdXREYXRhID0gdGhpcy5mcmFtZS5kYXRhO1xuICAgIGNvbnN0IGFjY0luZGljZXMgPSB0aGlzLnBhcmFtcy5nZXQoJ2FjY0luZGljZXMnKTtcbiAgICBjb25zdCBneXJJbmRpY2VzID0gdGhpcy5wYXJhbXMuZ2V0KCdneXJJbmRpY2VzJyk7XG4gICAgXG4gICAgdGhpcy5fZmVhdHVyZXMuc2V0QWNjZWxlcm9tZXRlcihcbiAgICAgIGluRGF0YVthY2NJbmRpY2VzWzBdXSxcbiAgICAgIGluRGF0YVthY2NJbmRpY2VzWzFdXSxcbiAgICAgIGluRGF0YVthY2NJbmRpY2VzWzJdXVxuICAgICk7XG5cbiAgICB0aGlzLl9mZWF0dXJlcy5zZXRHeXJvc2NvcGUoXG4gICAgICBpbkRhdGFbZ3lySW5kaWNlc1swXV0sXG4gICAgICBpbkRhdGFbZ3lySW5kaWNlc1sxXV0sXG4gICAgICBpbkRhdGFbZ3lySW5kaWNlc1syXV1cbiAgICApO1xuXG4gICAgLy8gdGhpcy5fZmVhdHVyZXMudXBkYXRlKChlcnIsIHZhbHVlcykgPT4ge1xuICAgIC8vICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAgIC8vICAgICAvLyB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGNvbXB1dGluZyBtb3Rpb24gZmVhdHVyZXMgOiAke2Vycn1gKTtcbiAgICAvLyAgICAgcmV0dXJuO1xuICAgIC8vICAgfVxuXG4gICAgLy8gICBsZXQgaSA9IDA7XG4gICAgLy8gICAvLyBsZXQgcHJudCA9ICcnO1xuICAgIC8vICAgZm9yIChsZXQgZCBvZiBkZXNjcmlwdG9ycykge1xuICAgIC8vICAgICBjb25zdCBzdWJEZXNjID0gdGhpcy5fZGVzY3JpcHRvcnNJbmZvW2RdOyAvLyB0aGUgYXJyYXkgb2YgdGhlIGN1cnJlbnQgZGVzY3JpcHRvcidzIGRpbWVuc2lvbnMgbmFtZXNcbiAgICAvLyAgICAgY29uc3Qgc3ViVmFsdWVzID0gdmFsdWVzW2RdO1xuXG4gICAgLy8gICAgIGZvciAobGV0IHN1YmQgb2Ygc3ViRGVzYykge1xuICAgIC8vICAgICAgIGlmIChzdWJkID09PSAnZHVyYXRpb24nIHx8IHN1YmQgPT09ICdzbGlkZScpIHtcbiAgICAvLyAgICAgICAgIHN1YlZhbHVlc1tzdWJkXSA9IDA7XG4gICAgLy8gICAgICAgfVxuICAgIC8vICAgICAgIG91dERhdGFbaV0gPSBzdWJWYWx1ZXNbc3ViZF07IC8vIGhlcmUgd2UgZmlsbCB0aGUgb3V0cHV0IGZyYW1lIChkYXRhKVxuICAgIC8vICAgICAgIGkrKztcbiAgICAvLyAgICAgICAvLyBwcm50ICs9IHN1YmQgKyAnOicgKyBzdWJWYWx1ZXNbc3ViZF0gKyAnLCAnO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gICAvL2NvbnNvbGUubG9nKHBybnQpO1xuXG4gICAgLy8gICBpZiAoY2FsbGJhY2spIHtcbiAgICAvLyAgICAgY29uc3QgZGVzYyA9IG5ldyBBcnJheSh0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUpO1xuICAgIC8vICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRlc2MubGVuZ3RoOyBqKyspIHtcbiAgICAvLyAgICAgICBkZXNjW2pdID0gb3V0RGF0YVtqXTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBjYWxsYmFjayhkZXNjKTtcbiAgICAvLyAgIH1cblxuICAgIC8vICAgdGhpcy5wcm9wYWdhdGVGcmFtZSgpO1xuICAgIC8vIH0pO1xuXG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy5fZmVhdHVyZXMudXBkYXRlKCk7XG5cbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChsZXQgZCBvZiBkZXNjcmlwdG9ycykge1xuICAgICAgY29uc3Qgc3ViRGVzYyA9IHRoaXMuX2Rlc2NyaXB0b3JzSW5mb1tkXTsgLy8gdGhlIGFycmF5IG9mIHRoZSBjdXJyZW50IGRlc2NyaXB0b3IncyBkaW1lbnNpb25zIG5hbWVzXG4gICAgICBjb25zdCBzdWJWYWx1ZXMgPSB2YWx1ZXNbZF07XG5cbiAgICAgIGZvciAobGV0IHN1YmQgb2Ygc3ViRGVzYykge1xuICAgICAgICBpZiAoc3ViZCA9PT0gJ2R1cmF0aW9uJyB8fCBzdWJkID09PSAnc2xpZGUnKSB7XG4gICAgICAgICAgc3ViVmFsdWVzW3N1YmRdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBvdXREYXRhW2ldID0gc3ViVmFsdWVzW3N1YmRdOyAvLyBoZXJlIHdlIGZpbGwgdGhlIG91dHB1dCBmcmFtZSAoZGF0YSlcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY29uc3QgZGVzYyA9IG5ldyBBcnJheSh0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUpO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBkZXNjLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGRlc2Nbal0gPSBvdXREYXRhW2pdO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2soZGVzYyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIC8vIHByb2Nlc3NGcmFtZShmcmFtZSkge1xuICAvLyAgIHRoaXMucHJlcGFyZUZyYW1lKGZyYW1lKTtcbiAgLy8gICB0aGlzLnByb2Nlc3NGdW5jdGlvbihmcmFtZSk7XG4gIC8vIH1cbn07Il19