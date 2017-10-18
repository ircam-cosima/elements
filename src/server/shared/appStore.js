import * as mano from 'mano-js/common';
import projectDbMapper from './projectDbMapper';
import uuidv4 from 'uuid/v4';
import merge from 'lodash.merge';
// @todo - should be removed when the create project page will be done
import defaultAudio from '../../shared/audio';

import Project from './entities/Project';
import Player from './entities/Player';

const appStore = {
  init() {
    /**
     * @type Set
     */
    this.projects = new Set(); // projectDbMapper.getList();

    /**
     * @type Set
     */
    this.players = new Set();

    /**
     * @type Map
     */
    this.uuidPlayerMap = new Map();

    /**
     * @type Map
     */
    this.projectPlayersMap = new Map();

    /**
     * @type Map
     */
    // this.clientProjectMap = new Map();

    this._listeners = new Map();

    // load persisted projects in memory
    const persistedProjects = projectDbMapper.getList();

    persistedProjects.forEach(serializedProject => {
      const project = new Project();
      project.unserialize(serializedProject);

      this.projectPlayersMap.set(project, new Set());
    });
  },

  // event listener
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

  emit(channel, ...args) {
    const listeners = this._listeners.get(channel);

    if (listeners)
      listeners.forEach(listener => listener(...args));
  },

  /**
   * Used by the `ClientRegister` service
   */
  registerPlayer(client) {
    // const model = getDefaultClientModel();
    // client.model = model;

    // this.uuidClientMap.set(client.uuid, client);
    // this.clients.add(client);
  },

  /**
   * Used by the `ClientRegister` service
   */
  unregisterPlayer(client) {
    // this.uuidClientMap.delete(client.uuid);
    // this.clients.delete(client);
  },

  /**
   * Used by the `ProjectManager` service
   */
  addClientToProject(client, project) {
    const clients = this.projectClientsMap.get(project);

    merge(client.model, project.clientDefaults);

    clients.add(client);
    client.project = project;

    this._emit('clientAddedToProject', client, project);
  },

  /**
   * Used by the `ProjectManager` service
   */
  removeClientFromProject(client) {
    const project = client.project;
    const clients = this.projectClientsMap.get(project);

    if (!clients)
      throw new Error(`Cannot remove client from undefined project ${project.name}`)

    clients.delete(client);
    client.project = null;

    this._emit('clientRemovedFromProject', client, project);
  },


  /**
   *
   */
  createProject() {

  }

  deleteProject(project) {
    // remove from this projects
    // store this project
  }


  // getters
  getClientByUuid(uuid) {
    return this.uuidClientMap.get(uuid);
  }
}
