import EnergyFilter from '../audio-processing/EnergyFilter';
import FeedbackDelay from '../audio-processing/FeedbackDelay';

const processsesTypes = {
  'energy-filter': EnergyFilter,
  'feedback-delay': FeedbackDelay,
};

class BaseMapping {
  constructor(audioProcessesDefinitions = []) {
    this.processes = new Set();

    audioProcessesDefinitions.forEach(defs => {
      const ctor = processsesTypes[defs.type];
      const options = defs.options;
      const proc = new ctor(options);

      this.processes.add(proc);
    });
  }

  stopProcesses() {
    this.processes.forEach(proc => proc.disconnect());
  }

  createAudioChain(source, destination) {
    let prev = source;
    const lastProcIndex = this.processes.size - 1;

    this.processes.forEach((proc, index) => {
      prev.connect(proc.input);
      prev = proc;
    });

    prev.connect(destination);
  }

  enableSensors() {
    this.processes.forEach(proc => {
      if (proc.enableSensors)
        proc.enableSensors();
    });
  }

  disableSensors() {
    this.processes.forEach(proc => {
      if (proc.disableSensors)
        proc.disableSensors();
    });
  }

  processSensorsData(data) {
    this.processes.forEach(proc => {
      if (proc.processSensorsData)
        proc.processSensorsData(data);
    });
  }

  processDecoderOutput(data) {
    this.processes.forEach(proc => {
      if (proc.processDecoderOutput)
        proc.processDecoderOutput(data);
    });
  }
}

export default BaseMapping;
