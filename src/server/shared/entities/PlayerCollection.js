
class PlayerCollection {
  constructor() {
    this.players = new Set();
    this.uuidPlayerMap = new Map();
    this.indexPlayerMap = new Map();
  }

  add(player) {
    this.players.add(player);
    this.uuidPlayerMap.set(player.uuid, player);
    this.indexPlayerMap.set(player.index, player);
  }

  remove(player) {
    this.players.delete(player);
    this.uuidPlayerMap.delete(player.uuid);
    this.indexPlayerMap.delete(player.index);
  }

  get(uuid) {
    return this.uuidPlayerMap.get(uuid);
  }

  getByIndex(index) {
    return this.indexPlayerMap.get(index);
  }

  getClients() {
    const clients = Array.from(this.players).map(player => player.client);

    return clients;
  }

  forEach(callback) {
    this.players.forEach(callback);
  }

  serialize() {
    const serializedCollection = [];

    this.players.forEach(player => {
      const serializedPlayer = player.serialize();
      serializedCollection.push(serializedPlayer);
    });

    return serializedCollection;
  }

  overview() {
    const overview = [];
    this.players.forEach(player => {
      overview.push(player.overview());
    });

    return overview;
  }
}

export default PlayerCollection;
