import { client } from 'soundworks/client';
import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';

const MODULE_ID = 'streams';

class StreamsModule extends BaseModule {
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

    this.isStreamingSensors = false;

    this.gestureRecognitionModule = this.experience.getModule('gesture-recognition');

    this.processSensors = this.processSensors.bind(this);
    this.sensorsBuffer = null;
  }

  dispatch(action) {
    const { type, payload } = action;

    switch (type) {
      case 'update-player-param': {
        const streamSensors = payload.params.streams.sensors;

        if (streamSensors !== this.isStreamingSensors) {
          if (streamSensors)
            this.gestureRecognitionModule.addSensorsListener(this.processSensors);
          else
            this.gestureRecognitionModule.removeSensorsListener(this.processSensors);

          this.isStreamingSensors = streamSensors;
        }
        break;
      }
    }
  }

  processSensors(data) {
    const rawSocket = this.experience.rawSocket;

    if (!this.sensorsBuffer)
      this.sensorsBuffer = new Float32Array(data.length + 1);

    this.sensorsBuffer[0] = client.index;

    for (let i = 0; i < data.length; i++)
      this.sensorsBuffer[i + 1] =  data[i];

    rawSocket.send('sensors', this.sensorsBuffer);
  }
}

moduleManager.register(MODULE_ID, StreamsModule);

export default StreamsModule;
