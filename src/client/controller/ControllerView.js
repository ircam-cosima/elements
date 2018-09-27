import { View } from 'soundworks/client';
import template from 'lodash.template';
// templates
import headerTmpl from './templates/header.tmpl';
import projectTmpl from './templates/project.tmpl';
import projectParamsTmpl from './templates/project-params.tmpl';
import playerTmpl from './templates/player.tmpl';
import playerParamsTmpl from './templates/player-params.tmpl';
import playerSensorsTmpl from './templates/player-sensors.tmpl';
import playerLikelihoodsTmpl from './templates/player-likelihoods.tmpl';

import SensorsDisplay from './display-components/SensorsDisplay';
import LikelihoodsDisplay from './display-components/LikelihoodsDisplay';

//
import mlPresets from '../../shared/config/ml-presets';
import { colors } from '../../shared/config/ui';


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
  projects: [],
  projectsOverview: [],
  projectPresets: [],
  mlPresets: mlPresets,
  colors: colors,
};

class ControllerView extends View {
  constructor() {
    super(tmpl, model, {}, { id: 'controller' });

    this.projectTmpl = template(projectTmpl);
    this.projectParamsTmpl = template(projectParamsTmpl);
    this.playerTmpl = template(playerTmpl);
    this.playerParamsTmpl = template(playerParamsTmpl);
    this.playerSensorsTmpl = template(playerSensorsTmpl);
    this.playerLikelihoodsTmpl = template(playerLikelihoodsTmpl);
    this.headerTmpl = template(headerTmpl);

    this.sensorsDisplayCollection = new Map();
    this.likelihoodsDisplayCollection = new Map();

    this.installEvents({
      // ----------------------------------------------------------------
      //
      // ----------------------------------------------------------------
      'click #header .create-project': e => {
        e.preventDefault();

        const $name = this.$header.querySelector('.project-name');
        const $preset = this.$header.querySelector('.project-preset');
        const name = $name.value;
        const preset = $preset.value;

        $name.classList.remove('error');

        if (name === '')
          $name.classList.add('error');
        else
          this.request('create-project', { name, preset });
      },

      'submit #header #upload-project': e => {
        e.preventDefault();
        const $form = e.target;
        const data = new FormData($form);

        const request = new XMLHttpRequest();
        request.open('POST', './upload', true);
        request.onload = e => console.log(e);

        request.send(data);
      },

      'click #header .move-players-to-project': e => {
        e.preventDefault();
        const $select = this.$el.querySelector('.move-players-to-project-target');
        const uuid = $select.value;

        this.request('move-all-players-to-project', { uuid })
      },

      'change #header #duplicate-audio': e => {
        e.preventDefault();
        const $select = e.target;
        const uuid = $select.value;

        // @todo - handle stop duplication
        if (uuid === '') {
          this.requestLocal('stop-duplicate-audio', {});
        } else {
          // enable streaming for this client
          const streamSensors = {
            uuid: uuid,
            name: 'streams.sensors',
            value: true,
          };

          this.request('update-player-param', streamSensors);

          const streamDecoding = {
            uuid: uuid,
            name: 'streams.decoding',
            value: true,
          };

          this.request('update-player-param', streamDecoding);

          // find player and project -> this is ugly and should be maintained in
          // the experience
          const projects = this.model.projects;
          let player = null;
          let project = null;

          projects.forEach(_project => {
            _project.players.forEach(_player => {
              if (_player.uuid = uuid)
                player = _player;
                project = _project;
            });
          });

          // request synth and mapping duplication
          this.requestLocal('duplicate-audio', { player, project });
        }
      },

      'click .project .export-project': e => {
        e.preventDefault();
        const $btn = e.target;
        const $project = $btn.closest('.project');
        const uuid = $project.dataset.uuid;

        window.open(`./download?uuid=${uuid}`);
      },

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
      'click .project .delete-project': e => {
        if (window.confirm('Are you sure?')) {
          e.preventDefault();
          const $btn = e.target;
          const $project = $btn.closest('.project');
          const uuid = $project.dataset.uuid;

          this.request('delete-project', { uuid });
        }
      },

      // ----------------------------------------------------------------
      // REQUESTS TO APP STORE
      // ----------------------------------------------------------------
      // player change project
      'change .change-project': e => {
        e.preventDefault();
        const $target = e.target;
        const $player = $target.closest('.player');
        const projectUuid = $target.value;
        const playerUuid = $player.dataset.uuid;

        this.request('add-player-to-project', { playerUuid, projectUuid });
      },

      // project params (select, numbers)
      'change .project .project-param': e => {
        e.preventDefault();
        const $input = e.target;
        const $project = $input.closest('.project');
        const uuid = $project.dataset.uuid;
        const name = $input.dataset.name;
        const value = $input.value;

        this.request('update-project-param', { uuid, name, value });
      },

      'click .project input[type=checkbox].project-param': e => {
        e.preventDefault();
        const $input = e.target;
        const $project = $input.closest('.project');
        const uuid = $project.dataset.uuid;
        const name = $input.dataset.name;
        const value = !($input.hasAttribute('checked'));

        this.request('update-project-param', { uuid, name, value });
      },

      // @fixme (but how?) - these have bad behavior due to rendering
      'input .project input[type=range].project-param': e => {
        const $input = e.target;
        const $project = $input.closest('.project');
        const uuid = $project.dataset.uuid;
        const name = $input.dataset.name;
        const value = $input.value;

        this.request('update-project-param', { uuid, name, value });
      },
      // name
      'blur .project [contenteditable].project-param': e => {
        const $input = e.target;
        const $project = $input.closest('.project');
        const uuid = $project.dataset.uuid;
        const name = $input.dataset.name;
        const value = $input.textContent;

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

        this.request('update-player-param', { uuid, name, value });
      },
      // player params / slider
      // @todo - these have bad behaviors due to rendering
      'input .player input[type=range].player-param': e => {
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

      'mousedown .player .trigger-audio': e => {
        e.preventDefault();
        const $el = e.target;
        const $player = $el.closest('.player');
        const uuid = $player.dataset.uuid;
        const kind = $el.dataset.kind;
        const label = $el.dataset.label;

        this.request('trigger-audio', { uuid, kind, label });
      },

      'click .player .stream-display .close': e => {
        e.preventDefault();
        const $btn = e.target;
        const $player = $btn.closest('.player');
        const uuid = $player.dataset.uuid;
        const index = parseInt($player.dataset.index, 10);
        const paramName = $btn.dataset.name;

        this.request('update-player-param', {
          uuid: uuid,
          name: paramName,
          value: false,
        });

        if (paramName === 'streams.sensors')
          this._deleteSensorsStream(uuid, index);
        else if (paramName === 'streams.decoding')
          this._deleteLikelihoodsStream(uuid, index);
      }
    });
  }

  onRender() {
    super.onRender();

    this.$header = this.$el.querySelector('#header');
    this.$projects = this.$el.querySelector('#projects');

    // this.updateHeader();
  }

  onResize(width, height, orientation) {}

  updateHeader() {
    let players = [];

    this.model.projects.forEach(p => players = players.concat(p.players));
    this.$header.innerHTML = this.headerTmpl({
      players: players,
      projectPresets: this.model.projectPresets,
      projectsOverview: this.model.projectsOverview,
    });
  }

  addProject(project) {
    this.model.projects.push(project);

    const projectData = { project: project, global: this.model };
    const $project = createDOM(this.projectTmpl, projectData);
    this.$projects.appendChild($project);

    this.updateProject(project);
  }

  deleteProject(project) {
    const uuid = project.uuid;
    const index = this.model.projects.findIndex(p => p.uuid === project.uuid);

    if (index !== -1) {
      this.model.projects.splice(index, 1);

      const $project = this.$el.querySelector(`#_${uuid}`);
      $project.remove();
    }
  }

  updateProject(project) {
    // update project reference
    const projectIndex = this.model.projects.findIndex(p => p.uuid === project.uuid);
    this.model.projects[projectIndex] = project;

    // update project name
    const nameSelector = `#_${project.uuid} .header .name`;
    const $name = this.$projects.querySelector(nameSelector);
    $name.textContent = project.params.name;
    // update params
    const paramsSelector = `#_${project.uuid} .header .params`;
    const $paramsContainer = this.$projects.querySelector(paramsSelector);
    const data = { project: project, global: this.model };
    const params = this.projectParamsTmpl(data);

    $paramsContainer.innerHTML = params;
  }

  updateProjectPlayers(project) {
    project.players.forEach(player => this.updatePlayer(player));
  }

  addPlayerToProject(player, project) {
    // update project reference
    const projectIndex = this.model.projects.findIndex(p => p.uuid === project.uuid);
    this.model.projects[projectIndex] = project;

    const data = { player: player, global: this.model };
    const $player = createDOM(this.playerTmpl, data);
    const selector = `#_${player.project.uuid} > .players`;
    const $container = this.$projects.querySelector(selector);
    $container.appendChild($player);

    this.updatePlayer(player);
  }

  removePlayerFromProject(player, project) {
    const projectIndex = this.model.projects.findIndex(p => p.uuid === project.uuid);
    this.model.projects[projectIndex] = project;

    const selector = `#_${player.uuid}`;
    const $player = this.$el.querySelector(selector);

    if (this.sensorsDisplayCollection.has(player.index))
      this._deleteSensorsStream(player.uuid, player.index);

    $player.remove();
  }

  updatePlayer(player) {
    const $container = this.$el.querySelector(`#_${player.uuid} .player-params`);
    const data = { player: player, global: this.model };
    const $player = this.playerParamsTmpl(data);
    // update or create
    $container.innerHTML = $player;

    this._updateSensorsStream(player);
    this._updateLikelihoodsStream(player);
  }

  _updateSensorsStream(player) {
    const sensorsDisplay = this.sensorsDisplayCollection.get(player.index);

    if (player.params.streams.sensors === true) {
      if (sensorsDisplay && sensorsDisplay.isStreaming === false) {
        sensorsDisplay.reset();
        sensorsDisplay.isStreaming = true;
      } else if (!sensorsDisplay) {
        const $sensorsContainer = this.$el.querySelector(`#_${player.uuid} .sensors-display`);
        const playerSensorsHtml = this.playerSensorsTmpl({});
        $sensorsContainer.innerHTML = playerSensorsHtml;

        const sensorsDisplay = new SensorsDisplay($sensorsContainer);
        this.sensorsDisplayCollection.set(player.index, sensorsDisplay);
      }
    } else if (
      player.params.streams.sensors === false &&
      sensorsDisplay &&
      sensorsDisplay.isStreaming === true
    ) {
      sensorsDisplay.isStreaming = false;
    }
  }

  _deleteSensorsStream(uuid, index) {
    let sensorsDisplay = this.sensorsDisplayCollection.get(index);
    this.sensorsDisplayCollection.delete(index);
    sensorsDisplay.destroy();

    // delete container
    const $container = this.$el.querySelector(`.players #_${uuid} .sensors-display`);
    $container.innerHTML = '';
  }

  processSensorsStream(playerIndex, data) {
    const sensorsDisplay = this.sensorsDisplayCollection.get(playerIndex);
    // as everything is async, we cannot garantee that the chain still exists
    if (sensorsDisplay)
      sensorsDisplay.process(data);
  }

  _updateLikelihoodsStream(player) {
    const likelihoodsDisplay = this.likelihoodsDisplayCollection.get(player.index);

    if (player.params.streams.decoding === true) {
      if (likelihoodsDisplay && likelihoodsDisplay.isStreaming === false) {
        likelihoodsDisplay.reset();
        likelihoodsDisplay.isStreaming = true;
      } else if (!likelihoodsDisplay) {
        const $likelihoodsContainer = this.$el.querySelector(`#_${player.uuid} .likelihoods-display`);
        const playerLikelihoodsHtml = this.playerLikelihoodsTmpl({});
        $likelihoodsContainer.innerHTML = playerLikelihoodsHtml;

        const likelihoodsDisplay = new LikelihoodsDisplay($likelihoodsContainer);
        this.likelihoodsDisplayCollection.set(player.index, likelihoodsDisplay);
      }
    } else if (
      player.params.streams.decoding === false &&
      likelihoodsDisplay &&
      likelihoodsDisplay.isStreaming === true
    ) {
      likelihoodsDisplay.isStreaming = false;
    }
  }

  _deleteLikelihoodsStream(uuid, index) {
    let likelihoodsDisplay = this.likelihoodsDisplayCollection.get(index);
    this.likelihoodsDisplayCollection.delete(index);
    likelihoodsDisplay.destroy();
    // delete container
    const $container = this.$el.querySelector(`.players #_${uuid} .likelihoods-display`);
    $container.innerHTML = '';
  }

  processLikelihoodsStream(playerIndex, data) {
    const likelihoodsDisplay = this.likelihoodsDisplayCollection.get(playerIndex);

    if (likelihoodsDisplay)
      likelihoodsDisplay.process(data);
  }

}

export default ControllerView;
