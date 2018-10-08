import { client } from 'soundworks/client';
import AudioControlView from './AudioControlView';
import BaseModule from '../BaseModule';
import Instrument from './Instrument';
import moduleManager from '../moduleManager';
import merge from 'lodash.merge';


const MODULE_ID = 'audio-renderer';

class AudioRendererModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.options = merge({
      showView: true,
    }, options);

    this.subscriptions = [
      'add-player-to-project',
      'remove-player-from-project',
      'update-player-param',
      'update-project-param',
      'update-model',
      'update-audio-files',
    ];

    this.allowedRequests = [
      'update-player-param',
    ];

    this.dependencies = [
      'gesture-recognition'
    ];

    this.gestureRecognitionModule = this.experience.getModule('gesture-recognition');

    this.processSensorsData = this.processSensorsData.bind(this);
    this.processDecoderOutput = this.processDecoderOutput.bind(this);
    this.instrument = null;

    if (this.options.showView) {
      this.view = new AudioControlView();
      this.view.request = (type, payload) => {
        payload.uuid = client.uuid;
        const action = { type, payload };

        this.request(action);
      }
    }
  }

  start() {
    super.start();
    this.gestureRecognitionModule.addSensorsListener(this.processSensorsData);
  }

  stop() {
    this.gestureRecognitionModule.removeSensorsListener(this.processSensorsData);
    super.stop();
  }

  show() {
    super.show();

    if (this.view) {
      this.view.render();
      this.view.show();
      this.view.appendTo(this.getContainer());
    }
  }

  hide() {
    super.hide();

    if (this.view)
      this.view.remove();
  }

  dispatch(action) {
    const { type, payload } = action;

    // @todo - as something is async here, something could go wrong
    switch (type) {
      case 'remove-player-from-project': {
        if (this.instrument)
          this.instrument.stop();

        this.gestureRecognitionModule.removeDecoderListener(this.processDecoderOutput);
        break;
      }
      case 'add-player-to-project': {
        const { player, project } = payload;
        const audioBufferManager = this.experience.audioBufferManager;
        const uuid = payload.project.uuid;
        const audioParams = player.params.audioRendering;
        const mappingParams = player.params.mappings;

        if (this.view) {
          merge(this.view.model.audioParams, audioParams);
          merge(this.view.model.mappings, mappingParams);

          this.view.model.loading = true;
          this.view.render();
        }

        const model = project.model;
        const labels = model.payload.models.map(mod => mod.label);
        const projectPreset = this.experience.projectPresets[project.params.preset];
        const synth = projectPreset.synth;
        const effects = projectPreset.effects;
        const mappings = projectPreset.mappings;
        const audioOutput = this.experience.getAudioOutput();

        this.instrument = new Instrument(synth, effects, mappings);
        this.instrument.setLabels(labels);
        this.instrument.updateMappings(mappingParams);
        this.instrument.connect(audioOutput);

        const buffers = this.experience.audioBufferManager.data.labels;
        this.instrument.setBuffers(buffers);

        this.experience.mute(audioParams.mute);
        this.experience.volume(audioParams.volume);

        if (this.view) {
          this.view.model.loading = false;
          this.view.render();
        }

        this.gestureRecognitionModule.addDecoderListener(this.processDecoderOutput);
        break;
      }
      // @todo / @fixme - probably need to update labels...
      case 'update-project-param': {
        const project = { payload };
        const model = project.model;

        let labels = [];

        if (model) {
          labels = model.payload.models.map(mod => mod.label);
        }

        if (this.instrument) {
          this.instrument.setLabels(labels);
        }
        break;
      }
      case 'update-model': {
        const model = payload.model;
        const labels = model.payload.models.map(mod => mod.label);
        this.instrument.setLabels(labels);
        break;
      }
      case 'update-player-param': {
        const audioParams = payload.params.audioRendering;
        const mappingParams = payload.params.mappings;

        this.experience.mute(audioParams.mute);
        this.experience.volume(audioParams.volume);

        this.instrument.updateMappings(mappingParams);

        if (this.view) {
          merge(this.view.model.audioParams, audioParams);
          merge(this.view.model.mappings, mappingParams);
          this.view.render();
        }
        break;
      }
      case 'update-audio-files': {
        const audioFiles = payload;
        const audioBufferManager = this.experience.audioBufferManager;

        if (this.view) {
          this.view.model.loading = true;
          this.view.render();
        }

        audioBufferManager
          .load({ labels: audioFiles })
          .then(buffers => {
            if (this.instrument) {
              this.instrument.setBuffers(buffers['labels']);
            }

            if (this.view) {
              this.view.model.loading = false;
              this.view.render();
            }
          });
        break;
      }
    }
  }

  /** @note - consumed by the `RecordingControlModule`. */
  enablePreview(label) {
    this.gestureRecognitionModule.removeDecoderListener(this.processDecoderOutput);

    if (this.instrument)
      this.instrument.enablePreview(label);
  }

  /** @note - consumed by the `RecordingControlModule`. */
  disablePreview() {
    if (this.instrument)
      this.instrument.disablePreview();

    this.gestureRecognitionModule.addDecoderListener(this.processDecoderOutput);
  }

  processSensorsData(data) {
    if (this.instrument)
      this.instrument.processSensorsData(data);
  }

  processDecoderOutput(data) {
    if (this.instrument)
      this.instrument.processDecoderOutput(data);
  }
}

moduleManager.register(MODULE_ID, AudioRendererModule);

export default AudioRendererModule;
