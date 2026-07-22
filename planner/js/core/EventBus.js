class EventBus {
  #handlers = new Map();

  on(eventName, handler) {
    if (typeof eventName !== 'string' || eventName.length === 0) {
      throw new Error('EventBus.on: eventName muss ein nicht-leerer String sein');
    }
    if (typeof handler !== 'function') {
      throw new Error('EventBus.on: handler muss eine Funktion sein');
    }
    if (!this.#handlers.has(eventName)) {
      this.#handlers.set(eventName, new Set());
    }
    this.#handlers.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    if (typeof eventName !== 'string' || eventName.length === 0) {
      throw new Error('EventBus.off: eventName muss ein nicht-leerer String sein');
    }
    if (typeof handler !== 'function') {
      throw new Error('EventBus.off: handler muss eine Funktion sein');
    }
    const handlers = this.#handlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.#handlers.delete(eventName);
      }
    }
  }

  emit(eventName, payload) {
    if (typeof eventName !== 'string' || eventName.length === 0) {
      throw new Error('EventBus.emit: eventName muss ein nicht-leerer String sein');
    }
    const handlers = this.#handlers.get(eventName);
    if (!handlers) {
      return;
    }
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (error) {
        // R13: strukturiertes Logging — Event-Name und Fehlerobjekt getrennt
        // maschinenlesbar, kein zusammengesetzter String.
        console.error({ event: eventName, error });
      }
    }
  }
}

export const eventBus = new EventBus();
export { EventBus };
