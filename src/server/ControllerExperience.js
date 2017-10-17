import * as soundworks from 'soundworks/server';
import appStore from './shared/appStore';
import chalk from 'chalk';
import xmm from 'xmm-node';
import { rapidMixToXmmTrainingSet, xmmToRapidMixModel } from 'mano-js/common';

// xmm instances for the controller
const gx = new xmm('gmm');
const hx = new xmm('hhmm');


class ControllerExperience extends soundworks.Experience {
  constructor(clientType, comm, oscConfig) {
    super(clientType);

    this.comm = comm;
    this.oscConfig = oscConfig;

    this.rawSocket = this.require('raw-socket', {
      protocol: { channel: 'sensors', type: 'Float32' },
    });

    this.osc = this.require('osc');
  }

  start() {
    super.start();

    // @todo - make sure that we have some clients before doing the work
    appStore.addListener('create-project', project => {
      const projectsOverview = Array.from(appStore.projects);
      const serializedProject = this._serializeProject(project);
      this.broadcast('controller', null, 'project:create', serializedProject);
      this.broadcast('controller', null, 'project:overview', projectsOverview);
    });
    // cannot use the broadcast method as serialize will crash...
    appStore.addListener('delete-project', project => {
      const projectsOverview = Array.from(appStore.projects);
      this.broadcast('controller', null, 'project:delete', project);
      this.broadcast('controller', null, 'project:overview', projectsOverview);
    });

    const broadcast = (channel, project) => {
      const serializedProject = this._serializeProject(project);
      console.log(serializedProject);
      this.broadcast('controller', null, channel, serializedProject);
    };

    appStore.addListener('set-project-param', project => broadcast('project:update', project));
    appStore.addListener('set-project-config', project => broadcast('project:update', project));
    appStore.addListener('set-project-model', project => broadcast('project:update', project));

    // appStore.addListener('add-designer-to-project', project => broadcast('project:update', project));
    // appStore.addListener('add-player-to-project', project => broadcast('project:update', project));

    // appStore.addListener('remove-designer-from-project', project => broadcast('project:update', project));
    // appStore.addListener('remove-player-from-project', project => broadcast('project:update', project));

    appStore.addListener('add-client-to-project', project => broadcast('project:update', project));
    appStore.addListener('remove-client-from-project', project => broadcast('project:update', project));

    this.comm.addListener('sensors', data => {
      const features = new Float32Array(8) // nb of features to extract

      for (let i = 0; i < 8; i++)
        features[i] = data[i];

      this.rawSocket.broadcast('controller', null, 'sensors', features);
      this.osc.send('/sensors', Array.from(data));
    });

    console.log(chalk.yellow(`[OSC] Phone sent on port ${this.oscConfig.sendPort}`));
  }

  enter(client) {
    super.enter(client);

    // send init informations
    const projects = appStore.projects;
    const projectsOverview = Array.from(projects);
    const serializedProjectList = [];

    projects.forEach((project) => {
      const serializedProject = this._serializeProject(project);
      serializedProjectList.push(serializedProject);
    });

    this.send(client, 'project:list', serializedProjectList);
    this.send(client, 'project:overview', projectsOverview);

    this.receive(client, 'project:delete', this._onProjectDeleteRequest(client));
    this.receive(client, 'designer:disconnect', this._onDesignerDisconnectRequest(client));
    this.receive(client, 'project:clearModel', this._clearModelRequest(client));
    this.receive(client, 'project:clearLabel', this._clearLabelRequest(client));
    this.receive(client, 'param:project:update', this._onUpdateProjectParam(client));
    this.receive(client, 'config:project:update', this._onUpdateProjectConfig(client));
    this.receive(client, 'param:client:update', this._onUpdateClientParam(client));
    this.receive(client, 'exclusive:param:client:update', this._onUpdateClientExclusiveParam(client));
    this.receive(client, 'command:trigger', this._onTriggerClientCommmand(client));
  }

  exit(client) {
    super.exit(client);
  }

  /**
   * Given a project, returns a serialize version of all it clients
   */
  _serializeProject(project) {
    const config = appStore.getProjectTrainingConfig(project);
    const serialized = {
      name: project.name,
      uuid: project.uuid,
      params: project.params,
      config: project.config,
      hasDesigner: false,
      clients: [],
      // this could probably be cleaner...
      modelType: (config !== null ? config.target.name.split(':')[1] : 'gmm'),
      gaussians: (config !== null ? config.payload.gaussians : 1),
      relativeRegularization: (config !== null ? config.payload.relativeRegularization : 0.1),
      absoluteRegularization: (config !== null ? config.payload.absoluteRegularization : 0.1),
      covarianceMode: (config !== null ? config.payload.covarianceMode : 'full'),
      hierarchical: (config !== null ? config.payload.hierarchical : true),
      states: (config !== null ? config.payload.states : 1),
      transitionMode: (config !== null ? config.payload.transitionMode : 'leftright'),
      regressionEstimator: (config !== null ? config.payload.regressionEstimator : 'full'),
    };

    // handle designer
    /*
    const designer = appStore.getProjectDesigner(project);

    if (designer !== null) {
      const client = {
        type: 'designer',
        uuid: designer.uuid,
        params: designer.params,
      };

      serialized.hasDesigner = true;
      serialized.clients.push(client);
    }

    const players = appStore.getProjectPlayers(project);

    players.forEach(player => {
      const client = {
        type: 'player',
        uuid: player.uuid,
        params: player.params,
      };

      serialized.clients.push(client);
    });
    */

    const clients = appStore.getProjectClients(project);

    if (clients.size > 0)
      serialized.hasDesigner = true;

    clients.forEach(client => {
      const c = {
        type: 'designer',
        uuid: client.uuid,
        params: client.params,
      };

      console.log(c);
      console.log('--------------------------------');
      serialized.clients.push(c);
    });
    //

    return serialized;
  }

  _onProjectDeleteRequest(client) {
    return uuid => {
      const project = appStore.getProjectByUuid(uuid);

      if (project !== null)
        appStore.deleteProject(project);
    }
  }

  _onDesignerDisconnectRequest(client) {
    return uuid => {
      const designer = appStore.getClientByUuid(uuid);
      this.send(designer, 'force:disconnect');
    }
  }

  _clearModelRequest(client) {
    return uuid => {
      const project = appStore.getProjectByUuid(uuid);
      appStore.removeAllExamplesFromProject(project);

    };
  }

  _clearLabelRequest(client) {
    return (uuid, label) => {
      const project = appStore.getProjectByUuid(uuid);
      appStore.removeExamplesFromProject(project, label);

    };
  }

  _onUpdateProjectParam(client) {
    return (uuid, paramName, value) => {
      const project = appStore.getProjectByUuid(uuid);
      appStore.setProjectParam(project, paramName, value);
    }
  }

  _onUpdateClientParam(client) {
    return (uuid, paramName, value) => {
      const user = appStore.getClientByUuid(uuid);
      appStore.setClientParam(user, paramName, value);
    }
  }

  // exclusive params are params that can't be true on 2 users
  _onUpdateClientExclusiveParam(client) {
    return (uuid, paramName, value) => {
      const user = appStore.getClientByUuid(uuid);

      if (value === true) {
        const clients = appStore.clients;

        clients.forEach(client => {
          if (client.params[paramName] === true)
            appStore.setClientParam(client, paramName, false);
        });
      }

      this.broadcast('controller', null, 'sensors-display', value);
      appStore.setClientParam(user, paramName, value);
    }
  }

  // absolute and relative regularization
  _onUpdateProjectConfig(client) {
    return (uuid, name, value) => {
      const project = appStore.getProjectByUuid(uuid);

      if (name in project.config) {
        // this is part of the project configuration
        appStore.setProjectConfig(project, name, value);
      } else {
        // this is an xmm parameter, for now we only deal with regularization

        // appStore should be the one that handles this
        switch(name) {
          case 'absoluteRegularization':
          case 'relativeRegularization':
            value = Math.min(1, Math.max(0.01, value));
            break;

          default:
            break;
        }

        // flatten rapidmix config
        let config = appStore.getProjectTrainingConfig(project);
        const modelType = config.target.name.split(':')[1];
        config = config.payload;
        config.modelType = modelType;

        // update desired param
        config[name] = value;

        appStore.setProjectTrainingConfig(project, config);
      }
    }
  }

  _onTriggerClientCommmand(client) {
    return (uuid, cmd, ...args) => {
      this.comm.emit('command:trigger', uuid, cmd, ...args);
    }
  }
}

export default ControllerExperience;
