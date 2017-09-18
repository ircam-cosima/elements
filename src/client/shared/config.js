/* * * * * * * * * * * * * * * * * SOUNDS * * * * * * * * * * * * * * * * * * */

const labels = {
  aerial: 'sounds/labels/aerial.mp3',
  birds: 'sounds/labels/oiseaux.mp3',
  bubble: 'sounds/labels/bubble.mp3',
  clicks: 'sounds/labels/clicks.mp3',
  can: 'sounds/labels/crashedcan.mp3',
  fire: 'sounds/labels/feu.mp3',
  noise: 'sounds/labels/noisystroke.mp3',
  sand: 'sounds/labels/sable.mp3',
  shake: 'sounds/labels/shake.mp3',
  stone: 'sounds/labels/pierres.mp3',
  water: 'sounds/labels/nage.mp3',
  wind: 'sounds/labels/vent.mp3',
  silence: 'sounds/labels/silence.mp3',
};

const clicks = {
  startRec: 'sounds/clicks/tik.mp3',
  stopRec: 'sounds/clicks/tik.mp3',
};

/* * * * * * * * * * * * * * * * * PRESETS * * * * * * * * * * * * * * * * * */

const presets = {
  basic: {
    modelType: 'gmm',
    gaussians: 1,
    absoluteRegularization: 0.1,
    relativeRegularization: 0.1,
    covarianceMode: 'full',
  },
  simpleGestures: {
    modelType: 'hhmm',
    gaussians: 1,
    absoluteRegularization: 0.01,
    relativeRegularization: 0.1,
    covarianceMode: 'full',
    states: 4,
  },
  advancedGestures: {
    modelType: 'hhmm',
    gaussians: 2,
    absoluteRegularization: 0.01,
    relativeRegularization: 0.1,
    covarianceMode: 'full',
    states: 10,
  }
};

export { labels, clicks, presets };
