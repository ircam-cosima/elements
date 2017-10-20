import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

const template = `
  <h1 class="big">Elements</h1>
`;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(config, modules = []) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: config.assetsDomain,
      // should be loaded when the project is chosen
      // files: { triggers, labels, uiSounds },
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['devicemotion']
    });

    // should depends of the required roles
    // this.rawSocket = this.require('raw-socket');

    this.sendRequest = this.sendRequest.bind(this);
    this.receiveExecute = this.receiveExecute.bind(this);
    this.receiveTrigger = this.receiveTrigger.bind(this);

    // install modules reuired from given role (defined through #hash or url)
    this.modules = new Set();

    // @todo - should be able to pass options to each modules
    modules.forEach(ctor => {
      const module = new ctor(this);
      this.modules.add(module);
    });
  }

  start() {
    super.start(); // don't forget this

    // initialize the view
    this.view = new soundworks.View(template, {}, {}, { id: this.id });

    this.receive('execute', () => {
      // forward to modules
    });

    this.receive('trigger', (channel, args) => {
      switch (channel) {
        case 'reload':
          window.location.reload(true);
          break;
        default:
          // forward to
      }
    });


    this.modules.forEach(module => module.start());

    this.show().then(() => {
      this.modules.forEach(module => module.show());
    });
  }

  stop() {
    this.modules.forEach(module => module.stop());
  }

  sendRequest(channel) {

  }

  receiveExecute() {

  }

  receiveTrigger() {

  }
}

export default PlayerExperience;
