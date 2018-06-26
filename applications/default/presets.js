import MovingAverage from '../shared/utils/MovingAverage';

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
  default: {
    'project-params-control': {},
    'project-manager': {
      enableChange: true,
      enableCreation: true,
      projectList: 'select', // 'none' | 'select' | 'buttons'
      // forceProject: '1ccd4418-9f2f-49b4-86a2-6f072ac20b68',
    },
    'gesture-recognition': {},
    'audio-renderer': {
      synth: {
        type: 'likeliest-loop', // 'likeliest-loop', 'likeliest-granular', 'probabilistic-granular'
        params: {
          fadeDuration: 0.5,
        },
      },
      effects: [
        {
          id: 'gain',
          type: 'gain',
          params: {
            gain: 1,
          }
        },
        {
          id: 'filter-gain',
          type: 'gain',
          params: {
            gain: 1,
          }
        },
        {
          id: 'bandpass',
          type: 'filter',
          // values when mapping is disabled
          params: {
            type: 'bandpass',
            frequency: 100,
            Q: 0,
            gain: 0,
          },
        },
        // {
        //   id: 'delay',
        //   type: 'delay',
        //   params: {
        //     delay: 0.1,
        //     preGain: 0,
        //     feedback: 0.95,
        //   }
        // }
      ],
      mappings: [
        {
          id: 'gain',
          input: 'sensors',
          targets: ['gain'],
          payload: {
            movingAverage: new MovingAverage(20),
          },
          process: (data, targets, payload) => {
            const gain = targets[0];

            const energy = data[1]; // enhanced intensity
            const avg = payload.movingAverage.process(energy);
            const pow = Math.pow(avg, 1/1);

            gain.gain = pow;
          }
        },
        // {
        //   id: 'dynamic-gain',
        //   input: 'sensors',
        //   target: 'dynamic-gain',
        //   // enabled: true,
        //   payload: {
        //     movingAverage: new MovingAverage(1),
        //     normDegree: 1/360,
        //   },
        //   process: (data, target, payload) => {
        //     // get gyroscopes energy
        //     const alpha = data[8] * payload.normDegree;
        //     const beta = data[9] * payload.normDegree;
        //     const gamma = data[10] * payload.normDegree;
        //     // ~ [0, 3]
        //     const norm = Math.sqrt(alpha * alpha + beta * beta + gamma * gamma);
        //     target.gain = 1 + norm;
        //     // const avg = payload.movingAverage.process(norm);
        //     // const pow = Math.pow(avg, 1/4);
        //     // const cutoff = payload.minCutoff * Math.exp(payload.ratio * pow);

        //     // target.frequency = cutoff;
        //     // // target.gain = avg * 20 + 4; // [0, 30]
        //     // target.Q = pow; // ??
        //   },
        // },
        {
          id: 'bandpass',
          input: 'sensors',
          targets: ['bandpass', 'filter-gain'],
          // enabled: true,
          payload: {
            movingAverage: new MovingAverage(20),
            normDegree: 1/360,
            // Q:
            minCutoff: 100,
            maxCutoff: 6000,
          },
          /**
           * data is an array that contains:
           * - [0]  IntensityNorm
           * - [1]  IntensityNormBoost
           * - [2]  BandPass AccX
           * - [3]  BandPass AccY
           * - [4]  BandPass AccZ
           * - [5]  Orientation X (processed from acc and gyro)
           * - [6]  Orientation Y (processed from acc and gyro)
           * - [7]  Orientation Z (processed from acc and gyro)
           * - [8]  gyro (alpha)
           * - [9]  gyro (beta)
           * - [10] gyro (gamma)
           */
          process: (data, targets, payload) => {
            const bandpass = targets[0];
            const gain = targets[1];
            // // execute only once and cache the result
            if (!payload.ratio)
              payload.ratio = Math.log(payload.maxCutoff / payload.minCutoff);

            // get gyroscopes energy
            const alpha = data[8] * payload.normDegree;
            const beta = data[9] * payload.normDegree;
            const gamma = data[10] * payload.normDegree;
            // ~ [0, 3]
            const norm = Math.sqrt(alpha * alpha + beta * beta + gamma * gamma);
            const avg = payload.movingAverage.process(norm);
            const pow = Math.pow(avg, 1/4);
            const cutoff = payload.minCutoff * Math.exp(payload.ratio * pow);

            gain.gain = 1 + norm * 4;

            bandpass.frequency = cutoff;
            bandpass.Q = pow * 6;
          },
        },
      ],
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
};

// never remove that
const isNode = new Function('try {return this===global;}catch(e){return false;}');
if (!isNode())
  window.clientPresets = clientPresets;

export default clientPresets;
