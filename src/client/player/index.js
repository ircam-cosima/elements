// import client side soundworks and player experience
import { client } from 'soundworks/client';
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

  const presets = window.clientPresets;

  // configure views for the services
  client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const preset = presets[config.clientType];
  const experience = new PlayerExperience(config, preset);

  client.start();
}

window.addEventListener('load', bootstrap);
