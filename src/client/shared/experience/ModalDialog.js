import { View } from 'soundworks/client';

const template = `
  <div class="background"></div>
  <div class="wrapper">
    <p><%= msg %></p>
    <div class="btn-wrapper">
      <button class="btn" id="ok">ok</button>
      <button class="btn" id="cancel">cancel</button>
    </div>
  </div>
`;

/**
 * @param {Object} model - object containing the text to display
 * @param {Promise} promise - promise to resolve or reject according to the
 *  user choice
 *
 */
class ModalDialog extends View {
  constructor(model, resolve, reject) {
    super(template, model, {}, {
      className: 'modal-dialog',
    });

    this.resolve = resolve;
    this.reject = reject;

    this.installEvents({
      'touchstart #ok': (e) => {
        e.preventDefault();

        resolve();
        this.remove();
      },
      'touchstart #cancel': (e) => {
        e.preventDefault();

        reject('operation canceled');
        this.remove();
      },
    });
  }
}

export default ModalDialog;
