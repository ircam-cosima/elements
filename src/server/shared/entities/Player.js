// import

class Player {
  constructor(client, preset) {
    this.type = client.type;
    this.uuid = client.uuid;
    this.index = client.index;
    this.client = client;
    this.project = null;
    this.preset = preset;

    const mappings = {};
    preset['audio-renderer'].mappings.forEach(mapping => mappings[mapping.id] = false);

    this.params = {
      audioRendering: {
        mappings: mappings,
        volume: 0, // dB
        mute: true,
      },
      record: {
        state: 'idle',
        label: '',
        preview: false,
      },
      streams: {
        sensors: false,
        decoding: false,
      },
    };
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
