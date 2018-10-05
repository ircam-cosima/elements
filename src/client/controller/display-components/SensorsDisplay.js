import * as controllers from '@ircam/basic-controllers';
import * as lfo from 'waves-lfo/client';

class SensorsDisplay {
  constructor($container) {
    const $canvasContainer = $container.querySelector('.canvas-container');
    const $controllerContainer = $container.querySelector('.controllers');

    this.initialized = false;

    const displayFilter = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    // build lfo chain
    const eventIn = new lfo.source.EventIn({
      frameType: 'vector',
      frameSize: 11,
      frameRate: 0,
    });

    const filter = new lfo.operator.Multiplier({
      factor: displayFilter,
    });

    const bpfDisplay = new lfo.sink.BpfDisplay({
      min: -1,
      max: 1,
      width: 600,
      height: 300,
      duration: 10,
      line: true,
      radius: 0,
      colors: [
        '#da251c', '#f8cc11', // intensity
        'steelblue', 'orange', 'green', // bandpass
        '#565656', '#fa8064', '#54b2a9', // orientation
        '#67fa32', '#fa3267', '#3267fa', // gyroscopes
      ],
      container: $canvasContainer,
    });

    // controls
    const intensityToggle = new controllers.Toggle({
      label: 'intensity',
      active: true,
      container: $controllerContainer,
      callback: active => {
        const value = active === true ? 1 : 0;
        displayFilter[0] = value;
        displayFilter[1] = value;
      }
    });

    const bandpassToggle = new controllers.Toggle({
      label: 'bandpass',
      active: true,
      container: $controllerContainer,
      callback: active => {
        const value = active === true ? 1 : 0;
        displayFilter[2] = value;
        displayFilter[3] = value;
        displayFilter[4] = value;
      }
    });

    const orientationToggle = new controllers.Toggle({
      label: 'orientation',
      active: true,
      container: $controllerContainer,
      callback: active => {
        const value = active === true ? 1 : 0;
        displayFilter[5] = value;
        displayFilter[6] = value;
        displayFilter[7] = value;
      }
    });

    const gyroscopeToggle = new controllers.Toggle({
      label: 'gyroscope',
      active: true,
      container: $controllerContainer,
      callback: active => {
        const value = active === true ? 1 : 0;
        displayFilter[8] = value;
        displayFilter[9] = value;
        displayFilter[10] = value;
      }
    });

    const bpfTickness = new controllers.Slider({
      label: 'tickness',
      min: 0,
      max: 10,
      step: 1,
      value: 0,
      container: $controllerContainer,
      callback: value => bpfDisplay.params.set('radius', value),
    });

    eventIn.connect(filter);
    filter.connect(bpfDisplay);

    eventIn.init().then(() => {
      this.initialized = true;
      eventIn.start();
    });

    this.eventIn = eventIn;
    this.filter = filter;
    this.bpfDisplay = bpfDisplay;
    this.intensityToggle = intensityToggle;
    this.bandpassToggle = bandpassToggle;
    this.orientationToggle = orientationToggle;
    this.gyroscopeToggle = gyroscopeToggle;
    this.bpfTickness = bpfTickness;
    this.isStreaming = true;
  }

  process(data) {
    if (this.initialized) {
      this.eventIn.process(null, data);
    }
  }

  reset() {
    this.bpfDisplay.resetStream();
  }

  destroy() {
    this.eventIn.finalizeStream();
    this.eventIn.destroy();
    this.filter.destroy();
    this.bpfDisplay.destroy();
  }
}

export default SensorsDisplay;
