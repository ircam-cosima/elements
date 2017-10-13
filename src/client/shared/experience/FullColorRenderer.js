import { Canvas2dRenderer } from 'soundworks/client';

class FullColorRenderer extends Canvas2dRenderer {
  constructor(view) {
    super();

    this.view = view;
    this.color = '#000000';
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);
  }

  /**
   * Update model results
   * @param {Object} res - model result object
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * Update rederer state.
   * @param {Number} dt - time since last update in seconds.
   */
  update(dt) {}

  /**
   * Draw into canvas.
   * Method is called by animation frame loop in current frame rate.
   * @param {CanvasRenderingContext2D} ctx - canvas 2D rendering context
   */
  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
}

export default FullColorRenderer;
