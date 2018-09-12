import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const dbPath = path.join(cwd, 'db');

if (!fs.existsSync(dbPath))
  fs.mkdirSync(dbPath);

/**
 * Naive project persistance implementation.
 */
const projectStore = {
  configure(applicationName) {
    this.dbPath = path.join(dbPath, applicationName);

    if (!fs.existsSync(this.dbPath))
      fs.mkdirSync(this.dbPath);
  },

  getFilename(uuid) {
    const filename = path.join(this.dbPath, `${uuid}.json`);
    return filename;
  },

  getList() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.dbPath, (err, files) => {
        if (err)
          throw err;

        const promises = [];
        files.forEach(basename => {
          const filename = path.join(this.dbPath, basename);
          const stats = fs.statSync(filename)
          // read one file
          if (!stats.isDirectory()) {
            const promise = new Promise((resolve, reject) => {
              fs.readFile(filename, 'utf8', (err, data) => {
                if (err)
                  throw err;

                try {
                  const projectData = JSON.parse(data);
                  resolve(projectData);
                } catch(err) {
                  console.error(`Invalid project: ${filename} is not valid JSON`);
                }
              });
            });

            promises.push(promise);
          }
        });

        Promise.all(promises).then(results => {
          resolve(results)
        });
      });
    });
  },

  persist(projectData) {
    return new Promise((resolve, reject) => {
      const uuid = projectData.uuid;

      if (!uuid)
        throw new Error(`projectDbMapper: Invalid project "${project.name}"`);

      const filename = path.join(this.dbPath, `${uuid}.json`);

      try {
        const json = JSON.stringify(projectData, null, 2);

        fs.writeFile(filename, json, 'utf8', err => {
          if (err)
            throw err;

          resolve(projectData);
        });
      } catch(err) {
        throw new Error(`projectDbMapper: Invalid JSON of project "${project.name}"`);
      }
    });
  },

  delete(project) {
    return new Promise((resolve, reject) => {
      const uuid = project.uuid;

      if (!uuid)
        throw new Error(`projectDbMapper: Invalid project "${project.name}"`);

      const filename = path.join(this.dbPath, `${uuid}.json`);

      fs.unlink(filename, err => {
        if (err)
          throw err;

        resolve(null);
      });
    });
  },
};

export default projectStore;
