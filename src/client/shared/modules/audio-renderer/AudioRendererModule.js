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

    this.audioFiles = {};
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
        const audioFiles = project.params.audioFiles;
        const audioParams = player.params.audioRendering;
        const mappingParams = player.params.mappings;

        this.audioFiles = audioFiles;

        if (this.view) {
          merge(this.view.model, audioParams);
          this.view.model.loading = true;
          this.view.model.mappings = player.params.mappings;
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

        this.experience.mute(audioParams.mute);
        this.experience.volume(audioParams.volume);

        audioBufferManager
          .load({ [uuid]: audioFiles })
          .then(buffers => {
            this.instrument.setBuffers(buffers[uuid]);

            if (this.view) {
              this.view.model.loading = false;
              this.view.render();
            }

            this.gestureRecognitionModule.addDecoderListener(this.processDecoderOutput);
          });
        break;
      }
      case 'update-project-param': {
        const project = payload;
        const uuid = project.uuid;
        const audioFiles = project.params.audioFiles;

        // check if we need to refresh audioFiles
        let refresh = false;
        const currentFiles = this.audioFiles;

        for (let label in audioFiles) {
          if (!(label in currentFiles))
            refresh = true;

          if (currentFiles[label] && currentFiles[label][0] !== audioFiles[label][0])
            refresh = true;

          if (refresh)
            break;
        }

        this.audioFiles = audioFiles;

        if (refresh) {
          const audioBufferManager = this.experience.audioBufferManager;

          if (this.view) {
            this.view.model.loading = true;
            this.view.render();
          }

          audioBufferManager
            .load({ [uuid]: audioFiles })
            .then(buffers => {
              this.instrument.setBuffers(buffers[uuid]);

              if (this.view) {
                this.view.model.loading = false;
                this.view.render();
              }
            });
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
        const mappings = payload.params.mappings;

        this.experience.mute(audioParams.mute);
        this.experience.volume(audioParams.volume);

        this.instrument.updateMappings(mappings);

        if (this.view) {
          merge(this.view.model.audioParams, audioParams);
          merge(this.view.model.mappings, mappings);
          this.view.render();
        }
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
