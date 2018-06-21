import LikeliestLoopSynth from './LikeliestLoopSynth';

const ctors = {
  'likeliest-loop': LikeliestLoopSynth,
};

function create(config) {
  const type = config.type;
  const params = config.params;
  const synth = new ctors[type](params);

  return synth;
}

export default create;
