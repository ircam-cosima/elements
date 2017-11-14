const presets = {
  default: {
    'project-params-control': {},
    'project-manager': {
      enableChange: true,
      enableCreation: true,
      projectList: 'buttons', // 'none' | 'select' | 'buttons'
      forceProject: 'cdb88e55-7977-476c-8616-2a9fe063f357',
    },
    'gesture-recognition': {},
    'audio-renderer': {},
    'recording-control': {},
    'canvas-renderer': {
      background: false,
      likelihoods: true,
    },
    'stream-sensors': {
      oscPort: null,
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
