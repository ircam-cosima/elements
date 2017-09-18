
const projectManager = {
  projectUsersMap: new Map(),

  addProject(project) {
    const users = {
      designer: null,
      players: new Set(),
    };

    this.projectUsersMap.set(project, users);
  },

  // should be cleaned from outside
  deleteProject(project) {
    // @todo - check if users
    this.projectUsersMap.delete(project);
  },

  getUsers(project) {
    return this.projectUserMap.get(project);
  },

  addDesigner(project, client) {
    if (!this.projectUsersMap.has(project))
      this.addProject(project);

    const users = this.projectUsersMap.get(project);
    users.designer = client;
  },

  removeDesigner(project, client) {
    if (!this.projectUsersMap.has(project))
      this.addProject(project);

    const users = this.projectUsersMap.get(project);
    users.designer = null;
  },

  addPlayer(project, client) {
    if (!this.projectUsersMap.has(project))
      this.addProject(project);

    const users = this.projectUsersMap.get(project);
    users.players.add(client);
  },

  removePlayer(project, client) {
    if (!this.projectUsersMap.has(project))
      this.addProject(project);

    const users = this.projectUsersMap.get(project);
    users.players.delete(client);
  },
};

export default projectManager;

// filter by project
// associate a designer and its players

