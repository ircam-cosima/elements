const presets = {
  default: {
    'project-params-control': {},
    'project-manager': {
      enableChange: true,
      enableCreation: true,
      // projectList: 'none' | 'select' | 'buttons'
    },
    'gesture-recognition': {},
    'audio-renderer': {},
    'recording-control': {},
    'canvas-renderer': {
      background: false,
      likelihoods: true,
    },
  },

  // default: {
  //   // 'project-params-control': {},
  //   'project-manager': {
  //     enableChange: false,
  //     forceProject: 'fefc0121-083c-4fe9-9a08-bd35d4a25790', // name or uuid
  //   },
  //   'gesture-recognition': {},
  //   // 'recording-control': {},
  //   'audio-renderer': {},
  //   'canvas-renderer': {
  //     background: true,
  //     likelihoods: false,
  //   },
  // },
};

export default presets;
