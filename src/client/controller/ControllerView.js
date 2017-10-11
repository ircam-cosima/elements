import * as soundworks from 'soundworks/client';
import template from 'lodash.template';

// highThreshold
// lowThreshold
// offDelay

const projectTemplate = `
  <div class="project-header">
    <h4><%= name %></h4>
    <div class="toggle-container project-param mute <%= params.mute ? 'active' : '' %>" data-target="<%= uuid %>">
      <div class="toggle-btn">
        <div></div>
      </div>Mute
    </div>
    <div class="toggle-container project-param intensity <%= params.intensity ? 'active' : ''%>" data-target="<%= uuid %>">
      <div class="toggle-btn">
        <div></div>
      </div>Intensity
    </div>

    <div>Global:

      <div class="select-container">Gaussians
        <select class="project-configuration" data-target="<%= uuid %>" data-param="gaussians" >
          <% for (var i = 1; i <= 10; i++) { %>
          <option value="<%= i %>" <%= gaussians === i ? 'selected' : '' %> ><%= i %> </option>
          <% } %>
        </select>
      </div>

      <div class="select-container">Covariance
        <select class="project-configuration" data-target="<%= uuid %>" data-param="covarianceMode" >
          <% ['full', 'diagonal'].forEach(function(opt) { %>
          <option value="<%= opt %>" <%= covarianceMode === opt ? 'selected' : '' %> ><%= opt %></option>
          <% }); %>
        </select>
      </div>

      <div class="number-box">Absolute regularization
        <input type="number" value="<%= absoluteRegularization %>" data-target="<%= uuid %>" data-param="absoluteRegularization" class="project-configuration" />
      </div>

      <div class="number-box">Relative regularization
        <input type="number" value="<%= relativeRegularization %>" data-target="<%= uuid %>" data-param="relativeRegularization" class="project-configuration" />
      </div>

    </div> <!-- Global -->

    <div class="hhmm-configuration">HHMM:

      <div class="select-container">States
        <select class="project-configuration" data-target="<%= uuid %>" data-param="states" >
          <% for (var i = 1; i <= 20; i++) { %>
          <option value="<%= i %>" <%= states === i ? 'selected' : '' %> ><%= i %></option>
          <% } %>
        </select>
      </div>

      <div class="select-container">Transition
        <select class="project-configuration" data-target="<%= uuid %>" data-param="transitionMode" >
          <% ['ergodic', 'leftright'].forEach(function(opt) { %>
          <option value="<%= opt %>" <%= transitionMode === opt ? 'selected' : '' %> ><%= opt %></option>
          <% }); %>
        </select>
      </div>

    </div> <!-- HHMM -->

    <div>Recording:

      <div class="number-box">High Threshold
        <input type="number" value="<%= config.highThreshold %>" data-target="<%= uuid %>" data-param="highThreshold" class="project-configuration" />
      </div>

      <div class="number-box">Low Threshold
        <input type="number" value="<%= config.lowThreshold %>" data-target="<%= uuid %>" data-param="lowThreshold" class="project-configuration" />
      </div>

      <div class="number-box">Off Delay
        <input type="number" value="<%= config.offDelay %>" data-target="<%= uuid %>" data-param="offDelay" class="project-configuration" />
      </div>

    </div> <!-- Recording -->

    <% if (!hasDesigner) { %>
    <button class="btn danger delete-project" data-target="<%= uuid %>">Delete</button>
    <% } %>
  </div> <!-- Project Header -->

  <% if (clients.length > 0) { %>
  <ul class="clients">
  <% clients.forEach(function(client) { %>
    <li class="client <%= client.type %>" id="<%= client.uuid %>">
      <p><%= client.type %></p>

      <div class="toggle-container mute <%= client.params.mute ? 'active' : '' %>" data-target="<%= client.uuid %>" class="client-configuration">
        <div class="toggle-btn"><div></div></div> Mute
      </div>
      <div class="toggle-container intensity <%= client.params.intensity ? 'active' : '' %>" data-target="<%= client.uuid %>" class="client-configuration">
        <div class="toggle-btn"><div></div></div> Intensity
      </div>
      <div class="toggle-container stream-sensors <%= client.params.streamSensors ? 'active' : '' %>" data-target="<%= client.uuid %>" class="client-configuration">
        <div class="toggle-btn"><div></div></div> Stream sensors
      </div>

      <% if (client.type === 'designer') { %>
        <% if (!client.params.recording) { %>
        <button class="btn toggle-record record" data-target="<%= client.uuid %>">Rec</button>
        <% } else { %>
        <button class="btn toggle-record stop fast-blink" data-target="<%= client.uuid %>">Stop</button>
        <% } %>

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
  <h1>Controller</h1>

  <div id="main-controls">
    <label id="select-project-container">
      Select project:
      <select id="project-select"></select>
    </label>
    <div id="visualization">
      <div id="sensors-controls"></div>
      <canvas id="sensors"></sensors>
    </div>
  </div>

  <div id="projects"></div>
`;

class ControllerView extends soundworks.View {
  constructor() {
    super(mainTemplate, {}, {}, {
      id: 'controller',
    });

    this._deleteProjectCallback = null;
    this._disconnectDesignerCallback = null;
    this._updateProjectParamCallback = null;
    this._updateProjectConfigCallback = null;
    this._updateClientParamCallback = null;
    this._updateClientExclusiveParamCallback = null;

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
      // project params: apply to all clients
      'click .project .project-param.mute': (e) => {
        const $btn = e.target.closest('.mute');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this._updateProjectParamCallback(uuid, 'mute', !active);
      },
      'click .project .project-param.intensity': (e) => {
        const $btn = e.target.closest('.intensity');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this._updateProjectParamCallback(uuid, 'intensity', !active);
      },
      // project config
      // depending on the parameter, may trigger a new model training
      // cf. server/ControllerExperience::_onUpdateProjectConfig
      'change .project .project-configuration': (e) => {
        const $input = e.target;
        const uuid = $input.dataset.target;
        const param = $input.dataset.param;

        // appStore should conform the values
        let value;
        switch(param) {

          // string
          case 'covarianceMode':
          case 'transitionMode':
            value = $input.value;
            break;

          // number
          case 'absoluteRegularization':
          case 'gaussians':
          case 'highThreshold':
          case 'lowThreshold':
          case 'offDelay':
          case 'relativeRegularization':
          case 'states':
          default:
            value = parseFloat($input.value);
            break;
        }

        this._updateProjectConfigCallback(uuid, param, value);
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
      // client exclusive params
      'click .project .client .stream-sensors': (e) => {
        const $btn = e.target.closest('.stream-sensors');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this._updateClientExclusiveParamCallback(uuid, 'streamSensors', !active);
      },
      // triggers
      'click .project .client .toggle-record': (e) => {
        const $btn = e.target;
        const uuid = $btn.dataset.target;
        let cmd = null;

        if ($btn.classList.contains('record'))
          cmd = 'startRecording';
        else if ($btn.classList.contains('stop'))
          cmd = 'stopRecording';

        console.log(cmd);

        this._triggerClientCommandCallback(uuid, cmd);
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
    this.$visualization = this.$el.querySelector('#visualization');
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

  setUpdateClientExclusiveParamCallback(callback) {
    this._updateClientExclusiveParamCallback = callback;
  }

  setTriggerClientCommandCallback(callback) {
    this._triggerClientCommandCallback = callback;
  }
}

export default ControllerView;
