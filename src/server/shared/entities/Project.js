import * as mano from 'mano-js/common';
import PlayerCollection from './PlayerCollection';
import uuidv4 from 'uuid/v4';
// @todo - remove
// import config from '../../config/default';
import { labels as audioConfig } from '../../../shared/config/audio';


// const gx = new xmm('gmm');
// const hx = new xmm('hhmm');


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
     *
     */
    this.params = {
      name: '',
      clientDefaults: {
        audio: {
          intensity: false,
          mute: false,
        }
      },
      audio: audioConfig,
      learning: {
        config: null,
        trainingSet: null,
        model: null,
      },
      sensorsPreprocessing: {},
    }
  }

  getOverview() {
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
   * @param {JSON} example - RapidMix JSON Example
   */
  addExample(example) {
    this.trainingData.addExample(example);
  }

  clearExamples(label) {
    this.trainingData.removeExamplesByLabel(label);
  }

  clearAllExamples() {
    this.trainingData.clear();
  }

  /**
   * @return {Promise} - Promise that resolves when the model is updated
   */
  train() {
    //
    // const trainingData = {
    //   docType: 'rapid-mix:rest-api-request',
    //   docVersion: '1.0.0',
    //   configuration: this.processor.getConfig(),
    //   trainingSet: trainingSet
    // };

    //   const body = req.body;
    //   const config = body.configuration;
    //   const algo = config.target.name.split(':')[1];
    //   const trainingSet = rapidMixToXmmTrainingSet(body.trainingSet);
    //   let x = (algo === 'hhmm') ? hx : gx;

    //   x.setConfig(config.payload);
    //   x.setTrainingSet(trainingSet);
    //   x.train((err, model) => {
    //     if (err)
    //       console.error(err.stack);

    //     const rapidModel = xmmToRapidMixModel(model);
    //     res.setHeader('Content-Type', 'application/json');
    //     // simulate RapidMix API JSON format
    //     res.end(JSON.stringify({ model: rapidModel }));
    //   });

    return new Promise((resolve, reject) => {
      throw new Error('training not implemented');
    });
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
    project.params = data.params;

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
