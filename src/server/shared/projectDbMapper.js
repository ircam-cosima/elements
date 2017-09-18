import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const basePath = path.join(cwd, 'db');
const filename = path.join(basePath, 'designers.json');

// simple abstraction that could be a starting point
// for a database or something more elaborated
const projectStore = {
  getList() {
    const projectList = new Set();

    if (!fs.existsSync(basePath))
      fs.mkdirSync(basePath);

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);

      try {
        const json = JSON.parse(content);
        json.forEach((project) => projectList.add(project));
      } catch(err) {
        // empty json, do nothing
      }
    }

    return projectList;
  },

  persist(projects) {
    const json = JSON.stringify(Array.from(projects), null, 2);
    fs.writeFileSync(filename, json, 'utf8');
  },
};

export default projectStore;
