const projectParamsTmpl = `
<h2>Presets</h2>

<% for (var name in global.mlPresets) { %>
  <button class="btn preset" value="<%= name %>"><%= global.mlPresets[name].label %></button>
<% } %>

<h2>Learning Params</h2>

<label class="param select-container">
  <span>Model Type</span>
  <select class="project-param" data-name="learning.config.target.name">
    <option value="xmm:gmm"<%= params.learning.config.target.name === 'xmm:gmm' ? ' selected' : '' %>>gmm</option>
    <option value="xmm:hhmm"<%= params.learning.config.target.name === 'xmm:hhmm' ? ' selected' : '' %>>hhmm</option>
  </select>
</label>

<label class="param select-container">
  <span>Gaussians</span>
  <select class="project-param" data-name="learning.config.payload.gaussians">
    <% for (var i = 1; i <= 10; i++) { %>
    <% var selected = params.learning.config.payload.gaussians === i ? ' selected' : ''; %>
    <option value="<%= i %>"<%= selected %>><%= i %></option>
    <% } %>
  </select>
</label>

<label class="param select-container">
  <span>Covariance mode</span>
  <select class="project-param" data-name="learning.config.payload.covarianceMode">
    <option value="full"<%= params.learning.config.payload.covarianceMode === 'full' ? ' selected' : '' %>>full</option>
    <option value="diagonal"<%= params.learning.config.payload.covarianceMode === 'diagonal' ? ' selected' : '' %>>diagonal</option>
  </select>
</label>

<label class="param number-box">
  <span>Absolute regularization</span>
  <input class="project-param" data-name="learning.config.payload.absoluteRegularization" type="number" value="<%= params.learning.config.payload.absoluteRegularization %>" />
</label>

<label class="param number-box">
  <span>Relative regularization</span>
  <input class="project-param" data-name="learning.config.payload.relativeRegularization" type="number" value="<%= params.learning.config.payload.relativeRegularization %>" />
</label>

<% if (params.learning.config.target.name === 'xmm:hhmm') { %>
  <h3>HHMM params</h3>

  <label class="param select-container">
    <span>States</span>
    <select class="project-param" data-name="learning.config.payload.states">
      <% for (var i = 1; i <= 20; i++) { %>
      <% var selected = params.learning.config.payload.states === i ? ' selected' : ''; %>
      <option value="<%= i %>"<%= selected %>><%= i %></option>
      <% } %>
    </select>
  </label>

  <label class="param select-container">
    <span>Transition</span>
    <select class="project-param" data-name="learning.config.payload.transitionMode">
      <option value="ergodic"<%= params.learning.config.payload.transitionMode === 'ergodic' ? ' selected' : '' %>>ergodic</option>
      <option value="leftright"<%= params.learning.config.payload.transitionMode === 'leftright' ? ' selected' : '' %>>leftright</option>
    </select>
  </label>
<% } %>

<h2>Recording</h2>

<label class="param number-box">
  <span>High Threshold</span>
  <input class="project-param" data-name="recording.options.highThreshold" type="number" value="<%= params.recording.options.highThreshold %>" />
</label>
<label class="param number-box">
  <span>Low Threshold</span>
  <input class="project-param" data-name="recording.options.lowThreshold" type="number" value="<%= params.recording.options.lowThreshold %>" />
</label>
<label class="param number-box">
  <span>Off Delay</span>
  <input class="project-param" data-name="recording.options.offDelay" type="number" value="<%= params.recording.options.offDelay %>" />
</label>
`;

export default projectParamsTmpl;
