import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';
import ModelUpdateNotificationView from './ModelUpdateNotificationView';
import * as mano from 'mano-js';

const MODULE_ID = 'gesture-recognition';

class GestureRecognitionModule extends BaseModule {
  constructor(experience, options = {}) {
    super(MODULE_ID, experience);

    this.options = Object.assign({}, options);

    this.subscriptions = [
      'add-player-to-project',
      'update-model',
    ];

    this.decoderInputs = null;
    // notification of model update
    this.view = new ModelUpdateNotificationView();

    this.decoderListeners = new Set();
    this.feedDecoder = this.feedDecoder.bind(this);
  }

  init() {
    this.processedSensors = new mano.ProcessedSensors();
    this.decoder = new mano.XmmProcessor({ /* @todo: pass options */ });
    this.decoder.setConfig({ likelihoodWindow: 20 });

    return this.processedSensors.init();
  }

  start() {
    super.start();

    this.processedSensors.start();
  }

  show() {
    this.view.render();
    this.view.show();
    this.view.appendTo(this.getContainer());
  }

  dispatch(action) {
    const { type, payload } = action;
    let model = null;

    switch (type) {
      case 'add-player-to-project': {
        model = payload.project.model;
        this.decoderInputs = payload.project.params.learning.inputs;
        break;
      }
      case 'update-model': {
        model = payload.model;
        this.decoderInputs = payload.params.learning.inputs;
        break;
      }
    }

    if (model !== null) {
      this.disableDecoding();
      this.decoder.setModel(model);
      this.enableDecoding();

      this.view.model.state = 'notification';
      this.view.render();
    }
  }

  addSensorsListener(callback) {
    this.processedSensors.addListener(callback);
  }

  removeSensorsListener(callback) {
    this.processedSensors.removeListener(callback);
  }

  addDecoderListener(callback) {
    this.decoderListeners.add(callback);
  }

  removeDecoderListener(callback) {
    this.decoderListeners.delete(callback);
  }

  enableDecoding() {
    this.addSensorsListener(this.feedDecoder);
  }

  disableDecoding() {
    this.removeSensorsListener(this.feedDecoder);
  }

  feedDecoder(data) {
    if (this._checkDataIntegrity(data)) {
      const { intensity, bandpass, orientation } = this.decoderInputs;

      // filter data according to `project.params.learning.inputs`
      if (!intensity || !bandpass || !orientation) {
        const filteredData = [];
        let index = 0;

        if (intensity) {
          for (let i = 0; i < 2; i++) {
            filteredData[index] = data[i];
            index += 1;
          }
        }

        if (bandpass) {
          for (let i = 2; i < 5; i++) {
            filteredData[index] = data[i];
            index += 1;
          }
        }

        if (orientation) {
          for (let i = 5; i < 8; i++) {
            filteredData[index] = data[i];
            index += 1;
          }
        }

        if (filteredData.length !== 0)
          data = filteredData;
      }

      const results = this.decoder.run(data);

      // don't forward when no results
      if (results !== null)
        this.decoderListeners.forEach(callback => callback(results));
    } else {
      console.warn('Invalid processedSensors data', data);
    }
  }

  /**
   * Sometimes processedSensors seems to output invalid data, this should not
   * happend but should not crashe the application neither,when this problem is
   * fixed, we will be able to remove that check.
   */
  _checkDataIntegrity(data) {
    for (let i = 0; i < data.length; i++) {
      if (!Number.isFinite(data[i]) && data[i] !== null) {
        this.send('logFaultySensorData', data);
        return false;
      }
    }

    return true;
  }
}

moduleManager.register(MODULE_ID, GestureRecognitionModule);

export default GestureRecognitionModule;
