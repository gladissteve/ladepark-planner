import { STANDARDS_EVENTS } from './events.js';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const OPERATORS = new Set(['>', '>=', '<', '<=', '==', '!=']);
const SEVERITIES = new Set(['warning', 'error']);

const TOP_LEVEL_REQUIRED_FIELDS = [
  'version', 'updated', 'author', 'assetTypes', 'cables', 'chargerTypes', 'materials', 'rules'
];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneOrThrow(value, context) {
  try {
    return structuredClone(value);
  } catch (error) {
    throw new Error(`Standards: Fehler beim Kopieren (${context}): ${error.message}`, { cause: error });
  }
}

function assertSlugKey(key, category) {
  if (!SLUG_PATTERN.test(key)) {
    throw new Error(`Standards: Ungültiger Slug "${key}" in "${category}" (erwartet ^[a-z0-9]+(-[a-z0-9]+)*$)`);
  }
}

function assertRequiredFields(entry, requiredFields, category, key) {
  for (const field of requiredFields) {
    if (!(field in entry)) {
      throw new Error(`Standards: Pflichtfeld "${field}" fehlt in "${category}.${key}"`);
    }
  }
}

function assertCableReference(value, category, key, fieldName) {
  if (value === null || value === undefined) {
    return;
  }
  if (!isPlainObject(value) || typeof value.cableId !== 'string' || !('crossSection' in value)) {
    throw new Error(
      `Standards: "${fieldName}" in "${category}.${key}" muss null oder {cableId, crossSection} sein`
    );
  }
}

function assertCrossSections(crossSections, category, key) {
  if (!Array.isArray(crossSections) || crossSections.length === 0) {
    throw new Error(`Standards: "crossSections" in "${category}.${key}" muss ein nicht-leeres Array sein`);
  }
  for (const entry of crossSections) {
    if (!isPlainObject(entry) || !('crossSection' in entry) || !('maxLength' in entry)) {
      throw new Error(`Standards: Ungültiger crossSections-Eintrag in "${category}.${key}"`);
    }
  }
}

function validateSlugKeyedCategory(data, category, requiredFields, extraValidator) {
  const value = data[category];
  if (!isPlainObject(value)) {
    throw new Error(`Standards: "${category}" muss ein Object sein`);
  }
  for (const [key, entry] of Object.entries(value)) {
    assertSlugKey(key, category);
    if (!isPlainObject(entry)) {
      throw new Error(`Standards: Eintrag "${category}.${key}" muss ein Object sein`);
    }
    assertRequiredFields(entry, requiredFields, category, key);
    if (entry.id !== key) {
      throw new Error(`Standards: "id" in "${category}.${key}" muss exakt dem Object-Key entsprechen`);
    }
    assertSlugKey(entry.id, category);
    if (extraValidator) {
      extraValidator(entry, category, key);
    }
  }
}

function validateRules(rules) {
  if (!Array.isArray(rules)) {
    throw new Error('Standards: "rules" muss ein Array sein');
  }
  for (const rule of rules) {
    if (!isPlainObject(rule)) {
      throw new Error('Standards: Ein Eintrag in "rules" muss ein Object sein');
    }
    assertRequiredFields(rule, ['id', 'field', 'op', 'value', 'severity', 'message'], 'rules', rule.id ?? '?');
    if (!OPERATORS.has(rule.op)) {
      throw new Error(`Standards: Ungültiger Operator "${rule.op}" in Regel "${rule.id}"`);
    }
    if (!SEVERITIES.has(rule.severity)) {
      throw new Error(`Standards: Ungültige severity "${rule.severity}" in Regel "${rule.id}"`);
    }
  }
}

function validateStructure(data) {
  if (!isPlainObject(data)) {
    throw new Error('Standards: Geladene Daten müssen ein Object sein');
  }
  for (const field of TOP_LEVEL_REQUIRED_FIELDS) {
    if (!(field in data)) {
      throw new Error(`Standards: Pflichtfeld "${field}" fehlt auf oberster Ebene`);
    }
  }

  validateSlugKeyedCategory(data, 'assetTypes', ['id', 'code', 'name', 'color'], (entry, category, key) => {
    assertCableReference(entry.defaultCable, category, key, 'defaultCable');
  });

  validateSlugKeyedCategory(data, 'cables', ['id', 'code', 'name', 'category', 'crossSections'], (entry, category, key) => {
    assertCrossSections(entry.crossSections, category, key);
  });

  validateSlugKeyedCategory(data, 'chargerTypes', ['id', 'code', 'name', 'powerKW', 'defaultCable'], (entry, category, key) => {
    assertCableReference(entry.defaultCable, category, key, 'defaultCable');
  });

  validateSlugKeyedCategory(data, 'materials', ['id', 'code', 'name', 'unit']);

  validateRules(data.rules);
}

function resolveFieldPath(context, fieldPath) {
  const segments = fieldPath.split('.');
  let current = context;
  for (const segment of segments) {
    if (current === null || typeof current !== 'object' || !(segment in current)) {
      return { found: false, value: undefined };
    }
    current = current[segment];
  }
  return { found: true, value: current };
}

function evaluateOperator(op, actual, expected) {
  switch (op) {
    case '>':
      return actual > expected;
    case '>=':
      return actual >= expected;
    case '<':
      return actual < expected;
    case '<=':
      return actual <= expected;
    case '==':
      return actual === expected;
    case '!=':
      return actual !== expected;
    default:
      // Unerreichbar, da validateRules() bereits gegen OPERATORS prüft.
      return false;
  }
}

class Standards {
  #data = null;
  #eventBus;

  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  async #fetchStandards() {
    let response;
    try {
      response = await fetch('data/standards.json');
    } catch (error) {
      throw new Error(`Standards: Netzwerkfehler beim Laden von data/standards.json: ${error.message}`, { cause: error });
    }
    if (!response.ok) {
      throw new Error(`Standards: data/standards.json konnte nicht geladen werden (HTTP ${response.status})`);
    }
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(`Standards: data/standards.json ist kein gültiges JSON: ${error.message}`, { cause: error });
    }
    validateStructure(data);
    return data;
  }

  async reload() {
    try {
      const data = await this.#fetchStandards();
      this.#data = data;
      this.#eventBus.emit(STANDARDS_EVENTS.LOADED, { version: this.#data.version });
    } catch (error) {
      this.#eventBus.emit(STANDARDS_EVENTS.LOAD_ERROR, { error });
      throw error;
    }
  }

  #assertLoaded() {
    if (this.#data === null) {
      throw new Error('Standards: Noch keine Standards geladen');
    }
  }

  #getEntry(category, id) {
    this.#assertLoaded();
    const entry = this.#data[category][id];
    if (!entry) {
      throw new Error(`Standards: Kein Eintrag mit id "${id}" in "${category}" gefunden`);
    }
    return cloneOrThrow(entry, `get(${category}, ${id})`);
  }

  #getEntries(category) {
    this.#assertLoaded();
    return cloneOrThrow(Object.values(this.#data[category]), `getAll(${category})`);
  }

  getAssetType(id) {
    return this.#getEntry('assetTypes', id);
  }

  getAssetTypes() {
    return this.#getEntries('assetTypes');
  }

  getCable(id) {
    return this.#getEntry('cables', id);
  }

  getCables() {
    return this.#getEntries('cables');
  }

  getCableCrossSection(id, crossSection) {
    this.#assertLoaded();
    const cable = this.#data.cables[id];
    if (!cable) {
      throw new Error(`Standards: Kein Kabeltyp mit id "${id}" gefunden`);
    }
    const variant = cable.crossSections.find((entry) => entry.crossSection === crossSection);
    if (!variant) {
      throw new Error(`Standards: Keine Querschnitt-Variante "${crossSection}" für Kabeltyp "${id}" gefunden`);
    }
    return cloneOrThrow({
      id: cable.id,
      code: cable.code,
      name: cable.name,
      category: cable.category,
      crossSection: variant.crossSection,
      maxLength: variant.maxLength
    }, `getCableCrossSection(${id}, ${crossSection})`);
  }

  getChargerType(id) {
    return this.#getEntry('chargerTypes', id);
  }

  getChargerTypes() {
    return this.#getEntries('chargerTypes');
  }

  getMaterial(id) {
    return this.#getEntry('materials', id);
  }

  getMaterials() {
    return this.#getEntries('materials');
  }

  getRules() {
    this.#assertLoaded();
    return cloneOrThrow(this.#data.rules, 'getRules');
  }

  validate(context) {
    this.#assertLoaded();
    const violations = [];
    for (const rule of this.#data.rules) {
      const { found, value } = resolveFieldPath(context, rule.field);
      if (!found) {
        continue;
      }
      if (evaluateOperator(rule.op, value, rule.value)) {
        violations.push(cloneOrThrow(rule, `validate(${rule.id})`));
      }
    }
    return violations;
  }

  getVersion() {
    this.#assertLoaded();
    return this.#data.version;
  }
}

export { Standards };
