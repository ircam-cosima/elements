import * as soundworks from 'soundworks/client';
import template from 'lodash.template';
import { presets as mlPresets } from '../../shared/config/ml-presets';
import { labels as audioLabels } from '../../shared/config/audio';

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

    <div class="select-container">Presets:
      <% for (var p in mlPresets) { %>
       <button class="btn project-configuration ml-preset" data-target="<%= uuid %>" value="<%= p %>">
          <%= mlPresets[p].name %>
        </button>
      <% } %>
    </div><!-- Presets -->

    <div>Global:

      <div class="select-container">Model type
        <select class="project-configuration" data-target="<%= uuid %>" data-param="modelType" >
          <% ['gmm', 'hhmm'].forEach(function(opt) { %>
          <option value="<%= opt %>" <%= modelType === opt ? 'selected' : '' %> ><%= opt %></option>
          <% }); %>
        </select>
      </div>

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

      <div class="record-container">
        Record state: <%= client.params.recordState %>
        <% switch (client.params.recordState) {
             case 'idle':
             case 'armed': %>
        <button class="btn record start" data-param="start" data-target="<%= client.uuid %>">Record</button>
        <%     break;
             case 'recording': %>
        <button class="btn record stop" data-param="stop" data-target="<%= client.uuid %>">Stop</button>
        <%     break;
             case 'pending': %>
        <button class="btn record confirm" data-param="confirm" data-target="<%= client.uuid %>">Confirm</button>
        <button class="btn record cancel" data-param="cancel" data-target="<%= client.uuid %>">Cancel</button>
        <%     break;
           } %>
      </div>

      <div class="label-container">
        <label class="select-container">Label:
          <select class="label-select" data-target="<%= client.uuid %>">
          <% for (var label in audioLabels) { %>
            <option value="<%= label %>"><%= label %></option>
          <% } %>
          </select>
        </label>
      </div>

      <div class="disconnect-container">
 <% console.log(client) %>
        <% if (client.params.recordState === 'idle') { %>
        <button class="btn warning disconnect-designer" data-target="<%= client.uuid %>">Disconnect</button>
        <% } %>
      </div>
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

    this.deleteProjectCallback = null;
    this.disconnectDesignerCallback = null;
    this.updateProjectParamCallback = null;
    this.updateProjectConfigCallback = null;
    this.updateClientParamCallback = null;
    this.updateClientExclusiveParamCallback = null;
    this.triggerClientCommandCallback = null;

    this.installEvents({
      'click .delete-project': (e) => {
        const uuid = e.target.dataset.target;
        this.deleteProjectCallback(uuid);
      },
      'click .disconnect-designer': (e) => {
        const uuid = e.target.dataset.target;
        this.disconnectDesignerCallback(uuid);
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
        this.updateProjectParamCallback(uuid, 'mute', !active);
      },
      'click .project .project-param.intensity': (e) => {
        const $btn = e.target.closest('.intensity');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this.updateProjectParamCallback(uuid, 'intensity', !active);
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
          case 'modelType':
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

        this.updateProjectConfigCallback(uuid, param, value);
      },
      'click .project .project-configuration.ml-preset': (e) => {
        const $input = e.target;
        const uuid = $input.dataset.target;
        const value = $input.value;
        const preset = mlPresets[value].preset;
        for(let param in preset) {
          this.updateProjectConfigCallback(uuid, param, preset[param]);
        }
      },
      // client params
      'click .project .client .mute': (e) => {
        const $btn = e.target.closest('.mute');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this.updateClientParamCallback(uuid, 'mute', !active);
      },
      'click .project .client .intensity': (e) => {
        const $btn = e.target.closest('.intensity');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this.updateClientParamCallback(uuid, 'intensity', !active);
      },
      // client exclusive params
      'click .project .client .stream-sensors': (e) => {
        const $btn = e.target.closest('.stream-sensors');
        const active = $btn.classList.contains('active');
        const uuid = $btn.dataset.target;
        this.updateClientExclusiveParamCallback(uuid, 'streamSensors', !active);
      },
      // triggers
      'click .project .client .record': (e) => {
        const $input = e.target;
        const uuid = $input.dataset.target;
        const args = $input.dataset.param;
        this.triggerClientCommandCallback(uuid, 'record', args);
      },
      'change .project .client .label-select': (e) => {
        const $input = e.target;
        const value = $input.value;
        const uuid = $input.dataset.target;
        this.triggerClientCommandCallback(uuid, 'setLabel', value);
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

    const content = this.projectTemplate(Object.assign({}, project, { mlPresets, audioLabels }));
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
    const content = this.projectTemplate(Object.assign({}, project, { mlPresets, audioLabels }));

    $container.innerHTML = content;
  }
}

export default ControllerView;
