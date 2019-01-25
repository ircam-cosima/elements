import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const cwd = process.cwd();
const applicationsPath = path.join(cwd, 'applications');

/**
 * Naive project persistance implementation.
 */
const projectStore = {
  configure(applicationName) {
    this.dbPath = path.join(applicationsPath, applicationName, 'db');

    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath);
    }
  },

  getFilename(uuid) {
    const filename = path.join(this.dbPath, `${uuid}.json`);

    return filename;
  },

  getList() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.dbPath, (err, files) => {
        if (err) {
          throw err;
        }

        const results = [];

        files.forEach((basename, index) => {
          if (path.extname(basename) === '.json') {
            const filename = path.join(this.dbPath, basename);
            const stats = fs.statSync(filename);
            // read one file
            if (!stats.isDirectory()) {
              try {
                const data = fs.readFileSync(filename, 'utf8');
                const projectData = JSON.parse(data);
                results.push(projectData);
              } catch(err) {
                console.error(chalk.yellow(`[Elements - db] Error reading project "${filename}"`));
              }
            }
          }

          if (index === files.length - 1) {
            resolve(results);
          }
        });
      });
    });
  },

  persist(project) {
    return new Promise((resolve, reject) => {
      const uuid = project.uuid;

      if (!uuid) {
        throw new Error(`projectDbMapper: Invalid project "${project.name}"`);
      }

      const filename = path.join(this.dbPath, `${uuid}.json`);

      try {
        const json = JSON.stringify(project, null, 2);
        fs.writeFileSync(filename, json, 'utf8');

        resolve(project);
      } catch(err) {
        console.error(chalk.yellow(`[Elements - db] Error persisting project "${project.name}"`));
      }
    });
  },

  delete(project) {
    return new Promise((resolve, reject) => {
      const uuid = project.uuid;

      if (!uuid) {
        throw new Error(`projectDbMapper: Invalid project "${project.name}"`);
      }

      const filename = path.join(this.dbPath, `${uuid}.json`);

      try {
        fs.unlink(filename);
        resolve(null);
      } catch(err) {
        throw err;
      }
    });
  },
};

export default projectStore;
