import { View } from 'soundworks/client';

const template = `
  <div class="background"></div>
  <div class="wrapper">
    <p><%= msg %></p>
  </div>
`;

/**
 * @param {Object} model - object containing the text to display
 */
class Notification extends View {
  constructor(msg, duration = 1000) {
    super(template, { msg }, {}, {
      className: 'notification',
    });

    this.duration = duration;
  }

  onRender() {
    super.onRender();

    setTimeout(() => this.remove(), this.duration);
  }
}

export default Notification;
