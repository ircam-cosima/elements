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
  constructor(model, duration = 1000) {
    super(template, model, {}, {
      className: 'notification',
    });

    setTimeout(() => { this.remove() }, duration);
  }
}

export default Notification;
