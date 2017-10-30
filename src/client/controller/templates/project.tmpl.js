const projectTmpl = `
<div class="project" id="_<%= project.uuid %>" data-uuid="<%= project.uuid %>">
  <div class="header">
    <h1><%= project.params.name %></h1>

    <!-- container for project-params.tmpl.js -->
    <div class="params"></div>
  </div>

  <div class="players"></div>
</div>
`;

export default projectTmpl;
