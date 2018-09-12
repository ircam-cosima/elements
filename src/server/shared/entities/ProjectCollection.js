
class ProjectCollection {
  constructor(projectPresets) {
    this.projects = new Set();
    this.uuidProjectMap = new Map();
  }

  add(project) {
    this.projects.add(project);
    this.uuidProjectMap.set(project.uuid, project);
  }

  remove(project) {
    this.projects.delete(project);
    this.uuidProjectMap.delete(project.uuid, project);
  }

  get(uuid) {
    return this.uuidProjectMap.get(uuid);
  }

  getByName(name) {
    let project = null;

    this.projects.forEach(_project => {
      if (_project.params.name === name)
        project = _project;
    });

    return project;
  }

  getAll() {
    return Array.from(this.projects);
  }

  /**
   * Return an overview of the projects
   * @return Array<Object<uuid, name>>
   */
  overview() {
    const collectionOverview = [];

    this.projects.forEach(project => {
      const overview = project.overview();
      collectionOverview.push(overview);
    });

    return collectionOverview;
  }

  /**
   * Returns all informations of all projects and related clients
   */
  serialize() {
    const serializedCollection = [];

    this.projects.forEach(project => {
      const serializedProject = project.serialize();
      serializedCollection.push(serializedProject);
    });

    return serializedCollection;
  }

  getParams() {}
}

export default ProjectCollection;
