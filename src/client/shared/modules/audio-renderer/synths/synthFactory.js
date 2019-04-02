import LikeliestLoopSynth from './LikeliestLoopSynth';
import LikeliestGranularSynth from './LikeliestGranularSynth';
import ProbabilisticGranularSynth from './ProbabilisticGranularSynth';
import LikeliestSyncedSynth from './LikeliestSyncedSynth';

const ctors = {
  'likeliest-loop': LikeliestLoopSynth,
  'likeliest-synced': LikeliestSyncedSynth,
  'likeliest-granular': LikeliestGranularSynth,
  'probabilistic-granular': ProbabilisticGranularSynth,
};

function create(config, syncScheduler) {
  const type = config.type;
  const params = config.params;
  const synth = new ctors[type](params, syncScheduler);

  return synth;
}

export default create;
