const playerParamsTmpl = `
<% /* retrieve project infos ------------------------ */ %>
<% var project = global.projects.filter(function(project) {
  return project.uuid === player.project.uuid
})[0]; %>
<% /* ----------------------------------------------- */ %>

<!-- <p class="small"><%= player.uuid %></p> -->
<% var color = global.colors[player.index] %>
<div class="color" style="background-color: <%= color %>"></div>

<p class="type"><%= player.type %></p>
<select class="change-project">
<% global.projectsOverview.forEach(overview => { %>
  <% var selected = overview.uuid === player.project.uuid ? ' selected' : ''; %>
  <option value="<%= overview.uuid %>"<%= selected %>><%= overview.name %></option>
<% }); %>
</select>

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

</div>

<% if (Object.keys(player.preset).indexOf('stream-sensors') !== -1) { %>
<div class="sensors-params">
  <label class="checkbox">
    <% var checked = player.params.sensors.stream ? ' checked' : ''; %>
    <input type="checkbox" class="player-param" data-name="sensors.stream"<%= checked %> />
    <div class="checkbox-ui"></div>
    <span>Stream sensors</span>
  <label>
</div>
<% } %>

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
