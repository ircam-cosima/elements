import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const basePath = path.join(cwd, 'db');

// simple abstraction that could be a starting point
// for a database or something more elaborated
const designerStore = {
  connectedUsers: new Set(),
  persistedUsers: new Set(),

  init() {
    if (!fs.existsSync(basePath))
      fs.mkdirSync(basePath);

    const filename = path.join(basePath, 'designers.json');

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);
      const json = JSON.parse(content);

      json.forEach((user) => this.persistedUsers.add(user));
    }
  },

  persist(user) {
    this.persistedUsers.add(user);

    const filename = path.join(basePath, 'designers.json');
    const json = JSON.stringify(Array.from(this.persistedUsers), null, 2);
    fs.writeFileSync(filename, json, 'utf8');
  },

  delete(user) {
    this.persistedUsers.delete(user);

    const filename = path.join(basePath, 'designers.json');
    const json = JSON.stringify(Array.from(this.persistedUsers), null, 2);
    fs.writeFileSync(filename, json, 'utf8');
  },

  add(user) {
    this.connectedUsers.add(user);
  },

  remove(user) {
    this.connectedUsers.forEach(connectedUser => {
      if (user.name === connectedUser.name && user.uuid === connectedUser.uuid)
        this.connectedUsers.delete(connectedUser);
    });
  },

  getList() {
    const list = new Set();

    this.persistedUsers.forEach(user => list.add(user));
    this.connectedUsers.forEach(user => list.add(user));

    return list;
  },

  //
  getConnectedUserByUsername(username) {
    let user = null;

    this.connectedUsers.forEach(connectedUser => {
      if (connectedUser.name === username)
        user = connectedUser;
    });

    return user;
  },

  getPersistedUserByUsername(username) {
    let user = null;

    this.persistedUsers.forEach(persistedUser => {
      if (persistedUser.name === username)
        user = persistedUser;
    });

    return user;
  },

  // save user in some json that should be loaded by the designer experience
  // and / or given to the login service
  // persist(user) {}


};

designerStore.init();

export default designerStore;
