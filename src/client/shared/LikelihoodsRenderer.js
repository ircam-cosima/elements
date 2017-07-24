import { Canvas2dRenderer } from 'soundworks/client';

const colorMap = [
  '#ff0000',
  '#00ff00',
  '#3355ff',
  '#999900',
  '#990099',
  '#009999',
];

class LikelihoodsRenderer extends Canvas2dRenderer {
  constructor(view) {
    super();

    this.view = view;
    this.modelResults = undefined;
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

    // do with logical coordinates
    const contentHeight = this.view.getContentHeight();
    const padding = 10;
    this.top = (contentHeight + padding) * this.pixelRatio;
    this.left = padding * this.pixelRatio;
    this.width = this.canvasWidth - (2 * padding) * this.pixelRatio;
    this.height = Math.max(this.canvasHeight - (contentHeight + 2 * padding) * this.pixelRatio, 0);
  }

  /**
   * Update model results
   * @param {Object} res - model result object
   */
  setModelResults(results) {
    this.modelResults = results;
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
    ctx.save();
    ctx.translate(this.left, this.top);

    ctx.strokeStyle = '#787878';
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.closePath();
    ctx.stroke();

    if (this.modelResults) {
      const likelihoods = this.modelResults.likelihoods;
      const length = likelihoods.length;
      const rectangleWidth = this.width / length;

      for (let i = 0; i < length; i++) {
        ctx.fillStyle = colorMap[i];

        const likelihood = likelihoods[i];
        const width = rectangleWidth;
        const height = likelihood * this.height;
        const x = i * rectangleWidth;
        const y = this.height - height;

        ctx.fillRect(x, y, width, height);
      }

      // display label
      ctx.font = '30px arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.modelResults.label, 10, 30);
    }

    ctx.restore();
  }
}

export default LikelihoodsRenderer;
