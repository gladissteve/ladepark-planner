import { eventBus } from './EventBus.js';
import { CORE_EVENTS } from './events.js';
import { CURRENT_SCHEMA_VERSION } from './ProjectManager.js';

const PROJECT_KEY_PREFIX = 'planner:project:';
const INDEX_KEY = 'planner:projects:index';

class LocalStorageAdapter {
  async getItem(key) {
    return localStorage.getItem(key);
  }

  async setItem(key, value) {
    localStorage.setItem(key, value);
  }

  async removeItem(key) {
    localStorage.removeItem(key);
  }
}

class Storage {
  #adapter;

  constructor(adapter = new LocalStorageAdapter()) {
    // Patch Modul 1: Adapter-Vertrag wird geprüft, statt bei fehlerhaftem
    // Adapter erst beim ersten Zugriff mit unklarer Fehlermeldung zu scheitern.
    if (
      typeof adapter?.getItem !== 'function' ||
      typeof adapter?.setItem !== 'function' ||
      typeof adapter?.removeItem !== 'function'
    ) {
      throw new Error('Ungültiger Storage-Adapter: getItem/setItem/removeItem müssen Funktionen sein');
    }
    this.#adapter = adapter;
  }

  async #readIndex() {
    let raw;
    try {
      raw = await this.#adapter.getItem(INDEX_KEY);
    } catch (error) {
      throw new Error(`Storage: Fehler beim Lesen des Projekt-Index: ${error.message}`, { cause: error });
    }
    if (raw === null || raw === undefined) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(`Storage: Fehler beim Parsen des Projekt-Index: ${error.message}`, { cause: error });
    }
  }

  async #writeIndex(index) {
    let serialized;
    try {
      serialized = JSON.stringify(index);
    } catch (error) {
      throw new Error(`Storage: Fehler beim Serialisieren des Projekt-Index: ${error.message}`, { cause: error });
    }
    try {
      await this.#adapter.setItem(INDEX_KEY, serialized);
    } catch (error) {
      throw new Error(`Storage: Fehler beim Schreiben des Projekt-Index: ${error.message}`, { cause: error });
    }
  }

  async saveProject(projectData) {
    if (
      projectData === null ||
      typeof projectData !== 'object' ||
      typeof projectData.id !== 'string' ||
      projectData.id.length === 0
    ) {
      throw new Error('Storage.saveProject: projectData muss ein Objekt mit nicht-leerer id sein');
    }

    let serialized;
    try {
      serialized = JSON.stringify(projectData);
    } catch (error) {
      throw new Error(`Storage.saveProject: Fehler beim Serialisieren: ${error.message}`, { cause: error });
    }
    try {
      await this.#adapter.setItem(`${PROJECT_KEY_PREFIX}${projectData.id}`, serialized);
    } catch (error) {
      throw new Error(`Storage.saveProject: Fehler beim Schreiben: ${error.message}`, { cause: error });
    }

    const index = await this.#readIndex();
    const entry = {
      id: projectData.id,
      name: projectData.name,
      updatedAt: projectData.updatedAt,
      schemaVersion: projectData.schemaVersion
    };
    const existingIndex = index.findIndex((item) => item.id === projectData.id);
    if (existingIndex === -1) {
      index.push(entry);
    } else {
      index[existingIndex] = entry;
    }
    await this.#writeIndex(index);

    eventBus.emit(CORE_EVENTS.PROJECT_SAVED, { id: projectData.id });
  }

  async loadProject(id) {
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error('Storage.loadProject: id muss ein nicht-leerer String sein');
    }
    let raw;
    try {
      raw = await this.#adapter.getItem(`${PROJECT_KEY_PREFIX}${id}`);
    } catch (error) {
      throw new Error(`Storage.loadProject: Fehler beim Lesen: ${error.message}`, { cause: error });
    }
    if (raw === null || raw === undefined) {
      throw new Error(`Storage.loadProject: Kein Projekt mit id "${id}" gefunden`);
    }
    let projectData;
    try {
      projectData = JSON.parse(raw);
    } catch (error) {
      throw new Error(`Storage.loadProject: Fehler beim Parsen: ${error.message}`, { cause: error });
    }
    if (projectData.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      return this.migrateProject(projectData.schemaVersion, CURRENT_SCHEMA_VERSION, projectData);
    }
    return projectData;
  }

  async listProjects() {
    return this.#readIndex();
  }

  async deleteProject(id) {
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error('Storage.deleteProject: id muss ein nicht-leerer String sein');
    }
    try {
      await this.#adapter.removeItem(`${PROJECT_KEY_PREFIX}${id}`);
    } catch (error) {
      throw new Error(`Storage.deleteProject: Fehler beim Löschen: ${error.message}`, { cause: error });
    }
    const index = await this.#readIndex();
    const filtered = index.filter((item) => item.id !== id);
    await this.#writeIndex(filtered);
  }

  async migrateProject(fromVersion, toVersion, projectData) {
    if (fromVersion === toVersion) {
      return projectData;
    }
    throw new Error(`Keine Migration von ${fromVersion} nach ${toVersion} implementiert`);
  }
}

export { Storage, LocalStorageAdapter };
