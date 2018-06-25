const projectParamsTmpl = `
<p class="tiny"><%= project.uuid %></p>

<h2>Labels</h2>

<button class="btn clear danger" data-type="clear-all-examples">
  clear all labels
</button>

<% const trainedLabels = project.model.payload.models.map(function(mod) { return mod.label }) %>
<% trainedLabels.forEach(function(label) { %>
  <button class="btn clear warning" data-type="clear-examples" data-target="<%= label %>">
    clear <%= label %>
  </button>
<% }); %>

<h2>Presets</h2>

<% for (var name in global.mlPresets) { %>
  <button class="btn preset" value="<%= name %>"><%= global.mlPresets[name].label %></button>
<% } %>

<h2>Audio params</h2>

<label class="param checkbox">
  <% var checked = project.params.clientDefaults.audioRendering.mute ? ' checked' : ''; %>
  <input type="checkbox" class="project-param" data-name="clientDefaults.audioRendering.mute"<%= checked %> />
  <div class="checkbox-ui"></div>
  <span>Mute</span>
</label>

<label class="param checkbox">
  <% var checked = project.params.clientDefaults.audioRendering.sensors ? ' checked' : ''; %>
  <input type="checkbox" class="project-param" data-name="clientDefaults.audioRendering.sensors"<%= checked %> />
  <div class="checkbox-ui"></div>
  <span>Sensors</span>
</label>

<label class="slider">
  <input type="range" class="project-param" data-name="clientDefaults.audioRendering.volume" min="-80" max="6" step="0.1" value="<%= project.params.clientDefaults.audioRendering.volume %>" />
  <span>Volume</span>
</label>

<h2>Inputs</h2>

<label class="param checkbox">
  <% var checked = project.params.learning.inputs.intensity ? ' checked' : ''; %>
  <input type="checkbox" class="project-param" data-name="learning.inputs.intensity"<%= checked %> />
  <div class="checkbox-ui"></div>
  <span>Intensity</span>
</label>

<label class="param checkbox">
  <% var checked = project.params.learning.inputs.bandpass ? ' checked' : ''; %>
  <input type="checkbox" class="project-param" data-name="learning.inputs.bandpass"<%= checked %> />
  <div class="checkbox-ui"></div>
  <span>Bandpass</span>
</label>

<label class="param checkbox">
  <% var checked = project.params.learning.inputs.orientation ? ' checked' : ''; %>
  <input type="checkbox" class="project-param" data-name="learning.inputs.orientation"<%= checked %> />
  <div class="checkbox-ui"></div>
  <span>Orientation</span>
</label>

<label class="param checkbox">
  <% var checked = project.params.learning.inputs.gyroscope ? ' checked' : ''; %>
  <input type="checkbox" class="project-param" data-name="learning.inputs.gyroscope"<%= checked %> />
  <div class="checkbox-ui"></div>
  <span>Gyroscope</span>
</label>

<h2>Learning Params</h2>

<label class="param select-container">
  <span>Model Type</span>
  <select class="project-param" data-name="learning.config.payload.modelType">
    <option value="gmm"<%= project.params.learning.config.payload.modelType === 'gmm' ? ' selected' : '' %>>gmm</option>
    <option value="hhmm"<%= project.params.learning.config.payload.modelType === 'hhmm' ? ' selected' : '' %>>hhmm</option>
  </select>
</label>

<label class="param select-container">
  <span>Gaussians</span>
  <select class="project-param" data-name="learning.config.payload.gaussians">
    <% for (var i = 1; i <= 10; i++) { %>
    <% var selected = project.params.learning.config.payload.gaussians === i ? ' selected' : ''; %>
    <option value="<%= i %>"<%= selected %>><%= i %></option>
    <% } %>
  </select>
</label>

<label class="param select-container">
  <span>Covariance mode</span>
  <select class="project-param" data-name="learning.config.payload.covarianceMode">
    <option value="full"<%= project.params.learning.config.payload.covarianceMode === 'full' ? ' selected' : '' %>>full</option>
    <option value="diagonal"<%= project.params.learning.config.payload.covarianceMode === 'diagonal' ? ' selected' : '' %>>diagonal</option>
  </select>
</label>

<label class="param number-box">
  <span>Absolute regularization</span>
  <input class="project-param" data-name="learning.config.payload.absoluteRegularization" type="number" value="<%= project.params.learning.config.payload.absoluteRegularization %>" />
</label>

<label class="param number-box">
  <span>Relative regularization</span>
  <input class="project-param" data-name="learning.config.payload.relativeRegularization" type="number" value="<%= project.params.learning.config.payload.relativeRegularization %>" />
</label>

<% if (project.params.learning.config.payload.modelType === 'hhmm') { %>
  <h3>HHMM params</h3>

  <label class="param select-container">
    <span>States</span>
    <select class="project-param" data-name="learning.config.payload.states">
      <% for (var i = 1; i <= 20; i++) { %>
      <% var selected = project.params.learning.config.payload.states === i ? ' selected' : ''; %>
      <option value="<%= i %>"<%= selected %>><%= i %></option>
      <% } %>
    </select>
  </label>

  <label class="param select-container">
    <span>Transition</span>
    <select class="project-param" data-name="learning.config.payload.transitionMode">
      <option value="ergodic"<%= project.params.learning.config.payload.transitionMode === 'ergodic' ? ' selected' : '' %>>ergodic</option>
      <option value="leftright"<%= project.params.learning.config.payload.transitionMode === 'leftright' ? ' selected' : '' %>>leftright</option>
    </select>
  </label>
<% } %>

<h2>Recording</h2>

<!--
<label class="param number-box">
  <span>High Threshold</span>
  <input class="project-param" data-name="recording.options.highThreshold" type="number" value="<%= project.params.recording.options.highThreshold %>" />
</label>
<label class="param number-box">
  <span>Low Threshold</span>
  <input class="project-param" data-name="recording.options.lowThreshold" type="number" value="<%= project.params.recording.options.lowThreshold %>" />
</label>
<label class="param number-box">
  <span>Off Delay</span>
  <input class="project-param" data-name="recording.options.offDelay" type="number" value="<%= project.params.recording.options.offDelay %>" />
</label>
-->

<label class="param number-box">
  <span>Threshold</span>
  <input class="project-param" data-name="recording.options.threshold" type="number" value="<%= project.params.recording.options.threshold %>" />
</label>
<label class="param number-box">
  <span>Off Delay</span>
  <input class="project-param" data-name="recording.options.offDelay" type="number" value="<%= project.params.recording.options.offDelay %>" />
</label>
<label class="param number-box">
  <span>PreRoll Count</span>
  <input class="project-param" data-name="recording.options.preRollCount" type="number" value="<%= project.params.recording.options.preRollCount %>" />
</label>
<label class="param number-box">
  <span>PreRoll Interval</span>
  <input class="project-param" data-name="recording.options.preRollInterval" type="number" value="<%= project.params.recording.options.preRollInterval %>" />
</label>
`;

export default projectParamsTmpl;
