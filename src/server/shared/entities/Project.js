import * as mano from 'mano-js/common';
import PlayerCollection from './PlayerCollection';
import uuidv4 from 'uuid/v4';
import merge from 'lodash.merge';
// @todo - remove
import { labels as audioConfig } from '../../../shared/config/audio';


class Project {
  constructor() {
    this.uuid = null;
    this.players = new PlayerCollection();

    this.trainingData = new mano.TrainingData();
    // copy of `this.trainingData` according to `params.learning.filter`
    this.filteredTrainingData = new mano.TrainingData();
    // used for config formatting
    this.processor = new mano.XmmProcessor({ url: null, });

    /**
     * xmm model is not part of the params as it will never be saved but always
     * be recreated from persisted `config` and `trainingSet`
     */
    this.model = null;

    this.params = {
      name: '',
      clientDefaults: {
        audioRendering: {
          sensors: false,
          mute: true,
          volume: 0,
        },
        record: {
          label: Object.keys(audioConfig)[0], // defaults to first audio label
        },
      },
      audioFiles: audioConfig,
      learning: {
        config: null,
        trainingSet: null,
        inputs: { // use data when true
          intensity: true,
          bandpass: true,
          orientation: true,
        }
      },
      recording: {
        type: 'AutoTrigger',
        options: {
          highThreshold: 0.2,
          lowThreshold: 0.05,
          offDelay: 200,
        },
      },
      sensorsPreprocessing: {},
    }
  }

  serialize() {
    const details = {
      uuid: this.uuid,
      params: this.params,
      model: this.model,
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
    project.params.learning.config = project.processor.getConfig()

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

    // update mano instances from JSON informations
    const { trainingSet, config } = project.params.learning;
    project.trainingData.setTrainingSet(trainingSet);
    project.processor.setConfig(config);

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
