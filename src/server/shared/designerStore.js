import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const basePath = path.join(cwd, 'db');

// simple abstraction that could be a starting point
// for a database or something more elaborated
const designerStore = {
  users: new Set(),

  init() {
    if (!fs.existsSync(basePath))
      fs.mkdirSync(basePath);

    const filename = path.join(basePath, 'designers.json');

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);

      try {
        const json = JSON.parse(content);
        json.forEach((user) => this.users.add(user));
      } catch(err) {
        // empty json, do nothing
      }
    }
  },

  persist(user) {
    this.users.add(user);

    const filename = path.join(basePath, 'designers.json');
    const json = JSON.stringify(Array.from(this.users), null, 2);
    fs.writeFileSync(filename, json, 'utf8');
  },

  delete(user) {
    this.users.delete(user);

    const filename = path.join(basePath, 'designers.json');
    const json = JSON.stringify(Array.from(this.users), null, 2);
    fs.writeFileSync(filename, json, 'utf8');
  },

  getByUuid(uuid) {
    let _user = null;

    this.users.forEach(user => {
      if (user.uuid === uuid)
        _user = user;
    });

    return _user;
  },

  getByUsername(username) {
    let _user = null;

    this.users.forEach(user => {
      if (user.name === username)
        _user = user;
    });

    return _user;
  },
};

designerStore.init();

export default designerStore;
