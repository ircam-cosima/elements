import * as soundworks from 'soundworks/client';
import template from 'lodash.template';

const projectTemplate = `
  <h4><%= name %>
  <% if (!hasDesigner) { %>
    <button class="btn delete delete-project" data-target="<%= uuid %>">Delete</button>
  <% } %>
  </h4>

  <% if (clients.length > 0) { %>
  <ul class="clients">
  <% clients.forEach(function(client) { %>
    <li class="client <%= client.type %>" id="<%= client.uuid %>">
      <p>type: <%= client.type %></p>
    </li>
  <% }); %>
  </ul>
  <% } %>
`;

const mainTemplate = `
  <h1>Master</h1>

  <div id="projects">

  </div>
`;

class MasterView extends soundworks.View {
  constructor() {
    super(mainTemplate, {}, {}, {
      id: 'master',
    });

    this._deleteProjectCallback = null;

    this.installEvents({
      'click .delete-project': (e) => {
        const uuid = e.target.dataset.target;
        this._deleteProjectCallback(uuid);
      },
    });

    this.projectTemplate = template(projectTemplate);
    this.projectContainerMap = new Map();

    this.deleteProject = this.deleteProject.bind(this);
  }

  onRender() {
    super.onRender();

    this.$projects = this.$el.querySelector('#projects');
  }

  addProject(project) {
    const $container = document.createElement('div');
    $container.id = project.uuid;
    $container.classList.add('project');

    const content = this.projectTemplate(project);
    $container.innerHTML = content;

    this.$projects.appendChild($container);

    this.projectContainerMap.set(project.uuid, $container);
  }

  deleteProject(project) {
    const $container = this.projectContainerMap.get(project.uuid);
    $container.remove();

    this.projectContainerMap.delete(project)
  }

  setDeleteProjectCallback(callback) {
    this._deleteProjectCallback = callback;
  }
}

export default MasterView;
