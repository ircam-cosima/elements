import { View } from 'soundworks/client';
import template from 'lodash.template';
// templates
import projectTmpl from './templates/project.tmpl';
import projectParamsTmpl from './templates/project-params.tmpl';
import playerTmpl from './templates/player.tmpl';
//
import mlPresets from '../../shared/config/ml-presets';

const tmpl = `
  <div id="header"></div>
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
};

class ControllerView extends View {
  constructor() {
    super(tmpl, model, {}, {
      id: 'controller',
    });

    this.projectTmpl = template(projectTmpl);
    this.projectParamsTmpl = template(projectParamsTmpl);
    this.playerTmpl = template(playerTmpl);

    this.installEvents({
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
        const $input = e.target;
        const $project = $input.closest('.project');
        const uuid = $project.dataset.uuid;
        const name = $input.value;

        this.request('update-project-ml-preset', { uuid, name });
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

  onResize(width, height, orientation) {

  }

  addProject(project) {
    this.model.projects.push(project);

    const projectData = { project: project, global: this.model };
    const $project = createDOM(this.projectTmpl, projectData);

    const $paramsContainer = $project.querySelector('.params');
    const paramsData = { params: project.params, global: this.model };
    const params = this.projectParamsTmpl(paramsData);
    $paramsContainer.innerHTML = params;

    this.$projects.appendChild($project);
  }

  removeProject(project) {
    const index = this.model.projects.indexOf(project);

    if (index !== -1)
      this.model.projects.splice(index, 1);

    const $project = this.querySelector(`#_${uuid}`);
    $project.remove();
  }

  updateProject(project) {
    const selector = `#_${project.uuid} .params`;
    const $paramsContainer = this.$projects.querySelector(selector);
    const data = { params: project.params, global: this.model };
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
