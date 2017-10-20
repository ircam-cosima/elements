import * as mano from 'mano-js/common';
import merge from 'lodash.merge';
import projectDbMapper from './utils/projectDbMapper';
// entities
import Project from './entities/Project';
import ProjectCollection from './entities/ProjectCollection';
import Player from './entities/Player';
import PlayerCollection from './entities/PlayerCollection';


const appStore = {
  init() {
    /**
     * @type Set
     */
    this.projects = new ProjectCollection();

    /**
     * @type Set
     */
    this.players = new PlayerCollection();

    /**
     * @type Map
     */
    // this.clientProjectMap = new Map();

    this._listeners = new Set();

    // load persisted projects in memory
    return projectDbMapper.getList().then(projectsData => {
      projectsData.forEach(projectData => {
        const project = Project.fromData(projectData);
        this.projects.add(project);
      });

      return Promise.resolve();
    });
  },

  addListener(callback) {
    this._listeners.add(callback);
  },

  removeListener(callback) {
    this._listeners.remove(callback);
  },

  emit(channel, ...args) {
    this._listeners.forEach(listener => listener(channel, ...args));
  },

  /**
   *
   */
  createProject(name) {
    const project = Project.create(name);

    this.emit('updateProjectList', project);
  },

  deleteProject(project) {
    // remove from this.projects
    // delete related file

    this.emit('updateProjectList');
  },

  /**
   * Required by the `ClientRegister` service
   * This is the only place where the appStore should deal with the `client`.
   * After that it should only know `player` entities.
   */
  registerPlayer(client) {
    const player = new Player(client);
    this.players.add(player);
  },

  /**
   * Required by the `ClientRegister` service
   * This is the only place where the appStore should deal with the `client`.
   * After that it should only know `player` entities.
   */
  unregisterPlayer(client) {
    const player = this.players.get(client.uuid);
    this.players.remove(player);
  },

  /** Used by the `ProjectManager` service */
  addPlayerToProject(player, project) {
    // apply project `clientDefault` to `player.params`
    // @note - will probably need more check
    merge(player.param, project.params.clientDefaults);

    project.addPlayer(player);

    console.log('here');
    this.emit('add-player-to-project', player, project);
  },

  /** Used by the `ProjectManager` service */
  removePlayerFromProject(player, project) {
    if (project !== null) {
      project.removePlayer(player);
      this.emit('remove-player-from-project', player, project);
    }
  },

  // ...
};

export default appStore;
