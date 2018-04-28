import { client } from 'soundworks/client';
import BaseModule from '../BaseModule';
import AudioControlView from './AudioControlView';
import mappingManager from './mappings/mappingManager';
import moduleManager from '../moduleManager';
import merge from 'lodash.merge';


const MODULE_ID = 'audio-renderer';

class AudioRendererModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.options = merge({
      showView: true,
      mapping: {
        type: 'likeliest-mapping',
        synth: {
          type: 'loop',
        },
        audioProcesses: [
          {
            type: 'energy-filter',
            options: {},
          },
        ],
      },
    }, options);

    this.subscriptions = [
      'add-player-to-project',
      'remove-player-from-project',
      'update-player-param',
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

    this.mapping = null;

    if (this.options.showView) {
      this.view = new AudioControlView();
      this.view.request = (type, payload) => {
        payload.uuid = client.uuid;
        const action = { type, payload };

        this.request(action);
      }
    }
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
        if (this.mapping) {
          this.disableSensors();
          this.mapping.stop();
        }

        this.gestureRecognitionModule.removeDecoderListener(this.processDecoderOutput);
        break;
      }
      case 'add-player-to-project': {
        const { player, project } = payload;
        const audioBufferManager = this.experience.audioBufferManager;
        const uuid = payload.project.uuid;
        const audioFiles = project.params.audioFiles;
        const audioParams = player.params.audioRendering;

        if (this.view) {
          merge(this.view.model, audioParams);
          this.view.model.loading = true;
          this.view.render();
        }

        audioBufferManager
          .load({ [uuid]: audioFiles })
          .then(buffers => {
            const model = project.model;
            const labels = model.payload.models.map(mod => mod.label);
            const audioOutput = this.experience.getAudioOutput();

            const mappingType = this.options.mapping.type;
            const synthConfig = this.options.mapping.synth;
            const audioProcessesConfig = this.options.mapping.audioProcesses;
            const mappingCtor = mappingManager.get(mappingType);

            this.mapping = new mappingCtor(synthConfig, audioProcessesConfig);

            this.mapping.setBuffers(buffers[uuid]);
            this.mapping.setLabels(labels);
            this.mapping.setAudioDestination(audioOutput);

            this.experience.mute(audioParams.mute);
            this.experience.volume(audioParams.volume);

            if (audioParams.sensors)
              this.enableSensors();
            else
              this.disableSensors();

            if (this.view) {
              this.view.model.loading = false;
              this.view.render();
            }

            this.gestureRecognitionModule.addDecoderListener(this.processDecoderOutput);
          });
        break;
      }
      case 'update-model': {
        const model = payload.model;
        const labels = model.payload.models.map(mod => mod.label);
        this.mapping.setLabels(labels);
        break;
      }
      case 'update-player-param': {
        const audioParams = payload.params.audioRendering;

        this.experience.mute(audioParams.mute);
        this.experience.volume(audioParams.volume);

        if (audioParams.sensors)
          this.enableSensors();
        else
          this.disableSensors();

        merge(this.view.model, audioParams);
        this.view.render();
        break;
      }
    }
  }

  /**
   * @note - consumed by the `RecordingControlModule`.
   */
  enablePreview(label) {
    this.gestureRecognitionModule.removeDecoderListener(this.processDecoderOutput);

    if (this.mapping)
      this.mapping.enablePreview(label);
  }

  /**
   * @note - consumed by the `RecordingControlModule`.
   */
  disablePreview() {
    if (this.mapping)
      this.mapping.disablePreview();

    this.gestureRecognitionModule.addDecoderListener(this.processDecoderOutput);
  }

  enableSensors() {
    if (this.mapping)
      this.mapping.enableSensors();

    this.gestureRecognitionModule.addSensorsListener(this.processSensorsData);
  }

  disableSensors() {
    this.gestureRecognitionModule.removeSensorsListener(this.processSensorsData);

    if (this.mapping)
      this.mapping.disableSensors();
  }

  processSensorsData(data) {
    if (this.mapping)
      this.mapping.processSensorsData(data);
  }

  processDecoderOutput(data) {
    if (this.mapping)
      this.mapping.processDecoderOutput(data);
  }
}

moduleManager.register(MODULE_ID, AudioRendererModule);

export default AudioRendererModule;