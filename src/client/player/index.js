// import client side soundworks and player experience
import { client, serviceManager } from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
import serviceViews from '../shared/serviceViews';
// load modules
import * as modules from '../shared/modules/index';


function bootstrap() {
  document.body.classList.remove('loading');
  // initialize the client with configuration received
  // from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  client.init(config.clientType, config);

  const clientPresets = window.clientPresets;
  const clientPreset = clientPresets[config.clientType];
  const projectPresets = window.projectPresets;
  const audioFiles = config.audioFiles;

  // configure views for the services
  client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const platformService = client.require('platform');

  platformService.addFeatureDefinition({
    id: 'device-sensor',
    check: function () {
      return client.platform.isMobile; // true if phone or tablet
    },
    interactionHook() {
      return new Promise((resolve, reject) => {
        if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
          window.DeviceMotionEvent.requestPermission()
            .then(response => {
              if (response == 'granted') {
                resolve(true);
              } else {
                resolve(false);
              }
            })
            .catch(err => {
              resolve(false);
            })
        } else {
          resolve(true);
        }
      });
    }
  });

  const experience = new PlayerExperience(config, clientPreset, projectPresets, audioFiles);

  client.start();

  console.log(client);

  client.socket.addStateListener((name) => {
    if (name === 'disconnect') {
      setTimeout(() => window.location.reload(true), 2000);
    }
  });
}

window.addEventListener('load', bootstrap);
