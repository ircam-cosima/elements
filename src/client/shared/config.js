/* * * * * * * * * * * * * * * * * SOUNDS * * * * * * * * * * * * * * * * * * */

const labels = {
  silence: 'sounds/labels/silence.mp3',
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
  /*piano: 'sounds/labels/piano.mp3',
  beats: 'sounds/labels/5beats.mp3',
  synths: 'sounds/labels/synths.mp3', */
  bow_saltando_01: 'sounds/labels/bow_saltando_01.mp3',
  resonance_02: 'sounds/labels/resonance_02.mp3',
  resonance_01: 'sounds/labels/resonance_01.mp3',
  voice_breath_02: 'sounds/labels/voice_breath_02.mp3',
  eggcutter_01: 'sounds/labels/eggcutter_01.mp3',
  bowed_piano_01: 'sounds/labels/bowed_piano_01.mp3',
};

const clicks = {
  startRec: 'sounds/clicks/tik.mp3',
  stopRec: 'sounds/clicks/tik.mp3',
};

/* * * * * * * * * * * * * * * * * PRESETS * * * * * * * * * * * * * * * * * */

const presets = {
  postures: {
    name: 'postures',
    preset: {
      modelType: 'gmm',
      gaussians: 1,
      absoluteRegularization: 0.01,
      relativeRegularization: 0.01,
      covarianceMode: 'full',
    },
  },
  shortGestures: {
    name: 'short gestures',
    preset: {
      modelType: 'hhmm',
      gaussians: 1,
      absoluteRegularization: 0.1,
      relativeRegularization: 0.1,
      covarianceMode: 'full',
      states: 4,
      transitionMode: 'leftright',
    },
  },
  longGestures: {
    name: 'long gestures',
    preset: {
      modelType: 'hhmm',
      gaussians: 1,
      absoluteRegularization: 0.1,
      relativeRegularization: 0.1,
      covarianceMode: 'full',
      states: 10,
      transitionMode: 'leftright',
    },
  },
};

export { labels, clicks, presets };
