import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const basePath = path.join(cwd, 'db');
const filename = path.join(basePath, 'designers.json');

// simple abstraction that could be a starting point
// for a database or something more elaborated
const projectStore = {
  projects: new Set(),

  init() {
    if (!fs.existsSync(basePath))
      fs.mkdirSync(basePath);

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename);

      try {
        const json = JSON.parse(content);
        json.forEach((project) => this.projects.add(project));
      } catch(err) {
        // empty json, do nothing
      }
    }
  },

  persist(project) {
    this.projects.add(project);

    const json = JSON.stringify(Array.from(this.projects), null, 2);
    fs.writeFileSync(filename, json, 'utf8');
  },

  delete(project) {
    this.projects.delete(project);

    const json = JSON.stringify(Array.from(this.projects), null, 2);
    fs.writeFileSync(filename, json, 'utf8');
  },

  getByUuid(uuid) {
    let _project = null;

    this.projects.forEach(project => {
      if (project.uuid === uuid)
        _project = project;
    });

    return _project;
  },

  getByName(projectName) {
    let _project = null;

    this.projects.forEach(project => {
      if (project.name === projectName)
        _project = project;
    });

    return _project;
  },
};

projectStore.init();

export default projectStore;
