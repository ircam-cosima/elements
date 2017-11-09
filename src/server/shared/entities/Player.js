// import

class Player {
  constructor(client, preset) {
    this.type = client.type;
    this.uuid = client.uuid;
    this.index = client.index;
    this.client = client;
    this.project = null;
    this.preset = preset;

    this.params = {
      audioRendering: {
        sensors: false,
        intensity: false,
      },
      record: {
        state: 'idle',
        label: '',
      },
      sensors: {
        stream: false,
      }
    }
  }

  serialize() {
    const serialized = {
      type: this.type,
      uuid: this.uuid,
      index: this.index,
      type: this.type,
      params: this.params,
      project: this.project !== null ? this.project.overview() : null,
      preset: this.preset,
    };

    return serialized;
  }
}

export default Player;
