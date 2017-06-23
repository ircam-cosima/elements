'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _DesignerExperience = require('./DesignerExperience');

var _DesignerExperience2 = _interopRequireDefault(_DesignerExperience);

var _serviceViews = require('../shared/serviceViews');

var _serviceViews2 = _interopRequireDefault(_serviceViews);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bootstrap() {
  // initialize the client with configuration received
  // from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  var config = (0, _assign2.default)({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  // configure views for the services
  soundworks.client.setServiceInstanciationHook(function (id, instance) {
    if (_serviceViews2.default.has(id)) instance.view = _serviceViews2.default.get(id, config);
  });

  // create client side (player) experience and start the client
  var experience = new _DesignerExperience2.default(config.assetsDomain);
  soundworks.client.start();
} // import client side soundworks and player experience


window.addEventListener('load', bootstrap);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJib290c3RyYXAiLCJjb25maWciLCJhcHBDb250YWluZXIiLCJ3aW5kb3ciLCJzb3VuZHdvcmtzQ29uZmlnIiwiY2xpZW50IiwiaW5pdCIsImNsaWVudFR5cGUiLCJzZXRTZXJ2aWNlSW5zdGFuY2lhdGlvbkhvb2siLCJpZCIsImluc3RhbmNlIiwiaGFzIiwidmlldyIsImdldCIsImV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJzdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsU0FBU0MsU0FBVCxHQUFxQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLFNBQVMsc0JBQWMsRUFBRUMsY0FBYyxZQUFoQixFQUFkLEVBQThDQyxPQUFPQyxnQkFBckQsQ0FBZjtBQUNBTCxhQUFXTSxNQUFYLENBQWtCQyxJQUFsQixDQUF1QkwsT0FBT00sVUFBOUIsRUFBMENOLE1BQTFDOztBQUVBO0FBQ0FGLGFBQVdNLE1BQVgsQ0FBa0JHLDJCQUFsQixDQUE4QyxVQUFDQyxFQUFELEVBQUtDLFFBQUwsRUFBa0I7QUFDOUQsUUFBSSx1QkFBYUMsR0FBYixDQUFpQkYsRUFBakIsQ0FBSixFQUNFQyxTQUFTRSxJQUFULEdBQWdCLHVCQUFhQyxHQUFiLENBQWlCSixFQUFqQixFQUFxQlIsTUFBckIsQ0FBaEI7QUFDSCxHQUhEOztBQUtBO0FBQ0EsTUFBTWEsYUFBYSxpQ0FBdUJiLE9BQU9jLFlBQTlCLENBQW5CO0FBQ0FoQixhQUFXTSxNQUFYLENBQWtCVyxLQUFsQjtBQUNELEMsQ0F0QkQ7OztBQXdCQWIsT0FBT2MsZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0NqQixTQUFoQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCBjbGllbnQgc2lkZSBzb3VuZHdvcmtzIGFuZCBwbGF5ZXIgZXhwZXJpZW5jZVxuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgRGVzaWduZXJFeHBlcmllbmNlIGZyb20gJy4vRGVzaWduZXJFeHBlcmllbmNlJztcbmltcG9ydCBzZXJ2aWNlVmlld3MgZnJvbSAnLi4vc2hhcmVkL3NlcnZpY2VWaWV3cyc7XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcCgpIHtcbiAgLy8gaW5pdGlhbGl6ZSB0aGUgY2xpZW50IHdpdGggY29uZmlndXJhdGlvbiByZWNlaXZlZFxuICAvLyBmcm9tIHRoZSBzZXJ2ZXIgdGhyb3VnaCB0aGUgYGluZGV4Lmh0bWxgXG4gIC8vIEBzZWUge34vc3JjL3NlcnZlci9pbmRleC5qc31cbiAgLy8gQHNlZSB7fi9odG1sL2RlZmF1bHQuZWpzfVxuICBjb25zdCBjb25maWcgPSBPYmplY3QuYXNzaWduKHsgYXBwQ29udGFpbmVyOiAnI2NvbnRhaW5lcicgfSwgd2luZG93LnNvdW5kd29ya3NDb25maWcpO1xuICBzb3VuZHdvcmtzLmNsaWVudC5pbml0KGNvbmZpZy5jbGllbnRUeXBlLCBjb25maWcpO1xuXG4gIC8vIGNvbmZpZ3VyZSB2aWV3cyBmb3IgdGhlIHNlcnZpY2VzXG4gIHNvdW5kd29ya3MuY2xpZW50LnNldFNlcnZpY2VJbnN0YW5jaWF0aW9uSG9vaygoaWQsIGluc3RhbmNlKSA9PiB7XG4gICAgaWYgKHNlcnZpY2VWaWV3cy5oYXMoaWQpKVxuICAgICAgaW5zdGFuY2UudmlldyA9IHNlcnZpY2VWaWV3cy5nZXQoaWQsIGNvbmZpZyk7XG4gIH0pO1xuXG4gIC8vIGNyZWF0ZSBjbGllbnQgc2lkZSAocGxheWVyKSBleHBlcmllbmNlIGFuZCBzdGFydCB0aGUgY2xpZW50XG4gIGNvbnN0IGV4cGVyaWVuY2UgPSBuZXcgRGVzaWduZXJFeHBlcmllbmNlKGNvbmZpZy5hc3NldHNEb21haW4pO1xuICBzb3VuZHdvcmtzLmNsaWVudC5zdGFydCgpO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGJvb3RzdHJhcCk7Il19