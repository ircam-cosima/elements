import { Renderer } from 'soundworks/client';

/**
 * A simple canvas renderer.
 * The class renders a dot moving over the screen and rebouncing on the edges.
 */
export default class MotionRenderer extends Renderer {
  constructor(msHeight = 100) {
    super(0); // update rate = 0: synchronize updates to frame rate

    this._resized = true; // to set canvas width to 100%

    this._mRes = undefined;
    this._features = undefined;

    this._msHeight = msHeight;
    this._msSpacer = 5;

    this._mResRectangles = undefined;
    this._featuresRectangles = undefined;

    this._colors = [
      '#ff0000',
      '#00ff00',
      '#3355ff',
      '#999900',
      '#990099',
      '#009999'
    ];
  }

  /**
   * Update filtering results
   * @param {Object} res - filtering result object
   */
  setModelResults(res) {
    if (!this._mRes) {
      // init drawing vars, then update them in update
    }
    this._mRes = res;
  }

  setFeatureValues(values) {
    this._features = values.slice(0);
    //console.log(this._features);
  }

  /**
   * Override onResize method so that we can update the canvas size from here
   */
  onResize(canvasWidth, canvasHeight) {
    super.onResize(canvasWidth, canvasHeight);
    this._resized = true;
  }

  /**
   * Initialize renderer state.
   */
  init() {}

  /** @todo avoid code duplication in update function */

  /**
   * Update rederer state.
   * @param {Number} dt - time since last update in seconds.
   */
  update(dt) {
    if (this._mRes) {
      const n = this._mRes.likelihoods.length;
      const s = this._msSpacer;
      const sp = s * (n - 1);
      const w = (this.canvasWidth - sp) / n;

      this._mResRectangles = new Array(n);

      for (let i = 0; i < n; i++) {
        const v = this._mRes.likelihoods[i];
        this._mResRectangles[i] = {
          x: i * (w + s),
          y: this._msHeight * (1 - v),
          w: w,
          h: this._msHeight * v
        };
      }
    }

    if (this._features) {
      const n = this._features.length;
      const s = this._msSpacer;
      const sp = s * (n - 1);
      const w = (this.canvasWidth - sp) / n;

      this._featuresRectangles = new Array(n);

      for (let i = 0; i < n; i++) {
        let v = this._features[i];
        if (typeof v === 'boolean') {
          v = v ? 1 : 0;
        } else {
          v = Number.isNaN(v) ? 0 : v;
        }
        this._featuresRectangles[i]  = {
          x: i * (w + s),
          y: this._msHeight * (1 - v),
          w: w,
          h: this._msHeight * v
        };
      }
    }
  }

  /**
   * Draw into canvas.
   * Method is called by animation frame loop in current frame rate.
   * @param {CanvasRenderingContext2D} ctx - canvas 2D rendering context
   */
  render(ctx) {

    if (this._resized) {
      ctx.canvas.style.width = '100%';
      this.canvasWidth = ctx.canvas.width;//clientWidth;
      this._resized = false;
    }

    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (this._features) {
      ctx.fillStyle = '#ffffff';
      this._drawMultislider(ctx, this._featuresRectangles, 0, 3 * this._msHeight);
    }

    if (!this._mRes) {
      return;
    }

    this._drawMultislider(ctx, this._mResRectangles, 0, 0);

    ctx.font="50px Verdana";
    const c = Math.min(this._mRes.likeliest, this._colors.length)
    ctx.fillStyle = this._colors[c];
    ctx.fillText(this._mRes.label, 0, this._msHeight + 60);
  }

  /** @private */
  _drawMultislider(ctx, rects, x, y) {
    for (let i = 0; i < rects.length; i++) {
      if (i < this._colors.length) {
        ctx.fillStyle = this._colors[i];
      } else {
        ctx.fillStyle = this._colors[this._colors.length];
      }
      const r = rects[i];
      ctx.fillRect(r.x + x, r.y + y, r.w, r.h);
    }
  }
}
