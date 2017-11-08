// import

class Player {
  constructor(client) {
    this.uuid = client.uuid;
    this.index = client.index;
    this.client = client;
    this.project = null;

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
      uuid: this.uuid,
      index: this.index,
      params: this.params,
      project: this.project !== null ? this.project.overview() : null,
    };

    return serialized;
  }
}

export default Player;
