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
    this.isStreamingDecoding = false;

    this.gestureRecognitionModule = this.experience.getModule('gesture-recognition');

    this.processSensors = this.processSensors.bind(this);
    this.processDecoding = this.processDecoding.bind(this);

    this.sensorsBuffer = null;
    this.likelihoodsBuffer = null;
    this.timeProgressionsBuffer = null;
  }

  dispatch(action) {
    const { type, payload } = action;

    switch (type) {
      case 'update-player-param': {
        const streams = payload.params.streams;

        // sensors streaming
        const streamSensors = streams.sensors;

        if (streamSensors !== this.isStreamingSensors) {
          if (streamSensors)
            this.gestureRecognitionModule.addSensorsListener(this.processSensors);
          else
            this.gestureRecognitionModule.removeSensorsListener(this.processSensors);

          this.isStreamingSensors = streamSensors;
        }

        // decoding streaming
        const streamDecoding = streams.decoding;

        if (streamDecoding !== this.isStreamingDecoding) {
          if (streamDecoding)
            this.gestureRecognitionModule.addDecoderListener(this.processDecoding);
          else
            this.gestureRecognitionModule.removeDecoderListener(this.processDecoding);

          this.isStreamingDecoding = streamDecoding;
        }
        break;
      }
    }
  }

  processSensors(data) {
    const rawSocket = this.experience.rawSocket;

    if (!this.sensorsBuffer) {
      this.sensorsBuffer = new Float32Array(data.length + 1);
      this.sensorsBuffer[0] = client.index;
    }

    for (let i = 0; i < data.length; i++)
      this.sensorsBuffer[i + 1] =  data[i];

    rawSocket.send('sensors', this.sensorsBuffer);
  }

  processDecoding(results) {
    this.experience.send('decoding', client.index, results);
  }
}

moduleManager.register(MODULE_ID, StreamsModule);

export default StreamsModule;
