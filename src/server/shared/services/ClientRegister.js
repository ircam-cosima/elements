import { Service, serviceManager } from 'soundworks/server';
import appStore from '../appStore';

const SERVICE_ID = 'service:client-register';

class ClientRegister extends Service {
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
    appStore.registerClient(client);
  }

  disconnect(client) {
    appStore.unregisterClient(client);
    super.disconnect(client);
  }
}

serviceManager.register(SERVICE_ID, ClientRegister);

export default ClientRegister;
