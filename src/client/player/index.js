// import client side soundworks and player experience
import { client } from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
import serviceViews from '../shared/serviceViews';

// load all modules
import ProjectParamsControlModule from '../shared/modules/project-params-control/ProjectParamsControlModule';
import ProjectManagerModule from '../shared/modules/project-manager/ProjectManagerModule';
import GestureRecognitionModule from '../shared/modules/gesture-recognition/GestureRecognitionModule';
import AudioRendererModule from '../shared/modules/audio-renderer/AudioRendererModule';
import CanvasRendererModule from '../shared/modules/canvas-renderer/CanvasRendererModule';
import RecordingControlModule from '../shared/modules/recording-control/RecordingControlModule';

import presets from './presets';

function bootstrap() {
  // initialize the client with configuration received
  // from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  client.init(config.clientType, config);

  // configure views for the services
  client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  let preset = null;

  if (Array.isArray(client.urlParams) && presets[client.urlParams[0]])
    preset = presets[client.urlParams[0]];
  else
    preset = presets['default'];

  const experience = new PlayerExperience(config, preset);
  client.start();
}

window.addEventListener('load', bootstrap);
