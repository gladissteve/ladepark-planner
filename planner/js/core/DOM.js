// Einziger Ort im gesamten Projekt mit Zugriff auf das globale
// `document`-Objekt (R14). Kein anderes Modul darf getElementById,
// querySelector, querySelectorAll, createElement o. ä. direkt aufrufen.

const idCache = new Map();

export const DOM = {
  get(id) {
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error('DOM.get: id muss ein nicht-leerer String sein');
    }
    if (idCache.has(id)) {
      return idCache.get(id);
    }
    // Harte Referenz, absichtlich strikt: einmal aufgelöste Elemente
    // bleiben im Cache, auch wenn sie später aus dem DOM entfernt würden.
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`DOM.get: Kein Element mit id "${id}" gefunden`);
    }
    idCache.set(id, element);
    return element;
  },

  query(selector, root = document) {
    if (typeof selector !== 'string' || selector.length === 0) {
      throw new Error('DOM.query: selector muss ein nicht-leerer String sein');
    }
    return root.querySelector(selector);
  },

  queryAll(selector, root = document) {
    if (typeof selector !== 'string' || selector.length === 0) {
      throw new Error('DOM.queryAll: selector muss ein nicht-leerer String sein');
    }
    return Array.from(root.querySelectorAll(selector));
  },

  create(tagName, options = {}) {
    if (typeof tagName !== 'string' || tagName.length === 0) {
      throw new Error('DOM.create: tagName muss ein nicht-leerer String sein');
    }
    const element = document.createElement(tagName);
    const { className, attributes, textContent } = options;
    if (className !== undefined) {
      element.className = className;
    }
    if (attributes !== undefined) {
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
      }
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }
};
