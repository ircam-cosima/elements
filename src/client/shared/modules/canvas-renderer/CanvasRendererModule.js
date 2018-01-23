import BaseModule from '../BaseModule';
import moduleManager from '../moduleManager';
import LikelihoodsRenderer from './LikelihoodsRenderer';
import BackgroundRenderer from './BackgroundRenderer';

const MODULE_ID = 'canvas-renderer';

class CanvasRendererModule extends BaseModule {
  constructor(experience, options) {
    super(MODULE_ID, experience);

    this.options = Object.assign({
      background: true,
      likelihoods: true,
    }, options);

    this.subscriptions = [];
    this.allowedRequests = [];

    this.dependencies = [
      'gesture-recognition'
    ];

    this.renderers = new Map();

    if (this.options.background) {
      const renderer = new BackgroundRenderer();
      this.renderers.set(renderer.type, renderer);
    }

    if (this.options.likelihoods) {
      const renderer = new LikelihoodsRenderer();
      this.renderers.set(renderer.type, renderer);
    }
  }

  show() {
    super.show();

    this.renderers.forEach(renderer => {
      this.experience.view.addRenderer(renderer);
    });

    if (this.options.likelihoods) {
      const likelihoodRenderer = this.renderers.get('likelihood-renderer');
      const gestureRecognitionModule = this.experience.getModule('gesture-recognition');
      // @todo - renderer
      gestureRecognitionModule.addDecoderListener(results => {
        likelihoodRenderer.setResults(results);
      });
    }
  }
}

moduleManager.register(MODULE_ID, CanvasRendererModule);

export default CanvasRendererModule;
