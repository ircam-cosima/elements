import { View } from 'soundworks/client';


const template = `
<div class="labels">
  <span>Label (<%= label %>):</span>
  <select class="client-param" data-name="record.label">
  <% for (var i = 0; i < labels.length; i++) { %>
    <% var selected = label === labels[i] ? ' selected' : ''; %>
    <option value="<%= labels[i] %>"<%= selected %>><%= labels[i] %></option>
  <% } %>
  </select>
</div>

<button class="player-param" data-name="record.state">
  <%= state %>
</button>
`;

const model = {
  labels: [],
  label: '',
  state: 'idle',
};

class RecordingControlView extends View {
  constructor() {
    super(template, model, {}, {
      className: 'recording-control'
    });

    this.installEvents({
      'change select.client-param': e => {
        e.preventDefault();
        const $input = e.target;
        const name = $input.dataset.name;
        const value = $input.value;

        this.request('update-player-param', { name, value });
      },
      'click .player-param': e => {
        console.log('clicked');
      }
    });
  }

  onResize(width, height, orientation) {}

  onRender() {
    super.onRender();

    console.log(this.model);
  }
}

export default RecordingControlView;
