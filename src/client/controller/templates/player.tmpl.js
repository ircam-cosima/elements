const playerTmpl = `
<div class="player" id="_<%= player.uuid %>" data-uuid="<%= player.uuid %>">
  <p class="small"><%= player.uuid %></p>

  <div class="audio-params">

    <label class="checkbox">
      <span>Mute</span>
      <% var checked = player.params.audio.mute ? ' checked' : ''; %>
      <input type="checkbox" class="player-param" data-name="audio.mute"<%= checked %> />
      <div class="checkbox-ui"></div>
    </label>

  </div>

  <div class="select-container">

    <select class="change-project">
    <% global.projectsOverview.forEach(overview => { %>
      <% var selected = overview.uuid === player.project.uuid ? ' selected' : ''; %>
      <option value="<%= overview.uuid %>"<%= selected %>><%= overview.name %></option>
    <% }); %>
    </select>

</div>
`;

export default playerTmpl;
