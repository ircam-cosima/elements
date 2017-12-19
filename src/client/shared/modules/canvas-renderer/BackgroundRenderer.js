import { Canvas2dRenderer, client } from 'soundworks/client';
import { colors } from '../../../../shared/config/ui';

class BackgroundRenderer extends Canvas2dRenderer {
  constructor() {
    super();

    this.color = colors[client.index % colors.length];
    this.flag = 0;
  }

  render(ctx) {
    this.flag = (this.flag + 1) % 8;

    if (this.flag !== 0)
      return;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.restore();
  }
}

export default BackgroundRenderer;
