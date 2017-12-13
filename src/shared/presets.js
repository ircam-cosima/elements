const presets = {
  default: {
    'project-params-control': {},
    'project-manager': {
      enableChange: true,
      enableCreation: true,
      projectList: 'buttons', // 'none' | 'select' | 'buttons'
      forceProject: '2a3eab59-0c1a-4a27-a75b-eca6548a6431',
    },
    'gesture-recognition': {},
    'audio-renderer': {},
    'recording-control': {},
    'canvas-renderer': {
      background: false,
      likelihoods: true,
    },
    'streams': {
      osc: {
        sendAddress: '127.0.0.1',
        sendPort: 57120,
      },
    },
    'audio-trigger': {},
  },

  // default: {
  //   // 'project-params-control': {},
  //   'project-manager': {
  //     enableChange: false,
  //     // forceProject: 'fefc0121-083c-4fe9-9a08-bd35d4a25790', // name or uuid
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
