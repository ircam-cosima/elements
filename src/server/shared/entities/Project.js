import * as mano from 'mano-js/common';
// @todo - remove
import config from '../../config'


class Project {
  constructor() {
    this.name = '';
    this.uuid = null;

    this.trainingData = new mano.TrainingData();
    // @todo - remove that
    this.processor = new mano.XmmProcessor({
      // config should come from somewhere else
      url: `http://localhost:${config.port}${config.trainUrl}`,
    });
  }

  serialize() {
    return {
      name: this.name,
      uuid: this.uuid,
      params: this.params,
    }
  }

  unserialize(json) {
    this.name = json.name;
    this.uuid = json.uuid;
    this.params = json.params;
  }
}

export default Project;
