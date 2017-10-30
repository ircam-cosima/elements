import { View } from 'soundworks/client';

const template = `
  <label class="checkbox">
    <span><%= text.mute %></span>
    <% var checked = mute ? ' checked' : ''; %>
    <input type="checkbox" class="player-param" data-name="audio.mute"<%= checked %> />
    <div class="checkbox-ui"></div>
  </label>
`;

const model = {
  mute: false,

  text: {
    mute: 'Mute',
  },
};

class AudioControlView extends View {
  constructor() {
    super(template, model, {}, {
      className: 'audio-control',
    });

    this.installEvents({
      'click .player-param': e => {
        e.preventDefault();
        const $input = e.target;
        const value = !($input.hasAttribute('checked'));
        const name = $input.dataset.name;

        this.request('update-player-param', { name, value });
      }
    });
  }

  onResize(width, height, orientation) {}
}

export default AudioControlView;
