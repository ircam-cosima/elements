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

  <button class="clear btn" data-type="clear-examples" data-target="<%= label %>">
    Clear <%= label %> label
  </button>
  <button class="clear btn" data-type="clear-all-examples">
    Clear all examples
  </button>
</div>

<% if (state === 'idle') { %>
  <button class="btn player-param" data-name="record.state" value="arm">
    <%= state %>
  </button>
<% } else if (state === 'armed') { %>
  <button class="btn player-param" data-name="record.state" value="record">
    <%= state %>
  </button>
<% } else if (state === 'recording') { %>
  <button class="btn player-param" data-name="record.state" value="stop">
    <%= state %>
  </button>
<% } else if (state === 'pending') { %>
<div class="overlay">
  <div class="overlay-container">
    <p>Save recording ?</p>
    <button class="btn player-param" data-name="record.state" value="confirm">
      Confirm
    </button>
    <button class="btn player-param" data-name="record.state" value="cancel">
      Cancel
    </button>
  </div>
</div>
<% } %>
`;

const model = {
  labels: [],
  label: '',
  state: 'idle',
  text: {
    // @todo
  }
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
      'click button.player-param': e => {
        e.preventDefault();
        const $input = e.target;
        const name = $input.dataset.name;
        const value = $input.value;

        this.request('update-player-param', { name, value });
      },
      'click button.clear': e => {
        e.preventDefault();

        console.log('@todo - implement');
      }
    });
  }

  onResize(width, height, orientation) {}

  // onRender() {
  //   super.onRender();
  // }
}

export default RecordingControlView;
