import * as lfo from 'waves-lfo/client';

class LikelihoodsDisplay {
  constructor($container) {
    const $canvasContainer = $container.querySelector('.canvas-container');

    this.initialized = false;

    const eventIn = new lfo.source.EventIn({
      frameSize: 1, // dummy value
      frameRate: 0, // dummy value
      frameType: 'vector',
    });

    const barChartDisplay = new lfo.sink.BarChartDisplay({
      container: $canvasContainer,
      width: 600,
      colors: [
        '#ff0000',
        '#00ff00',
        '#3355ff',
        '#999900',
        '#990099',
        '#009999',
      ],
    });

    eventIn.connect(barChartDisplay);
    eventIn.init().then(() => {
      this.initialized = true;
      eventIn.start();
    });

    this.eventIn = eventIn;
    this.barChartDisplay = barChartDisplay;
    this.isStreaming = true;
  }

  process(data) {
    if (this.initialized) {
      if (this.eventIn.streamParams.frameSize !== data.length) {
        this.eventIn.streamParams.frameSize = data.length;
        this.eventIn.propagateStreamParams();
      }

      this.eventIn.process(null, data);
    }
  }

  reset() {
    this.barChartDisplay.resetStream();
  }

  destroy() {
    this.eventIn.finalizeStream();
    this.eventIn.destroy();
    this.barChartDisplay.destroy();
  }
}

export default LikelihoodsDisplay;
