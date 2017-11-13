import { client } from 'soundworks/client';
import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';

const MODULE_ID = 'stream-sensors';

class StreamSensorsModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.options = Object.assign({

    }, options);

    this.subscriptions = [
      'update-player-param',
    ];

    this.dependencies = [
      'gesture-recognition',
    ];

    this.isStreaming = false;

    this.gestureRecognitionModule = this.experience.getModule('gesture-recognition');

    this.processSensors = this.processSensors.bind(this);
    this.buffer = null;
  }

  dispatch(action) {
    const { type, payload } = action;

    switch (type) {
      case 'update-player-param': {
        const stream = payload.params.sensors.stream;

        if (stream !== this.isStreaming) {
          if (stream)
            this.gestureRecognitionModule.addSensorsListener(this.processSensors);
          else
            this.gestureRecognitionModule.removeSensorsListener(this.processSensors);

          this.isStreaming = stream;
        }
        break;
      }
    }
  }

  processSensors(data) {
    const rawSocket = this.experience.rawSocket;

    if (!this.buffer)
      this.buffer = new Float32Array(data.length + 1);

    this.buffer[0] = client.index;

    for (let i = 0; i < data.length; i++)
      this.buffer[i + 1] =  data[i];

    rawSocket.send('sensors', this.buffer);
  }
}

moduleManager.register(MODULE_ID, StreamSensorsModule);

export default StreamSensorsModule;
