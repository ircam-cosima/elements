// import soundworks (client side) and Soundfield experience
import * as soundworks from 'soundworks/client';
// import ControllerExperience from './ControllerExperience';
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

  // instanciate the experience of the `controller`
  const controller = new soundworks.ControllerExperience();
  controller.setGuiOptions('sensitivity', { type: 'slider', size: 'large' });
  controller.setGuiOptions('intensityFeedback', { type: 'slider', size: 'large' });
  controller.setGuiOptions('intensityGain', { type: 'slider', size: 'large' });
  controller.setGuiOptions('intensityPower', { type: 'slider', size: 'large' });
  controller.setGuiOptions('intensityLowClip', { type: 'slider', size: 'large' });

  // start the application
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);