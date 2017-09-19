import projectDbMapper from './projectDbMapper';
import xmmDbMapper from './xmmDbMapper';
import uuidv4 from 'uuid/v4';

const appStore = {
  init() {
    this._listeners = new Map();

    this.projects = projectDbMapper.getList(); // project = { name, uuid }
    this.projectUsersMap = new Map();

    this.uuidClientMap = new Map();

    this.projects.forEach(project => {
      this.projectUsersMap.set(project, this._getEmptyUserMap());
    });
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
    this.uuidClientMap.set(client.uuid, client);
  },

  unregisterClient(client) {
    this.uuidClientMap.delete(client.uuid);
  },

  getClientByUuid(uuid) {
    return this.uuidClientMap.get(uuid);
  },

  _getEmptyUserMap() {
    return {
      designer: null,
      players: new Set(),
    };
  },

  createProject(name) {
    const project = { name: name, uuid: uuidv4() };

    this.projects.add(project);
    this.projectUsersMap.set(project, this._getEmptyUserMap());

    projectDbMapper.persist(this.projects);

    this._emit('create-project', project);

    return project;
  },

  /**
   * @todo - check what to do on delete
   */
  deleteProject(project) {
    // @todo - check if users
    this.projectUsersMap.delete(project);
    this.projects.delete(project);

    projectDbMapper.persist(this.projects);

    this._emit('delete-project', project);
  },

  addDesignerToProject(client, project) {
    const users = this.projectUsersMap.get(project);

    users.designer = client;
    client.project = project;

    this._emit('add-designer-to-project', project);
  },

  removeDesignerFromProject(client) {
    const project = client.project;
    const users = this.projectUsersMap.get(project);

    users.designer = null;
    client.project = null;

    this._emit('remove-designer-from-project', project);
  },

  addPlayerToProject(client, project) {
    const users = this.projectUsersMap.get(project);

    users.players.add(client);
    client.project = project;

    this._emit('add-player-to-project', project);
  },

  removePlayerFromProject(client) {
    const project = client.project;
    const users = this.projectUsersMap.get(project);

    users.players.delete(client);
    client.project = null;

    this._emit('remove-player-from-project', project);
  },

  setProjectTrainingData(project, trainingData) {
    xmmDbMapper.persistConfig(project, msg.config);
    xmmDbMapper.persistTrainingSet(project, msg.trainingSet);

    this._emit('set-project-training-data', project);
  },

  setProjectModel(project, model) {
    xmmDbMapper.persistModel(project, msg.model);

    this._emit('set-project-model', project);
  },

  getProjectTrainingData(project) {
    const trainingSet = xmmDbMapper.getTrainingSet(project);
    const config = xmmDbMapper.getConfig(project);

    return { config, trainingSet };
  },

  getProjectModel(project) {
    return xmmDbMapper.getModel(project);
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

  setProjectTrainingData(project, trainingData) {
    xmmDbMapper.persistConfig(project, trainingData.config);
    xmmDbMapper.persistTrainingSet(project, trainingData.trainingSet);
  },

  setProjectModel(project, model) {
    xmmDbMapper.persistModel(project, model);
  },

  getProjectDesigner(project) {
    const users = this.projectUsersMap.get(project);
    return users.designer;
  },

  getProjectPlayers(project) {
    const users = this.projectUsersMap.get(project);
    return users.players;
  },
};

appStore.init();

export default appStore;

// filter by project
// associate a designer and its players

