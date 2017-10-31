import * as mano from 'mano-js/common';
import merge from 'lodash.merge';
import projectDbMapper from './utils/projectDbMapper';
// entities
import Project from './entities/Project';
import ProjectCollection from './entities/ProjectCollection';
import Player from './entities/Player';
import PlayerCollection from './entities/PlayerCollection';
import xmm from 'xmm-node';


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


    this.xmmInstances = {
      'xmm:gmm': new xmm('gmm'),
      'xmm:hhmm': new xmm('hhmm'),
    };

    // load persisted projects in memory
    return projectDbMapper.getList().then(projectsData => {
      projectsData.forEach(projectData => {
        const project = Project.fromData(projectData);
        this.projects.add(project);
        this._updateModel(project);
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

    this.emit('create-project', project);

    this._updateModel(project);
  },

  deleteProject(project) {
    // remove from this.projects
    // delete related file

    this.emit('delete-project', project);
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
    const project = player.project;

    this.removePlayerFromProject(player, project);
    this.players.remove(player);
  },

  /** Used by the `ProjectManager` service */
  addPlayerToProject(player, project) {
    merge(player.params, project.params.clientDefaults);

    project.addPlayer(player);
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
  updatePlayerParam(player, name, value) {
    const path = name.split('.');
    const depth = path.length;
    let ref = player.params;

    // @todo - move to
    for (let i = 0; i < depth; i++) {
      if (path[i] in ref) {
        if (i < depth - 1) {
          ref = ref[path[i]];
        } else {

          // handle record state machine
          // @todo - 'idle' should be accessible from everywhere as it should
          // be the default on a project change / or add a 'reset' state ?
          if (name === 'record.state') {
            const currentState = ref.state;

            if (currentState === 'idle' && value === 'arm')
              ref.state = 'armed';
            else if ((currentState === 'idle' || currentState === 'armed') && value === 'record')
              ref.state = 'recording';
            else if (currentState === 'recording' && value === 'stop')
              ref.state = 'pending';
            else if (currentState === 'pending' && (value === 'confirm' || value === 'cancel'))
              ref.state = value;
            else if ((currentState === 'confirm' || currentState === 'cancel') && value === 'idle')
              ref.state = 'idle';

          } else {
            ref[path[i]] = value;
          }

        }
      } else {
        throw new Error(`Invalid param name "${name}"`);
      }
    }

    this.emit('update-player-param', player);
  },

  updateProjectParam(project, name, value) {
    throw new Error('`updateProjectParam` not implemented');
  },


  addExampleToProject(example, project) {
    project.trainingData.addExample(example);
    this._updateModel(project);
  },

  clearLabelFromProject(label, project) {
    project.trainingData.removeExamplesByLabel(label);
    this._updateModel(project);
  },

  clearAllLabelsFromProject(project) {
    project.trainingData.clear();
    this._updateModel(project);
  },

  // update xmm model
  _updateModel(project) {
    const config = project.processor.getConfig()
    const trainingSet = project.trainingData.getTrainingSet();
    const xmmTrainingSet = mano.rapidMixToXmmTrainingSet(trainingSet);

    const target = config.target.name;
    const xmm = this.xmmInstances[target];

    xmm.setConfig(config);
    xmm.setTrainingSet(xmmTrainingSet);
    xmm.train((err, model) => {
      if (err)
        console.log(err.stack);

      const rapidMixModel = mano.xmmToRapidMixModel(model);
      project.model = model;

      this.emit('update-model', project, model);
    });
  },
};

export default appStore;
