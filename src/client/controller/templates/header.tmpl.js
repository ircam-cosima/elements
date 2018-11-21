const headerTmpl = `
<div>
  <h4>Create new project</h4>
  <input type="text" placeholder="project name" class="project-name input-large" value="" />
  <select class="project-preset">
    <% for (let presetName in projectPresets) { %>
    <option value="<%= presetName %>"><%= presetName %></options>
    <% } %>
  </select>
  <button class="btn normal create-project">Create</button>
</div>

<form class="section" id="upload-project" enctype="multipart/form-data" method="post">
  <h4>Upload Project</h4>
  <input type="file" name="project" class="input-large" required />
  <input type="submit" class="btn normal" value="upload" />
</form>

<div>
  <h4>Move all players to project</h4>
  <select class="move-players-to-project-target input-large">
    <option value="">select a project and trigger</option>
  <% projectsOverview.forEach(function(overview) { %>
    <option value="<%= overview.uuid %>"><%= overview.name %></option>
  <% }); %>
  </select>
  <button class="btn normal move-players-to-project">Trigger</button>
</div>

<label class="param checkbox">
  <% var checked = muteAll === true ? ' checked' : ''; %>
  <input type="checkbox" class="mute-all" <%= checked %> />
  <div class="checkbox-ui"></div>
  <span>Mute All</span>
</label>
`;

export default headerTmpl;
