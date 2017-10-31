import * as mano from 'mano-js/common';
import PlayerCollection from './PlayerCollection';
import uuidv4 from 'uuid/v4';
import merge from 'lodash.merge';
// @todo - remove
import { labels as audioConfig } from '../../../shared/config/audio';


function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


class Project {
  constructor() {
    this.uuid = null;
    this.players = new PlayerCollection();

    this.trainingData = new mano.TrainingData();
    // @todo - remove that
    this.processor = new mano.XmmProcessor({
      // config should come from somewhere else
      // url: `http://localhost:${config.port}${config.trainUrl}`,
      url: null,
    });

    /**
     * xmm model is not part of the params as it will never be saved but always
     * be recreated from persisted `config` and `trainingSet`
     */
    this.model = null;

    this.params = {
      name: '',
      clientDefaults: {
        audio: {
          intensity: false,
          mute: false,
        },
        record: {
          label: Object.keys(audioConfig)[0], // defaults to first audio label
        },
      },
      audio: audioConfig,
      learning: {
        config: null,
        trainingSet: null,
      },
      sensorsPreprocessing: {},
    }
  }

  serialize() {
    const details = {
      uuid: this.uuid,
      params: this.params,
      players: this.players.serialize(),
    };

    return details;
  }

  overview() {
    const overview = {
      uuid: this.uuid,
      name: this.params.name,
    };

    return overview;
  }

  setParam(paramPath, value) {
    const path = paramPath.split('.');
    const depth = path.length;
    let ref = this.params;

    for (let i = 0; i < depth; i++) {
      const attr = path[i];

      if (attr in ref) {
        if (i < depth - 1)
          ref = ref[attr];
        else
          ref[attr] = value;
      } else {
        throw new Error(`Invalid param ${paramPath}`);
      }
    }
  }

  addPlayer(player) {
    player.project = this;
    this.players.add(player);
  }

  removePlayer(player) {
    this.players.remove(player);
    player.project = null;
  }

  /**
   * Create a new Project instance with proper default attrbutes and parameters.
   * @static
   * @param {String} name - Name of the project
   * @return {Promise}
   */
  static create(name) {
    const project = new Project();

    project.uuid = uuidv4();
    project.params.name = name;
    project.params.learning.trainingSet = project.trainingData.getTrainingSet();
    project.params.learning.config = project.processor.getConfig();

    return project;
  }

  /**
   * Create a new Project instaance from persisted data.
   * @static
   * @param {Object} data - Persisted data
   */
  static fromData(data) {
    const project = new Project();

    project.uuid = data.uuid;
    project.params = merge(project.params, data.params);

    return project;
  }

  /**
   * Retrieve the data defining the entity from a Project instance.
   * @static
   * @param {Object} data - Persisted data
   */
  static toData(project) {
    const data = {
      uuid: project.uuid,
      params: project.params,
    }

    return data;
  }
}

export default Project;
