import MovingAverage from '../shared/utils/MovingAverage';

const projectPresets = {
  'default-mapping': {
    synth: {
      // 'likeliest-loop',
      // 'likeliest-granular',
      // 'probabilistic-granular'
      // type: 'likeliest-loop',
      type: 'likeliest-synced',
      params: {
        fadeDuration: 0.5,
        period: Infinity, //
        origin: 'absolute', // relative to the first recognition
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

          gain.gain = pow * 500;
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
          normDegree: 1 / 360 * 1000,
          // Q:
          minCutoff: 100,
          maxCutoff: 2000,
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
  },
};

// @important - don't remove that
const isNode = new Function('try {return this===global;}catch(e){return false;}');
if (!isNode()) {
  window.projectPresets = projectPresets;
}

export default projectPresets;
