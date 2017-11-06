// import client side soundworks and player experience
import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
import serviceViews from '../shared/serviceViews';
import projectManager from '../shared/services/ProjectManager';

import ProjectChooserModule from '../shared/modules/project-chooser/ProjectChooserModule';
import AudioControlModule from '../shared/modules/audio-control/AudioControlModule';
import RecordingControlModule from '../shared/modules/recording-control/RecordingControlModule';
import ModelSyncModule from '../shared/modules/model-sync/ModelSyncModule';
import ProjectParamsControlModule from '../shared/modules/project-params-control/ProjectParamsControlModule';

function bootstrap() {
  // initialize the client with configuration received
  // from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  // configure views for the services
  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const modules = [
    ProjectParamsControlModule,
    ModelSyncModule,
    ProjectChooserModule,
    AudioControlModule,
    RecordingControlModule,
  ];

  // create client side (player) experience and start the client
  const experience = new PlayerExperience(config.assetsDomain, modules);
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
