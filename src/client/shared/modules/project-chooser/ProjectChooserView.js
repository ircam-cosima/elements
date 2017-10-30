import { View } from 'soundworks/client';

const template = `
<% if (state === 'reduced') { %>
<button class="btn expand">Switch project<button>
<% } else if (state === 'expanded') { %>
<div class="flex-middle">
  <div>
    <p>Select project</p>
    <p class="error">
    <% if (error === true) { %>
      <%= text.error %>
    <% } %>
    </p>
    <div>
      <select id="projects">
        <option value=""><%= text.chooseProject %></option>
        <% projectOverviewList.forEach(function(overview) { %>
          <% const selected = project.uuid === overview.uuid ? ' selected' : '' %>
          <option value="<%= overview.uuid %>"<%= selected %>>
            <%= overview.name %>
          </option>
        <% }); %>
      </select>
    </div>
  </div>
</div>
<% } %>
`;

const model = {
  projectOverviewList: [],
  error: false,
  name: null,
  project: {
    name: null,
    uuid: null,
  },
  state: 'expanded', // 'expanded' || 'reduced'
  // prepare field for i18n
  text: {
    chooseProject: 'Choose a project',
    error: 'Sorry, an error occured',
  },
}

class ProjectChooserView extends View {
  constructor() {
    super(template, model, {}, {
      className: 'project-chooser'
    });

    this.selectProject = null;

    this.installEvents({
      'change #projects': e => {
        const uuid = e.target.value;

        if (uuid !== '')
          this.selectProject(uuid);
      },
      // 'click button': change state and render, view only action
      'click .expand': e => {
        this.model.state = 'expanded',
        this.render();
      }
    });
  }

  onResize(width, height, orientation) {}

  onRender() {
    super.onRender();

    this.$el.classList.remove('reduced', 'expanded');
    this.$el.classList.add(this.model.state);
  }
}

export default ProjectChooserView;
