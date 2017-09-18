import { default as Xmm } from 'xmm-node';
import { Experience } from 'soundworks/server';
// services
import ProjectAdmin from './shared/services/ProjectAdmin';
// stores
import xmmStore from './shared/xmmStore';
import projectManager from './shared/projectManager';

const cwd = process.cwd();

// server-side 'designer' experience.
class DesignerExperience extends Experience {
  constructor(clientType, comm, config) {
    super(clientType);

    this.comm = comm;
    this.config = config;

    this.audioBufferManager = this.require('audio-buffer-manager');
    this.projectAdmin = this.require('project-admin');
    this.sharedParams = this.require('shared-params');

    if (config.env !== 'production') {
      this.rawSocket = this.require('raw-socket', {
        protocol: { channel: 'sensors', type: 'Float32' },
      });
    }
  }

  start() {}

  enter(client) {
    super.enter(client);

    const project = client.project;
    projectManager.addDesigner(project, client);

    const trainingSet = xmmStore.getTrainingSet(project);
    const config = xmmStore.getConfig(project);

    this.send(client, 'init:training-data', { config, trainingSet });
    this.receive(client, 'persist:training-data', this._persistTrainingData(client));

    // listen for client sensor streaming, the client is using `#stream`
    // if (this.config.env !== 'production') {
    //   this.rawSocket.receive(client, 'sensors', data => {
    //     // send to visualizer experience
    //     this.comm.emit('designer-sensors', data);
    //   });
    // }
  }

  exit(client) {
    const project = client.project;
    projectManager.removeDesigner(project, client);

    super.exit(client);
  }

  _persistTrainingData(client) {
    return msg => {
      const project = client.project;
      xmmStore.persistConfig(project, msg.config);
      xmmStore.persistTrainingSet(project, msg.trainingSet);
      xmmStore.persistModel(project, msg.model);
    };
  }
}

export default DesignerExperience;
