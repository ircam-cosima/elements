'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cwd = process.cwd();

// Configuration of the application.
// Other entries can be added (as long as their name doesn't conflict with
// existing ones) to define global parameters of the application (e.g. BPM,
// synth parameters) that can then be shared easily among all clients using
// the `shared-config` service.
exports.default = {
  // name of the application, used in the `.ejs` template and by default in
  // the `platform` service to populate its view
  appName: 'elements',

  // name of the environnement ('production' enable cache in express application)
  env: 'development',

  someArray: [0, 1, 2],
  // version of application, can be used to force reload css and js files
  // from server (cf. `html/default.ejs`)
  version: '0.0.1',

  // name of the default client type, i.e. the client that can access the
  // application at its root URL
  defaultClient: 'player',

  // define from where the assets (static files) should be loaded, these value
  // could also refer to a separate server for scalability reasons. This value
  // should also be used client-side to configure the `audio-buffer-manager` service.
  assetsDomain: '/',
  // assetsDomain: '/apps/elements/',

  // port used to open the http server, in production this value is typically 80
  port: 9000,

  // define if the server should use gzip compression for static files
  enableGZipCompression: true,

  // location of the public directory (accessible through http(s) requests)
  publicDirectory: _path2.default.join(cwd, 'public'),

  // directory where the server templating system looks for the `ejs` templates
  templateDirectory: _path2.default.join(cwd, 'html'),

  // define if the HTTP server should be launched using secure connections.
  // For development purposes when set to `true` and no certificates are given
  // (cf. `httpsInfos`), a self-signed certificate is created.
  useHttps: false,

  // paths to the key and certificate to be used in order to launch the https
  // server. Both entries are required otherwise a self-signed certificate
  // is generated.
  httpsInfos: {
    key: null,
    cert: null
  },

  // socket.io configuration
  websockets: {
    // url: '',
    // url: ':9000',
    transports: ['websocket'],
    path: ''
    // path: '/apps/elements/socket.io',
    // @note: EngineIO defaults
    // pingTimeout: 3000,
    // pingInterval: 1000,
    // upgradeTimeout: 10000,
    // maxHttpBufferSize: 10E7,
  },

  // describe the location where the experience takes places, theses values are
  // used by the `placer`, `checkin` and `locator` services.
  // if one of these service is required, this entry shouldn't be removed.
  setup: {
    area: {
      width: 1,
      height: 1,
      // path to an image to be used in the area representation
      background: null
    },
    // list of predefined labels
    labels: null,
    // list of predefined coordinates given as an array of `[x:Number, y:Number]`
    coordinates: null,
    // maximum number of clients allowed in a position
    maxClientsPerPosition: 1,
    // maximum number of positions (may limit or be limited by the number of
    // labels and/or coordinates)
    capacity: Infinity
  },

  // password to be used by the `auth` service
  password: '',

  // configuration of the `osc` service
  osc: {
    // IP of the currently running node server
    receiveAddress: '127.0.0.1',
    // port listening for incomming messages
    receivePort: 57121,
    // IP of the remote application
    sendAddress: '127.0.0.1',
    // port where the remote application is listening for messages
    sendPort: 57120
  },

  // configuration of the `raw-socket` service
  rawSocket: {
    // port used for socket connection
    // port: 8080
    port: 9000
  },

  // bunyan configuration
  logger: {
    name: 'soundworks',
    level: 'info',
    streams: [{
      level: 'info',
      stream: process.stdout
    }]
  },

  // directory where error reported from the clients are written
  errorReporterDirectory: _path2.default.join(cwd, 'logs', 'clients')
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlZmF1bHQuanMiXSwibmFtZXMiOlsiY3dkIiwicHJvY2VzcyIsImFwcE5hbWUiLCJlbnYiLCJzb21lQXJyYXkiLCJ2ZXJzaW9uIiwiZGVmYXVsdENsaWVudCIsImFzc2V0c0RvbWFpbiIsInBvcnQiLCJlbmFibGVHWmlwQ29tcHJlc3Npb24iLCJwdWJsaWNEaXJlY3RvcnkiLCJqb2luIiwidGVtcGxhdGVEaXJlY3RvcnkiLCJ1c2VIdHRwcyIsImh0dHBzSW5mb3MiLCJrZXkiLCJjZXJ0Iiwid2Vic29ja2V0cyIsInRyYW5zcG9ydHMiLCJwYXRoIiwic2V0dXAiLCJhcmVhIiwid2lkdGgiLCJoZWlnaHQiLCJiYWNrZ3JvdW5kIiwibGFiZWxzIiwiY29vcmRpbmF0ZXMiLCJtYXhDbGllbnRzUGVyUG9zaXRpb24iLCJjYXBhY2l0eSIsIkluZmluaXR5IiwicGFzc3dvcmQiLCJvc2MiLCJyZWNlaXZlQWRkcmVzcyIsInJlY2VpdmVQb3J0Iiwic2VuZEFkZHJlc3MiLCJzZW5kUG9ydCIsInJhd1NvY2tldCIsImxvZ2dlciIsIm5hbWUiLCJsZXZlbCIsInN0cmVhbXMiLCJzdHJlYW0iLCJzdGRvdXQiLCJlcnJvclJlcG9ydGVyRGlyZWN0b3J5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7O0FBQ0EsSUFBTUEsTUFBTUMsUUFBUUQsR0FBUixFQUFaOztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7a0JBQ2U7QUFDYjtBQUNBO0FBQ0FFLFdBQVMsVUFISTs7QUFLYjtBQUNBQyxPQUFLLGFBTlE7O0FBUWJDLGFBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FSRTtBQVNiO0FBQ0E7QUFDQUMsV0FBUyxPQVhJOztBQWFiO0FBQ0E7QUFDQUMsaUJBQWUsUUFmRjs7QUFpQmI7QUFDQTtBQUNBO0FBQ0FDLGdCQUFjLEdBcEJEO0FBcUJiOztBQUVBO0FBQ0FDLFFBQU0sSUF4Qk87O0FBMkJiO0FBQ0FDLHlCQUF1QixJQTVCVjs7QUE4QmI7QUFDQUMsbUJBQWlCLGVBQUtDLElBQUwsQ0FBVVgsR0FBVixFQUFlLFFBQWYsQ0EvQko7O0FBaUNiO0FBQ0FZLHFCQUFtQixlQUFLRCxJQUFMLENBQVVYLEdBQVYsRUFBZSxNQUFmLENBbENOOztBQXFDYjtBQUNBO0FBQ0E7QUFDQWEsWUFBVSxLQXhDRzs7QUEwQ2I7QUFDQTtBQUNBO0FBQ0FDLGNBQVk7QUFDVkMsU0FBSyxJQURLO0FBRVZDLFVBQU07QUFGSSxHQTdDQzs7QUFrRGI7QUFDQUMsY0FBWTtBQUNWO0FBQ0E7QUFDQUMsZ0JBQVksQ0FBQyxXQUFELENBSEY7QUFJVkMsVUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVZVLEdBbkRDOztBQWdFYjtBQUNBO0FBQ0E7QUFDQUMsU0FBTztBQUNMQyxVQUFNO0FBQ0pDLGFBQU8sQ0FESDtBQUVKQyxjQUFRLENBRko7QUFHSjtBQUNBQyxrQkFBWTtBQUpSLEtBREQ7QUFPTDtBQUNBQyxZQUFRLElBUkg7QUFTTDtBQUNBQyxpQkFBYSxJQVZSO0FBV0w7QUFDQUMsMkJBQXVCLENBWmxCO0FBYUw7QUFDQTtBQUNBQyxjQUFVQztBQWZMLEdBbkVNOztBQXFGYjtBQUNBQyxZQUFVLEVBdEZHOztBQXdGYjtBQUNBQyxPQUFLO0FBQ0g7QUFDQUMsb0JBQWdCLFdBRmI7QUFHSDtBQUNBQyxpQkFBYSxLQUpWO0FBS0g7QUFDQUMsaUJBQWEsV0FOVjtBQU9IO0FBQ0FDLGNBQVU7QUFSUCxHQXpGUTs7QUFvR2I7QUFDQUMsYUFBVztBQUNUO0FBQ0E7QUFDQTVCLFVBQU07QUFIRyxHQXJHRTs7QUEyR2I7QUFDQTZCLFVBQVE7QUFDTkMsVUFBTSxZQURBO0FBRU5DLFdBQU8sTUFGRDtBQUdOQyxhQUFTLENBQUM7QUFDUkQsYUFBTyxNQURDO0FBRVJFLGNBQVF4QyxRQUFReUM7QUFGUixLQUFEO0FBSEgsR0E1R0s7O0FBd0hiO0FBQ0FDLDBCQUF3QixlQUFLaEMsSUFBTCxDQUFVWCxHQUFWLEVBQWUsTUFBZixFQUF1QixTQUF2QjtBQXpIWCxDIiwiZmlsZSI6ImRlZmF1bHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmNvbnN0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG5cblxuLy8gQ29uZmlndXJhdGlvbiBvZiB0aGUgYXBwbGljYXRpb24uXG4vLyBPdGhlciBlbnRyaWVzIGNhbiBiZSBhZGRlZCAoYXMgbG9uZyBhcyB0aGVpciBuYW1lIGRvZXNuJ3QgY29uZmxpY3Qgd2l0aFxuLy8gZXhpc3Rpbmcgb25lcykgdG8gZGVmaW5lIGdsb2JhbCBwYXJhbWV0ZXJzIG9mIHRoZSBhcHBsaWNhdGlvbiAoZS5nLiBCUE0sXG4vLyBzeW50aCBwYXJhbWV0ZXJzKSB0aGF0IGNhbiB0aGVuIGJlIHNoYXJlZCBlYXNpbHkgYW1vbmcgYWxsIGNsaWVudHMgdXNpbmdcbi8vIHRoZSBgc2hhcmVkLWNvbmZpZ2Agc2VydmljZS5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gbmFtZSBvZiB0aGUgYXBwbGljYXRpb24sIHVzZWQgaW4gdGhlIGAuZWpzYCB0ZW1wbGF0ZSBhbmQgYnkgZGVmYXVsdCBpblxuICAvLyB0aGUgYHBsYXRmb3JtYCBzZXJ2aWNlIHRvIHBvcHVsYXRlIGl0cyB2aWV3XG4gIGFwcE5hbWU6ICdlbGVtZW50cycsXG5cbiAgLy8gbmFtZSBvZiB0aGUgZW52aXJvbm5lbWVudCAoJ3Byb2R1Y3Rpb24nIGVuYWJsZSBjYWNoZSBpbiBleHByZXNzIGFwcGxpY2F0aW9uKVxuICBlbnY6ICdkZXZlbG9wbWVudCcsXG5cbiAgc29tZUFycmF5OiBbMCwgMSwgMl0sXG4gIC8vIHZlcnNpb24gb2YgYXBwbGljYXRpb24sIGNhbiBiZSB1c2VkIHRvIGZvcmNlIHJlbG9hZCBjc3MgYW5kIGpzIGZpbGVzXG4gIC8vIGZyb20gc2VydmVyIChjZi4gYGh0bWwvZGVmYXVsdC5lanNgKVxuICB2ZXJzaW9uOiAnMC4wLjEnLFxuXG4gIC8vIG5hbWUgb2YgdGhlIGRlZmF1bHQgY2xpZW50IHR5cGUsIGkuZS4gdGhlIGNsaWVudCB0aGF0IGNhbiBhY2Nlc3MgdGhlXG4gIC8vIGFwcGxpY2F0aW9uIGF0IGl0cyByb290IFVSTFxuICBkZWZhdWx0Q2xpZW50OiAncGxheWVyJyxcblxuICAvLyBkZWZpbmUgZnJvbSB3aGVyZSB0aGUgYXNzZXRzIChzdGF0aWMgZmlsZXMpIHNob3VsZCBiZSBsb2FkZWQsIHRoZXNlIHZhbHVlXG4gIC8vIGNvdWxkIGFsc28gcmVmZXIgdG8gYSBzZXBhcmF0ZSBzZXJ2ZXIgZm9yIHNjYWxhYmlsaXR5IHJlYXNvbnMuIFRoaXMgdmFsdWVcbiAgLy8gc2hvdWxkIGFsc28gYmUgdXNlZCBjbGllbnQtc2lkZSB0byBjb25maWd1cmUgdGhlIGBhdWRpby1idWZmZXItbWFuYWdlcmAgc2VydmljZS5cbiAgYXNzZXRzRG9tYWluOiAnLycsXG4gIC8vIGFzc2V0c0RvbWFpbjogJy9hcHBzL2VsZW1lbnRzLycsXG5cbiAgLy8gcG9ydCB1c2VkIHRvIG9wZW4gdGhlIGh0dHAgc2VydmVyLCBpbiBwcm9kdWN0aW9uIHRoaXMgdmFsdWUgaXMgdHlwaWNhbGx5IDgwXG4gIHBvcnQ6IDkwMDAsXG5cblxuICAvLyBkZWZpbmUgaWYgdGhlIHNlcnZlciBzaG91bGQgdXNlIGd6aXAgY29tcHJlc3Npb24gZm9yIHN0YXRpYyBmaWxlc1xuICBlbmFibGVHWmlwQ29tcHJlc3Npb246IHRydWUsXG5cbiAgLy8gbG9jYXRpb24gb2YgdGhlIHB1YmxpYyBkaXJlY3RvcnkgKGFjY2Vzc2libGUgdGhyb3VnaCBodHRwKHMpIHJlcXVlc3RzKVxuICBwdWJsaWNEaXJlY3Rvcnk6IHBhdGguam9pbihjd2QsICdwdWJsaWMnKSxcblxuICAvLyBkaXJlY3Rvcnkgd2hlcmUgdGhlIHNlcnZlciB0ZW1wbGF0aW5nIHN5c3RlbSBsb29rcyBmb3IgdGhlIGBlanNgIHRlbXBsYXRlc1xuICB0ZW1wbGF0ZURpcmVjdG9yeTogcGF0aC5qb2luKGN3ZCwgJ2h0bWwnKSxcblxuXG4gIC8vIGRlZmluZSBpZiB0aGUgSFRUUCBzZXJ2ZXIgc2hvdWxkIGJlIGxhdW5jaGVkIHVzaW5nIHNlY3VyZSBjb25uZWN0aW9ucy5cbiAgLy8gRm9yIGRldmVsb3BtZW50IHB1cnBvc2VzIHdoZW4gc2V0IHRvIGB0cnVlYCBhbmQgbm8gY2VydGlmaWNhdGVzIGFyZSBnaXZlblxuICAvLyAoY2YuIGBodHRwc0luZm9zYCksIGEgc2VsZi1zaWduZWQgY2VydGlmaWNhdGUgaXMgY3JlYXRlZC5cbiAgdXNlSHR0cHM6IGZhbHNlLFxuXG4gIC8vIHBhdGhzIHRvIHRoZSBrZXkgYW5kIGNlcnRpZmljYXRlIHRvIGJlIHVzZWQgaW4gb3JkZXIgdG8gbGF1bmNoIHRoZSBodHRwc1xuICAvLyBzZXJ2ZXIuIEJvdGggZW50cmllcyBhcmUgcmVxdWlyZWQgb3RoZXJ3aXNlIGEgc2VsZi1zaWduZWQgY2VydGlmaWNhdGVcbiAgLy8gaXMgZ2VuZXJhdGVkLlxuICBodHRwc0luZm9zOiB7XG4gICAga2V5OiBudWxsLFxuICAgIGNlcnQ6IG51bGwsXG4gIH0sXG5cbiAgLy8gc29ja2V0LmlvIGNvbmZpZ3VyYXRpb25cbiAgd2Vic29ja2V0czoge1xuICAgIC8vIHVybDogJycsXG4gICAgLy8gdXJsOiAnOjkwMDAnLFxuICAgIHRyYW5zcG9ydHM6IFsnd2Vic29ja2V0J10sXG4gICAgcGF0aDogJydcbiAgICAvLyBwYXRoOiAnL2FwcHMvZWxlbWVudHMvc29ja2V0LmlvJyxcbiAgICAvLyBAbm90ZTogRW5naW5lSU8gZGVmYXVsdHNcbiAgICAvLyBwaW5nVGltZW91dDogMzAwMCxcbiAgICAvLyBwaW5nSW50ZXJ2YWw6IDEwMDAsXG4gICAgLy8gdXBncmFkZVRpbWVvdXQ6IDEwMDAwLFxuICAgIC8vIG1heEh0dHBCdWZmZXJTaXplOiAxMEU3LFxuICB9LFxuXG4gIC8vIGRlc2NyaWJlIHRoZSBsb2NhdGlvbiB3aGVyZSB0aGUgZXhwZXJpZW5jZSB0YWtlcyBwbGFjZXMsIHRoZXNlcyB2YWx1ZXMgYXJlXG4gIC8vIHVzZWQgYnkgdGhlIGBwbGFjZXJgLCBgY2hlY2tpbmAgYW5kIGBsb2NhdG9yYCBzZXJ2aWNlcy5cbiAgLy8gaWYgb25lIG9mIHRoZXNlIHNlcnZpY2UgaXMgcmVxdWlyZWQsIHRoaXMgZW50cnkgc2hvdWxkbid0IGJlIHJlbW92ZWQuXG4gIHNldHVwOiB7XG4gICAgYXJlYToge1xuICAgICAgd2lkdGg6IDEsXG4gICAgICBoZWlnaHQ6IDEsXG4gICAgICAvLyBwYXRoIHRvIGFuIGltYWdlIHRvIGJlIHVzZWQgaW4gdGhlIGFyZWEgcmVwcmVzZW50YXRpb25cbiAgICAgIGJhY2tncm91bmQ6IG51bGwsXG4gICAgfSxcbiAgICAvLyBsaXN0IG9mIHByZWRlZmluZWQgbGFiZWxzXG4gICAgbGFiZWxzOiBudWxsLFxuICAgIC8vIGxpc3Qgb2YgcHJlZGVmaW5lZCBjb29yZGluYXRlcyBnaXZlbiBhcyBhbiBhcnJheSBvZiBgW3g6TnVtYmVyLCB5Ok51bWJlcl1gXG4gICAgY29vcmRpbmF0ZXM6IG51bGwsXG4gICAgLy8gbWF4aW11bSBudW1iZXIgb2YgY2xpZW50cyBhbGxvd2VkIGluIGEgcG9zaXRpb25cbiAgICBtYXhDbGllbnRzUGVyUG9zaXRpb246IDEsXG4gICAgLy8gbWF4aW11bSBudW1iZXIgb2YgcG9zaXRpb25zIChtYXkgbGltaXQgb3IgYmUgbGltaXRlZCBieSB0aGUgbnVtYmVyIG9mXG4gICAgLy8gbGFiZWxzIGFuZC9vciBjb29yZGluYXRlcylcbiAgICBjYXBhY2l0eTogSW5maW5pdHksXG4gIH0sXG5cbiAgLy8gcGFzc3dvcmQgdG8gYmUgdXNlZCBieSB0aGUgYGF1dGhgIHNlcnZpY2VcbiAgcGFzc3dvcmQ6ICcnLFxuXG4gIC8vIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGBvc2NgIHNlcnZpY2VcbiAgb3NjOiB7XG4gICAgLy8gSVAgb2YgdGhlIGN1cnJlbnRseSBydW5uaW5nIG5vZGUgc2VydmVyXG4gICAgcmVjZWl2ZUFkZHJlc3M6ICcxMjcuMC4wLjEnLFxuICAgIC8vIHBvcnQgbGlzdGVuaW5nIGZvciBpbmNvbW1pbmcgbWVzc2FnZXNcbiAgICByZWNlaXZlUG9ydDogNTcxMjEsXG4gICAgLy8gSVAgb2YgdGhlIHJlbW90ZSBhcHBsaWNhdGlvblxuICAgIHNlbmRBZGRyZXNzOiAnMTI3LjAuMC4xJyxcbiAgICAvLyBwb3J0IHdoZXJlIHRoZSByZW1vdGUgYXBwbGljYXRpb24gaXMgbGlzdGVuaW5nIGZvciBtZXNzYWdlc1xuICAgIHNlbmRQb3J0OiA1NzEyMCxcbiAgfSxcblxuICAvLyBjb25maWd1cmF0aW9uIG9mIHRoZSBgcmF3LXNvY2tldGAgc2VydmljZVxuICByYXdTb2NrZXQ6IHtcbiAgICAvLyBwb3J0IHVzZWQgZm9yIHNvY2tldCBjb25uZWN0aW9uXG4gICAgLy8gcG9ydDogODA4MFxuICAgIHBvcnQ6IDkwMDBcbiAgfSxcblxuICAvLyBidW55YW4gY29uZmlndXJhdGlvblxuICBsb2dnZXI6IHtcbiAgICBuYW1lOiAnc291bmR3b3JrcycsXG4gICAgbGV2ZWw6ICdpbmZvJyxcbiAgICBzdHJlYW1zOiBbe1xuICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgIHN0cmVhbTogcHJvY2Vzcy5zdGRvdXQsXG4gICAgfSwgLyoge1xuICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgIHBhdGg6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbG9ncycsICdzb3VuZHdvcmtzLmxvZycpLFxuICAgIH0gKi9dXG4gIH0sXG5cbiAgLy8gZGlyZWN0b3J5IHdoZXJlIGVycm9yIHJlcG9ydGVkIGZyb20gdGhlIGNsaWVudHMgYXJlIHdyaXR0ZW5cbiAgZXJyb3JSZXBvcnRlckRpcmVjdG9yeTogcGF0aC5qb2luKGN3ZCwgJ2xvZ3MnLCAnY2xpZW50cycpLFxufVxuIl19