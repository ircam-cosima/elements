import LikeliestLoopSynth from './LikeliestLoopSynth';
import LikeliestGranularSynth from './LikeliestGranularSynth';
import ProbabilisticGranularSynth from './ProbabilisticGranularSynth';

const ctors = {
  'likeliest-loop': LikeliestLoopSynth,
  'likeliest-granular': LikeliestGranularSynth,
  'probabilistic-granular': ProbabilisticGranularSynth,
};

function create(config) {
  const type = config.type;
  const params = config.params;
  const synth = new ctors[type](params);

  return synth;
}

export default create;
