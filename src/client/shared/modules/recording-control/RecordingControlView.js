import { View } from 'soundworks/client';


const template = `
<div class="labels">
  <div class="label-choice">
    <span>Label:</span>
    <select class="client-param" data-name="record.label">
    <% for (var i = 0; i < labels.length; i++) { %>
      <% var selected = recordLabel === labels[i] ? ' selected' : ''; %>
      <option value="<%= labels[i] %>"<%= selected %>><%= labels[i] %></option>
    <% } %>
    </select>
  </div>

  <% var disabled = trainedLabels.indexOf(recordLabel) === -1 ? ' disabled' : ''; %>
  <button class="clear btn" data-type="clear-examples" data-target="<%= recordLabel %>"<%= disabled %>>
    clear <%= recordLabel %> recordings
  </button>

  <% var disabled = trainedLabels.length === 0 ? ' disabled' : ''; %>
  <button class="clear btn" data-type="clear-all-examples"<%= disabled %>>
    clear all recordings
  </button>

  <% /* clear confirm overlays -------------------------- */ %>

  <% if (confirm !== null) { %>
  <div class="overlay confirm">
    <div class="overlay-container">
      <p>Are you sure?</p>
      <button class="btn clear-modal confirm" data-type="<%= confirm %>">
        confirm
      </button>
      <button class="btn clear-modal cancel">
        cancel
      </button>
    </div>
  </div>

  <% } %>
</div>

<% /* record button ----------------------------------- */ %>

<% if (recordState === 'idle') { %>
  <button class="record-btn player-param <%= recordState %>" data-name="record.state" value="arm">
    start
  </button>
<% } else if (recordState === 'armed') { %>
  <button class="record-btn player-param <%= recordState %>" data-name="record.state" value="record">
    move
  </button>
<% } else if (recordState === 'recording') { %>
  <button class="record-btn player-param <%= recordState %>" data-name="record.state" value="stop">
    recording
  </button>
<% } else if (recordState === 'pending') { %>
  <button class="record-btn player-param <%= recordState %>" data-name="record.state" value="stop">
    pending
  </button>

  <% /* confirm record overlay -------------------------- */ %>

  <div class="overlay confirm">
    <div class="overlay-container">
      <p>Save recording?</p>
      <button class="btn player-param" data-name="record.state" value="confirm">
        ok
      </button>
      <button class="btn player-param" data-name="record.state" value="cancel">
        cancel
      </button>
    </div>
  </div>

<% } %>
`;

const model = {
  labels: [],
  recordLabel: '',
  recordState: 'idle',
  trainedLabels: [],
  confirm: null,
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
      //
      'click button.clear': e => {
        e.preventDefault();
        const $btn = e.target;
        const type = $btn.dataset.type;

        this.model.confirm = type;
        this.render();
      },
      'click button.clear-modal': e => {
        e.preventDefault();
        const $btn = e.target;

        if ($btn.classList.contains('confirm')) {
          const type = $btn.dataset.type;
          const payload = {};

          if (type === 'clear-examples')
            payload.label = this.model.recordLabel;

          this.request(type, payload);
        }

        this.model.confirm = null;
        this.render();
      }
    });
  }

  onResize(width, height, orientation) {}

  // onRender() {
  //   super.onRender();
  // }
}

export default RecordingControlView;
