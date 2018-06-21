import { audioContext } from 'soundworks/client';
// import mappingManager from '../shared/modules/audio-renderer/mappings/mappingManager';
/**
 * mimic AudioRendererModule behavior
 */
class AudioRendererHook {
  constructor(audioBufferManager, config) {
    this.audioBufferManager = audioBufferManager;
    this.config = config;

    this.player = null;
    this.project = null;
    this.sensorsEnabled = false;

    this.output = audioContext.destination;
  }

  init(player, project) {
    if (this.player)
      this.stop();

    this.player = player;
    this.project = project;

    const audioConfig = this.config.presets[player.type]['audio-renderer']['mapping'];
    const uuid = project.params.uuid;
    const audioFiles = project.params.audioFiles;

    this.audioBufferManager
      .load({ [uuid]: audioFiles })
      .then(buffers => {
        const model = project.model;
        const labels = model.payload.models.map(mod => mod.label);
        const audioOutput = this.output;
        const audioParams = player.params.audioRendering;

        const mappingType = audioConfig.type;
        const synthConfig = audioConfig.synth;
        const audioProcessesConfig = audioConfig.audioProcesses;
        const mappingCtor = mappingManager.get(mappingType);

        this.mapping = new mappingCtor(synthConfig, audioProcessesConfig);
        this.mapping.setBuffers(buffers[uuid]);
        this.mapping.setLabels(labels);
        this.mapping.setAudioDestination(audioContext.destination);

        if (audioParams.sensors)
          this.enableSensors();
        else
          this.disableSensors();
      });
  }

  stop() {
    this.mapping.stop();
    this.player = null;
    this.project = null;
  }

  updatePlayerParams(params) {
    if (params.sensors)
      this.enableSensors();
    else
      this.disableSensors();
  }

  updateProject(project) {
    if (this.project && this.project.uuid === project.uuid) {
      const labels = project.model.payload.models.map(mod => mod.label);
      this.mapping.setLabels(labels);
    }
  }

  enableSensors() {
    if (this.mapping)
      this.mapping.enableSensors();

    this.sensorsEnabled = true;
  }

  disableSensors() {
    this.sensorsEnabled = false;

    if (this.mapping)
      this.mapping.disableSensors();
  }

  processSensorsData(clientIndex, data) {
    if (this.mapping && this.player && clientIndex === this.player.index && this.sensorsEnabled)
      this.mapping.processSensorsData(data);
  }

  processDecoderOutput(clientIndex, data) {
    if (this.mapping && this.player && clientIndex === this.player.index)
      this.mapping.processDecoderOutput(data);
  }
}

export default AudioRendererHook;
