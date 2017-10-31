const playerTmpl = `
<% /* retrieve project infos ------------------------ */ %>
<% var project = global.projects.filter(function(project) {
  return project.uuid === player.project.uuid
})[0]; %>
<% /* ----------------------------------------------- */ %>

<div class="player" id="_<%= player.uuid %>" data-uuid="<%= player.uuid %>">
  <p class="small"><%= player.uuid %></p>

  <div class="select-container">

    <select class="change-project">
    <% global.projectsOverview.forEach(overview => { %>
      <% var selected = overview.uuid === player.project.uuid ? ' selected' : ''; %>
      <option value="<%= overview.uuid %>"<%= selected %>><%= overview.name %></option>
    <% }); %>
    </select>

  </div>

  <div class="audio-params">

    <label class="checkbox">
      <span>Mute</span>
      <% var checked = player.params.audio.mute ? ' checked' : ''; %>
      <input type="checkbox" class="player-param" data-name="audio.mute"<%= checked %> />
      <div class="checkbox-ui"></div>
    </label>

  </div>

  <div class="record-params">

    <label class="select">
      <span>Label</span>
      <select class="player-param" data-name="record.label">
      <% var labels = Object.keys(project.params.audio) %>
      <% labels.forEach(function(label) { %>
        <% var selected = player.params.record.label === label ? ' selected' : ''; %>
        <option name="<%= label %>"<%= selected %>><%= label %></option>
      <% }); %>
      </select>
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

</div>
`;

export default playerTmpl;
