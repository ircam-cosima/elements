import * as soundworks from 'soundworks/client';
import template from 'lodash.template';

const projectTemplate = `
  <div class="project-header">
    <h4><%= name %></h4>
    <div class="toggle-container mute <%= params.mute ? 'active' : '' %>" data-target="<%= uuid %>">
      <div class="toggle-btn"><div></div></div> Mute
    </div>
    <div class="toggle-container intensity <%= params.intensity ? 'active' : '' %>" data-target="<%= uuid %>">
      <div class="toggle-btn"><div></div></div> Intensity
    </div>

    <div>
      <div class="number-box absolute-regularization"">
        <input type="number" value="<%= absoluteRegularization %>" data-target="<%= uuid %>" />
        Absolute Regularization
      </div>

      <div class="number-box relative-regularization"">
        <input type="number" value="<%= relativeRegularization %>" data-target="<%= uuid %>" />
        Relative Regularization
      </div>
    </div>
    <% if (!hasDesigner) { %>
    <button class="btn danger delete-project" data-target="<%= uuid %>">Delete</button>
    <% } %>
  </div>

  <% if (clients.length > 0) { %>
  <ul class="clients">
  <% clients.forEach(function(client) { %>
    <li class="client <%= client.type %>" id="<%= client.uuid %>">
      <p><%= client.type %></p>

      <div class="toggle-container mute <%= client.params.mute ? 'active' : '' %>" data-target="<%= client.uuid %>">
        <div class="toggle-btn"><div></div></div> Mute
      </div>
      <div class="toggle-container intensity <%= client.params.intensity ? 'active' : '' %>" data-target="<%= client.uuid %>">
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
  </div>

  <div id="projects">

  </div>
`;

class ControllerView extends soundworks.View {
  constructor() {
    super(mainTemplate, {}, {}, {
      id: 'master',
    });

    this._deleteProjectCallback = null;
    this._disconnectDesignerCallback = null;
    this._updateProjectParamCallback = null;
    this._updateClientParamCallback = null;
    this._updateProjectConfigCallback = null;

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
      // project params
      'click .project .project-header .mute': (e) => {
        const $btn = e.target.closest('.mute');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this._updateProjectParamCallback(uuid, 'mute', !active);
      },
      'click .project .project-header .intensity': (e) => {
        const $btn = e.target.closest('.intensity');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this._updateProjectParamCallback(uuid, 'intensity', !active);
      },
      // client params
      'click .project .client .mute': (e) => {
        const $btn = e.target.closest('.mute');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this._updateClientParamCallback(uuid, 'mute', !active);
      },
      'click .project .client .intensity': (e) => {
        const $btn = e.target.closest('.intensity');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this._updateClientParamCallback(uuid, 'intensity', !active);
      },

      'change .absolute-regularization': (e) => {
        const $input = e.target;
        const value = parseFloat($input.value);
        const uuid = $input.dataset.target;
        this._updateProjectConfigCallback(uuid, 'absoluteRegularization', value);

      },
      'change .relative-regularization': (e) => {
        const $input = e.target;
        const value = parseFloat($input.value);
        const uuid = $input.dataset.target;
        this._updateProjectConfigCallback(uuid, 'relativeRegularization', value);

      }
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

  setUpdateProjectParamCallback(callback) {
    this._updateProjectParamCallback = callback;
  }

  setUpdateClientParamCallback(callback) {
    this._updateClientParamCallback = callback;
  }

  setUpdateProjectConfigCallback(callback) {
    this._updateProjectConfigCallback = callback;
  }
}

export default ControllerView;
