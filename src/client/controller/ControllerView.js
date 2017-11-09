import { View } from 'soundworks/client';
import template from 'lodash.template';
// templates
import projectTmpl from './templates/project.tmpl';
import projectParamsTmpl from './templates/project-params.tmpl';
import playerTmpl from './templates/player.tmpl';
//
import mlPresets from '../../shared/config/ml-presets';
import { colors } from '../../shared/config/ui';

const tmpl = `
  <div id="header">
    <input type="text" placeholder="project name" class="project-name" value="" />
    <button class="btn normal create-project">Create</button>
  </div>
  <div id="projects"></div>
`;

function createDOM(tmplFunction, data) {
  const html = tmplFunction(data);
  const $div = document.createElement('div');
  $div.innerHTML = html;
  const $content = $div.firstElementChild;

  return $content;
}

const model = {
  projectsOverview: [],
  projects: [],
  mlPresets: mlPresets,
  colors: colors,
};

class ControllerView extends View {
  constructor() {
    super(tmpl, model, {}, { id: 'controller' });

    this.projectTmpl = template(projectTmpl);
    this.projectParamsTmpl = template(projectParamsTmpl);
    this.playerTmpl = template(playerTmpl);

    this.installEvents({
      // ----------------------------------------------------------------
      //
      // ----------------------------------------------------------------
      'click .project .toggle-params': e => {
        e.preventDefault();
        const $btn = e.target;
        const $params = $btn.closest('.project').querySelector('.params');
        const hidden = $params.classList.contains('hidden');

        if (hidden)
          $params.classList.remove('hidden');
        else
          $params.classList.add('hidden');
      },
      'click #header .create-project': e => {
        const $btn = e.target;
        const $input = $btn.previousElementSibling;
        const name = $input.value;

        this.request('create-project', { name });
      },
      'click .project .delete-project': e => {
        // if (window.confirm('Are you sure?')) {
          const $btn = e.target;
          const $project = $btn.closest('.project');
          const uuid = $project.dataset.uuid;

          this.request('delete-project', { uuid });
        // }
      },

      // ----------------------------------------------------------------
      // REQUESTS TO APP STORE
      // ----------------------------------------------------------------
      // player change project
      'change .change-project': e => {
        const $target = e.target;
        const $player = $target.closest('.player');
        const projectUuid = $target.value;
        const playerUuid = $player.dataset.uuid;

        this.request('add-player-to-project', { playerUuid, projectUuid });
      },

      // project params
      'change .project .project-param': e => {
        e.preventDefault();
        const $input = e.target;
        const $project = $input.closest('.project');
        const uuid = $project.dataset.uuid;
        const name = $input.dataset.name;
        const value = $input.value;

        this.request('update-project-param', { uuid, name, value });
      },

      'click .project .preset': e => {
        e.preventDefault();
        const $btn = e.target;
        const $project = $btn.closest('.project');
        const uuid = $project.dataset.uuid;
        const name = $btn.value;

        this.request('update-project-ml-preset', { uuid, name });
      },

      'click .project .clear': e => {
        e.preventDefault();
        const $btn = e.target;
        const $project = $btn.closest('.project');
        const uuid = $project.dataset.uuid;
        const type = $btn.dataset.type;
        const payload = { uuid };

        if (type === 'clear-examples')
          payload.label = $btn.dataset.target;

        this.request(type, payload);
      },

      // player params / checkboxes
      'click .player input[type=checkbox].player-param': e => {
        e.preventDefault();
        const $input = e.target;
        const $player = $input.closest('.player');
        const uuid = $player.dataset.uuid;
        const name = $input.dataset.name;
        const value = !($input.hasAttribute('checked'));

        this.request('update-player-param', { uuid, name, value });
      },
      // player params / selects
      'change .player select.player-param': e => {
        e.preventDefault();
        const $input = e.target;
        const $player = $input.closest('.player');
        const uuid = $player.dataset.uuid;
        const name = $input.dataset.name;
        const value = $input.value;

        console.log(uuid, name, value);
        this.request('update-player-param', { uuid, name, value });
      },
      // player params / buttons
      'click .player button.player-param': e => {
        e.preventDefault();
        const $input = e.target;
        const $player = $input.closest('.player');
        const uuid = $player.dataset.uuid;
        const name = $input.dataset.name;
        const value = $input.value;

        this.request('update-player-param', { uuid, name, value });
      },
    });
  }

  onRender() {
    super.onRender();

    this.$header = this.$el.querySelector('#header');
    this.$projects = this.$el.querySelector('#projects');
  }

  onResize(width, height, orientation) {}

  // resetHeader() {}

  addProject(project) {
    this.model.projects.push(project);

    const projectData = { project: project, global: this.model };
    const $project = createDOM(this.projectTmpl, projectData);
    this.$projects.appendChild($project);

    this.updateProject(project);
  }

  deleteProject(project) {
    const uuid = project.uuid;
    const index = this.model.projects.indexOf(project);

    if (index !== -1)
      this.model.projects.splice(index, 1);

    const $project = this.$el.querySelector(`#_${uuid}`);
    $project.remove();
  }

  updateProject(project) {
    const selector = `#_${project.uuid} .params`;
    const $paramsContainer = this.$projects.querySelector(selector);
    const data = { project: project, global: this.model };
    const params = this.projectParamsTmpl(data);

    $paramsContainer.innerHTML = params;
  }

  addPlayerToProject(player, project) {
    const selector = `#_${player.project.uuid} > .players`;
    const $container = this.$projects.querySelector(selector);
    const data = { player: player, global: this.model };
    const $player = createDOM(this.playerTmpl, data);

    $container.appendChild($player);
  }

  removePlayerFromProject(player, project) {
    const selector = `#_${player.uuid}`;
    const $player = this.$el.querySelector(selector);

    $player.remove();
  }

  updatePlayer(player) {
    const $current = this.$el.querySelector(`#_${player.uuid}`);
    const data = { player: player, global: this.model };
    const $new = createDOM(this.playerTmpl, data);
    const $container = $current.parentElement;

    $container.replaceChild($new, $current);
  }
}

export default ControllerView;
