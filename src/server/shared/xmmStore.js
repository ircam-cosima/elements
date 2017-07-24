import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const basePath = path.join(cwd, 'public', 'exports');

/**
 * @todo - make everything Promise based and async
 */
const xmmStore = {
  getTrainingSet(user) {
    const uuid = user.uuid;
    const filename = path.join(basePath, 'sets', `${uuid}-training-set.json`);
    let trainingSet = {};

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      trainingSet = JSON.parse(content, 'utf8');
    }

    return trainingSet;
  },

  getConfig(user) {
    const uuid = user.uuid;
    const filename = path.join(basePath, 'configs', `${uuid}-config.json`);
    let config = {};

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      config = JSON.parse(content, 'utf8');
    }

    return config;
  },

  getModel(user) {
    const uuid = user.uuid;
    const filename = path.join(basePath, 'models', `${uuid}-model.json`);
    let model = {};

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      model = JSON.parse(content, 'utf8');
    }

    return model;
  },

  persistTrainingSet(user, trainingSet) {
    const uuid = user.uuid;
    const filename = path.join(basePath, 'sets', `${uuid}-training-set.json`);
    const json = JSON.stringify(trainingSet, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  persistConfig(user, config) {
    const uuid = user.uuid;
    const filename = path.join(basePath, 'configs', `${uuid}-config.json`);
    const json = JSON.stringify(config, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  persistModel(user, model) {
    const uuid = user.uuid;
    const filename = path.join(basePath, 'models', `${uuid}-model.json`);
    const json = JSON.stringify(model, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  // return a structure that keep trace of the user informations
  getModelByUsers(users) {
    const results = {};

    users.forEach(user => {
      results[user.uuid] = {
        username: user.name,
        model: this.getModel(user),
      };
    });

    return results;
  },
};

export default xmmStore;
