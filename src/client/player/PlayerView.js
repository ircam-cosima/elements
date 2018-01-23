import { CanvasView } from 'soundworks/client';

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="content"></div>
  </div>
`;

class PlayerView extends CanvasView {
  constructor() {
    super(template, {}, {}, {
      id: 'player',
      ratios: { '.content': 1 },
    });

    this.placeholders = new Set();
  }

  addPlaceholder(id) {
    this.placeholders.add(id);
  }

  onRender() {
    super.onRender();

    const $content = this.$el.querySelector('.content');

    this.placeholders.forEach(id => {
      const $div = document.createElement('div');
      $div.id = id;
      $div.classList.add('module-container');

      $content.appendChild($div);
    });
  }
}

export default PlayerView;
