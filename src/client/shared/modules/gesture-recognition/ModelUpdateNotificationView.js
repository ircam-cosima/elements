import { View } from 'soundworks/client';

const template = `
<% if (state === 'notification') { %>
<div class="overlay notification">
  <div class="overlay-container">
  <p>Model updated</p>
  </div>
</div>
<% } %>
`;

const model = {
  state: 'hidden', // notification
};

class ModelUpdateNotificationView extends View {
  constructor() {
    super(template, model, {}, {
      className: 'model-sync',
    });

    this.timeoutId = null;
  }

  onResize(width, height, orientation) {}

  onRender() {
    super.onRender();

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.model.state === 'notification') {
      this.timeoutId = setTimeout(() => {
        this.model.state = 'hidden';
        this.timeoutId = null;
        this.render();
      }, 1000);
    }
  }
}

export default ModelUpdateNotificationView;
