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

    this.options = {
      padding: 10,
      height: 120,
    }

    this.type = 'likelihood-renderer';
    this.modelResults = null;
  }

  setResults(results) {
    const likelihoods = results ? results.likelihoods : [];
    const likeliest = results ? results.likeliestIndex : -1;
    let label = 'not recognized';

    if (results && results.likeliest)
      label = results.likeliest;

    const formattedResults = {
      label: label,
      likeliest: likeliest,
      likelihoods: likelihoods,
    };

    this.modelResults = formattedResults;
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

    const padding = this.options.padding;
    const chartHeight = this.options.height;

    this.top = this.canvasHeight - (chartHeight + padding) * this.pixelRatio;
    this.height = chartHeight * this.pixelRatio;

    this.left = padding * this.pixelRatio;
    this.width = this.canvasWidth - (2 * padding) * this.pixelRatio;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.left, this.top);

    ctx.strokeStyle = '#787878';
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.closePath();
    ctx.stroke();

    if (this.modelResults !== null) {
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
      ctx.font = '16px arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.modelResults.label, 10, this.height - 10);
    }

    ctx.restore();
  }
}

export default LikelihoodsRenderer;
