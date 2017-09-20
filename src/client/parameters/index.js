// import soundworks (client side) and Soundfield experience
import * as soundworks from 'soundworks/client';
import serviceViews from '../shared/serviceViews';

function bootstrap() {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  // configure views for the services
  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  // instanciate the experience of the `player`
  const parameters = new soundworks.ControllerExperience();

  parameters.require('auth');

  parameters.setGuiOptions('sensitivity', { type: 'slider', size: 'large' });
  parameters.setGuiOptions('intensityFeedback', { type: 'slider', size: 'large' });
  parameters.setGuiOptions('intensityGain', { type: 'slider', size: 'large' });
  parameters.setGuiOptions('intensityPower', { type: 'slider', size: 'large' });
  parameters.setGuiOptions('intensityLowClip', { type: 'slider', size: 'large' });
  parameters.setGuiOptions('bandpassGain', { type: 'slider', size: 'large' });

  // start the application
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);