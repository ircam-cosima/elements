/**
 * Available modules:
 *
 * - project-params-control (optionnal):
 *   Allow to control project parameters such as xmm configuration
 *   Must be inserted first to have the menu on top of the page
 *
 *   available options: none
 *
 * - project-manager (mandatory):
 *   Handle project related problems
 *
 *   2 different views:
 *   > name of the current project, optionnal button to change project
 *   > full screen to change project or create a new one
 *
 *   available options:
 *   `enableChange` Boolean (default: true) - Allow user to switch to another project
 *   `enableCreate`: Boolean (default: false) - Allow user to create a new project
 *   `projectList`: 'none' | 'select' | 'buttons' (default: 'select') - Defines how the project
 *      list is displayed
 *   `forceProject`: String (default: false) - If defined force the user to enter to a
 *      project. The value must be set to the uuid of the project
 *
 * - gesture-recognition (mandatory)
 *   Handle the xmm model updates and recognition of gesture
 *
 *   view: display a notification each time a new model is received
 *   available options: none
 *
 * - audio-renderer (madatory)
 *   Handle audio synthesis according to decoding results and raw data from
 *   processed-sensors
 *
 *   view (optionnal) that allows the user to mute audio and use sensors data
 *   in synthesis
 *
 *   is dependant of (must be loaded after) 'gesture-recognition'
 *
 * - recording-control (optionnal)
 *   Allow user to record new gesture examples.
 *
 *   is dependant of  (must be loaded after) 'gesture-recognition' and 'audio-renderer'
 *
 * - canvas-renderer (optionnal)
 *   Handle graphics displayed in canvas
 *
 *   is dependant of (must be loaded after) 'gesture-recognition'
 *
 *   available options:
 *   `background` {Boolean} (default: true) - display the color associated to the user in background
 *   `likelihoods` {Boolean} (default: true) - display the likelihoods
 *
 * - streams (optionnal)
 *   Defines if sensors and decoding results (likelihoods and timeProgressions)
 *   should be streamed to the server. If used, creates a new binary Socket between
 *   client and server. Optionnaly allow to pipe the streams to osc
 *   (cf. max/comm.maxpat)
 *
 *   > no view
 *
 *   available options:
 *   osc: { sendAddress, sendPort } - if defined set the ip and port of the
 *   osc receiver.
 *
 * - 'audio-trigger' (optionnal)
 *   Allow to trigg audio from the controller. For now only the white noise
 *
 */
const clientPresets = {
  /**
   * Example config for a designer client.
   */
  designer: {
    'project-params-control': {},
    'project-manager': {
      enableChange: true,
      enableCreation: true,
      projectList: 'buttons', // 'none' | 'select' | 'buttons'
      // forceProject: '2a3eab59-0c1a-4a27-a75b-eca6548a6431',
    },
    'gesture-recognition': {},
    'audio-renderer': {
      mapping: {
        type: 'likeliest-mapping',
        // type: 'likeliest-mapping', 'probabilistic-mapping'
        synth: { // only exists with `likeliest-mapping`
          type: 'loop', // or loop / granular
        },
        audioProcesses: [
          {
            type: 'energy-filter',
            options: {
              //default options
              energyAvgOrder: 20,
              energyExp: 1/4, //1/2
              minCutoffFreq: 500,  //50
              //maxCutoffFreq: audioContext.sampleRate / 2,
              maxCutoffFreq: 44100 / 2,
              filterType: 'lowpass',
              energyIndex: 1,
            },
          },
          // {
          //   type: 'feedback-delay',
          //   options: {
          //     // default options
          //     // delayTime: 0.1,
          //     // feedback: 0.9,
          //   },
          // },
        ],
      },
      showView: true,
    },
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

designgran: {
    'project-params-control': {},
    'project-manager': {
      enableChange: true,
      enableCreation: true,
      projectList: 'buttons', // 'none' | 'select' | 'buttons'
      // forceProject: '2a3eab59-0c1a-4a27-a75b-eca6548a6431',
    },
    'gesture-recognition': {},
    'audio-renderer': {
      mapping: {
        type: 'probabilistic-mapping',
        // type: 'likeliest-mapping', 'probabilistic-mapping'
        synth: { // only exists with `likeliest-mapping`
          type: 'granular', // or loop / granular
        },
        audioProcesses: [
          {
            type: 'energy-filter',
            options: {
              //default options
              energyAvgOrder: 20,
              energyExp: 1/4, //1/2
              minCutoffFreq: 100,  //50
              //maxCutoffFreq: audioContext.sampleRate / 2,
              maxCutoffFreq: 44100 / 2,
              filterType: 'lowpass',
              energyIndex: 1,
            },
          },
          // {
          //   type: 'feedback-delay',
          //   options: {
          //     // default options
          //     // delayTime: 0.1,
          //     // feedback: 0.9,
          //   },
          // },
        ],
      },
      showView: true,
    },
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
  /**
   * Example configuration for a basic player client.
   */
  default: {
    'project-manager': {
      // enableChange: false,
      // forceProject: '2a3eab59-0c1a-4a27-a75b-eca6548a6431',
    },
    'gesture-recognition': {},
    'audio-renderer': {
      mapping: {
        type: 'likeliest-mapping',
        // type: 'likeliest-mapping', 'probabilistic-mapping'
        synth: { // only exists with `likeliest-mapping`
          type: 'loop', // or loop / granular
        },
        audioProcesses: [
          {
            type: 'energy-filter',
            options: {
              //default options
              energyAvgOrder: 20,
              energyExp: 1/4, //1/2
              minCutoffFreq: 500,  //50
              //maxCutoffFreq: audioContext.sampleRate / 2,
              maxCutoffFreq: 44100 / 2,
              filterType: 'lowpass',
              energyIndex: 1,
            },
          },
          // {
          //   type: 'feedback-delay',
          //   options: {
          //     // default options
          //     // delayTime: 0.1,
          //     // feedback: 0.9,
          //   },
          // },
        ],
      },
      showView: true,
    },
    'canvas-renderer': {
      background: true,  //color of background
      likelihoods: false,
    },
    'audio-trigger': {},
  },




// granular player  
 gran: {
    'project-manager': {
      // enableChange: false,
      // forceProject: '2a3eab59-0c1a-4a27-a75b-eca6548a6431',
    },
    'gesture-recognition': {},
    'audio-renderer': {
      mapping: {
        type: 'likeliest-mapping',
        // type: 'likeliest-mapping', 'probabilistic-mapping'
        synth: { // only exists with `likeliest-mapping`
          type: 'granular', // or loop / granular
        },
        audioProcesses: [
          {
            type: 'energy-filter',
            options: {
              //default options
              energyAvgOrder: 20,
              energyExp: 1/4, //1/2
              minCutoffFreq: 200,  //50
              //maxCutoffFreq: audioContext.sampleRate / 2,
              maxCutoffFreq: 44100 / 2,
              filterType: 'lowpass',
              energyIndex: 1,
            },
          },
          // {
          //   type: 'feedback-delay',
          //   options: {
          //     // default options
          //     // delayTime: 0.1,
          //     // feedback: 0.9,
          //   },
          // },
        ],
      },
      showView: true,
    },
    'canvas-renderer': {
      background: true,  //color of background
      likelihoods: false,
    },
    'audio-trigger': {},
  },

// probabilist granular player  
 probgran: {
    'project-manager': {
      // enableChange: false,
      // forceProject: '2a3eab59-0c1a-4a27-a75b-eca6548a6431',
    },
    'gesture-recognition': {},
    'audio-renderer': {
      mapping: {
        type: 'probabilistic-mapping',
        // type: 'likeliest-mapping', 'probabilistic-mapping'
        synth: { // only exists with `likeliest-mapping`
          type: 'granular', // or loop / granular
        },
        audioProcesses: [
          {
            type: 'energy-filter',
            options: {
              //default options
              energyAvgOrder: 20,
              energyExp: 1/4, //1/2
              minCutoffFreq: 200,  //50
              //maxCutoffFreq: audioContext.sampleRate / 2,
              maxCutoffFreq: 44100 / 2,
              filterType: 'lowpass',
              energyIndex: 1,
            },
          },
          // {
          //   type: 'feedback-delay',
          //   options: {
          //     // default options
          //     // delayTime: 0.1,
          //     // feedback: 0.9,
          //   },
          // },
        ],
      },
      showView: true,
    },
    'canvas-renderer': {
      background: true,  //color of background
      likelihoods: false,
    },
    'audio-trigger': {},
  },






};

export default clientPresets;
