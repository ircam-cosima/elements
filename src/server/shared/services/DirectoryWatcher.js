import { Service, serviceManager } from 'soundworks/server';
import watch from 'node-watch';
import fs from 'fs';
import path from 'path';
import klawSync from 'klaw-sync';
import debounce from 'lodash.debounce';

const SERVICE_ID = 'service:directory-watcher';

// supported media formats + json
// https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats
const regexp = /\.(wav|mp3)$/i;

class DirectoryWatcher extends Service {
  constructor(options) {
    super(SERVICE_ID, options);

    const defaults = {
      publicDirectory: 'public',
      watchedDirectory: 'sounds',
    };

    this.list = new Set();

    this.configure(defaults);
  }

  configure(options) {
    super.configure(options);
  }

  start() {
    super.start();

    const cwd = process.cwd();
    const publicDirectory = path.join(cwd, this.options.publicDirectory);
    const soundFilesPath = path.join(publicDirectory, this.options.watchedDirectory);

    // init with existing files
    const files = klawSync(soundFilesPath, { nodir: true, recursive: true });

    files
      .filter(file => regexp.test(file.path)) // only
      .map(file => path.relative(publicDirectory, file.path)) // public relative
      .forEach(uri => this.list.add(uri));

    const updateCallback = debounce(() => {
      this.emit('update', this.getList());
    }, { wait: 100 });

    // listen for updates
    watch(soundFilesPath, { encoding: 'buffer', recursive: true }, (eventType, filename) => {
      filename = filename.toString();

      if (!regexp.test(filename))
        return;

      const uri = path.relative(publicDirectory, filename);

      switch (eventType) {
        case 'update':
          this.list.add(uri);
          break;
        case 'remove':
          this.list.delete(uri);
          break;
      }

      updateCallback();
    });

    this.ready();
  }

  getList() {
    const list = Array.from(this.list);
    return list;
  }
}

serviceManager.register(SERVICE_ID, DirectoryWatcher);

export default DirectoryWatcher;
