import { client, audioContext } from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import * as mano from 'mano-js';
import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';
import AutoTrigger from './AutoTrigger';
import merge from 'lodash.merge';
import RecordingControlView from './RecordingControlView';
import SampleSynth from '../../audio/SampleSynth';

const MODULE_ID = 'recording-control';

class RecordingControlModule extends BaseModule {
  constructor(experience, options = {}) {
    super(MODULE_ID, experience);

    this.options = Object.assign({}, options);

    this.subscriptions = [
      'add-player-to-project',
      'update-player-param',
      'update-project-param',
      'update-model',
    ];

    this.allowedRequests = [
      'update-player-param',
      'add-example',
      'clear-examples',
      'clear-all-examples',
    ];

    this.dependencies = [
      'gesture-recognition',
      'audio-renderer',
    ]

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

    this.autoTrigger = new AutoTrigger({
      startCallback: () => {
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

    this.feedRecorder = this.feedRecorder.bind(this);
    this.feedAutoTrigger = this.feedAutoTrigger.bind(this);

    this.sampleSynth = new SampleSynth();
    this.sampleSynth.connect(audioContext.destination); // bypass mute
  }

  show() {
    this.view.render();
    this.view.show();
    this.view.appendTo(this.getContainer());
  }

  dispatch(action) {
    const { type, payload } = action;
    let recordParams;

    // handle trained labels
    if (type === 'update-model' || type === 'add-player-to-project') {
      const model = type === 'update-model' ? payload.model : payload.project.model;
      const trainedLabels = model.payload.models.map(mod => mod.label);

      this.view.model.trainedLabels = trainedLabels;
    }

    // handle autoTrigger params
    if (type === 'add-player-to-project' || type === 'update-project-param') {
      let recording = null;

      if (type === 'add-player-to-project')
        recording = payload.project.params.recording.options;
      else
        recording = payload.params.recording.options;

      this.autoTrigger.highThreshold = recording.highThreshold;
      this.autoTrigger.lowThreshold = recording.lowThreshold;
      this.autoTrigger.offDelay = recording.offDelay;
    }

    // handle recording state
    if (type === 'add-player-to-project' || type === 'update-player-param') {
      switch (type) {
        case 'add-player-to-project':
          const audioFiles = payload.project.params.audioFiles;
          this.view.model.labels = Object.keys(audioFiles);
          this.currentProject = payload.project;
          // @todo - reset any ongoing recording and should set state to `idle`

          recordParams = payload.player.params.record;
          break;
        case 'update-player-param':
          recordParams = payload.params.record;
          break;
      }

      this.recordLabel = recordParams.label;
      this.view.model.recordState = recordParams.state;
      this.view.model.recordLabel = recordParams.label;

      // recording state machine
      if (this.recordState !== recordParams.state) {
        this.recordState = recordParams.state;

        const gestureRecognitionModule = this.experience.getModule('gesture-recognition');
        const gestureAudioRendererModule = this.experience.getModule('audio-renderer');

        // recording state machine
        switch (recordParams.state) {
          case 'idle': {
            // we should be able to go idle from any state (ex change project while recording)
            gestureRecognitionModule.removeSensorsListener(this.feedRecorder);
            gestureRecognitionModule.removeSensorsListener(this.feedAutoTrigger);
            gestureRecognitionModule.enableDecoding();
            this.exampleRecorder.clear();
            break;
          }
          case 'armed': {
            this.autoTrigger.setState('on');
            // this.experience.processedSensors.removeListener(decodingModule.feedDecoder);
            gestureRecognitionModule.addSensorsListener(this.feedAutoTrigger);
            gestureRecognitionModule.disableDecoding();

            gestureAudioRendererModule.enablePreview(this.recordLabel);
            break;
          }
          case 'recording': {
            // @note - if record has been launched from controller, auto trigger
            // is still in `off` and thus cannot trigger `stop`, define if it is
            // a desirable behavior.
            const buffer = this.experience.audioBufferManager.data.uiSounds['startRecord'];
            this.sampleSynth.trigger(buffer);
            // pipe sensors into an example instance
            gestureRecognitionModule.addSensorsListener(this.feedRecorder);
            break;
          }
          case 'pending': {
            const buffer = this.experience.audioBufferManager.data.uiSounds['stopRecord'];
            this.sampleSynth.trigger(buffer);
            // stop auto trigger
            this.autoTrigger.setState('off');

            gestureRecognitionModule.removeSensorsListener(this.feedAutoTrigger);
            gestureRecognitionModule.removeSensorsListener(this.feedRecorder);

            gestureAudioRendererModule.disablePreview()
            break;
          }
          case 'confirm': {
            // send the example
            this.exampleRecorder.setLabel(this.recordLabel);
            const example = this.exampleRecorder.toJSON();

            const addExampleAction = {
              type: 'add-example',
              payload: {
                uuid: this.currentProject.uuid,
                example: example,
              },
            };

            const idleAction = {
              type: 'update-player-param',
              payload: {
                uuid: client.uuid,
                name: 'record.state',
                value: 'idle',
              },
            };

            this.request(addExampleAction);
            this.request(idleAction);
            break;
          }
          case 'cancel': {
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
    }

    this.view.render();
  }

  feedAutoTrigger(data) {
    this.autoTrigger.process(data[1]); // enhanced intensity
  }

  feedRecorder(data) {
    this.exampleRecorder.addElement(data);
  }
}

moduleManager.register(MODULE_ID, RecordingControlModule);

export default RecordingControlModule;
