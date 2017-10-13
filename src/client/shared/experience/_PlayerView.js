import { View } from 'soundworks/client';
import Notification from '../shared/Notification';

const viewTemplate = `
  <div id="project-name">
    <p><%= title %></p>
    <button class="btn" id="switch-project">
      Switch project
    </button>
  </div>
  <div class="toggle-container" id="mute">
    <div class="toggle-btn"><div></div></div> Mute
  </div>
  <div class="toggle-container" id="intensity">
    <div class="toggle-btn"><div></div></div> Intensity
  </div>
  <div id="likeliest">
    <p class="small">recognized label: <b><%= likeliest %></b></p>
  </div>
`;

class PlayerView extends View {
  constructor(content, events, options) {
    super(viewTemplate, content, events, options);

    this._switchProjectCallback = null;
    this._updateParamCallback = null;

    this.installEvents({
      'touchstart #switch-project': () => {
        this._switchProjectCallback();
      },
      'touchstart #mute': () => {
        const active = this.$muteBtn.classList.contains('active');
        this._updateParamCallback('mute', !active);
      },
      'touchstart #intensity': () => {
        const active = this.$intensityBtn.classList.contains('active');
        this._updateParamCallback('intensity', !active);
      },
    });
  }

  onRender() {
    super.onRender();

    this.$muteBtn = this.$el.querySelector('#mute');
    this.$intensityBtn = this.$el.querySelector('#intensity');
  }

  showNotification(msg) {
    const notification = new Notification(msg);
    notification.render();
    notification.show();
    notification.appendTo(this.$el);
  }

  setSwitchProjectCallback(callback) {
    this._switchProjectCallback = callback;
  }

  setUpdateParamCallback(callback) {
    this._updateParamCallback = callback;
  }

  updateProjectName(name) {
    this.model.title = name;
    this.render('#project-name');
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
}

export default PlayerView;
