import Instrument from '../shared/modules/audio-renderer/Instrument';

/**
 * mimic AudioRendererModule behavior
 */
class AudioRendererHook {
  constructor(experience, config) {
    this.experience = experience;
    this.config = config;

    this.player = null;
    this.project = null;
  }

  init(player, project) {
    if (this.player)
      this.stop();

    this.player = player;
    this.project = project;

    const audioBufferManager = this.experience.audioBufferManager;
    const uuid = project.uuid;
    const audioParams = player.params.audioRendering;
    const mappingParams = player.params.mappings;

    const model = project.model;
    const labels = model.payload.models.map(mod => mod.label);
    const projectPreset = this.experience.projectPresets[project.params.preset];
    const synth = projectPreset.synth;
    const effects = projectPreset.effects;
    const mappings = projectPreset.mappings;
    const audioOutput = this.experience.getAudioOutput();

    const instrument = new Instrument(synth, effects, mappings);
    instrument.setLabels(labels);
    instrument.updateMappings(mappingParams);
    instrument.connect(audioOutput);
    instrument.setBuffers(this.experience.audioBufferManager.data.labels);

    this.instrument = instrument;
  }

  stop() {
    this.instrument.stop();

    this.player = null;
    this.project = null;
    this.instrument = null;
  }

  updatePlayerParams(player) {
    if (this.instrument) {
      this.instrument.updateMappings(player.params.mappings);
    }
  }

  updateProject(project) {
    const model = project.model;
    const labels = model.payload.models.map(mod => mod.label);

    if (this.instrument)
      this.instrument.setLabels(labels);
  }

  updateAudioFiles(audioFiles) {
    this.experience.audioBufferManager.load({ 'labels': audioFiles })
      .then(buffers => {
        if (this.instrument) {
          this.instrument.setBuffers(buffers['labels']);
        }
      });
  }

  processSensorsData(clientIndex, data) {
    if (this.instrument && this.player && clientIndex === this.player.index) {
      this.instrument.processSensorsData(data);
    }
  }

  processDecoderOutput(clientIndex, data) {
    if (this.instrument && this.player && clientIndex === this.player.index) {
      this.instrument.processDecoderOutput(data);
    }
  }
}

export default AudioRendererHook;
