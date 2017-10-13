import * as imlMotion from 'iml-motion/common';
import projectDbMapper from './projectDbMapper';
import xmmDbMapper from './xmmDbMapper';
import uuidv4 from 'uuid/v4';
import config from '../config/default';

const appStore = {
  init() {
    this.projects = projectDbMapper.getList();

    this.projectClientsMap = new Map();
    this.projectDataMap = new Map();

    this.uuidClientMap = new Map();
    this.clients = new Set();

    this._listeners = new Map();

    // initialize projects with default values
    this.projects.forEach(project => {
      // maybe `params` could be renamed to `clientParams`
      project.params = this._getProjectDefaultParams();
      // leave config as loaded from drive :
      // project.config = this._getProjectDefaultConfig();
      // this.projectUsersMap.set(project, this._getEmptyUserMap());

      this.projectClientsMap.set(project, new Set());

      const tc = this._getNewTrainingClasses();
      const trainingSet = xmmDbMapper.getTrainingSet(project);
      const config = xmmDbMapper.getConfig(project);

      if (trainingSet)
        tc.data.setTrainingSet(trainingSet);
      else
        xmmDbMapper.persistTrainingSet(project, tc.data.getTrainingSet());

      if (config)
        tc.algo.setConfig(config);
      else
        xmmDbMapper.persistConfig(project, tc.algo.getConfig());

      this.projectDataMap.set(project, tc);
    });
  },

  // maybe this could be split properly between players and designers
  _getClientDefaultParams() {
    return {
      mute: false,
      intensity: false,
      // designer specific parameters
      recording: false,
      streamSensors: false, // only one client can have this to `true`
    };
  },

  // project params are parameters that mimic client parameters
  // and override them if needed, this object should never contain a key
  // that is not part of `ClientDefaultParams`
  _getProjectDefaultParams() {
    return {
      mute: false,
      intensity: false,
    };
  },

  // project config are parameters that are relative to the project itself
  _getProjectDefaultConfig() {
    return config.defaultProjectConfig;
  },

  _getEmptyUserMap() {
    return {
      designer: null,
      players: new Set(),
    };
  },

  _getNewTrainingClasses() {
    return {
      data: new imlMotion.TrainingData(),
      algo: new imlMotion.XmmProcessor({
        // we assume the api simulation will run on the localhost (see server/index.js)
        url: `http://localhost:${config.port}${config.trainUrl}`
      }),
    };
  },

  addListener(channel, callback) {
    if (!this._listeners.has(channel))
      this._listeners.set(channel, new Set());

    const listeners = this._listeners.get(channel);
    listeners.add(callback);
  },

  removeListener(channel, callback) {
    if (this._listeners.has(channel)) {
      const listeners = this._listeners.get(channel);
      listeners.delete(callback);
    }
  },

  _emit(channel, ...args) {
    const listeners = this._listeners.get(channel);

    if (listeners)
      listeners.forEach(listener => listener(...args));
  },

  // easy acces to clients by uuid
  registerClient(client) {
    const params = this._getClientDefaultParams();
    client.params = params;

    this.uuidClientMap.set(client.uuid, client);
    this.clients.add(client);
  },

  unregisterClient(client) {
    this.uuidClientMap.delete(client.uuid);
    this.clients.delete(client);
  },

  // create / delete project
  createProject(name) {
    const project = {
      name: name,
      uuid: uuidv4(),
      params: this._getProjectDefaultParams(),
      config: this._getProjectDefaultConfig(),
    };

    this.projects.add(project);
    // this.projectUsersMap.set(project, this._getEmptyUserMap());
    this.projectClientsMap.set(project, new Set());
    this.projectDataMap.set(project, this._getNewTrainingClasses());

    projectDbMapper.persist(this.projects);

    const tc = this.projectDataMap.get(project);
    xmmDbMapper.persistTrainingSet(project, tc.data.getTrainingSet());
    xmmDbMapper.persistConfig(project, tc.algo.getConfig());

    this._emit('create-project', project);

    return project;
  },

  /**
   * @todo - check what to do on delete
   */
  deleteProject(project) {
    // @todo - check if users
    // this.projectUsersMap.delete(project);
    this.projectClientsMap.delete(project);
    this.projectDataMap.delete(project);
    this.projects.delete(project);

    xmmDbMapper.deleteTrainingSet(project);
    xmmDbMapper.deleteConfig(project);
    xmmDbMapper.deleteModel(project);

    projectDbMapper.persist(this.projects);

    this._emit('delete-project', project);
  },

  setProjectConfig(project, name, value) {
    // sanitize values
    switch (name) {
      case 'highThreshold':
      case 'lowThreshold':
        value = Math.min(1, Math.max(0, value));
        break;
      case 'offDelay':
        value = Math.max(20, value);
        break;
    }

    project.config[name] = value;
    projectDbMapper.persist(this.projects);

    this._emit('set-project-config', project);
  },

  // params handling project params are project level
  // overrides of the client params
  setProjectParam(project, name, value) {
    project.params[name] = value;

    const clients = this.projectClientsMap.get(project);
    clients.forEach(client => this.setClientParam(client, name, value, false));

    this._emit('set-project-param', project);
  },

  setClientParam(client, name, value, _triggerProject = true) {
    const project = client.project;
    client.params[name] = value;

    if (_triggerProject === true)
      this._emit('set-project-param', project);

    this._emit('set-client-param', project, client);
  },

  /////////// USERS ///////////

  addClientToProject(client, project) {
    const clients = this.projectClientsMap.get(project);

    for (let name in project.params)
      client.params[name] = project.params[name];

    clients.add(client);
    client.project = project;

    this._emit('add-client-to-project', project);
  },

  removeClientFromProject(client) {
    const project = client.project;
    const clients = this.projectClientsMap.get(project);

    if (clients) {
      clients.delete(client);
      client.project = null;

      this._emit('remove-client-from-project', project);
    }
  },

  ////////// PHRASES //////////

  addExampleToProject(project, phrase) {
    const trainingData = this.projectDataMap.get(project).data;
    trainingData.addExample(phrase);
    xmmDbMapper.persistTrainingSet(project, trainingData.getTrainingSet());

    this.trainProject(project);
  },

  removeExamplesFromProject(project, label) {
    const trainingData = this.projectDataMap.get(project).data;
    trainingData.removeExamplesByLabel(label);
    xmmDbMapper.persistTrainingSet(project, trainingData.getTrainingSet());

    this.trainProject(project);
  },

  removeAllExamplesFromProject(project) {
    const trainingData = this.projectDataMap.get(project).data;
    trainingData.clear();
    xmmDbMapper.persistTrainingSet(project, trainingData.getTrainingSet());

    this.trainProject(project);
  },

  /////////// TRAIN ///////////

  trainProject(project) {
    const trainingConfig = this.projectDataMap.get(project);
    trainingConfig.algo.train(xmmDbMapper.getTrainingSet(project))
      .then(response => {
        this.setProjectModel(project, response.model);
      })
      .catch(err => console.error(err));
  },

  ////////// SETTERS //////////

  setProjectTrainingConfig(project, config) {
    const trainingConfig = this.projectDataMap.get(project);
    trainingConfig.algo.setConfig(config);
    config = trainingConfig.algo.getConfig();
    xmmDbMapper.persistConfig(project, config);

    this._emit('set-project-training-config', project, config);

    this.trainProject(project);
  },

  setProjectModel(project, model) {
    xmmDbMapper.persistModel(project, model);

    this._emit('set-project-model', project, model);
  },

  ////////// GETTERS //////////

  getProjectTrainingSet(project) {
    return xmmDbMapper.getTrainingSet(project);
  },

  getProjectTrainingConfig(project) {
    return xmmDbMapper.getConfig(project);
  },

  getProjectModel(project) {
    return xmmDbMapper.getModel(project);
  },

  getProjectTrainingData(project) {
    const trainingSet = xmmDbMapper.getTrainingSet(project);
    const config = xmmDbMapper.getConfig(project);

    return { config, trainingSet };
  },

  getProjectByUuid(uuid) {
    let _project = null;

    this.projects.forEach(project => {
      if (project.uuid === uuid)
        _project = project;
    });

    return _project;
  },

  getProjectByName(projectName) {
    let _project = null;

    this.projects.forEach(project => {
      if (project.name === projectName)
        _project = project;
    });

    return _project;
  },

  getClientByUuid(uuid) {
    return this.uuidClientMap.get(uuid);
  },

  getProjectClients(project) {
    return this.projectClientsMap.get(project);
  },
};

export default appStore;

