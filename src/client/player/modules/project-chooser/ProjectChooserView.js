import { SegmentedView } from 'soundworks/client';

const template = `
<div class="section-top flex-center">
  <div id="project-name">
  <% if (projectName) { %>
    <h3><%= projectName %></h3>
  <% } %>
  </div>
</div>
<div class="section-center align-center">
  <div>
    <p>Select project</p>
    <p class="error">
    <% if (error === true) { %>
      Sorry, an error occured
    <% } %>
    </p>
    <div>
      <select id="project-list">
        <option value="">Choose a project</option>
        <% projectList.forEach(function(project) { %>
        <option value="<%= project.uuid %>"><%= project.name %></option>
        <% }); %>
      </select>
    </div>
  </div>
</div>
<div class="section-bottom"></div>
`;

const model = {
  projectList: [],
  error: false,
  name: null,
  projectName: '',
  // state: 'expended' | 'button'
}

class ProjectChooserView extends SegmentedView {
  constructor() {
    super(template, model);

    this.selectProject = null;

    this.installEvents({
      'change #project-list': e => {
        const uuid = e.target.value;

        if (uuid !== '')
          this.selectProject(uuid);
      },
    });
  }
}

export default ProjectChooserView;
