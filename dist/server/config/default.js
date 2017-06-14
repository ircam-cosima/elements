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
    url: '',
    // url: ':9000',
    transports: ['websocket']
    // path: ''
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlZmF1bHQuanMiXSwibmFtZXMiOlsiY3dkIiwicHJvY2VzcyIsImFwcE5hbWUiLCJlbnYiLCJzb21lQXJyYXkiLCJ2ZXJzaW9uIiwiZGVmYXVsdENsaWVudCIsImFzc2V0c0RvbWFpbiIsInBvcnQiLCJlbmFibGVHWmlwQ29tcHJlc3Npb24iLCJwdWJsaWNEaXJlY3RvcnkiLCJqb2luIiwidGVtcGxhdGVEaXJlY3RvcnkiLCJ1c2VIdHRwcyIsImh0dHBzSW5mb3MiLCJrZXkiLCJjZXJ0Iiwid2Vic29ja2V0cyIsInVybCIsInRyYW5zcG9ydHMiLCJzZXR1cCIsImFyZWEiLCJ3aWR0aCIsImhlaWdodCIsImJhY2tncm91bmQiLCJsYWJlbHMiLCJjb29yZGluYXRlcyIsIm1heENsaWVudHNQZXJQb3NpdGlvbiIsImNhcGFjaXR5IiwiSW5maW5pdHkiLCJwYXNzd29yZCIsIm9zYyIsInJlY2VpdmVBZGRyZXNzIiwicmVjZWl2ZVBvcnQiLCJzZW5kQWRkcmVzcyIsInNlbmRQb3J0IiwicmF3U29ja2V0IiwibG9nZ2VyIiwibmFtZSIsImxldmVsIiwic3RyZWFtcyIsInN0cmVhbSIsInN0ZG91dCIsImVycm9yUmVwb3J0ZXJEaXJlY3RvcnkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFDQSxJQUFNQSxNQUFNQyxRQUFRRCxHQUFSLEVBQVo7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtrQkFDZTtBQUNiO0FBQ0E7QUFDQUUsV0FBUyxVQUhJOztBQUtiO0FBQ0FDLE9BQUssYUFOUTs7QUFRYkMsYUFBVyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQVJFO0FBU2I7QUFDQTtBQUNBQyxXQUFTLE9BWEk7O0FBYWI7QUFDQTtBQUNBQyxpQkFBZSxRQWZGOztBQWlCYjtBQUNBO0FBQ0E7QUFDQUMsZ0JBQWMsR0FwQkQ7QUFxQmI7O0FBRUE7QUFDQUMsUUFBTSxJQXhCTzs7QUEyQmI7QUFDQUMseUJBQXVCLElBNUJWOztBQThCYjtBQUNBQyxtQkFBaUIsZUFBS0MsSUFBTCxDQUFVWCxHQUFWLEVBQWUsUUFBZixDQS9CSjs7QUFpQ2I7QUFDQVkscUJBQW1CLGVBQUtELElBQUwsQ0FBVVgsR0FBVixFQUFlLE1BQWYsQ0FsQ047O0FBcUNiO0FBQ0E7QUFDQTtBQUNBYSxZQUFVLEtBeENHOztBQTBDYjtBQUNBO0FBQ0E7QUFDQUMsY0FBWTtBQUNWQyxTQUFLLElBREs7QUFFVkMsVUFBTTtBQUZJLEdBN0NDOztBQWtEYjtBQUNBQyxjQUFZO0FBQ1ZDLFNBQUssRUFESztBQUVWO0FBQ0FDLGdCQUFZLENBQUMsV0FBRDtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVlUsR0FuREM7O0FBZ0ViO0FBQ0E7QUFDQTtBQUNBQyxTQUFPO0FBQ0xDLFVBQU07QUFDSkMsYUFBTyxDQURIO0FBRUpDLGNBQVEsQ0FGSjtBQUdKO0FBQ0FDLGtCQUFZO0FBSlIsS0FERDtBQU9MO0FBQ0FDLFlBQVEsSUFSSDtBQVNMO0FBQ0FDLGlCQUFhLElBVlI7QUFXTDtBQUNBQywyQkFBdUIsQ0FabEI7QUFhTDtBQUNBO0FBQ0FDLGNBQVVDO0FBZkwsR0FuRU07O0FBcUZiO0FBQ0FDLFlBQVUsRUF0Rkc7O0FBd0ZiO0FBQ0FDLE9BQUs7QUFDSDtBQUNBQyxvQkFBZ0IsV0FGYjtBQUdIO0FBQ0FDLGlCQUFhLEtBSlY7QUFLSDtBQUNBQyxpQkFBYSxXQU5WO0FBT0g7QUFDQUMsY0FBVTtBQVJQLEdBekZROztBQW9HYjtBQUNBQyxhQUFXO0FBQ1Q7QUFDQTtBQUNBNUIsVUFBTTtBQUhHLEdBckdFOztBQTJHYjtBQUNBNkIsVUFBUTtBQUNOQyxVQUFNLFlBREE7QUFFTkMsV0FBTyxNQUZEO0FBR05DLGFBQVMsQ0FBQztBQUNSRCxhQUFPLE1BREM7QUFFUkUsY0FBUXhDLFFBQVF5QztBQUZSLEtBQUQ7QUFISCxHQTVHSzs7QUF3SGI7QUFDQUMsMEJBQXdCLGVBQUtoQyxJQUFMLENBQVVYLEdBQVYsRUFBZSxNQUFmLEVBQXVCLFNBQXZCO0FBekhYLEMiLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxuXG4vLyBDb25maWd1cmF0aW9uIG9mIHRoZSBhcHBsaWNhdGlvbi5cbi8vIE90aGVyIGVudHJpZXMgY2FuIGJlIGFkZGVkIChhcyBsb25nIGFzIHRoZWlyIG5hbWUgZG9lc24ndCBjb25mbGljdCB3aXRoXG4vLyBleGlzdGluZyBvbmVzKSB0byBkZWZpbmUgZ2xvYmFsIHBhcmFtZXRlcnMgb2YgdGhlIGFwcGxpY2F0aW9uIChlLmcuIEJQTSxcbi8vIHN5bnRoIHBhcmFtZXRlcnMpIHRoYXQgY2FuIHRoZW4gYmUgc2hhcmVkIGVhc2lseSBhbW9uZyBhbGwgY2xpZW50cyB1c2luZ1xuLy8gdGhlIGBzaGFyZWQtY29uZmlnYCBzZXJ2aWNlLlxuZXhwb3J0IGRlZmF1bHQge1xuICAvLyBuYW1lIG9mIHRoZSBhcHBsaWNhdGlvbiwgdXNlZCBpbiB0aGUgYC5lanNgIHRlbXBsYXRlIGFuZCBieSBkZWZhdWx0IGluXG4gIC8vIHRoZSBgcGxhdGZvcm1gIHNlcnZpY2UgdG8gcG9wdWxhdGUgaXRzIHZpZXdcbiAgYXBwTmFtZTogJ2VsZW1lbnRzJyxcblxuICAvLyBuYW1lIG9mIHRoZSBlbnZpcm9ubmVtZW50ICgncHJvZHVjdGlvbicgZW5hYmxlIGNhY2hlIGluIGV4cHJlc3MgYXBwbGljYXRpb24pXG4gIGVudjogJ2RldmVsb3BtZW50JyxcblxuICBzb21lQXJyYXk6IFswLCAxLCAyXSxcbiAgLy8gdmVyc2lvbiBvZiBhcHBsaWNhdGlvbiwgY2FuIGJlIHVzZWQgdG8gZm9yY2UgcmVsb2FkIGNzcyBhbmQganMgZmlsZXNcbiAgLy8gZnJvbSBzZXJ2ZXIgKGNmLiBgaHRtbC9kZWZhdWx0LmVqc2ApXG4gIHZlcnNpb246ICcwLjAuMScsXG5cbiAgLy8gbmFtZSBvZiB0aGUgZGVmYXVsdCBjbGllbnQgdHlwZSwgaS5lLiB0aGUgY2xpZW50IHRoYXQgY2FuIGFjY2VzcyB0aGVcbiAgLy8gYXBwbGljYXRpb24gYXQgaXRzIHJvb3QgVVJMXG4gIGRlZmF1bHRDbGllbnQ6ICdwbGF5ZXInLFxuXG4gIC8vIGRlZmluZSBmcm9tIHdoZXJlIHRoZSBhc3NldHMgKHN0YXRpYyBmaWxlcykgc2hvdWxkIGJlIGxvYWRlZCwgdGhlc2UgdmFsdWVcbiAgLy8gY291bGQgYWxzbyByZWZlciB0byBhIHNlcGFyYXRlIHNlcnZlciBmb3Igc2NhbGFiaWxpdHkgcmVhc29ucy4gVGhpcyB2YWx1ZVxuICAvLyBzaG91bGQgYWxzbyBiZSB1c2VkIGNsaWVudC1zaWRlIHRvIGNvbmZpZ3VyZSB0aGUgYGF1ZGlvLWJ1ZmZlci1tYW5hZ2VyYCBzZXJ2aWNlLlxuICBhc3NldHNEb21haW46ICcvJyxcbiAgLy8gYXNzZXRzRG9tYWluOiAnL2FwcHMvZWxlbWVudHMvJyxcblxuICAvLyBwb3J0IHVzZWQgdG8gb3BlbiB0aGUgaHR0cCBzZXJ2ZXIsIGluIHByb2R1Y3Rpb24gdGhpcyB2YWx1ZSBpcyB0eXBpY2FsbHkgODBcbiAgcG9ydDogOTAwMCxcblxuXG4gIC8vIGRlZmluZSBpZiB0aGUgc2VydmVyIHNob3VsZCB1c2UgZ3ppcCBjb21wcmVzc2lvbiBmb3Igc3RhdGljIGZpbGVzXG4gIGVuYWJsZUdaaXBDb21wcmVzc2lvbjogdHJ1ZSxcblxuICAvLyBsb2NhdGlvbiBvZiB0aGUgcHVibGljIGRpcmVjdG9yeSAoYWNjZXNzaWJsZSB0aHJvdWdoIGh0dHAocykgcmVxdWVzdHMpXG4gIHB1YmxpY0RpcmVjdG9yeTogcGF0aC5qb2luKGN3ZCwgJ3B1YmxpYycpLFxuXG4gIC8vIGRpcmVjdG9yeSB3aGVyZSB0aGUgc2VydmVyIHRlbXBsYXRpbmcgc3lzdGVtIGxvb2tzIGZvciB0aGUgYGVqc2AgdGVtcGxhdGVzXG4gIHRlbXBsYXRlRGlyZWN0b3J5OiBwYXRoLmpvaW4oY3dkLCAnaHRtbCcpLFxuXG5cbiAgLy8gZGVmaW5lIGlmIHRoZSBIVFRQIHNlcnZlciBzaG91bGQgYmUgbGF1bmNoZWQgdXNpbmcgc2VjdXJlIGNvbm5lY3Rpb25zLlxuICAvLyBGb3IgZGV2ZWxvcG1lbnQgcHVycG9zZXMgd2hlbiBzZXQgdG8gYHRydWVgIGFuZCBubyBjZXJ0aWZpY2F0ZXMgYXJlIGdpdmVuXG4gIC8vIChjZi4gYGh0dHBzSW5mb3NgKSwgYSBzZWxmLXNpZ25lZCBjZXJ0aWZpY2F0ZSBpcyBjcmVhdGVkLlxuICB1c2VIdHRwczogZmFsc2UsXG5cbiAgLy8gcGF0aHMgdG8gdGhlIGtleSBhbmQgY2VydGlmaWNhdGUgdG8gYmUgdXNlZCBpbiBvcmRlciB0byBsYXVuY2ggdGhlIGh0dHBzXG4gIC8vIHNlcnZlci4gQm90aCBlbnRyaWVzIGFyZSByZXF1aXJlZCBvdGhlcndpc2UgYSBzZWxmLXNpZ25lZCBjZXJ0aWZpY2F0ZVxuICAvLyBpcyBnZW5lcmF0ZWQuXG4gIGh0dHBzSW5mb3M6IHtcbiAgICBrZXk6IG51bGwsXG4gICAgY2VydDogbnVsbCxcbiAgfSxcblxuICAvLyBzb2NrZXQuaW8gY29uZmlndXJhdGlvblxuICB3ZWJzb2NrZXRzOiB7XG4gICAgdXJsOiAnJyxcbiAgICAvLyB1cmw6ICc6OTAwMCcsXG4gICAgdHJhbnNwb3J0czogWyd3ZWJzb2NrZXQnXSxcbiAgICAvLyBwYXRoOiAnJ1xuICAgIC8vIHBhdGg6ICcvYXBwcy9lbGVtZW50cy9zb2NrZXQuaW8nLFxuICAgIC8vIEBub3RlOiBFbmdpbmVJTyBkZWZhdWx0c1xuICAgIC8vIHBpbmdUaW1lb3V0OiAzMDAwLFxuICAgIC8vIHBpbmdJbnRlcnZhbDogMTAwMCxcbiAgICAvLyB1cGdyYWRlVGltZW91dDogMTAwMDAsXG4gICAgLy8gbWF4SHR0cEJ1ZmZlclNpemU6IDEwRTcsXG4gIH0sXG5cbiAgLy8gZGVzY3JpYmUgdGhlIGxvY2F0aW9uIHdoZXJlIHRoZSBleHBlcmllbmNlIHRha2VzIHBsYWNlcywgdGhlc2VzIHZhbHVlcyBhcmVcbiAgLy8gdXNlZCBieSB0aGUgYHBsYWNlcmAsIGBjaGVja2luYCBhbmQgYGxvY2F0b3JgIHNlcnZpY2VzLlxuICAvLyBpZiBvbmUgb2YgdGhlc2Ugc2VydmljZSBpcyByZXF1aXJlZCwgdGhpcyBlbnRyeSBzaG91bGRuJ3QgYmUgcmVtb3ZlZC5cbiAgc2V0dXA6IHtcbiAgICBhcmVhOiB7XG4gICAgICB3aWR0aDogMSxcbiAgICAgIGhlaWdodDogMSxcbiAgICAgIC8vIHBhdGggdG8gYW4gaW1hZ2UgdG8gYmUgdXNlZCBpbiB0aGUgYXJlYSByZXByZXNlbnRhdGlvblxuICAgICAgYmFja2dyb3VuZDogbnVsbCxcbiAgICB9LFxuICAgIC8vIGxpc3Qgb2YgcHJlZGVmaW5lZCBsYWJlbHNcbiAgICBsYWJlbHM6IG51bGwsXG4gICAgLy8gbGlzdCBvZiBwcmVkZWZpbmVkIGNvb3JkaW5hdGVzIGdpdmVuIGFzIGFuIGFycmF5IG9mIGBbeDpOdW1iZXIsIHk6TnVtYmVyXWBcbiAgICBjb29yZGluYXRlczogbnVsbCxcbiAgICAvLyBtYXhpbXVtIG51bWJlciBvZiBjbGllbnRzIGFsbG93ZWQgaW4gYSBwb3NpdGlvblxuICAgIG1heENsaWVudHNQZXJQb3NpdGlvbjogMSxcbiAgICAvLyBtYXhpbXVtIG51bWJlciBvZiBwb3NpdGlvbnMgKG1heSBsaW1pdCBvciBiZSBsaW1pdGVkIGJ5IHRoZSBudW1iZXIgb2ZcbiAgICAvLyBsYWJlbHMgYW5kL29yIGNvb3JkaW5hdGVzKVxuICAgIGNhcGFjaXR5OiBJbmZpbml0eSxcbiAgfSxcblxuICAvLyBwYXNzd29yZCB0byBiZSB1c2VkIGJ5IHRoZSBgYXV0aGAgc2VydmljZVxuICBwYXNzd29yZDogJycsXG5cbiAgLy8gY29uZmlndXJhdGlvbiBvZiB0aGUgYG9zY2Agc2VydmljZVxuICBvc2M6IHtcbiAgICAvLyBJUCBvZiB0aGUgY3VycmVudGx5IHJ1bm5pbmcgbm9kZSBzZXJ2ZXJcbiAgICByZWNlaXZlQWRkcmVzczogJzEyNy4wLjAuMScsXG4gICAgLy8gcG9ydCBsaXN0ZW5pbmcgZm9yIGluY29tbWluZyBtZXNzYWdlc1xuICAgIHJlY2VpdmVQb3J0OiA1NzEyMSxcbiAgICAvLyBJUCBvZiB0aGUgcmVtb3RlIGFwcGxpY2F0aW9uXG4gICAgc2VuZEFkZHJlc3M6ICcxMjcuMC4wLjEnLFxuICAgIC8vIHBvcnQgd2hlcmUgdGhlIHJlbW90ZSBhcHBsaWNhdGlvbiBpcyBsaXN0ZW5pbmcgZm9yIG1lc3NhZ2VzXG4gICAgc2VuZFBvcnQ6IDU3MTIwLFxuICB9LFxuXG4gIC8vIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGByYXctc29ja2V0YCBzZXJ2aWNlXG4gIHJhd1NvY2tldDoge1xuICAgIC8vIHBvcnQgdXNlZCBmb3Igc29ja2V0IGNvbm5lY3Rpb25cbiAgICAvLyBwb3J0OiA4MDgwXG4gICAgcG9ydDogOTAwMFxuICB9LFxuXG4gIC8vIGJ1bnlhbiBjb25maWd1cmF0aW9uXG4gIGxvZ2dlcjoge1xuICAgIG5hbWU6ICdzb3VuZHdvcmtzJyxcbiAgICBsZXZlbDogJ2luZm8nLFxuICAgIHN0cmVhbXM6IFt7XG4gICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgc3RyZWFtOiBwcm9jZXNzLnN0ZG91dCxcbiAgICB9LCAvKiB7XG4gICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgcGF0aDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdsb2dzJywgJ3NvdW5kd29ya3MubG9nJyksXG4gICAgfSAqL11cbiAgfSxcblxuICAvLyBkaXJlY3Rvcnkgd2hlcmUgZXJyb3IgcmVwb3J0ZWQgZnJvbSB0aGUgY2xpZW50cyBhcmUgd3JpdHRlblxuICBlcnJvclJlcG9ydGVyRGlyZWN0b3J5OiBwYXRoLmpvaW4oY3dkLCAnbG9ncycsICdjbGllbnRzJyksXG59XG4iXX0=