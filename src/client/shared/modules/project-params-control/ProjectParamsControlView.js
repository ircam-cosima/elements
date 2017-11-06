import { View } from 'soundworks/client';

const template = `
<div class="burger"></div>
<% if (state === 'expanded') { %>
<div class="params">
  <div class="params-content">
    <h2>Presets</h2>

    <h2>Learning Params</h2>

    <h2>Recording</h2>
    <div class="param number-box">
      <span>High Threshold</span>
      <input class="project-param" data-name="" type="number" value="" />
    </div>
    <div class="param number-box">
      <span>Low Threshold</span>
      <input class="project-param" data-name="" type="number" value="" />
    </div>
    <div class="param number-box">
      <span>Off Delay</span>
      <input class="project-param" data-name="" type="number" value="" />
    </div>
  </div>
</div>
<% } %>
`;

const model = {
  state: 'expanded', // 'expanded'
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
      }
    })
  }

  onResize(width, height, orientation) {}
}

export default ProjectParamsControlView;
