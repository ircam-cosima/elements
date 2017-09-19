import { Experience } from 'soundworks/server';
import appStore from './shared/appStore';

const cwd = process.cwd();

// server-side 'designer' experience.
class DesignerExperience extends Experience {
  constructor(clientType, config) {
    super(clientType);

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
    const trainingData = appStore.getProjectTrainingData(project);

    this.send(client, 'init:training-data', trainingData);
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
    super.exit(client);
  }

  _persistTrainingData(client) {
    return msg => {
      const project = client.project;

      appStore.setProjectTrainingData(project, {
        config: msg.config,
        trainingData: msg.trainingSet,
      });

      appStore.setProjectModel(project, msg.model);
    };
  }
}

export default DesignerExperience;
