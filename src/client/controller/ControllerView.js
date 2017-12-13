import { View } from 'soundworks/client';
import template from 'lodash.template';
import * as lfo from 'waves-lfo/client';
import * as controllers from 'basic-controllers';
// templates
import projectTmpl from './templates/project.tmpl';
import projectParamsTmpl from './templates/project-params.tmpl';
import playerTmpl from './templates/player.tmpl';
import playerParamsTmpl from './templates/player-params.tmpl';
import playerSensorsTmpl from './templates/player-sensors.tmpl';
import playerLikelihoodsTmpl from './templates/player-likelihoods.tmpl';
//
import mlPresets from '../../shared/config/ml-presets';
import { colors } from '../../shared/config/ui';

const tmpl = `
  <div id="header">
    <div class="section" id="create-project">
      <input type="text" placeholder="project name" class="project-name" value="" />
      <button class="btn normal create-project">Create</button>
    </div>

    <form class="section" id="upload-project" enctype="multipart/form-data" method="post">
      <input type="file" name="project" required />
      <input type="submit" class="btn normal" value="upload" />
    </form>
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
    this.playerParamsTmpl = template(playerParamsTmpl);
    this.playerSensorsTmpl = template(playerSensorsTmpl);
    this.playerLikelihoodsTmpl = template(playerLikelihoodsTmpl);

    this.sensorsDisplayChains = new Map();
    this.likelihoodsDisplayChains = new Map();
    this.likelihoodResetRequired = false;

    this.installEvents({
      // ----------------------------------------------------------------
      //
      // ----------------------------------------------------------------
      'click #header .create-project': e => {
        e.preventDefault();
        const $btn = e.target;
        const $input = $btn.previousElementSibling;
        const name = $input.value;
        $input.classList.remove('error');

        if (name === '')
          $input.classList.add('error');
        else
          this.request('create-project', { name });
      },

      'submit #header #upload-project': e => {
        e.preventDefault();
        const $form = e.target;
        const data = new FormData($form);

        const request = new XMLHttpRequest();
        request.open('POST', './upload', true);
        request.onload = e => {
          console.log(e);
        }

        request.send(data);
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

  addPlayerToProject(player, project) {
    const data = { player: player, global: this.model };
    const $player = createDOM(this.playerTmpl, data);

    const selector = `#_${player.project.uuid} > .players`;
    const $container = this.$projects.querySelector(selector);
    $container.appendChild($player);

    this.updatePlayer(player);
  }

  removePlayerFromProject(player, project) {
    const selector = `#_${player.uuid}`;
    const $player = this.$el.querySelector(selector);

    if (this.sensorsDisplayChains.has(player.index))
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
    const lfoChain = this.sensorsDisplayChains.get(player.index);

    if (player.params.streams.sensors === true) {
      if (lfoChain && lfoChain.isStreaming === false) {
        // reset stream
        lfoChain.bpfDisplay.resetStream();
        lfoChain.isStreaming = true;

      } else if (!lfoChain) {
        const $sensorsContainer = this.$el.querySelector(`#_${player.uuid} .sensors-display`);
        const playerSensors = this.playerSensorsTmpl({});
        $sensorsContainer.innerHTML = playerSensors;

        const $canvasContainer = $sensorsContainer.querySelector('.canvas-container');
        const $controllerContainer = $sensorsContainer.querySelector('.controllers');

        const displayFilter = [1, 1, 1, 1, 1, 1, 1, 1];
        // build lfo chain
        const eventIn = new lfo.source.EventIn({
          frameType: 'vector',
          frameSize: 8,
          frameRate: 0,
        });

        const filter = new lfo.operator.Multiplier({
          factor: displayFilter,
        });

        const bpfDisplay = new lfo.sink.BpfDisplay({
          min: -1,
          max: 1,
          width: 600,
          height: 300,
          duration: 10,
          line: true,
          radius: 0,
          colors: [
            '#da251c', '#f8cc11', // intensity
            'steelblue', 'orange', 'green',
            '#565656', '#fa8064', '#54b2a9',
          ],
          container: $canvasContainer,
        });

        eventIn.connect(filter);
        filter.connect(bpfDisplay);
        eventIn.start();

        // controls
        const intensityToggle = new controllers.Toggle({
          label: 'intensity',
          active: true,
          container: $controllerContainer,
          callback: active => {
            const value = active === true ? 1 : 0;
            displayFilter[0] = value;
            displayFilter[1] = value;
          }
        });

        const bandpassToggle = new controllers.Toggle({
          label: 'bandpass',
          active: true,
          container: $controllerContainer,
          callback: active => {
            const value = active === true ? 1 : 0;
            displayFilter[2] = value;
            displayFilter[3] = value;
            displayFilter[4] = value;
          }
        });

        const orientationToggle = new controllers.Toggle({
          label: 'orientation',
          active: true,
          container: $controllerContainer,
          callback: active => {
            const value = active === true ? 1 : 0;
            displayFilter[5] = value;
            displayFilter[6] = value;
            displayFilter[7] = value;
          }
        });

        const bpfTickness = new controllers.Slider({
          label: 'tickness',
          min: 0,
          max: 10,
          step: 1,
          value: 0,
          container: $controllerContainer,
          callback: value => bpfDisplay.params.set('radius', value),
        });

        const lfoChain = {
          eventIn,
          filter,
          bpfDisplay,
          intensityToggle,
          bandpassToggle,
          orientationToggle,
          bpfTickness,
          isStreaming: true,
        };

        this.sensorsDisplayChains.set(player.index, lfoChain);
      }
    } else if (player.params.streams.sensors === false && lfoChain && lfoChain.isStreaming === true) {
      lfoChain.isStreaming = false;
    }
  }

  _deleteSensorsStream(uuid, index) {
    let lfoChain = this.sensorsDisplayChains.get(index);

    lfoChain.eventIn.finalizeStream();
    lfoChain.eventIn.destroy();
    lfoChain.filter.destroy();
    lfoChain.bpfDisplay.destroy();

    this.sensorsDisplayChains.delete(index);
    lfoChain = null;
    // delete container
    const $container = this.$el.querySelector(`.players #_${uuid} .sensors-display`);
    $container.innerHTML = '';
  }

  processSensorsStream(playerIndex, data) {
    const chain = this.sensorsDisplayChains.get(playerIndex);
    // as everything is async, we cannot garantee that the chain still exists
    if (chain)
      chain.eventIn.process(null, data);
  }

  _updateLikelihoodsStream(player) {
    const lfoChain = this.likelihoodsDisplayChains.get(player.index);

    if (player.params.streams.decoding === true) {
      if (lfoChain && lfoChain.isStreaming === false) {

        lfoChain.barChartDisplay.resetStream();
        lfoChain.isStreaming = true;

      } else if (!lfoChain) {

        const $likelihoodsContainer = this.$el.querySelector(`#_${player.uuid} .likelihoods-display`);
        const playerLikelihoods = this.playerLikelihoodsTmpl({});
        $likelihoodsContainer.innerHTML = playerLikelihoods;

        const $canvasContainer = $likelihoodsContainer.querySelector('.canvas-container');

        const eventIn = new lfo.source.EventIn({
          frameSize: 1, // dummy value
          frameRate: 0, // dummy value
          frameType: 'vector',
        });

        const barChartDisplay = new lfo.sink.BarChartDisplay({
          container: $canvasContainer,
          width: 600,
          colors: [
            '#ff0000',
            '#00ff00',
            '#3355ff',
            '#999900',
            '#990099',
            '#009999',
          ],
        });

        eventIn.connect(barChartDisplay);
        eventIn.start();

        const lfoChain = {
          eventIn,
          barChartDisplay,
          isStreaming: true,
        };

        this.likelihoodsDisplayChains.set(player.index, lfoChain);
      }
    } else if (player.params.streams.decoding === false && lfoChain && lfoChain.isStreaming === true) {
      lfoChain.isStreaming = false;
    }
  }

  _deleteLikelihoodsStream(uuid, index) {
    let lfoChain = this.likelihoodsDisplayChains.get(index);

    lfoChain.eventIn.finalizeStream();
    lfoChain.eventIn.destroy();
    lfoChain.barChartDisplay.destroy();

    this.likelihoodsDisplayChains.delete(index);
    lfoChain = null;
    // delete container
    const $container = this.$el.querySelector(`.players #_${uuid} .likelihoods-display`);
    $container.innerHTML = '';

    this.likelihoodResetRequired = true;
  }

  processLikelihoodsStream(playerIndex, data, reset) {
    const chain = this.likelihoodsDisplayChains.get(playerIndex);

    if (chain) {
      if (reset || this.likelihoodResetRequired) {
        chain.eventIn.streamParams.frameSize = data.length;
        chain.eventIn.propagateStreamParams();

        this.likelihoodResetRequired = false;
      }

      chain.eventIn.process(null, data);
    } else if (reset) {
      this.likelihoodResetRequired = true;
    }
  }

}

export default ControllerView;
