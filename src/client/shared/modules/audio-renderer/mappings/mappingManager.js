const mappingManager = {
  _mappings: new Map(),

  register(moduleId, ctor) {
    this._mappings.set(moduleId, ctor);
  },

  get(moduleId, ctor) {
    return this._mappings.get(moduleId);
  },
};

export default mappingManager;
