
class ProjectCollection {
  constructor() {
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

  getOverview() {
    const projectsOverview = [];

    this.projects.forEach(project => {
      const overview = project.getOverview();
      projectsOverview.push(overview);
    });

    return projectsOverview;
  }

}

export default ProjectCollection;
