export const presets = {
  postures: {
    name: 'postures',
    preset: {
      modelType: 'gmm',
      gaussians: 1,
      absoluteRegularization: 0.01,
      relativeRegularization: 0.01,
      covarianceMode: 'full',
      states: 1,
      transitionMode: 'ergodic',
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
