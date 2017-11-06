export default {
  postures: {
    label: 'postures',
    params: {
      target: {
        name: 'xmm:gmm',
      },
      payload: {
        gaussians: 1,
        absoluteRegularization: 0.01,
        relativeRegularization: 0.01,
        covarianceMode: 'full',
        states: 1,
        transitionMode: 'ergodic',
      },
    },
  },
  shortGestures: {
    label: 'short gestures',
    params: {
      target: {
        name: 'xmm:hhmm',
      },
      payload: {
        gaussians: 1,
        absoluteRegularization: 0.1,
        relativeRegularization: 0.1,
        covarianceMode: 'full',
        states: 4,
        transitionMode: 'leftright',
      },
    },
  },
  longGestures: {
    label: 'long gestures',
    params: {
      target: {
        name: 'xmm:hhmm',
      },
      payload: {
        gaussians: 1,
        absoluteRegularization: 0.1,
        relativeRegularization: 0.1,
        covarianceMode: 'full',
        states: 10,
        transitionMode: 'leftright',
      },
    },
  },
};
