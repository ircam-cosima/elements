import { CanvasView } from 'soundworks/client';

const viewTemplate = `
  <canvas class=background noselect"></canvas>
  <div class="content foreground">

    <div id="nav"></div>

    <section id="overlay">
      <div class="overlay-content">
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

        <h2> Hhmm parameters </h2>

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
            <option value="0">ergodic</option>
            <option value="1">leftright</option>
          </select>
        </label>
      </div>
    </section>

    <section id="main">
      <div class="wrapper">
        <div class="toggle-container" id="mute">
          <div class="toggle-btn"><div></div></div> Mute
        </div>

        <div class="labels-wrapper">
          <label class="select-container">Label:
            <select id="label-select">
            <% for (var prop in sounds) { %>
              <option value="<%= prop %>"><%= prop %></option>
            <% } %>
            </select>
          </label>
          <button class="btn" id="clear-label">clear label</button>
          <button class="btn" id="clear-all">clear all</button>
        </div>

        <button id="rec-btn">
          <div class="bg"></div>
          <p>record</p>
        </button>
      </div>

    </section>

  </div>
`;

class DesignerView extends CanvasView {
  constructor(content, events, options) {
    super(viewTemplate, content, events, options);

    this._configUpdateCallback = null;
    this._clearLabelCallback = null;
    this._clearModelCallback = null;
    this._muteCallback = null;
    this._recordCallback = null;

    this.installEvents({
      'touchstart #rec-btn': () => {
        if (!this.$recBtn.classList.contains('armed')) {
          this.armRecording();
          this._recordCallback('arm');
        } else {
          this.stopRecording();
          this._recordCallback('stop')
        }
      },
      'touchstart #nav': () => {
        const active = this.$overlay.classList.contains('active');

        if (!active) {
          this.$overlay.classList.add('active');
        } else {
          const $el = this.$el;
          const type = $el.querySelector('#model-select').value;

          const config = {
            gaussians: parseFloat($el.querySelector('#gauss-select').value),
            covariance_mode: $el.querySelector('#cov-mode-select').value,
            absolute_regularization: parseFloat($el.querySelector('#abs-reg').value),
            relative_regularization: parseFloat($el.querySelector('#rel-reg').value),
            states: parseFloat($el.querySelector('#states-select').value),
            transition_mode: $el.querySelector('#trans-mode-select').value,
          };

          this._configCallback(type, config);
          this.$overlay.classList.remove('active');
        }
      },
      'change #label-select': () => {
        const label = this.$labelSelect.value;
        this.$clearLabel.textContent = `clear ${label} recordings`;
      },
      'touchstart #clear-label': () => {
        const label = this.$labelSelect.value;
        this._clearLabelCallback(label);
      },
      'touchstart #clear-all': () => {
        this._clearModelCallack();
      },
      'touchstart #mute': () => {
        const active = this.$muteBtn.classList.contains('active');

        if (!active)
          this.$muteBtn.classList.add('active');
        else
          this.$muteBtn.classList.remove('active');

        this._muteCallback(!active);
      },
    });
  }

  setConfig(config) {
    const $el = this.$el;

    $el.querySelector('#model-select').value = config.modelType;
    $el.querySelector('#gauss-select').value = config.gaussians;
    $el.querySelector('#cov-mode-select').selectedIndex = config.covariance_mode;
    $el.querySelector('#abs-reg').value = config.absolute_regularization;
    $el.querySelector('#rel-reg').value = config.relative_regularization;
    $el.querySelector('#states-select').value = config.states || 1;
    $el.querySelector('#trans-mode-select').selectedIndex = config.transition_mode || 0;
  }

  onRender() {
    super.onRender();

    this.$mainContent = this.$el.querySelector('#main');
    this.$recBtn = this.$el.querySelector('#rec-btn');
    this.$recBtnTxt = this.$el.querySelector('#rec-btn p');
    this.$muteBtn = this.$el.querySelector('#mute');
    this.$labelSelect = this.$el.querySelector('#label-select');
    this.$clearLabel = this.$el.querySelector('#clear-label');
    this.$overlay = this.$el.querySelector('#overlay');
  }

  confirm(type, ...args) {
    let msg;

    switch (type) {
      case 'send':
        msg = 'Do you want to keep to recording?';
        break;
      case 'clear-label':
        msg = `do you really want to clear the label ${args[0]}?`;
        break;
      case 'clear all':
        msg = `do you really want to delete all your recordings?`;
        break;
      default:
        msg = `What's the question?`;
        break;
    }

    // @todo - replace with clean modal dialog
    return new Promise((resolve, reject) => {
      if (window.confirm(msg))
        resolve();
      else
        reject();
    });
  }

  getContentHeight() {
    return this.$mainContent.getBoundingClientRect().height;
  }

  getCurrentLabel() {
    return this.$labelSelect.value;
  }

  armRecording() {
    this.$recBtnTxt.textContent = 'armed';
    this.$recBtn.classList.add('armed');
  }

  startRecording() {
    this.$recBtnTxt.textContent = 'recording';
    this.$recBtn.classList.remove('armed');
    this.$recBtn.classList.add('active');
  }

  stopRecording() {
    this.$recBtnTxt.textContent = 'record';
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

  setMuteCallback(callback) {
    this._muteCallback = callback;
  }
};

export default DesignerView;
