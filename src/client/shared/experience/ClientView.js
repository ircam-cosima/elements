import { CanvasView } from 'soundworks/client';
import ModalDialog from './ModalDialog';
import Notification from './Notification';

import { presets } from '../../../shared/config/ml-presets';

const viewTemplate = `
  <div id="canvas-wrapper" class="section-wrapper">
    <canvas class=background noselect"></canvas>
  </div>

  <div class="content foreground">

    <div id="configuration-wrapper" class="section-wrapper">
    <div id="nav"></div>

    <section id="overlay">
      <div class="overlay-content">

        <h2>Configuration presets</h2>

        <% for (var prop in presets) { %>
          <button class="btn" id="<%= prop %>">
            <%= presets[prop].name %>
          </button>
        <% } %>

        <h2>Global configuration</h2>

        <label class="select-container">Model type:
          <select id="model-select">
            <option value="gmm">gmm</option>
            <option value="hhmm">hhmm</option>
          </select>
        </label>
        <label class="select-container">Gaussians:
          <select id="gauss-select">
            <% for (var i = 0; i < 10; i++) { %>
              <option value="<%= i+1 %>">
                <%= i+1 %>
              </option>
            <% } %>
          </select>
        </label>
        <label class="select-container">Covariance mode:
          <select id="cov-mode-select">
            <option value="full">full</option>
            <option value="diagonal">diagonal</option>
          </select>
        </label>
        <label class="text-container">Absolute regularization:
          <input id="abs-reg" type="number" value="0.01" />
        </label>
        <label class="text-container">Relative regularization:
          <input id="rel-reg" type="number" value="0.01" />
        </label>

        <h2>Hhmm parameters</h2>

        <label class="select-container">States:
          <select id="states-select">
            <% for (var i = 0; i < 20; i++) { %>
              <option value="<%= i+1 %>">
                <%= i+1 %>
              </option>
            <% } %>
          </select>
        </label>
        <label class="select-container">Transition mode:
          <select id="trans-mode-select">
            <option value="ergodic">ergodic</option>
            <option value="leftright">leftright</option>
          </select>
        </label>

        <h2>Recording parameters</h2>

        <label class="text-container">High Threshold:
          <input id="high-threshold" type="number" value="0.2" />
        </label>
        <label class="text-container">Low Threshold:
          <input id="low-threshold" type="number" value="0.05" />
        </label>
        <label class="text-container">Off Delay:
          <input id="off-delay" type="number" value="" />
        </label>

      </div>
    </section>
    </div>

    <section id="main">
      <div class="wrapper">

        <div id="project-name">
          <p><%= title %></p>
          <button class="btn" id="switch-project">
            Switch project
          </button>
        </div>

        <div id="basic-controls-wrapper" class="section-wrapper">
        <div class="toggle-container" id="mute">
          <div class="toggle-btn"><div></div></div> Mute
        </div>
        <div class="toggle-container" id="intensity">
          <div class="toggle-btn"><div></div></div> Intensity
        </div>
        </div>

        <div id="advanced-controls-wrapper" class="section-wrapper">
        <div class="labels-wrapper">
          <label class="select-container">Label:
            <select id="label-select">
            <% for (var prop in sounds) { %>
              <option value="<%= prop %>"><%= prop %></option>
            <% } %>
            </select>
          </label>
          <button class="btn" id="clear-label" disabled>clear label</button>
          <button class="btn" id="clear-all" disabled>clear all recordings</button>
        </div>

        <button id="rec-btn">
          <div class="bg"></div>
          <p>
          <% if (recBtnState === 'idle') { %>
            start<br/>recording
          <% } else if (recBtnState === 'armed') { %>
            move<br/>or<br/>cancel
          <% } else if (recBtnState === 'recording') { %>
            recording
          <% } else { %>
            <%= recBtnState %>
          <% } %>
          <p>
        </button>
        </div>

      </div>

    </section>

  </div>
`;

/**
 * @todo - move more logic into the template:
 *   * enable / disable clear buttons
 *   * update clear button text
 *   * active / inactive mute button
 */
class ClientView extends CanvasView {
  constructor(content, events, options) {
    super(viewTemplate, content, events, options);

    this.recordCallback = null;
    this.clearLabelCallback = null;
    this.clearModelCallback = null;
    this.clearModelCallback = null;
    this.updateParamCallback = null;
    this.updateTrainingConfigCallback = null;
    this.updateProjectConfigCallback = null;
    this.switchProjectCallback = null;
    this.dialog = null;

    const viewEvents = {
      'touchstart #switch-project': (e) => {
        e.preventDefault();
        this.switchProjectCallback();
      },
      'touchstart #rec-btn': () => {
        if (this.$recBtn.classList.contains('active'))
          return;

        if (!this.$recBtn.classList.contains('armed')) {
          this.armRecording();
          this.recordCallback('arm');
        } else {
          this.stopRecording();
          this.recordCallback('idle');
        }
      },
      'touchstart #nav': () => {
        const active = this.$overlay.classList.contains('active');

        if (!active) {
          this.$overlay.classList.add('active');
        } else {
          const $el = this.$el;

          const trainingConfig = {
            modelType: $el.querySelector('#model-select').value,
            gaussians: parseFloat($el.querySelector('#gauss-select').value),
            covarianceMode: $el.querySelector('#cov-mode-select').value,
            absoluteRegularization: parseFloat($el.querySelector('#abs-reg').value),
            relativeRegularization: parseFloat($el.querySelector('#rel-reg').value),
            states: parseFloat($el.querySelector('#states-select').value),
            transitionMode: $el.querySelector('#trans-mode-select').value,
          };

          this.updateTrainingConfigCallback(trainingConfig);

          const recordingConfig = {
            highThreshold: parseFloat($el.querySelector('#high-threshold').value),
            lowThreshold: parseFloat($el.querySelector('#low-threshold').value),
            offDelay: parseFloat($el.querySelector('#off-delay').value),
          };

          this.updateProjectConfigCallback(recordingConfig);

          this.$overlay.classList.remove('active');
        }
      },
      'change #label-select': () => {
        const label = this.$labelSelect.value;
        this.$clearLabel.textContent = `clear ${label} recordings`;

        if (this.currentLabels.indexOf(label) === -1)
          this.$clearLabel.setAttribute('disabled', true);
        else
          this.$clearLabel.removeAttribute('disabled');
      },
      'touchstart #clear-label': (e) => {
        e.preventDefault();

        if (this.$clearLabel.hasAttribute('disabled'))
          return;

        const label = this.$labelSelect.value;
        this.clearLabelCallback(label);
      },
      'touchstart #clear-all': (e) => {
        e.preventDefault();

        if (this.$clearAll.hasAttribute('disabled'))
          return;

        this.clearModelCallback();
      },

      'touchstart #mute': () => {
        const active = this.$muteBtn.classList.contains('active');
        this.updateParamCallback('mute', !active);
      },
      'touchstart #intensity': () => {
        const active = this.$intensityBtn.classList.contains('active');
        this.updateParamCallback('intensity', !active);
      },
    };

    for (let prop in presets) {
      const cmd = `touchstart #${prop}`;
      viewEvents[cmd] = () => this.updateTrainingConfig(presets[prop].preset);
    }

    this.installEvents(viewEvents);
  }

  onRender() {
    super.onRender();

    this.$mainContent = this.$el.querySelector('#main');
    this.$recBtn = this.$el.querySelector('#rec-btn');
    this.$recBtnTxt = this.$el.querySelector('#rec-btn p');
    this.$muteBtn = this.$el.querySelector('#mute');
    this.$intensityBtn = this.$el.querySelector('#intensity');
    this.$labelSelect = this.$el.querySelector('#label-select');
    this.$clearLabel = this.$el.querySelector('#clear-label');
    this.$clearAll = this.$el.querySelector('#clear-all');
    this.$overlay = this.$el.querySelector('#overlay');

    this.$configSection = this.$el.querySelector('#configuration-wrapper');
    this.$basicSection = this.$el.querySelector('#basic-controls-wrapper');
    this.$advancedSection = this.$el.querySelector('#advanced-controls-wrapper');
    this.$canvasSection = this.$el.querySelector('#canvas-wrapper');

    this.$clearLabel.textContent = `clear ${this.getCurrentLabel()} recordings`;
  }

  confirmDialog(type, ...args) {
    let msg;

    switch (type) {
      case 'send':
        msg = 'do you want to keep this recording?';
        break;
      case 'clear-label':
        msg = `do you really want to clear the label ${args[0]}?`;
        break;
      case 'clear-all':
        msg = `do you really want to delete all your recordings?`;
        break;
      default:
        msg = `What's the question?`;
        break;
    }

    const promise = new Promise((resolve, reject) => {
      const model = { msg };
      const dialog = new ModalDialog(model, resolve, reject);

      dialog.render();
      dialog.show();
      dialog.appendTo(this.$el);

      if (this.dialog !== null)
        this.dialog.remove();

      this.dialog = dialog;
    });

    return promise;
  }

  removeDialog() {
    this.dialog.remove();
    this.dialog = null;
  }

  showNotification(msg) {
    const notification = new Notification(msg);
    notification.render();
    notification.show();
    notification.appendTo(this.$el);
  }

  updateParams(params) {
    if (params.mute === true)
      this.$muteBtn.classList.add('active');
    else
      this.$muteBtn.classList.remove('active');

    if (params.intensity === true)
      this.$intensityBtn.classList.add('active');
    else
      this.$intensityBtn.classList.remove('active');
  }

  updateProjectConfig(config) {
    const $el = this.$el;

    $el.querySelector('#high-threshold').value = config.highThreshold;
    $el.querySelector('#low-threshold').value = config.lowThreshold;
    $el.querySelector('#off-delay').value = config.offDelay;
  }

  updateTrainingConfig(config) {
    const $el = this.$el;

    $el.querySelector('#model-select').value = config.modelType;
    $el.querySelector('#gauss-select').value = config.gaussians;
    $el.querySelector('#cov-mode-select').selectedIndex = config.covarianceMode;
    $el.querySelector('#abs-reg').value = config.absoluteRegularization;
    $el.querySelector('#rel-reg').value = config.relativeRegularization;
    $el.querySelector('#states-select').value = config.states || 1;
    $el.querySelector('#trans-mode-select').value = config.transitionMode || 0;
  }

  updateProjectName(name) {
    this.model.title = name;
    this.render('#project-name');
  }

  setCurrentLabels(currentLabels) {
    this.currentLabels = currentLabels;

    // enable / disable clear all
    if (this.currentLabels.length === 0)
      this.$clearAll.setAttribute('disabled', true);
    else
      this.$clearAll.removeAttribute('disabled');

    // enable / disable clear current label
    if (this.currentLabels.indexOf(this.getCurrentLabel()) === -1)
      this.$clearLabel.setAttribute('disabled', true);
    else
      this.$clearLabel.removeAttribute('disabled');
  }

  getContentHeight() {
    return this.$mainContent.getBoundingClientRect().height;
  }

  getCurrentLabel() {
    return this.$labelSelect.value;
  }

  setCurrentLabel(value) {
    this.$labelSelect.value = value;
  }

  armRecording() {
    this.model.recBtnState = 'armed'; // "armed" state
    this.render('#rec-btn');
    this.$recBtn.classList.add('armed');
  }

  startRecording() {
    this.model.recBtnState = 'recording'; // "recording" state
    this.render('#rec-btn');
    this.$recBtn.classList.remove('armed');
    this.$recBtn.classList.add('active');
  }

  stopRecording() {
    this.model.recBtnState = 'idle'; // "waiting" state
    this.render('#rec-btn');
    this.$recBtn.classList.remove('active', 'armed');
  }

  setSectionsVisibility(flags) {
    for (let key in flags) {
      let section = null;

      switch (key) {
        case 'configuration':
          section = this.$configSection;
          break;
        case 'basicControls':
          section = this.$basicSection;
          break;
        case 'advancedControls':
          section = this.$advancedSection;
          break;
        case 'canvas':
          section = this.$canvasSection;
          break;
      }

      if (flags[key] && !section.classList.contains('show'))
        section.classList.add('show');
      else if (section.classList.contains('show'))
        section.classList.remove('show');
    }
  }
};

export default ClientView;
