import { STANDARDS_EVENTS } from './events.js';

// Interne, austauschbare Ladeimplementierung (R16): die öffentliche API
// dieses Moduls bleibt stabil, auch wenn der Bezugsweg der Standarddaten
// sich künftig ändert (z. B. anderes Backend statt einer statischen Datei).
// Relativ zur Moduldatei aufgelöst (nicht zur Host-Seite), damit der Pfad
// unabhängig davon funktioniert, von wo aus index.html geladen wird.
const STANDARDS_URL = new URL('../../data/standards.json', import.meta.url);

const REQUIRED_OBJECT_FIELDS = ['assetTypes', 'cables', 'chargerTypes', 'materials'];
const REQUIRED_STRING_FIELDS = ['version', 'updated', 'author'];

class Standards {
  #eventBus;
  #loaded = false;
  #version = null;
  #updated = null;
  #author = null;
  #assetTypes = {};
  #cables = {};
  #chargerTypes = {};
  #materials = {};
  #rules = [];

  constructor(eventBus) {
    if (!eventBus || typeof eventBus.emit !== 'function' || typeof eventBus.on !== 'function') {
      throw new Error('Standards: eventBus muss ein gültiger EventBus mit emit/on sein');
    }
    this.#eventBus = eventBus;
  }

  async #fetchStandardsData() {
    let response;
    try {
      response = await fetch(STANDARDS_URL);
    } catch (error) {
      throw new Error(`Standards: Fehler beim Laden von data/standards.json: ${error.message}`, { cause: error });
    }
    if (!response.ok) {
      throw new Error(`Standards: Fehler beim Laden von data/standards.json: HTTP ${response.status} ${response.statusText}`);
    }
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(`Standards: Fehler beim Parsen von data/standards.json: ${error.message}`, { cause: error });
    }
    return data;
  }

  #validateStandardsData(data) {
    if (data === null || typeof data !== 'object') {
      throw new Error('Standards: standards.json muss ein Objekt sein');
    }
    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof data[field] !== 'string' || data[field].length === 0) {
        throw new Error(`Standards: Pflichtfeld "${field}" fehlt oder ist kein nicht-leerer String in standards.json`);
      }
    }
    for (const field of REQUIRED_OBJECT_FIELDS) {
      if (data[field] === null || typeof data[field] !== 'object' || Array.isArray(data[field])) {
        throw new Error(`Standards: Pflichtfeld "${field}" fehlt oder ist kein Objekt in standards.json`);
      }
    }
    if (!Array.isArray(data.rules)) {
      throw new Error('Standards: Pflichtfeld "rules" fehlt oder ist kein Array in standards.json');
    }
  }

  #assertLoaded() {
    if (!this.#loaded) {
      throw new Error("Standards sind noch nicht geladen. Bitte auf das Event 'standards:loaded' warten oder Standards.reload() aufrufen.");
    }
  }

  #assertCode(code, methodName) {
    if (typeof code !== 'string' || code.length === 0) {
      throw new Error(`Standards.${methodName}: code muss ein nicht-leerer String sein`);
    }
  }

  #getEntry(collection, collectionName, code, methodName) {
    this.#assertLoaded();
    this.#assertCode(code, methodName);
    const entry = collection[code];
    if (!entry) {
      throw new Error(`Standards.${methodName}: Unbekannter Code "${code}" in ${collectionName}`);
    }
    return structuredClone(entry);
  }

  #getAllEntries(collection) {
    this.#assertLoaded();
    return Object.values(collection).map((entry) => structuredClone(entry));
  }

  isLoaded() {
    return this.#loaded;
  }

  getVersion() {
    this.#assertLoaded();
    return this.#version;
  }

  getUpdated() {
    this.#assertLoaded();
    return this.#updated;
  }

  getAuthor() {
    this.#assertLoaded();
    return this.#author;
  }

  getAssetType(code) {
    return this.#getEntry(this.#assetTypes, 'assetTypes', code, 'getAssetType');
  }

  getAllAssetTypes() {
    return this.#getAllEntries(this.#assetTypes);
  }

  getCableType(code) {
    return this.#getEntry(this.#cables, 'cables', code, 'getCableType');
  }

  getAllCableTypes() {
    return this.#getAllEntries(this.#cables);
  }

  getChargerType(code) {
    return this.#getEntry(this.#chargerTypes, 'chargerTypes', code, 'getChargerType');
  }

  getAllChargerTypes() {
    return this.#getAllEntries(this.#chargerTypes);
  }

  getMaterial(code) {
    return this.#getEntry(this.#materials, 'materials', code, 'getMaterial');
  }

  getAllMaterials() {
    return this.#getAllEntries(this.#materials);
  }

  getRules() {
    this.#assertLoaded();
    return structuredClone(this.#rules);
  }

  async reload() {
    try {
      const data = await this.#fetchStandardsData();
      this.#validateStandardsData(data);
      this.#version = data.version;
      this.#updated = data.updated;
      this.#author = data.author;
      this.#assetTypes = data.assetTypes;
      this.#cables = data.cables;
      this.#chargerTypes = data.chargerTypes;
      this.#materials = data.materials;
      this.#rules = data.rules;
      this.#loaded = true;
      this.#eventBus.emit(STANDARDS_EVENTS.LOADED, { version: this.#version });
    } catch (error) {
      this.#loaded = false;
      this.#eventBus.emit(STANDARDS_EVENTS.LOAD_ERROR, { error: error.message });
      throw error;
    }
  }
}

export { Standards };
