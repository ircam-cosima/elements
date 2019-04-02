import Instrument from '../shared/modules/audio-renderer/Instrument';

/**
 * mimic AudioRendererModule behavior
 */
class AudioRendererHook {
  constructor(experience, player, project) {
    this.experience = experience;
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
    this.instrument.updateMappings(player.params.mappings);
  }

  updateProject(project) {
    const model = project.model;
    const labels = model.payload.models.map(mod => mod.label);

    this.instrument.setLabels(labels);
  }

  updateAudioFiles(audioFiles) {
    this.experience.audioBufferManager.load({ 'labels': audioFiles })
      .then(buffers => {
        this.instrument.setBuffers(buffers['labels']);
      });
  }

  processSensorsData(clientIndex, data) {
    this.instrument.processSensorsData(data);
  }

  processDecoderOutput(clientIndex, data) {
    this.instrument.processDecoderOutput(data);
  }
}

export default AudioRendererHook;
