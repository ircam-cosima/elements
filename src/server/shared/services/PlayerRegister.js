import { Service, serviceManager } from 'soundworks/server';
import appStore from '../appStore';

const SERVICE_ID = 'service:player-register';

class PlayerRegister extends Service {
  constructor() {
    super(SERVICE_ID);
  }

  start() {
    super.start();
    this.ready();
  }

  /** @private */
  connect(client) {
    super.connect(client);
    appStore.registerPlayer(client);
  }

  disconnect(client) {
    appStore.unregisterPlayer(client);
    super.disconnect(client);
  }
}

serviceManager.register(SERVICE_ID, PlayerRegister);

export default PlayerRegister;
