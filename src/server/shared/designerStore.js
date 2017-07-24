// simple abstraction that could be a starting point
// for a database or something more elaborated
const designerStore = {
  users: new Set(),

  add(user) {
    this.users.add(user);
  },

  delete(user) {
    this.users.delete(user);
  },

  // save user in some json that should be loaded by the designer experience
  // and / or given to the login service
  // persist(user) {}

  getList() {
    return this.users;
  },
};

export default designerStore;
