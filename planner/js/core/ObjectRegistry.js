class ObjectRegistry {
  #instances = new Map();

  register(key, value) {
    if (typeof key !== 'string' || key.length === 0) {
      throw new Error('ObjectRegistry.register: key muss ein nicht-leerer String sein');
    }
    if (this.#instances.has(key)) {
      throw new Error(`ObjectRegistry.register: key "${key}" ist bereits registriert`);
    }
    this.#instances.set(key, value);
  }

  get(key) {
    if (!this.#instances.has(key)) {
      throw new Error(`ObjectRegistry.get: kein Eintrag für key "${key}" registriert`);
    }
    return this.#instances.get(key);
  }

  has(key) {
    return this.#instances.has(key);
  }

  unregister(key) {
    this.#instances.delete(key);
  }
}

export const registry = new ObjectRegistry();
export { ObjectRegistry };
