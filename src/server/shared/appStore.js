import path from 'path';
import * as mano from 'mano-js/common';
import merge from 'lodash.merge';
import projectDbMapper from './utils/projectDbMapper';
// entities
import mlPresets from '../../shared/config/ml-presets';
import Project from './entities/Project';
import ProjectCollection from './entities/ProjectCollection';
import Player from './entities/Player';
import PlayerCollection from './entities/PlayerCollection';
import xmm from 'xmm-node';
import rapidMixAdapters from 'rapid-mix-adapters';

const appStore = {
  init(applicationName, projectPresets) {
    projectDbMapper.configure(applicationName);

    this.projectPresets = projectPresets;
    this.projects = new ProjectCollection();
    this.players = new PlayerCollection();

    this.audioFiles = null;

    this._listeners = new Set();

    this.xmmInstances = {
      'gmm': new xmm('gmm'),
      'hhmm': new xmm('hhmm'),
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

  createProject(name, preset, params = null) {
    const presetInfos = this.projectPresets[preset];
    const project = Project.create(name, preset, presetInfos);
    // project.params.audioFiles = this.defaultAudioFiles;

    if (params !== null) {
      merge(project.params, params);
      // update training instances
      const { trainingSet, config } = project.params.learning;

      project.trainingSet.setTrainingSet(trainingSet);
      project.processor.setConfig(config);
    } else {
      const { config } = project.params.learning;

       for (let name in mlPresets) {
        if (mlPresets[name].default === true)
          merge(config, mlPresets[name].params);
      }

      project.processor.setConfig(config);
    }

    const promise = this._persistProject(project)
      .then(() => this._updateModel(project, true))
      .then(() => {
        this.projects.add(project);
        this.emit('create-project', project);

        return Promise.resolve(project);
      })
      .catch(err => console.error(err.stack));

    return promise;
  },

  deleteProject(project) {
    const players = project.players;
    players.forEach(player => this.removePlayerFromProject(player, project));

    this.projects.remove(project);

    const promise = projectDbMapper.delete(project)
      .then(() => this.emit('delete-project', project))
      .catch(err => console.error(err.stack));

    return promise;
  },

  /**
   * `registerPlayer` and `unregisterPlayer` are the only places where
   * the appStore should deal with the `client`, after that it should only
   * know `player` entities.
   */
  registerPlayer(client, preset) {
    const player = new Player(client, preset);
    this.players.add(player);
  },

  unregisterPlayer(client) {
    const player = this.players.get(client.uuid);
    const project = player.project;

    this.removePlayerFromProject(player, project);
    this.players.remove(player);
  },

  /** Used by the `ProjectManager` service */
  addPlayerToProject(player, project) {
    if (!project)
      throw new Error('Cannot add player to invalid project, check your presets (`forceProject`)');

    console.log(project.params.clientDefaults);
    merge(player.params, project.params.clientDefaults);

    project.addPlayer(player);
    this.emit('add-player-to-project', player, project);
  },

  /** Used by the `ProjectManager` service */
  removePlayerFromProject(player, project) {
    if (project !== null) {
      project.removePlayer(player);
      player.params.mappings = {}; // clean mappings for next project
      this.emit('remove-player-from-project', player, project);
    }
  },

  moveAllPlayersToProject(project) {
    this.players.forEach(player => this.removePlayerFromProject(player, player.project));
    this.players.forEach(player => this.addPlayerToProject(player, project));
  },

  // ...
  updatePlayerParam(player, name, value) {
    const path = name.split('.');
    const depth = path.length;
    let ref = player.params;

    // @todo - move to
    for (let i = 0; i < depth; i++) {
      const key = path[i];

      if (key in ref) {
        if (i < depth - 1) {
          ref = ref[key];
        } else {

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
            ref[key] = value;
          }
        }
      } else {
        throw new Error(`Invalid param name "${name}"`);
      }
    }

    this.emit('update-player-param', player, name, value);
  },

  updateProjectParam(project, name, value) {
    const path = name.split('.');
    const depth = path.length;
    let ref = project.params;

    for (let i = 0; i < depth; i++) {
      const key = path[i];

      if (key in ref) {
        if (i < depth - 1) {
          ref = ref[key];
        } else {
          // sanitize learning values
          if (/^learning\.config/.test(name)) {
            switch (key) {
              case 'gaussians':
              case 'states':
                value = parseInt(value, 10);
                break;
              case 'absoluteRegularization':
              case 'relativeRegularization':
                value = parseFloat(value);
                value = Math.min(1, Math.max(0, value));
                break;
            }
          }

          // sanitize recording options
          if (/^recording/.test(name)) {
            switch (key) {
              case 'highThreshold':
              case 'lowThreshold':
              case 'offDelay':
                value = parseFloat(value);
                break;
            }
          }

          // override clients parameters
          if (/^clientDefaults/.test(name)) {
            const players = project.players;
            const playerParam = name.replace(/^clientDefaults\./, '');

            players.forEach(player => {
              this.updatePlayerParam(player, playerParam, value);
            });
          }

          ref[key] = value;
        }
      } else {
        throw new Error(`Invalid param name "${name}"`);
      }
    }

    this.emit('update-project-param', project, name, value);

    if (path[0] === 'learning') {
      project.processor.setConfig(project.params.learning.config);
      project.params.learning.config = project.processor.getConfig();
      this._updateModel(project);
    }

    this._persistProject(project);
  },

  updateProjectMLPreset(project, name) {
    const presetParams = mlPresets[name].params;
    const config = project.params.learning.config;

    merge(config, presetParams);

    this.emit('update-project-param', project);

    project.processor.setConfig(project.params.learning.config);
    project.params.learning.config = project.processor.getConfig();

    this._persistProject(project)
      .then(() => this._updateModel(project))
      .catch(err => console.error(err.stack));
  },

  addExampleToProject(example, project) {
    try {
      project.trainingSet.addExample(example);
      project.params.learning.trainingSet = project.trainingSet.toJSON();

      this._persistProject(project)
        .then(() => this._updateModel(project))
        .catch(err => console.error(err.stack));
    } catch(err) {
      console.error(`Cannot add invalid example to trainingSet`);
    }
  },

  clearExamplesFromProject(label, project) {
    project.trainingSet.removeExamplesByLabel(label);
    project.params.learning.trainingSet = project.trainingSet.toJSON();

    this._persistProject(project)
      .then(() => this._updateModel(project))
      .catch(err => console.error(err.stack));
  },

  clearAllExamplesFromProject(project) {
    project.trainingSet.clear();
    project.params.learning.trainingSet = project.trainingSet.toJSON();

    this._persistProject(project)
      .then(() => this._updateModel(project))
      .catch(err => console.error(err.stack));
  },

  updateAudioFiles(list) {
    list.sort();

    const audioFiles = {};
    const labels = [];
    const promises = [];

    for (let i = 0; i < list.length; i++) {
      const filename = list[i];
      const extname = path.extname(filename);
      const basename = path.basename(filename, extname);
      audioFiles[basename] = [filename];
      labels.push(basename);
    }

    this.audioFiles = audioFiles;

    this.emit('update-audio-files', this.audioFiles);

    // clear examples associated to removed labels / soundfile
    this.projects.getAll().forEach(project => {
      const trainedLabels = project.trainingSet.getLabels();

      trainedLabels.forEach(trainedLabel => {
        if (labels.indexOf(trainedLabel) === -1)
          this.clearExamplesFromProject(trainedLabel, project);
      });

      this.updateProjectParam(project, 'clientDefaults.record.label', Object.keys(audioFiles)[0]);

      const promise = this._persistProject(project);
      promises.push(promise);
    });

    return Promise.all(promises).catch(err => console.error(err.stack));
  },

  _persistProject(project) {
    const projectData = Project.toData(project);

    return projectDbMapper.persist(projectData)
      .catch(err => console.error(err.stack));
  },

  // update xmm model
  _updateModel(project, silent = false) {
    const config = project.processor.getConfig();
    const trainingSet = project.trainingSet.toJSON();

    let trainedTraniningSet = trainingSet;

    // if one of the input is false, recreate a new trainingSet from raw data
    const inputs = project.params.learning.inputs;

    if (
      !inputs.intensity || 
      !inputs.bandpass ||
      !inputs.orientation  ||
      !inputs.gyroscope
    ) {
      const data = trainingSet.payload.data;
      let inputDimension = 0;

      const filteredTrainingSet = {
        docType: 'rapid-mix:ml-training-set',
        docVersion: '1.0.0',
        payload: {
          inputDimension: 0,
          outputDimension: 0,
          data: [],
        }
      }
      // // loop throught each example
      for (let i = 0; i < data.length; i++) {
        const srcExample = data[i];
        const destExample = {
          label: srcExample.label,
          input: [],
        };

        // create filtered copy of each input in example
        for (let j = 0; j < srcExample.input.length; j++) {
          const srcDatum = srcExample.input[j];
          const datum = [];
          let index = 0;

          if (inputs.intensity) {
            for (let k = 0; k < 2; k++) {
              datum[index] = srcDatum[k];
              index += 1;
            }
          }

          if (inputs.bandpass) {
            for (let k = 2; k < 5; k++) {
              datum[index] = srcDatum[k];
              index += 1;
            }
          }

          if (inputs.orientation) {
            for (let k = 5; k < 8; k++) {
              datum[index] = srcDatum[k];
              index += 1;
            }
          }

          if (inputs.gyroscope) {
            for (let k = 8; k < 11; k++) {
              datum[index] = srcDatum[k];
              index += 1;
            }
          }

          filteredTrainingSet.payload.inputDimension = index;
          destExample.input.push(datum);
        }

        filteredTrainingSet.payload.data.push(destExample);
      }

      // don't use filtered input if no dimensions, as it crashes xmm
      if (filteredTrainingSet.payload.inputDimension !== 0)
        trainedTraniningSet = filteredTrainingSet;
    }

    const xmmTrainingSet = rapidMixAdapters.rapidMixToXmmTrainingSet(trainedTraniningSet);
    const xmmConfig = rapidMixAdapters.rapidMixToXmmModel(config);

    const target = config.payload.modelType;
    const xmm = this.xmmInstances[target];

    return new Promise((resolve, reject) => {
      xmm.setConfig(xmmConfig);
      xmm.setTrainingSet(xmmTrainingSet);
      xmm.train((err, model) => {
        if (err)
          console.log(err.stack);

        const rapidMixModel = rapidMixAdapters.xmmToRapidMixModel(model);
        project.model = rapidMixModel;

        if (!silent)
          this.emit('update-model', project, rapidMixModel);

        resolve(project);
      });
    });
  },
};

export default appStore;
