import projectDbMapper from './projectDbMapper';
import xmmDbMapper from './xmmDbMapper';

const appStore = {
  init() {
    this._listeners = new Map();

    const projectList = projectDbMapper.getList();
    this.projects = projectList; // project = { name, uuid }
    this.projectUsersMap = new Map();

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
    listeners.forEach(listener => listener(...args));
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

  getProjectDesigner(project) {
    const users = this.projectUsersMap.get(project);
    return users.designer;
  },

  getProjectUsers(project) {
    return this.projectUsersMap.get(project);
  },

  addDesignerToProject(client, project) {
    const users = this.projectUsersMap.get(project);

    users.designer = client;
    client.project = project;
  },

  removeDesignerFromProject(client) {
    const project = client.project;
    const users = this.projectUsersMap.get(project);

    users.designer = null;
    client.project = null;
  },

  addPlayerToProject(client, project) {
    const users = this.projectUsersMap.get(project);

    users.players.add(client);
    client.project = project;
  },

  removePlayerFromProject(client) {
    const project = client.project;
    const users = this.projectUsersMap.get(project);

    users.players.delete(client);
    client.project = null;
  },

  getProjectTrainingData(project) {
    const trainingSet = xmmDbMapper.getTrainingSet(project);
    const config = xmmDbMapper.getConfig(project);

    return { config, trainingSet };
  },

  getProjectModel(project) {
    return xmmDbMapper.getModel(project);
  },

  setProjectTrainingData(project, trainingData) {
    xmmDbMapper.persistConfig(project, msg.config);
    xmmDbMapper.persistTrainingSet(project, msg.trainingSet);
  },

  setProjectModel(project, model) {
    xmmDbMapper.persistModel(project, msg.model);

    this._emit('set-project-model', project);
  },

};

appStore.init();

export default appStore;

// filter by project
// associate a designer and its players
