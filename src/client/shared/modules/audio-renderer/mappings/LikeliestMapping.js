import { client, audioContext } from 'soundworks/client';
import BaseMapping from './BaseMapping';
import LoopSynth from '../../../audio/LoopSynth';
import GranularSynth from '../../../audio/GranularSynth';

import mappingManager from './mappingManager';

const MAPPING_ID = 'likeliest-mapping';

/**
 * Mapping that use the `likeliest` recognized label to control a synth.
 * Apply energy to the cutoff of a low-pass filter.
 *
 * @todo - allow to choose between LoopSynth and GranularSynth from configuration
 */
class LikeliestMapping extends BaseMapping {
  constructor(synthConfig = {}, audioProcessesConfig = []) {
    super(MAPPING_ID, audioProcessesConfig);

    if (synthConfig.type === 'granular')
      this.synth = new GranularSynth();
    else
      this.synth = new LoopSynth(); // default

    this.currentLabel = null;
    this.output = null;
    this.labels = null;
    this.buffers = null;
  }

  stop() {
    this.synth.stop(() => {
      this.synth.disconnect();
      this.stopProcesses();
    });
  }

  setLabels(labels) {
    this.labels = labels;
  }

  setBuffers(buffers) {
    this.buffers = buffers;
    this.synth.buffers = buffers;
  }

  setAudioDestination(destination) {
    this.createAudioChain(this.synth, destination);
  }

  enablePreview(label) {
    const index = client.index % this.buffers[label].length;
    this.synth.trigger(label, index);

    this.currentLabel = null;
  }

  disablePreview() {
    this.synth.stop();
  }

  // enableSensors() {
  //   super.enableSensors();
  // }

  // disableSensors() {
  //   super.disableSensors();
  // }

  // processSensorsData(data) {
  //   super.processSensorsData(data);
  // }

  processDecoderOutput(data) {
    const { likeliest } = data;

    if (likeliest !== null && this.currentLabel !== likeliest) {
      this.currentLabel = likeliest;

      const index = client.index % this.buffers[likeliest].length;
      this.synth.trigger(likeliest, index);
    }

    super.processDecoderOutput(data);
  }
}

mappingManager.register(MAPPING_ID, LikeliestMapping);

export default LikeliestMapping;
