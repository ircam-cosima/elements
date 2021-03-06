import * as soundworks from 'soundworks/client';
import * as mano from 'mano-js';
import { decibelToLinear } from 'soundworks/utils/math';
import moduleManager from '../shared/modules/moduleManager';
import PlayerView from './PlayerView';
// shared informations
import { sounds as uiSounds } from '../../shared/config/ui';

const audioContext = soundworks.audioContext;

class PlayerExperience extends soundworks.Experience {
  constructor(config, clientPreset, projectPresets, audioFiles) {
    super();

    this.clientPreset = clientPreset;
    this.projectPresets = projectPresets;

    this.platform = this.require('platform', { features: ['web-audio', 'mobile-device', 'device-sensor'] });
    this.checkin = this.require('checkin');
    this.syncScheduler = this.require('sync-scheduler');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      files: {
        uiSounds,
        labels: audioFiles,
      },
    });

    this.streamSensors = false;

    if (Object.keys(this.clientPreset).indexOf('streams') !== -1)
      this.rawSocket = this.require('raw-socket');

    this.subscriptions = new Map();
    this.modules = new Map();

    // @todo - formalize that properly
    this.renderFrameInvRatio = 8; // render 1 frame over 8

    this.dispatch = this.dispatch.bind(this);
  }

  start() {
    super.start();

    this.receive('dispatch', this.dispatch);

    // init view
    this.view = new PlayerView();

    // init audio output chain
    this.muteNode = audioContext.createGain();
    this.muteNode.connect(audioContext.destination);
    this.muteNode.gain.value = 0; // mute by default, see `AudioControlModule`

    this.masterNode = audioContext.createGain();
    this.masterNode.connect(this.muteNode);
    this.masterNode.gain.value = 1;

    // instanciate modules from configuration
    for (let moduleId in this.clientPreset) {
      const ctor = moduleManager.get(moduleId);
      const clientOptions = this.clientPreset[moduleId];

      if (!ctor)
        throw new Error(`Undefined module "${moduleId}"`);

      const mod = new ctor(this, clientOptions);
      this.modules.set(mod.id, mod);
      this.view.addPlaceholder(mod.id);
    }

    // modules initialization
    const initPromises = [];

    this.modules.forEach(module => {
      const promise = module.init();
      initPromises.push(promise);
    });

    // check deps of each module and throw error if problem
    this.modules.forEach(module => {
      module.dependencies.forEach(dependency => {
        if (!this.modules.has(dependency))
          throw new Error(`${module.id} requires ${dependency}`);
      });
    });

    initPromises.push(this.show());

    Promise.all(initPromises)
      .then(() => {
        // @warning - render only 1 frame over 8
        let flag = 0;

        this.view.setPreRender((ctx, dt, canvasWidth, canvasHeight) => {
          flag = (flag + 1) % 8;

          if (flag !== 0) {
            return;
          }

          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        });

        this.modules.forEach(module => module.start());
        this.modules.forEach(module => module.show());
      })
      .catch(err => {
        console.error(err.stack);
      });
  }

  stop() {
    this.modules.forEach(module => module.stop());
  }

  subscribe(module, actionType) {
    if (!this.subscriptions.has(actionType)) {
      this.subscriptions.set(actionType, new Set());
      this.send('subscribe', actionType);
    }

    const subscribedModules = this.subscriptions.get(actionType);
    subscribedModules.add(module);
  }

  unsubscribe(module, actionType) {
    if (this.subscriptions.has(actionType)) {
      const subscribedModules = this.subscriptions.get(actionType);

      if (subscribedModules.has(module)) {
        subscribedModules.delete(module);

        if (subscribedModules.size === 0) {
          this.send('unsubscribe', actionType);
          this.subscriptions.delete(actionType);
        }
      } else {
        throw new Error(`Invalid unsubscribe call: module ${module.id} did not subscribe to ${actionType}`);
      }
    } else {
      throw new Error(`Invalid unsubscribe call: no module subscribed to ${actionType}`);
    }
  }

  request(action) {
    this.send('request', action);
  }

  dispatch(action) {
    const actionType = action.type;
    const subscribedModules = this.subscriptions.get(actionType);

    subscribedModules.forEach(module => module.dispatch(action));
  }

  getAudioOutput() {
    return this.masterNode;
  }

  volume(volume) {
    const gain = decibelToLinear(volume);
    this.masterNode.gain.value = gain;
  }

  mute(flag) {
    const target = flag ? 0 : 1;
    this.muteNode.gain.value = target;
  }

  // @todo - test module dependecies and throw more usefull error
  getModule(id) {
    if (!this.modules.has(id))
      throw new Error(`Invalid module "${id}"`);

    return this.modules.get(id);
  }
}

export default PlayerExperience;
