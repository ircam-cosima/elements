const playerParamsTmpl = `
<% /* retrieve project infos ------------------------ */ %>
<% var project = global.projects.filter(function(project) {
  return project.uuid === player.project.uuid
})[0]; %>
<% /* ----------------------------------------------- */ %>

<!-- <p class="small"><%= player.uuid %></p> -->
<% var color = global.colors[player.index] %>
<div class="color trigger-audio" data-kind="ui" data-label="noise" style="background-color: <%= color %>"></div>

<p class="type">
  <%= player.type %> (index: <%= player.index %>)
</p>
<select class="change-project">
<% global.projectsOverview.forEach(overview => { %>
  <% var selected = overview.uuid === player.project.uuid ? ' selected' : ''; %>
  <option value="<%= overview.uuid %>"<%= selected %>><%= overview.name %></option>
<% }); %>
</select>

<% if (Object.keys(player.preset).indexOf('streams') !== -1) { %>
<div class="streams-params">
  <label class="checkbox">
    <% var checked = player.params.streams.sensors ? ' checked' : ''; %>
    <input type="checkbox" class="player-param" data-name="streams.sensors"<%= checked %> />
    <div class="checkbox-ui"></div>
    <span>Stream sensors</span>
  </label>

  <label class="checkbox">
    <% var checked = player.params.streams.decoding ? ' checked' : ''; %>
    <input type="checkbox" class="player-param" data-name="streams.decoding"<%= checked %> />
    <div class="checkbox-ui"></div>
    <span>Stream decoding</span>
  </label>
</div>
<% } %>

<div class="audio-params">

  <label class="checkbox">
    <% var checked = player.params.audioRendering.mute ? ' checked' : ''; %>
    <input type="checkbox" class="player-param" data-name="audioRendering.mute"<%= checked %> />
    <div class="checkbox-ui"></div>
    <span>Mute</span>
  </label>

  <label class="checkbox">
    <% var checked = player.params.audioRendering.sensors ? ' checked' : ''; %>
    <input type="checkbox" class="player-param" data-name="audioRendering.sensors"<%= checked %> />
    <div class="checkbox-ui"></div>
    <span>Sensors</span>
  </label>

  <label class="slider">
    <input type="range" class="player-param" data-name="audioRendering.volume" min="-80" max="6" step="0.1" value="<%= player.params.audioRendering.volume %>" />
    <span>Volume</span>
  </label>

</div>

<% if (Object.keys(player.preset).indexOf('recording-control') !== -1) { %>
<div class="recording-control">
  <p class="record-state">
    Recording - <span><%= player.params.record.state %></span>
  </p>

  <select class="player-param" data-name="record.label">
  <% var labels = Object.keys(project.params.audioFiles) %>
  <% labels.forEach(function(label) { %>
    <% var selected = player.params.record.label === label ? ' selected' : ''; %>
    <option name="<%= label %>"<%= selected %>><%= label %></option>
  <% }); %>
  </select>

  <label class="checkbox">
    <% var checked = player.params.record.preview ? ' checked' : ''; %>
    <input type="checkbox" class="player-param" data-name="record.preview"<%= checked %> />
    <div class="checkbox-ui"></div>
    <span>Preview</span>
  </label>

  <% if (player.params.record.state === 'idle') { %>
    <button class="btn player-param" data-name="record.state" value="arm">
      Arm
    </button>
    <button class="btn player-param" data-name="record.state" value="record">
      Record
    </button>
  <% } else if (player.params.record.state === 'armed') { %>
    <button class="btn player-param" data-name="record.state" value="record">
      Record
    </button>
  <% } else if (player.params.record.state === 'recording') { %>
    <button class="btn player-param" data-name="record.state" value="stop">
      Stop
    </button>
  <% } else if (player.params.record.state === 'pending') { %>
    <button class="btn player-param" data-name="record.state" value="confirm">
      Confirm
    </button>
    <button class="btn player-param" data-name="record.state" value="cancel">
      Cancel
    </button>
  <% } %>
</div>
<% } %>
`;

export default playerParamsTmpl;
