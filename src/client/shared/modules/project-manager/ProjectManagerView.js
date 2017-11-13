import { View } from 'soundworks/client';

const template = `

<% if (project) { %>
<h1><%= project.params.name %></h1>
<% } %>

<% if (enableChange) { %>
<button class="btn expand">Switch project</button>
<% } %>

<% if (state === 'expanded') { %>

<div class="overlay">
  <% if (!forceProject) { %>
  <div class="overlay-container">

    <% if (enableCreation) { %>
      <p>Create or select project</p>
      <input type="text" class="project-name" placeholder="project name" />
      <button class="btn create-project">Send</button>
    <% } %>

    <% if (projectList !== 'none') { %>

      <p>Select project</p>
      <p class="error"><% if (error === true) { %><%= text.error %><% } %></p>

      <% if (projectList === 'select') { %>

      <select class="select-project">
        <option value=""><%= text.chooseProject %></option>
        <% projectOverviewList.forEach(function(overview) { %>
          <option value="<%= overview.uuid %>"><%= overview.name %></option>
        <% }); %>
      </select>

      <% } else if (projectList === 'buttons') { %>

        <% projectOverviewList.forEach(function(overview) { %>
          <button class="btn select-project" value="<%= overview.uuid %>">
            <%= overview.name %>
          </button>
        <% }); %>

      <% } %>

    <% } %>
  </div>
  <% } %>
</div>

<% } %>
`;

const model = {
  projectOverviewList: [],
  error: false,
  project: null,
  state: 'expanded', // 'expanded' || 'reduced'

  enableChange: true,
  enableCreation: false,
  forceProject: false, // don't overlay on load
  projectList: 'select',
  // prepare field for i18n
  text: {
    chooseProject: 'Choose a project',
    error: 'Sorry, an error occured',
  },
}

class ProjectChooserView extends View {
  constructor(options) {
    super(template, model, {}, {
      className: 'project-chooser'
    });

    Object.assign(this.model, options);

    this.selectProject = null;

    this.installEvents({
      'click .create-project': e => {
        const $input = this.$el.querySelector('.project-name');
        const name = $input.value;

        if (name !== '')
          this.request('create-project', { name });
      },
      // 'click button': change state and render, view only action
      'click .expand': e => {
        this.model.state = 'expanded',
        this.render();
      }
    });

    if (this.model.projectList !== 'none') {
      let action = null;

      if (this.model.projectList === 'select')
        action = 'change';
      else if (this.model.projectList === 'buttons')
        action = 'click';

      this.installEvents({
        [`${action} .select-project`]: e => {
          const projectUuid = e.target.value;

          if (projectUuid !== '')
            this.request('add-player-to-project', { projectUuid });
        },
      });
    }
  }

  onResize(width, height, orientation) {}

  onRender() {
    super.onRender();

    // the overlay must be skipped only on first rendering
    if (this.model.state === 'reduced')
      this.model.forceProject = false;

    this.$el.classList.remove('reduced', 'expanded');
    this.$el.classList.add(this.model.state);
  }
}

export default ProjectChooserView;
