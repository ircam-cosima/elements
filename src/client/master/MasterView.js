import * as soundworks from 'soundworks/client';
import template from 'lodash.template';

const projectTemplate = `
  <h4><%= name %>
  <% if (!hasDesigner) { %>
    <button class="btn danger delete-project" data-target="<%= uuid %>">Delete</button>
  <% } %>
  </h4>

  <% if (clients.length > 0) { %>
  <ul class="clients">
  <% clients.forEach(function(client) { %>
    <li class="client <%= client.type %>" id="<%= client.uuid %>">
      <p><%= client.type %></p>

      <% console.log(client); %>
      <div class="toggle-container mute <%= client.params.mute ? 'active' : '' %>">
        <div class="toggle-btn"><div></div></div> Mute
      </div>
      <div class="toggle-container intensity <%= client.params.intensity ? 'active' : '' %>">
        <div class="toggle-btn"><div></div></div> Intensity
      </div>

      <% if (client.type === 'designer') { %>
      <button class="btn warning disconnect-designer" data-target="<%= client.uuid %>">Disconnect</button>
      <% } %>
    </li>
  <% }); %>
  </ul>
  <% } %>
`;

const projectListTemplate = `
  <option value="all">All</option>
  <% overview.forEach(function(project) { %>
    <option value="<%= project.uuid %>"><%= project.name %></option>
  <% }); %>
`;

const mainTemplate = `
  <h1>Master</h1>

  <div id="main-controls">
    <label id="select-project-container">
      Select project:
      <select id="project-select"></select>
    </label>

    <div class="toggle-container mute">
      <div class="toggle-btn"><div></div></div> Mute
    </div>
    <div class="toggle-container intensity">
      <div class="toggle-btn"><div></div></div> Intensity
    </div>
  </div>

  <div id="projects">

  </div>
`;

class MasterView extends soundworks.View {
  constructor() {
    super(mainTemplate, {}, {}, {
      id: 'master',
    });

    this._deleteProjectCallback = null;
    this._disconnectDesignerCallback = null;

    this.installEvents({
      'click .delete-project': (e) => {
        const uuid = e.target.dataset.target;
        this._deleteProjectCallback(uuid);
      },
      'click .disconnect-designer': (e) => {
        const uuid = e.target.dataset.target;
        this._disconnectDesignerCallback(uuid);
      },
      'change #project-select': (e) => {
        const value = e.target.value;
        this._selectProject(value);
      },
      'click #main-controls .mute': (e) => {
        const $btn = e.target.closest('.mute');
        const active = $btn.classList.contains('active');
        this._updateGroupMute(active);
      },
    });

    this.projectUuidContainerMap = new Map();
    this.projectTemplate = template(projectTemplate);
    this.projectListTemplate = template(projectListTemplate);

    this.deleteProject = this.deleteProject.bind(this);

    // project that is currently under control
    this._currentProject = null;
  }

  onRender() {
    super.onRender();

    this.$projects = this.$el.querySelector('#projects');
    this.$projectSelect = this.$el.querySelector('#project-select');
  }

  _selectProject(value) {
    this._currentProject = value;

    this.projectUuidContainerMap.forEach(($container, uuid) => {
      if (value === 'all') {
        $container.style.display = 'block';
      } else {
        if (uuid === value)
          $container.style.display = 'block';
        else
          $container.style.display = 'none';
      }
    });
  }

  _updateGroupMute(active) {
    const currentProject = this._currentProject;
    this.send('')
  }

  // build project overview menu
  createProjectList(projectsOverview) {
    const content = this.projectListTemplate({ overview: projectsOverview });
    const uuids = projectsOverview.map(project => project.uuid);
    this.$projectSelect.innerHTML = content;

    if (uuids.indexOf(this._currentProject) === -1)
      this._currentProject = 'all';

    this.$projectSelect.value = this._currentProject;
    this._selectProject(this._currentProject);
  }

  // build projects detailled descriptions
  addProject(project) {
    const $container = document.createElement('div');
    $container.id = project.uuid;
    $container.classList.add('project');
    $container.style.display = 'none';

    const content = this.projectTemplate(project);
    $container.innerHTML = content;

    this.$projects.appendChild($container);

    this.projectUuidContainerMap.set(project.uuid, $container);
  }

  deleteProject(project) {
    const $container = this.projectUuidContainerMap.get(project.uuid);
    $container.remove();

    this.projectUuidContainerMap.delete(project);
  }

  updateProject(project) {
    const $container = this.projectUuidContainerMap.get(project.uuid);
    const content = this.projectTemplate(project);

    $container.innerHTML = content;
  }

  setDeleteProjectCallback(callback) {
    this._deleteProjectCallback = callback;
  }

  setDisconnectDesignerCallback(callback) {
    this._disconnectDesignerCallback = callback;
  }
}

export default MasterView;
