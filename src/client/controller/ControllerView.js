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
  players: [],
  monitoring: {},
  projects: [],
  projectsOverview: [],
  projectPresets: [],
  audioFiles: {},
  mlPresets: mlPresets,
  colors: colors,
  muteAll: false,
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

        if (uuid !== '') {
          this.request('move-all-players-to-project', { uuid });
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
        const hidden = $params.classList.toggle('hidden');
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
      // @todo - these have bad behaviors due to rendering (hopefull fix with real view system)
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

      // mute all
      'click #header input[type=checkbox].mute-all': e => {
        // e.preventDefault();
        const $input = e.target;
        const value = !($input.hasAttribute('checked'));

        this.model.muteAll = value;
        this.updateHeader();
        this.request('mute-all', { mute: value });
      },
      // monitoring
      'click .player input[type=checkbox].player-monitor': e => {
        e.preventDefault();
        const $input = e.target;
        const $player = $input.closest('.player');
        const uuid = $player.dataset.uuid;
        const name = $input.dataset.name;
        const value = !($input.hasAttribute('checked'));

        this.request('monitor', { uuid, name, value });
      },

      'click .player .stream-display .close': e => {
        e.preventDefault();
        const $btn = e.target;
        const $player = $btn.closest('.player');
        const uuid = $player.dataset.uuid;
        const index = parseInt($player.dataset.index, 10);
        const name = $btn.dataset.name;

        this.request('monitor', { uuid, name, value: false });
        // @note - ugly but...
        setTimeout(() => {
          if (name === 'sensors') {
            this._deleteSensorsStream(uuid, index);
          } else if (name === 'decoding') {
            this._deleteLikelihoodsStream(uuid, index);
          }
        }, 300);
      }
    });
  }

  onRender() {
    super.onRender();

    this.$header = this.$el.querySelector('#header');
    this.$projects = this.$el.querySelector('#projects');
  }

  onResize(width, height, orientation) {}

  updateHeader() {
    let players = [];

    this.model.projects.forEach(p => players = players.concat(p.players));
    this.$header.innerHTML = this.headerTmpl({
      players: players,
      projectPresets: this.model.projectPresets,
      projectsOverview: this.model.projectsOverview,
      muteAll: this.model.muteAll,
    });
  }

  addProject(project) {
    this.model.projects.push(project);
    // this.model.projects.sort(); // doesn't work because the DOM rendering is too dumb

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

  _updateProjectReference(project) {
    // update project reference
    const projectIndex = this.model.projects.findIndex(p => p.uuid === project.uuid);
    this.model.projects[projectIndex] = project;
  }

  updateProject(project) {
    this._updateProjectReference(project);

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
    this._updateProjectReference(project);
    this.model.players.push(player);
    // this.model.playersMonitoring[player.index] = {};

    const data = { player: player, global: this.model };
    const $player = createDOM(this.playerTmpl, data);
    const selector = `#_${player.project.uuid} > .players`;
    const $container = this.$projects.querySelector(selector);
    $container.appendChild($player);

    this.updatePlayer(player);
    this.updateHeader();
  }

  removePlayerFromProject(player, project) {
    this._updateProjectReference(project);
    const index = this.model.players.findIndex(p => p.uuid === player.uuid);
    this.model.players.splice(index, 1);

    const selector = `#_${player.uuid}`;
    const $player = this.$el.querySelector(selector);

    if (this.sensorsDisplayCollection.has(player.index)) {
      this._deleteSensorsStream(player.uuid, player.index);
    }

    $player.remove();
    this.updateHeader();
  }

  updatePlayer(player) {
    const $container = this.$el.querySelector(`#_${player.uuid} .player-params`);
    const data = { player: player, global: this.model };
    const $player = this.playerParamsTmpl(data);
    // update or create
    $container.innerHTML = $player;

    this._updateSensorsStream(player);
    this._updateLikelihoodsStream(player);

    // update player instance in this.model
    const index = this.model.players.findIndex(p => p.uuid === player.uuid);
    this.model.players[index] = player;
  }

  _updateSensorsStream(player) {
    if (!this.model.monitoring[player.index]) {
      return;
    }

    const sensorsDisplay = this.sensorsDisplayCollection.get(player.index);

    if (this.model.monitoring[player.index].sensors === true) {
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
      !!(this.model.monitoring[player.index].sensors) === false &&
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
    if (this.model.monitoring[playerIndex].sensors) {
      const sensorsDisplay = this.sensorsDisplayCollection.get(playerIndex);
      // as everything is async, we cannot garantee that the chain still exists
      if (sensorsDisplay) {
        sensorsDisplay.process(data);
      }
    }
  }

  _updateLikelihoodsStream(player) {
    if (!this.model.monitoring[player.index]) {
      return;
    }

    const likelihoodsDisplay = this.likelihoodsDisplayCollection.get(player.index);

    if (this.model.monitoring[player.index].decoding === true) {
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
      !!(this.model.monitoring[player.index].decoding) === false &&
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
    if (this.model.monitoring[playerIndex].decoding) {
      const likelihoodsDisplay = this.likelihoodsDisplayCollection.get(playerIndex);

      if (likelihoodsDisplay) {
        likelihoodsDisplay.process(data);
      }
    }
  }

}

export default ControllerView;
