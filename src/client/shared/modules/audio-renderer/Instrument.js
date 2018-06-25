import { audioContext } from 'soundworks/client';
import synthFactory from './synths/synthFactory';
import effectFactory from './effects/effectFactory';

class Instrument {
  constructor(synth, effects, mappings) {
    this.synth = synthFactory(synth);
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
    this.enabledSensorsMappings.forEach(({ mapping, targets }) => {
      targets.forEach(target => target.reset());
    });

    this.enabledDecoderMappings.forEach(({ mapping, targets }) => {
      targets.forEach(target => target.reset());
    });

    this.enabledSensorsMappings = [];
    this.enabledDecoderMappings = [];

    for (let id in config) {
      const enabled = config[id];

      if (enabled) {
        const mapping = this.mappings.find(mapping => mapping.id === id);

        if (!mapping)
          console.error('Undefined mapping id', id);

        let targets = [];

        mapping.targets.forEach(targetId => {
          let target = null;

          if (targetId === 'synth')
            target = this.synth;
          else
            target = this.effects.find(effect => effect.id === targetId);

          if (target)
            targets.push(target);
        });

        if (mapping.input === 'sensors')
          this.enabledSensorsMappings.push({ mapping, targets });
        else if (mapping.input === 'decoding')
          this.enabledDecoderMappings.push({ mapping, targets });
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
