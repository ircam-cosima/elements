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

    <p>Select project</p>
    <p class="error">
    <% if (error === true) { %>
      <%= text.error %>
    <% } %>
    </p>
    <div>
      <select class="select-project">
        <option value=""><%= text.chooseProject %></option>
        <% projectOverviewList.forEach(function(overview) { %>
          <% const selected = (project && project.uuid === overview.uuid) ? ' selected' : '' %>
          <option value="<%= overview.uuid %>"<%= selected %>>
            <%= overview.name %>
          </option>
        <% }); %>
      </select>
    </div>
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
  forceProject: false, // don't overlay on load
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

    this.model.enableChange = options.enableChange;
    this.model.forceProject = options.forceProject;
    this.model.enableCreation = options.enableCreation;

    this.selectProject = null;

    this.installEvents({
      'change .select-project': e => {
        const uuid = e.target.value;

        if (uuid !== '')
          this.request('add-player-to-project', { uuid });
      },
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
  }

  onResize(width, height, orientation) {}

  onRender() {
    super.onRender();

    // the overlay must be skipped only on first rendering
    if (this.state === 'reduced')
      this.model.forceProject = false;

    this.$el.classList.remove('reduced', 'expanded');
    this.$el.classList.add(this.model.state);
  }
}

export default ProjectChooserView;
