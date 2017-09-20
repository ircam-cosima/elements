import { CanvasView } from 'soundworks/client';
import ModalDialog from './ModalDialog';
import { presets } from '../shared/config';

const viewTemplate = `
  <canvas class=background noselect"></canvas>
  <div class="content foreground">

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
          <input id="high-threshold" type="number" value="<%= record.highThreshold %>" />
        </label>
        <label class="text-container">Low Threshold:
          <input id="low-threshold" type="number" value="<%= record.lowThreshold %>" />
        </label>
        <label class="text-container">Off Delay:
          <input id="off-delay" type="number" value="<%= record.offDelay %>" />
        </label>

      </div>
    </section>

    <section id="main">
      <div class="wrapper">
        <div class="toggle-container" id="mute">
          <div class="toggle-btn"><div></div></div> Mute
        </div>
        <div class="toggle-container" id="intensity">
          <div class="toggle-btn"><div></div></div> Intensity
        </div>

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
          <% if (recBtnState === 0) { %>
            start<br/>recording
          <% } else if (recBtnState === 1) { %>
            move<br/>or<br/>cancel
          <% } else if (recBtnState === 2) { %>
            recording
          <% } else if (recBtnState === 3) { %>
            idle
          <% } %>
          <p>
        </button>
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
class DesignerView extends CanvasView {
  constructor(content, events, options) {
    super(viewTemplate, content, events, options);

    this._configUpdateCallback = null;
    this._clearLabelCallback = null;
    this._clearModelCallback = null;
    this._recordCallback = null;
    this.__updateParamCallback = null;

    const viewEvents = {
      'touchstart #rec-btn': () => {
        if (this.$recBtn.classList.contains('active'))
          return;

        if (!this.$recBtn.classList.contains('armed')) {
          this.armRecording();
          this._recordCallback('arm');
        } else {
          this.stopRecording();
          // this._recordCallback('stop')
        }
      },
      'touchstart #nav': () => {
        const active = this.$overlay.classList.contains('active');

        if (!active) {
          this.$overlay.classList.add('active');
        } else {
          const $el = this.$el;

          const xmmConfig = {
            modelType: $el.querySelector('#model-select').value,
            gaussians: parseFloat($el.querySelector('#gauss-select').value),
            covarianceMode: $el.querySelector('#cov-mode-select').value,
            absoluteRegularization: parseFloat($el.querySelector('#abs-reg').value),
            relativeRegularization: parseFloat($el.querySelector('#rel-reg').value),
            states: parseFloat($el.querySelector('#states-select').value),
            transitionMode: $el.querySelector('#trans-mode-select').value,
          };

          const recordConfig = {
            highThreshold: Math.min(1, Math.max($el.querySelector('#high-threshold').value, 0)),
            lowThreshold: Math.min(1, Math.max($el.querySelector('#low-threshold').value, 0)),
            offDelay: Math.max(20, $el.querySelector('#off-delay').value),
          };

          this._configCallback(xmmConfig, recordConfig);
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
        this._clearLabelCallback(label);
      },
      'touchstart #clear-all': (e) => {
        e.preventDefault();

        if (this.$clearAll.hasAttribute('disabled'))
          return;

        this._clearModelCallack();
      },

      'touchstart #mute': () => {
        const active = this.$muteBtn.classList.contains('active');
        this._updateParamCallback('mute', !active);
      },
      'touchstart #intensity': () => {
        const active = this.$intensityBtn.classList.contains('active');
        this._updateParamCallback('intensity', !active);
      },
    };

    for (let prop in presets) {
      const cmd = `touchstart #${prop}`;
      viewEvents[cmd] = () => {
        this.setConfig(presets[prop].preset);
      };
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

    this.$clearLabel.textContent = `clear ${this.getCurrentLabel()} recordings`;
  }

  confirm(type, ...args) {
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
    });

    return promise;
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

  setConfig(config) {
    const $el = this.$el;

    $el.querySelector('#model-select').value = config.modelType;
    $el.querySelector('#gauss-select').value = config.gaussians;
    $el.querySelector('#cov-mode-select').selectedIndex = config.covarianceMode;
    $el.querySelector('#abs-reg').value = config.absoluteRegularization;
    $el.querySelector('#rel-reg').value = config.relativeRegularization;
    $el.querySelector('#states-select').value = config.states || 1;
    $el.querySelector('#trans-mode-select').value = config.transitionMode || 0;
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

  armRecording() {
    this.model.recBtnState = 1; // "armed" state
    this.render('#rec-btn');
    this.$recBtn.classList.add('armed');
  }

  startRecording() {
    this.model.recBtnState = 2; // "recording" state
    this.render('#rec-btn');
    this.$recBtn.classList.remove('armed');
    this.$recBtn.classList.add('active');
  }

  stopRecording() {
    this.model.recBtnState = 0; // "waiting" state
    this.render('#rec-btn');
    this.$recBtn.classList.remove('active', 'armed');
  }

  setRecordCallback(callback) {
    this._recordCallback = callback;
  }

  setConfigCallback(callback) {
    this._configCallback = callback;
  }

  setClearLabelCallback(callback) {
    this._clearLabelCallback = callback;
  }

  setClearModelCallback(callback) {
    this._clearModelCallack = callback;
  }

  setUpdateParamCallback(callback) {
    this._updateParamCallback = callback;
  }
};

export default DesignerView;
