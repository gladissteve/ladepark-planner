import { eventBus } from './EventBus.js';
import { CORE_EVENTS } from './events.js';

export const CURRENT_SCHEMA_VERSION = '1.0.0';

const COLLECTION_NAMES = ['assets', 'cables', 'routes', 'materials', 'layers'];
const PREFIX_PATTERN = /^[a-z]{2,20}$/;

class ProjectManager {
  #project = null;

  #cloneOrThrow(value, context) {
    // Patch Modul 1: structuredClone-Fehler werden nie verschluckt,
    // sondern mit Kontext (betroffene Operation) erneut geworfen.
    try {
      return structuredClone(value);
    } catch (error) {
      throw new Error(`ProjectManager: Fehler beim Kopieren (${context}): ${error.message}`, { cause: error });
    }
  }

  #assertProjectLoaded() {
    if (this.#project === null) {
      throw new Error('ProjectManager: Kein Projekt geladen');
    }
  }

  #assertCollectionName(name) {
    if (!COLLECTION_NAMES.includes(name)) {
      throw new Error(`ProjectManager: Unbekannte Collection "${name}". Gültige Collections: ${COLLECTION_NAMES.join(', ')}`);
    }
  }

  #isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  #deepMerge(target, patch) {
    // Nur einfache Objekte werden rekursiv gemischt (Geschwister-Felder
    // bleiben erhalten); Arrays und alle anderen Werte werden komplett
    // ersetzt, nie elementweise gemischt.
    for (const key of Object.keys(patch)) {
      const patchValue = patch[key];
      const targetValue = target[key];
      if (this.#isPlainObject(targetValue) && this.#isPlainObject(patchValue)) {
        this.#deepMerge(targetValue, patchValue);
      } else {
        target[key] = patchValue;
      }
    }
    return target;
  }

  createNewProject(name) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('ProjectManager.createNewProject: name muss ein nicht-leerer String sein');
    }
    const now = new Date().toISOString();
    this.#project = {
      id: this.generateId('project'),
      name,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
      settings: {},
      standardsVersion: null,
      layers: [],
      assets: [],
      cables: [],
      routes: [],
      materials: []
    };
    const projectCopy = this.getProject();
    eventBus.emit(CORE_EVENTS.PROJECT_CREATED, projectCopy);
    return projectCopy;
  }

  loadProjectData(projectData) {
    if (projectData === null || typeof projectData !== 'object') {
      throw new Error('ProjectManager.loadProjectData: projectData muss ein Objekt sein');
    }
    const requiredFields = [
      'id', 'name', 'schemaVersion', 'createdAt', 'updatedAt',
      'settings', 'standardsVersion', 'layers', 'assets', 'cables', 'routes', 'materials'
    ];
    for (const field of requiredFields) {
      if (!(field in projectData)) {
        throw new Error(`ProjectManager.loadProjectData: Pflichtfeld "${field}" fehlt in projectData`);
      }
    }
    for (const collectionName of COLLECTION_NAMES) {
      if (!Array.isArray(projectData[collectionName])) {
        throw new Error(`ProjectManager.loadProjectData: "${collectionName}" muss ein Array sein`);
      }
    }
    this.#project = this.#cloneOrThrow(projectData, 'loadProjectData');
    eventBus.emit(CORE_EVENTS.PROJECT_LOADED, this.getProject());
  }

  getProject() {
    this.#assertProjectLoaded();
    return this.#cloneOrThrow(this.#project, 'getProject');
  }

  generateId(prefix) {
    if (typeof prefix !== 'string' || !PREFIX_PATTERN.test(prefix)) {
      throw new Error(
        `ProjectManager.generateId: prefix muss /^[a-z]{2,20}$/ entsprechen ` +
        `(nur Kleinbuchstaben, 2-20 Zeichen). Beispiele: project, asset, cable, layer, material, route. ` +
        `Erhalten: ${JSON.stringify(prefix)}`
      );
    }
    return `${prefix}-${crypto.randomUUID()}`;
  }

  getCollection(name) {
    this.#assertProjectLoaded();
    this.#assertCollectionName(name);
    return this.#cloneOrThrow(this.#project[name], `getCollection(${name})`);
  }

  getFromCollection(name, id) {
    this.#assertProjectLoaded();
    this.#assertCollectionName(name);
    const item = this.#project[name].find((entry) => entry.id === id);
    if (!item) {
      throw new Error(`ProjectManager.getFromCollection: Kein Eintrag mit id "${id}" in Collection "${name}" gefunden`);
    }
    return this.#cloneOrThrow(item, `getFromCollection(${name}, ${id})`);
  }

  addToCollection(name, item) {
    this.#assertProjectLoaded();
    this.#assertCollectionName(name);
    if (item === null || typeof item !== 'object' || typeof item.id !== 'string' || item.id.length === 0) {
      throw new Error('ProjectManager.addToCollection: item muss ein Objekt mit nicht-leerer item.id sein');
    }
    const stored = this.#cloneOrThrow(item, `addToCollection(${name})`);
    this.#project[name].push(stored);
    this.#project.updatedAt = new Date().toISOString();
    eventBus.emit(CORE_EVENTS.PROJECT_CHANGED, {
      collection: name,
      action: 'add',
      item: this.#cloneOrThrow(stored, `addToCollection(${name}) emit`)
    });
  }

  removeFromCollection(name, id) {
    this.#assertProjectLoaded();
    this.#assertCollectionName(name);
    const index = this.#project[name].findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error(`ProjectManager.removeFromCollection: Kein Eintrag mit id "${id}" in Collection "${name}" gefunden`);
    }
    this.#project[name].splice(index, 1);
    this.#project.updatedAt = new Date().toISOString();
    eventBus.emit(CORE_EVENTS.PROJECT_CHANGED, { collection: name, action: 'remove', id });
  }

  updateInCollection(name, id, patch) {
    this.#assertProjectLoaded();
    this.#assertCollectionName(name);
    if (patch === null || typeof patch !== 'object') {
      throw new Error('ProjectManager.updateInCollection: patch muss ein Objekt sein');
    }
    const item = this.#project[name].find((entry) => entry.id === id);
    if (!item) {
      throw new Error(`ProjectManager.updateInCollection: Kein Eintrag mit id "${id}" in Collection "${name}" gefunden`);
    }
    const patchCopy = this.#cloneOrThrow(patch, `updateInCollection(${name}, ${id})`);
    this.#deepMerge(item, patchCopy);
    this.#project.updatedAt = new Date().toISOString();
    eventBus.emit(CORE_EVENTS.PROJECT_CHANGED, {
      collection: name,
      action: 'update',
      id,
      patch: this.#cloneOrThrow(patchCopy, `updateInCollection(${name}, ${id}) emit`)
    });
  }

  getSetting(path) {
    this.#assertProjectLoaded();
    if (typeof path !== 'string' || path.length === 0) {
      throw new Error('ProjectManager.getSetting: path muss ein nicht-leerer String sein');
    }
    const settingsCopy = this.#cloneOrThrow(this.#project.settings, 'getSetting');
    const segments = path.split('.');
    let current = settingsCopy;
    for (const segment of segments) {
      if (current === null || typeof current !== 'object' || !(segment in current)) {
        return undefined;
      }
      current = current[segment];
    }
    return current;
  }

  setSetting(path, value) {
    this.#assertProjectLoaded();
    if (typeof path !== 'string' || path.length === 0) {
      throw new Error('ProjectManager.setSetting: path muss ein nicht-leerer String sein');
    }
    const segments = path.split('.');
    let current = this.#project.settings;
    for (let i = 0; i < segments.length - 1; i += 1) {
      const segment = segments[i];
      if (current[segment] === null || typeof current[segment] !== 'object') {
        current[segment] = {};
      }
      current = current[segment];
    }
    current[segments[segments.length - 1]] = value;
    this.#project.updatedAt = new Date().toISOString();
  }

  setStandardsVersion(version) {
    this.#assertProjectLoaded();
    if (typeof version !== 'string' || version.length === 0) {
      throw new Error('ProjectManager.setStandardsVersion: version muss ein nicht-leerer String sein');
    }
    this.#project.standardsVersion = version;
    this.#project.updatedAt = new Date().toISOString();
  }

  getStandardsVersion() {
    this.#assertProjectLoaded();
    return this.#project.standardsVersion;
  }

  toJSON() {
    this.#assertProjectLoaded();
    return this.#cloneOrThrow(this.#project, 'toJSON');
  }
}

export { ProjectManager };
