import LikeliestLoopSynth from './LikeliestLoopSynth';
import LikeliestGranularSynthRandom from './LikeliestGranularSynthRandom';
import LikeliestGranularSynthFreeze from './LikeliestGranularSynthFreeze';
import ProbabilisticGranularSynth from './ProbabilisticGranularSynth';
import LikeliestSyncedSynth from './LikeliestSyncedSynth';

const ctors = {
  'likeliest-loop': LikeliestLoopSynth,
  'likeliest-synced': LikeliestSyncedSynth,
  'likeliest-granular-random': LikeliestGranularSynthRandom,
  'likeliest-granular-freeze': LikeliestGranularSynthFreeze,
  'probabilistic-granular': ProbabilisticGranularSynth,
};

function create(config, syncScheduler) {
  const type = config.type;
  const params = config.params;
  const synth = new ctors[type](params, syncScheduler);

  return synth;
}

export default create;
