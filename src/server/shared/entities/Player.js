// import

class Player {
  constructor(client) {
    this.uuid = client.uuid;
    this.index = client.index;
    this.client = client;
    this.project = null;

    this.params = {
      audio: {
        mute: false,
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
}

export default Player;
