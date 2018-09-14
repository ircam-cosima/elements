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
    this.audioFiles = {};
  }

  init(player, project) {
    if (this.player)
      this.stop();

    this.player = player;
    this.project = project;

    const audioBufferManager = this.experience.audioBufferManager;
    const uuid = project.uuid;
    const audioFiles = project.params.audioFiles;
    const audioParams = player.params.audioRendering;
    const mappingParams = player.params.mappings;

    this.audioFiles = audioFiles;

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

    audioBufferManager
      .load({ [uuid]: audioFiles })
      .then(buffers => {
        instrument.setBuffers(buffers[uuid]);
        // now the instrument is completely ready and can process streams
        this.instrument = instrument;
      });
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

      audioBufferManager
        .load({ [uuid]: audioFiles })
        .then(buffers => this.instrument.setBuffers(buffers[uuid]));
    }
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
