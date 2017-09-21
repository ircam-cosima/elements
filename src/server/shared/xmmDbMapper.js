import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const basePath = path.join(cwd, 'db');

if (!fs.existsSync(basePath))
  fs.mkdirSync(basePath);

const trainingSetDirname = path.join(basePath, 'sets');
const configDirname = path.join(basePath, 'configs');
const modelDirname = path.join(basePath, 'models');

if (!fs.existsSync(trainingSetDirname))
  fs.mkdirSync(trainingSetDirname);

if (!fs.existsSync(configDirname))
  fs.mkdirSync(configDirname);

if (!fs.existsSync(modelDirname))
  fs.mkdirSync(modelDirname);

/**
 * @todo - make everything Promise based and async
 */
const xmmStore = {
  getTrainingSet(project) {
    const uuid = project.uuid;
    const filename = path.join(trainingSetDirname, `${uuid}-training-set.json`);
    let trainingSet = null;

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      trainingSet = JSON.parse(content, 'utf8');
    }

    return trainingSet;
  },

  getConfig(project) {
    const uuid = project.uuid;
    const filename = path.join(configDirname, `${uuid}-config.json`);
    let config = null;

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      config = JSON.parse(content, 'utf8');
    }

    return config;
  },

  getModel(project) {
    const uuid = project.uuid;
    const filename =  path.join(modelDirname, `${uuid}-model.json`);
    let model = null;

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      model = JSON.parse(content, 'utf8');
    }

    return model;
  },

  persistTrainingSet(project, trainingSet) {
    const uuid = project.uuid;
    const filename = path.join(trainingSetDirname, `${uuid}-training-set.json`);
    const json = JSON.stringify(trainingSet, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  persistConfig(project, config) {
    const uuid = project.uuid;
    const filename = path.join(configDirname, `${uuid}-config.json`);
    const json = JSON.stringify(config, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  persistModel(project, model) {
    const uuid = project.uuid;
    const filename = path.join(modelDirname, `${uuid}-model.json`);
    const json = JSON.stringify(model, null, 2);

    fs.writeFileSync(filename, json, 'utf8');
  },

  deleteTrainingSet(project) {
    const uuid = project.uuid;
    const filename = path.join(trainingSetDirname, `${uuid}-training-set.json`);

    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
  },

  deleteConfig(project) {
    const uuid = project.uuid;
    const filename = path.join(configDirname, `${uuid}-config.json`);

    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
  },

  deleteModel(project) {
    const uuid = project.uuid;
    const filename = path.join(modelDirname, `${uuid}-model.json`);

    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
  },
};

export default xmmStore;
