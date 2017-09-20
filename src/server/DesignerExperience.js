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

    // if (config.env !== 'production') {
    //   this.rawSocket = this.require('raw-socket', {
    //     protocol: { channel: 'sensors', type: 'Float32' },
    //   });
    // }
  }

  start() {
    appStore.addListener('set-client-param', (project, client) => {
      this.send(client, 'params:update', client.params);
    });

    appStore.addListener('set-project-model', (project, model) => {
      const client = appStore.getProjectDesigner(project);
      const { config } = appStore.getProjectTrainingData(project);

      if (client !== null)
        this.send(client, 'model:update', model, config);
    });
  }

  enter(client) {
    super.enter(client);

    const project = client.project;
    const trainingData = appStore.getProjectTrainingData(project);

    this.send(client, 'init', trainingData);
    this.send(client, 'params:update', client.params);

    this.receive(client, 'param:update', this._onParamUpdate(client));
    this.receive(client, 'model:update', this._onModelUpdate(client));

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

  _onModelUpdate(client) {
    return data => {
      const project = client.project;

      appStore.setProjectTrainingData(project, {
        config: data.config,
        trainingSet: data.trainingSet,
      });

      appStore.setProjectModel(project, data.model);
    }
  }

  _onParamUpdate(client) {
    return (paramName, value) => {
      appStore.setClientParam(client, paramName, value);
    }
  }
}

export default DesignerExperience;
