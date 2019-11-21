import { View } from 'soundworks/client';

const template = `
<label class="checkbox">
  <% var checked = audioParams.mute ? ' checked' : ''; %>
  <input type="checkbox" class="player-param" data-name="audioRendering.mute"<%= checked %> />
  <div class="checkbox-ui"></div>

  <span><%= text.mute %></span>
</label>

<h4>Effects:</h4>
<% for (var name in mappings) { %>
<label class="checkbox param-<%= name %>">
  <% var checked = mappings[name] ? ' checked' : ''; %>
  <input type="checkbox" class="player-param" data-name="mappings.<%= name %>"<%= checked %> />
  <div class="checkbox-ui"></div>

  <span><%= name.charAt(0).toUpperCase() + name.slice(1) %></span>
</label>
<% } %>

<% if (loading) { %>
<div class="overlay">
  <div class="overlay-container">
    <p><%= text.loading %></p>
  </div>
</div>
<% } %>
`;

const model = {
  audioParams: {
    mute: false,
  },
  mappings: {},
  loading: false,
  text: {
    mute: 'Mute',
    loading: 'Loading...'
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
