const headerTmpl = `
<div class="section" id="create-project">
  <input type="text" placeholder="project name" class="project-name" value="" />
  <select class="project-preset">
    <% for (let presetName in projectPresets) { %>
    <option value="<%= presetName %>"><%= presetName %></options>
    <% } %>
  </select>
  <button class="btn normal create-project">Create</button>
</div>

<form class="section" id="upload-project" enctype="multipart/form-data" method="post">
  <input type="file" name="project" required />
  <input type="submit" class="btn normal" value="upload" />
</form>

<div id="header-controls">
  <% if (players.length > 0) { %>
  <p>Duplicate client audio</p>
  <select id="duplicate-audio">
    <option value="">none</option>
    <% players.forEach(function(player) { %>
    <option value="<%= player.uuid %>"><%= player.type %> <%= player.index %></option>
    <% }); %>
  </select>
  <% } %>
</div>
`;

export default headerTmpl;
