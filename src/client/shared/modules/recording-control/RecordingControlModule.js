import { client } from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import * as mano from 'mano-js';
import AutoTrigger from './AutoTrigger';
import BaseModule from '../BaseModule';
import merge from 'lodash.merge';
import RecordingControlView from './RecordingControlView';

const MODULE_ID = 'recording-control';

class RecordingControlModule extends BaseModule {
  constructor(experience, options = {}) {
    super(MODULE_ID, experience);

    this.options = Object.assign({
      viewContainer: '#recording-control',
    }, options);

    this.allowedActions = [
      'add-player-to-project',
      'update-player-param',
      // ...
      'add-example',
      'clear-examples',
      'clear-all-examples',
    ];

    this.recordState = null;
    this.recordLabel = null;
    this.currentProject = null;

    this.view = new RecordingControlView();
    this.view.request = (type, payload) => {
      switch (type) {
        case 'update-player-param':
          payload.uuid = client.uuid;
          this.request({ type, payload });
          break;
        case 'clear-examples':
        case 'clear-all-examples':
          payload.uuid = this.currentProject.uuid;
          this.request({ type, payload });
          break;
      }
    };

    this.feedRecorder = this.feedRecorder.bind(this);
    this.feedAutoTrigger = this.feedAutoTrigger.bind(this);
  }

  // mano and lfo sensor chain are ready at this point
  start() {
    super.start();

    this.autoTrigger = new AutoTrigger({
      startCallback: () => {
        console.log('start callback');
        const action = {
          type: 'update-player-param',
          payload: {
            uuid: client.uuid,
            name: 'record.state',
            value: 'record',
          },
        };

        this.request(action);
      },
      stopCallback: () => {
        console.log('stop callback');
        const action = {
          type: 'update-player-param',
          payload: {
            uuid: client.uuid,
            name: 'record.state',
            value: 'stop',
          },
        };

        this.request(action);
      },
    });

    this.exampleRecorder = new mano.Example();
  }

  show() {
    this.view.render();
    this.view.show();
    this.view.appendTo(this.experience.getContainer('#recording-control'));
  }

  // hide() {}

  dispatch(action) {
    const { type, payload } = action;
    let recordParams;

    switch (type) {
      case 'add-player-to-project':
        this.view.model.labels = Object.keys(payload.project.params.audio);
        this.currentProject = payload.project;

        // set state to idle - reset any ongoing recording

        recordParams = payload.player.params.record;
        break;
      case 'update-player-param':
        recordParams = payload.params.record;
        break;
    }

    this.recordLabel = recordParams.label;

    if (this.recordState !== recordParams.state) {
      this.recordState = recordParams.state;

      // const decodingModule = this.experience.modules.get('decoding');

      // recording state machine
      switch (recordParams.state) {
        case 'idle': {
          // we should be able to go idle from any state (ex change project while recording)
          this.experience.processedSensors.removeListener(this.feedRecorder);
          // this.experience.processedSensors.addListener(decodingModule.feedDecoder);
          // this.exampleRecorder.clear();
          break;
        }
        case 'armed': {
          this.autoTrigger.setState('on');
          // this.experience.processedSensors.removeListener(decodingModule.feedDecoder);
          this.experience.processedSensors.addListener(this.feedAutoTrigger);
          break;
        }
        case 'recording': {
          // @note - if record has been launched from controller, auto trigger
          // is still in `off` and thus cannot trigger `stop`, define if it is
          // a desirable behavior.

          // pipe sensors into an example instance
          this.experience.processedSensors.addListener(this.feedRecorder);
          break;
        }
        case 'pending': {
          // stop auto trigger
          this.experience.processedSensors.removeListener(this.feedAutoTrigger);
          this.experience.processedSensors.removeListener(this.feedRecorder);
          this.autoTrigger.setState('off');
          // wait...
          break;
        }
        case 'confirm': {
          // send the example
          this.exampleRecorder.setLabel(this.recordLabel);
          const example = this.exampleRecorder.getExample();

          const addExampleAction = {
            type: 'add-example',
            payload: {
              uuid: this.currentProject.uuid,
              example: example,
            },
          };

          this.request(addExampleAction);
          this.exampleRecorder.clear();

          // go back to idle state
          const idleAction = {
            type: 'update-player-param',
            payload: {
              uuid: client.uuid,
              name: 'record.state',
              value: 'idle',
            },
          };

          this.request(idleAction);
          break;
        }
        case 'cancel': {
          this.exampleRecorder.clear();
          // go back to idle state
          const idleAction = {
            type: 'update-player-param',
            payload: {
              uuid: client.uuid,
              name: 'record.state',
              value: 'idle',
            },
          };

          this.request(idleAction);
          break;
        }
      }
    }

    merge(this.view.model, recordParams);
    // this.view.model.state = 'pending';
    this.view.render();
  }

  feedAutoTrigger(data) {
    this.autoTrigger.process(data[1]); // enhanced intensity
  }

  feedRecorder(data) {
    this.exampleRecorder.addElement(data);
  }
}

export default RecordingControlModule;
