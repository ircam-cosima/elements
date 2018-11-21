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
    <% var monitorDetails = global.monitoring[player.index] || {}; %>
    <label class="checkbox">
      <% var checked = monitorDetails.sensors ? ' checked' : ''; %>
      <input type="checkbox" class="player-monitor" data-name="sensors"<%= checked %> />
      <div class="checkbox-ui"></div>
      <span>Display sensors</span>
    </label>

    <label class="checkbox">
      <% var checked = monitorDetails.decoding ? ' checked' : ''; %>
      <input type="checkbox" class="player-monitor" data-name="decoding"<%= checked %> />
      <div class="checkbox-ui"></div>
      <span>Display decoding</span>
    </label>

    <label class="checkbox">
      <% var checked = monitorDetails.audio ? ' checked' : ''; %>
      <input type="checkbox" class="player-monitor" data-name="audio"<%= checked %> />
      <div class="checkbox-ui"></div>
      <span>Duplicate audio</span>
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

  <% for (let id in player.params.mappings) { %>
    <label class="checkbox">
      <% var checked = player.params.mappings[id] ? ' checked' : ''; %>
      <input type="checkbox" class="player-param" data-name="mappings.<%= id %>"<%= checked %> />
      <div class="checkbox-ui"></div>
      <span><%= id.charAt(0).toUpperCase() + id.slice(1) %></span>
    </label>
  <% } %>


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
  <% var labels = Object.keys(global.audioFiles) %>
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
