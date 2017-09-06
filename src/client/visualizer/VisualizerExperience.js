import * as soundworks from 'soundworks/client';
import * as lfo from 'waves-lfo/client';
import * as controllers from 'basic-controllers';


const template = `
  <h2>Display options</h2>
  <div id="controls"></div>

  <h2>Phone sensors</h2>
  <canvas id="phone-sensors"></canvas>

  <h2>R-ioT</h2>
  <canvas id="riot"></canvas>
`;

// filter which sensor is displayed
const displayFilter = [1, 1, 1];

class VisualizerExperience extends soundworks.Experience {
  constructor() {
    super();

    this.rawSocket = this.require('raw-socket');
  }

  start() {
    super.start();

    this.view = new soundworks.View(template, {}, {}, {
      id: 'visualizer',
    });

    this.show().then(() => {
      const logger = new lfo.sink.Logger({ time: true, data: true });

      // designer sensors
      // --------------------------------------------------

      this.phoneEventIn = new lfo.source.EventIn({
        frameType: 'vector',
        frameSize: 3,
        frameRate: 0,
      });

      this.phoneDisplayFilter = new lfo.operator.Multiplier({
        factor: displayFilter,
      });

      this.phoneDisplay = new lfo.sink.BpfDisplay({
        min: -9.81,
        max: 9.81,
        width: 600,
        height: 300,
        duration: 10,
        canvas: '#phone-sensors'
      });

      this.phoneEventIn.connect(this.phoneDisplayFilter);
      this.phoneDisplayFilter.connect(this.phoneDisplay);
      this.phoneEventIn.start();

      this.rawSocket.receive('designer-sensors', data => this.phoneEventIn.process(null, data));

      // riot sensors
      // --------------------------------------------------

      this.riotEventIn = new lfo.source.EventIn({
        frameType: 'vector',
        frameSize: 3,
        frameRate: 0,
      });

      this.riotDisplayFilter = new lfo.operator.Multiplier({
        factor: displayFilter,
      });

      this.riotDisplay = new lfo.sink.BpfDisplay({
        min: -1,
        max: 1,
        width: 600,
        height: 300,
        duration: 10,
        canvas: '#riot',
      });

      this.riotEventIn.connect(this.riotDisplayFilter);
      this.riotDisplayFilter.connect(this.riotDisplay);
      this.riotEventIn.start();

      this.rawSocket.receive('riot', data => this.riotEventIn.process(null, data));

      // controls
      // --------------------------------------------------

      const xToggle = new controllers.Toggle({
        label: 'enable X',
        active: true,
        container: '#controls',
        callback: (active) => {
          const value = active === true ? 1 : 0;
          displayFilter[0] = value;
        }
      });

      const yToggle = new controllers.Toggle({
        label: 'enable Y',
        active: true,
        container: '#controls',
        callback: (active) => {
          const value = active === true ? 1 : 0;
          displayFilter[1] = value;
        }
      });

      const zToggle = new controllers.Toggle({
        label: 'enable Z',
        active: true,
        container: '#controls',
        callback: (active) => {
          const value = active === true ? 1 : 0;
          displayFilter[2] = value;
        }
      });
    });
  }
}

export default VisualizerExperience;
