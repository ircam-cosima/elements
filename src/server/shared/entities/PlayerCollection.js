
class PlayerCollection {
  constructor() {
    this.players = new Set();
    this.uuidPlayerMap = new Map();
  }

  add(player) {
    this.players.add(player);
    this.uuidPlayerMap.set(player.uuid, player);
  }

  remove(player) {
    this.players.delete(player);
    this.uuidPlayerMap.delete(player.uuid);
  }

  get(uuid) {
    return this.uuidPlayerMap.get(uuid);
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
}

export default PlayerCollection;
