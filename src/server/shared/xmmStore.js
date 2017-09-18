import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const basePath = path.join(cwd, 'public', 'exports');

/**
 * @todo - make everything Promise based and async
 */
const xmmStore = {
  getTrainingSet(project) {
    const uuid = project.uuid;
    const filename = path.join(basePath, 'sets', `${uuid}-training-set.json`);
    let trainingSet = null;

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      trainingSet = JSON.parse(content, 'utf8');
    }

    return trainingSet;
  },

  getConfig(project) {
    const uuid = project.uuid;
    const filename = path.join(basePath, 'configs', `${uuid}-config.json`);
    let config = null;

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      config = JSON.parse(content, 'utf8');
    }

    return config;
  },

  getModel(project) {
    const uuid = project.uuid;
    const filename = path.join(basePath, 'models', `${uuid}-model.json`);
    let model = null;

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      model = JSON.parse(content, 'utf8');
    }

    return model;
  },

  persistTrainingSet(project, trainingSet) {
    const uuid = project.uuid;
    const filename = path.join(basePath, 'sets', `${uuid}-training-set.json`);
    const json = JSON.stringify(trainingSet, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  persistConfig(project, config) {
    const uuid = project.uuid;
    const filename = path.join(basePath, 'configs', `${uuid}-config.json`);
    const json = JSON.stringify(config, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  persistModel(project, model) {
    const uuid = project.uuid;
    const filename = path.join(basePath, 'models', `${uuid}-model.json`);
    const json = JSON.stringify(model, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  // return a structure that keep trace of the project informations
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
