
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

  /**
   * @return Array
   */
  getList() {
    return Array.from(this.players);
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
