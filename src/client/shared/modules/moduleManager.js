
const moduleManager = {
  modules: new Map(),

  register(moduleId, ctor) {
    this.modules.set(moduleId, ctor);
  },

  get(moduleId) {
    const ctor = this.modules.get(moduleId);
    return ctor;
  },
}

export default moduleManager;
