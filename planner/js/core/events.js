// Diese Datei enthält ausschließlich Core-Events. Spätere Module
// definieren eigene Event-Konstanten in einer eigenen events.js
// innerhalb ihres eigenen Bounded Context (z. B. js/assets/events.js,
// Präfix "assets:").
export const CORE_EVENTS = {
  PROJECT_CREATED: 'core:project-created',
  PROJECT_LOADED: 'core:project-loaded',
  PROJECT_SAVED: 'core:project-saved',
  PROJECT_CHANGED: 'core:project-changed',
  APP_READY: 'core:app-ready'
};
