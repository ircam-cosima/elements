import { client, audioContext } from 'soundworks/client';
import * as lfo from 'waves-lfo/common';
import * as mano from 'mano-js';
import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';
// import AutoTrigger from './AutoTrigger';
import CountDownTrigger from './CountDownTrigger';
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
      'update-audio-files',
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
    this.preview = false;
    this.currentProject = null;

    this.view = new RecordingControlView();
    this.view.model.labels = Object.keys(this.experience.audioBufferManager.data.labels);

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

    this.trigger = new CountDownTrigger({
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
      countCallback: counter => {
        const buffer = this.experience.audioBufferManager.data.uiSounds['startRecord'];
        this.sampleSynth.trigger(buffer);
      },
    });

    this.exampleRecorder = new mano.Example();

    this.feedRecorder = this.feedRecorder.bind(this);
    this.feedTrigger = this.feedTrigger.bind(this);

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

    if (type === 'update-audio-files') {
      const audioFiles = payload;
      this.view.model.labels = Object.keys(payload);
    }

    // handle trained labels
    if (type === 'update-model' || type === 'add-player-to-project') {
      const model = type === 'update-model' ? payload.model : payload.project.model;
      const trainedLabels = model.payload.models.map(mod => mod.label);

      this.view.model.trainedLabels = trainedLabels;
    }

    // handle trigger params
    if (type === 'add-player-to-project' || type === 'update-project-param') {
      let recording = null;
      // let audioFiles = null;

      if (type === 'add-player-to-project') {
        recording = payload.project.params.recording.options;
        // audioFiles = payload.project.params.audioFiles
      } else {
        recording = payload.params.recording.options;
        // audioFiles = payload.params.audioFiles;
      }

      this.trigger.threshold = recording.threshold;
      this.trigger.offDelay = recording.offDelay;
      this.trigger.preRollCount = recording.preRollCount;
      this.trigger.preRollInterval = recording.preRollInterval;
    }

    // handle recording state
    if (type === 'add-player-to-project' || type === 'update-player-param') {
      switch (type) {
        case 'add-player-to-project': {
          this.currentProject = payload.project;
          // @todo - reset any ongoing recording and should set state to `idle`
          recordParams = payload.player.params.record;
          break;
        }
        case 'update-player-param': {
          recordParams = payload.params.record;
          break;
        }
      }

      const gestureRecognitionModule = this.experience.getModule('gesture-recognition');
      const audioRendererModule = this.experience.getModule('audio-renderer');

      // audio preview
      if (this.preview !== recordParams.preview) {
        this.preview = recordParams.preview;
        const audioRendererModule = this.experience.getModule('audio-renderer');

        if (this.preview) {
          gestureRecognitionModule.disableDecoding();
          audioRendererModule.enablePreview(recordParams.label);
        } else {
          audioRendererModule.disablePreview();
          gestureRecognitionModule.enableDecoding();
        }
      }

      // update preview on label change
      if (this.preview && this.recordLabel !== recordParams.label) {
        audioRendererModule.enablePreview(recordParams.label);
      }

      this.view.model.recordState = recordParams.state;
      this.view.model.recordLabel = recordParams.label;
      this.view.model.preview = recordParams.preview;
      this.recordLabel = recordParams.label;

      // recording state machine
      if (this.recordState !== recordParams.state) {
        this.recordState = recordParams.state;

        // recording state machine
        switch (recordParams.state) {
          case 'idle': {
            // we should be able to go idle from any state (ex change project while recording)
            gestureRecognitionModule.removeSensorsListener(this.feedRecorder);
            gestureRecognitionModule.removeSensorsListener(this.feedTrigger);
            gestureRecognitionModule.enableDecoding();
            this.exampleRecorder.clear();
            break;
          }
          case 'armed': {
            this.trigger.setState('preroll');

            gestureRecognitionModule.disableDecoding();

            audioRendererModule.enablePreview(this.recordLabel);
            break;
          }
          case 'recording': {
            this.trigger.setState('on');

            const buffer = this.experience.audioBufferManager.data.uiSounds['startRecord'];
            this.sampleSynth.trigger(buffer);
            // pipe sensors into an example instance
            gestureRecognitionModule.addSensorsListener(this.feedTrigger);
            gestureRecognitionModule.addSensorsListener(this.feedRecorder);
            break;
          }
          case 'pending': {
            const buffer = this.experience.audioBufferManager.data.uiSounds['stopRecord'];
            this.sampleSynth.trigger(buffer);
            // stop auto trigger
            gestureRecognitionModule.removeSensorsListener(this.feedTrigger);
            gestureRecognitionModule.removeSensorsListener(this.feedRecorder);

            audioRendererModule.disablePreview();

            this.trigger.setState('off');
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

  feedTrigger(data) {
    this.trigger.process(data[1]); // enhanced intensity
  }

  feedRecorder(data) {
    this.exampleRecorder.addElement(data);
  }
}

moduleManager.register(MODULE_ID, RecordingControlModule);

export default RecordingControlModule;
