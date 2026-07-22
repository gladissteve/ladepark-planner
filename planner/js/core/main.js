import { eventBus } from './EventBus.js';
import { registry } from './ObjectRegistry.js';
import { DOM } from './DOM.js';
import { CORE_EVENTS } from './events.js';
import { MODULE_MANIFEST } from './module-manifest.js';
import { ProjectManager } from './ProjectManager.js';
import { Storage } from './Storage.js';

async function ensureProject(projectManager, storage) {
  try {
    const projects = await storage.listProjects();
    if (projects.length > 0) {
      const latest = projects.reduce((newest, current) =>
        new Date(current.updatedAt) > new Date(newest.updatedAt) ? current : newest
      );
      const projectData = await storage.loadProject(latest.id);
      projectManager.loadProjectData(projectData);
      return;
    }
  } catch (error) {
    // Konservative Entscheidung: Ein Fehler beim Laden bestehender Projekte
    // darf den Start nicht verhindern — strukturiert protokollieren und
    // stattdessen mit einem neuen Standardprojekt fortfahren.
    console.error({ phase: 'ensureProject:load', error });
  }
  projectManager.createNewProject('Neues Projekt');
  await storage.saveProject(projectManager.toJSON());
}

async function loadManifestModules() {
  for (const entry of MODULE_MANIFEST) {
    try {
      const module = await import(entry.entry);
      if (typeof module.init === 'function') {
        await module.init();
      }
    } catch (error) {
      console.error({ module: entry.name, error });
    }
  }
}

async function bootstrap() {
  const projectManager = new ProjectManager();
  const storage = new Storage();

  registry.register('eventBus', eventBus);
  registry.register('projectManager', projectManager);
  registry.register('storage', storage);

  // Patch Modul 1: appRoot ist kein Software-Instanz-Objekt, sondern ein
  // DOM-Element — bleibt lokale Variable, keine Registrierung in registry,
  // und wird auch nicht über den EventBus verteilt (R9/R13: EventBus dient
  // der Modul-Entkopplung, nicht der DOM-Referenz-Weitergabe).
  DOM.get('app-root');

  await ensureProject(projectManager, storage);
  await loadManifestModules();

  eventBus.emit(CORE_EVENTS.APP_READY, { project: projectManager.getProject() });
}

bootstrap().catch((error) => {
  console.error({ phase: 'bootstrap', error });
});
