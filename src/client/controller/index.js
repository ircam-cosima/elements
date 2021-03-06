import * as soundworks from 'soundworks/client';
import ControllerExperience from './ControllerExperience';
import serviceViews from '../shared/serviceViews';

// import shared modules
import * as modules from '../shared/modules/index';

function bootstrap() {
  document.body.classList.remove('loading');

  // initialize the client with configuration received
  // from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  const clientPresets = window.clientPresets;
  const projectPresets = window.projectPresets;
  const audioFiles = config.audioFiles;

  // configure views for the services
  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const experience = new ControllerExperience(config, clientPresets, projectPresets, audioFiles);
  soundworks.client.start();

  soundworks.client.socket.addStateListener((name) => {
    if (name === 'disconnect') {
      setTimeout(() => window.location.reload(true), 2000);
    }
  });
}

window.addEventListener('load', bootstrap);
