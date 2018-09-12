const projectTmpl = `
<div class="project" id="_<%= project.uuid %>" data-uuid="<%= project.uuid %>">
  <div class="header">
    <h1 contenteditable class="project-param name" data-name="name">
      <%= project.params.name %>
    </h1>

    <button class="btn normal toggle-params">Advanced options</button>
    <button class="btn normal export-project">Export</button>
    <button class="btn danger delete-project">Delete</button>

    <% /* container for project-params.tmpl.js */ %>
    <div class="params hidden"></div>
  </div>

  <% /* container for player.tmpl.js */ %>
  <div class="players"></div>
</div>
`;

export default projectTmpl;
