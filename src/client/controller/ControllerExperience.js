import * as soundworks from 'soundworks/client';

class ControllerExperience extends soundworks.ControllerExperience {
  constructor() {
    super();

    this.setGuiOptions('sensitivity', { type: 'slider', size: 'large' });
  }

  start() {
    super.start();
  }
}

export default ControllerExperience;