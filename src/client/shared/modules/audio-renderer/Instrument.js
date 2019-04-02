import { audioContext } from 'soundworks/client';
import synthFactory from './synths/synthFactory';
import effectFactory from './effects/effectFactory';

class Instrument {
  constructor(synth, effects, mappings, syncScheduler) {
    this.synth = synthFactory(synth, syncScheduler);
    this.effects = effects.map(config => effectFactory(config));

    this.mappings = mappings;
    this.enabledSensorsMappings = [];
    this.enabledDecoderMappings = [];
  }

  connect(destination) {
    let prev = this.synth;

    this.effects.forEach(effect => {
      prev.connect(effect.input);
      prev = effect;
    });

    prev.connect(destination);
  }

  stop() {
    this.synth.disconnect();
    this.effects.forEach(effect => effect.disconnect());

    this.enabledSensorsMappings.forEach(({ mapping, targets }) => {
      targets.forEach(target => target.reset());
    });

    this.enabledSensorsMappings.length = 0;

    this.enabledDecoderMappings.forEach(({ mapping, targets }) => {
      targets.forEach(target => target.reset());
    });

    this.enabledDecoderMappings.length = 0;
  }

  setBuffers(buffers) {
    this.synth.setBuffers(buffers);
  }

  setLabels(labels) {
    this.synth.setLabels(labels);
  }

  enablePreview(label) {
    this.synth.enablePreview(label);
  }

  disablePreview() {
    this.synth.disablePreview();
  }

  updateMappings(config) {
    for (let id in config) {
      const enabled = config[id];
      const mapping = this.mappings.find(mapping => mapping.id === id);

      if (!mapping) {
        console.error('Undefined mapping id', id);
        return;
      }

      // get the stack we are addressing
      let enabledMappingStack = [];

      if (mapping.input === 'sensors') {
        enabledMappingStack = this.enabledSensorsMappings;
      } else if (mapping.input === 'decoding') {
        enabledMappingStack = this.enabledDecoderMappings;
      }

      const index = enabledMappingStack.findIndex(entry => entry.mapping === mapping);

      if (enabled && index === -1) { // add to stack
        let targets = [];

        mapping.targets.forEach(targetId => {
          let target = null;

          if (targetId === 'synth') {
            target = this.synth;
          } else {
            target = this.effects.find(effect => effect.id === targetId);
          }

          if (target) {
            targets.push(target);
          }
        });

        enabledMappingStack.push({ mapping, targets });

      } else if (!enabled && index !== -1) { // remove from stack
        const { targets } = enabledMappingStack[index];
        enabledMappingStack.splice(index, 1);

        targets.forEach(target => target.reset());
      }
    }
  }

  processSensorsData(data) {
    if (this.enabledSensorsMappings.length > 0) {
      for (let i = 0; i < this.enabledSensorsMappings.length; i++) {
        const { mapping, targets } = this.enabledSensorsMappings[i];
        mapping.process(data, targets, mapping.payload);
      }
    }
  }

  processDecoderOutput(data) {
    this.synth.processDecoderOutput(data);

    if (this.enabledDecoderMappings.length > 0) {
      for (let i = 0; i < this.enabledDecoderMappings.length; i++) {
        const { mapping, targets } = this.enabledDecoderMappings[i];
        mapping.process(data, targets, mapping.payload);
      }
    }
  }
}

export default Instrument;
