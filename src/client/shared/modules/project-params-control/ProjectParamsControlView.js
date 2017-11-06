import { View } from 'soundworks/client';
import mlPresets from '../../../../shared/config/ml-presets';

const template = `
<div class="burger"></div>
<% if (state === 'expanded' && learningConfig !== null && recordingOptions !== null) { %>
<div class="params">
  <div class="params-content">
    <h2>Presets</h2>

    <% for (var name in mlPresets) { %>
      <button class="btn preset" value="<%= name %>"><%= mlPresets[name].label %></button>
    <% } %>

    <h2>Learning Params</h2>

    <label class="param select-container">
      <span>Model Type</span>
      <select class="project-param" data-name="learning.config.target.name">
        <option value="xmm:gmm"<%= learningConfig.target.name === 'xmm:gmm' ? ' selected' : '' %>>gmm</option>
        <option value="xmm:hhmm"<%= learningConfig.target.name === 'xmm:hhmm' ? ' selected' : '' %>>hhmm</option>
      </select>
    </label>

    <label class="param select-container">
      <span>Gaussians</span>
      <select class="project-param" data-name="learning.config.payload.gaussians">
        <% for (var i = 1; i <= 10; i++) { %>
        <% var selected = learningConfig.payload.gaussians === i ? ' selected' : ''; %>
        <option value="<%= i %>"<%= selected %>><%= i %></option>
        <% } %>
      </select>
    </label>

    <label class="param select-container">
      <span>Covariance mode</span>
      <select class="project-param" data-name="learning.config.payload.covarianceMode">
        <option value="full"<%= learningConfig.payload.covarianceMode === 'full' ? ' selected' : '' %>>full</option>
        <option value="diagonal"<%= learningConfig.payload.covarianceMode === 'diagonal' ? ' selected' : '' %>>diagonal</option>
      </select>
    </label>

    <label class="param number-box">
      <span>Absolute regularization</span>
      <input class="project-param" data-name="learning.config.payload.absoluteRegularization" type="number" value="<%= learningConfig.payload.absoluteRegularization %>" />
    </label>

    <label class="param number-box">
      <span>Relative regularization</span>
      <input class="project-param" data-name="learning.config.payload.relativeRegularization" type="number" value="<%= learningConfig.payload.relativeRegularization %>" />
    </label>

    <% if (learningConfig.target.name === 'xmm:hhmm') { %>
      <h3>HHMM params</h3>

      <label class="param select-container">
        <span>States</span>
        <select class="project-param" data-name="learning.config.payload.states">
          <% for (var i = 1; i <= 20; i++) { %>
          <% var selected = learningConfig.payload.states === i ? ' selected' : ''; %>
          <option value="<%= i %>"<%= selected %>><%= i %></option>
          <% } %>
        </select>
      </label>

      <label class="param select-container">
        <span>Transition</span>
        <select class="project-param" data-name="learning.config.payload.transitionMode">
          <option value="ergodic"<%= learningConfig.payload.transitionMode === 'ergodic' ? ' selected' : '' %>>ergodic</option>
          <option value="leftright"<%= learningConfig.payload.transitionMode === 'leftright' ? ' selected' : '' %>>leftright</option>
        </select>
      </label>
    <% } %>

    <h2>Recording</h2>

    <label class="param number-box">
      <span>High Threshold</span>
      <input class="project-param" data-name="recording.options.highThreshold" type="number" value="<%= recordingOptions.highThreshold %>" />
    </label>
    <label class="param number-box">
      <span>Low Threshold</span>
      <input class="project-param" data-name="recording.options.lowThreshold" type="number" value="<%= recordingOptions.lowThreshold %>" />
    </label>
    <label class="param number-box">
      <span>Off Delay</span>
      <input class="project-param" data-name="recording.options.offDelay" type="number" value="<%= recordingOptions.offDelay %>" />
    </label>
  </div>
</div>
<% } %>
`;

const model = {
  state: 'expanded', // 'expanded'
  mlPresets: mlPresets,
  learningConfig: null,
  recordingOptions: null,
};

class ProjectParamsControlView extends View {
  constructor() {
    super(template, model, {}, {
      className: 'project-params-control',
    });

    this.installEvents({
      'click .burger': e => {
        this.model.state = (this.model.state === 'reduced') ? 'expanded' : 'reduced';
        this.render();
      },
      'change .project-param': e => {
        e.preventDefault();
        const $input = e.target;
        const name = $input.dataset.name;
        const value = $input.value;

        this.request('update-project-param', { name, value });
      },
      'click .preset': e => {
        e.preventDefault();
        const $input = e.target;
        const name = $input.value;

        this.request('update-project-ml-preset', { name });
      },
    });
  }

  onResize(width, height, orientation) {}
}

export default ProjectParamsControlView;
