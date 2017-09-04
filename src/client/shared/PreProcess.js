import * as lfo from 'waves-lfo/client';
import FeaturizerLfo from './FeaturizerLfo';

export default class PreProcess {
  constructor(intensityCallback) {
    //--------------------------------- LFO's --------------------------------//
    this._devicemotionIn = new lfo.source.EventIn({
      frameType: 'vector',
      frameSize: 6,
      frameRate: 1,//this.motionInput.period doesn't seem available anymore
      description: ['accX', 'accY', 'accZ', 'gyrAlpha', 'gyrBeta', 'gyrGamma']
    });
    this._featurizer = new FeaturizerLfo({
      descriptors: [ 'accRaw', 'accIntensity' ],
      // descriptors: [ 'accRaw', 'gyrZcr', 'accIntensity' ],
      // gyrZcrNoiseThresh: 0.01,
      // gyrZcrFrameSize: 100,
      // gyrZcrHopSize: 10,
      // callback: this._intensityCallback
    });
    this._selectInput = new lfo.operator.Select({ indices: [0, 1, 2] });
    this._selectAccIntensity = new lfo.operator.Select({ index: 3 });
    this._intensityBridge = new lfo.sink.Bridge({
      processFrame: intensityCallback // the constructor's argument
    });

    this._devicemotionIn.connect(this._featurizer);

    this._featurizer.connect(this._selectInput);
    // this._selectInput.connect(this._xmmDecoder);

    this._featurizer.connect(this._selectAccIntensity);
    this._selectAccIntensity.connect(this._intensityBridge);
  }

  connect(targetLfo) {
    this._selectInput.connect(targetLfo);
  }

  start() {
    this._devicemotionIn.start();
  }

  process(time, values) {
    this._devicemotionIn.process(time, values);
  }
}
