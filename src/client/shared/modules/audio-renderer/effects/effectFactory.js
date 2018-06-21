import Filter from './Filter';
import Gain from './Gain';
import Delay from './Delay';

const ctors = {
  'filter': Filter,
  'gain': Gain,
  'delay': Delay,
};

function create(config) {
  const type = config.type;
  const id = config.id;
  const params = config.params;

  if (!ctors[type])
    throw new Error(`Undefined effect type "${type}"`);

  const effect = new ctors[type](id, params);

  return effect;
}

export default create;
