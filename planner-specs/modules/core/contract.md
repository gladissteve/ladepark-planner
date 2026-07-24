STATUS: REVIEW
frozenAtCommit: n/a (REVIEW, wird beim Übergang zu FROZEN mit dem
Commit-Hash dieses Dokuments nachgetragen, siehe "Geklärte Fragen" unten)
frozenDate: n/a (REVIEW)

Hinweis (Architect, 2026-07-24, Sonderfall gemäß MIGRATION.md, Abschnitt
"Was sich für Modul 1 (Core) ändert" und ADR-010): Core (v1.0.0) ist seit
2026-07-23 bereits FROZEN in architecture/planner-registry.json
(frozenAtCommit d77d054, ADR-010) — dieser Freeze bleibt unangetastet
und wird durch diesen Contract NICHT neu aufgerollt. Dieser Contract
wird rückwirkend, reverse-engineered aus dem tatsächlichen Code (gelesen
gegen HEAD 937570a1778fc487c33dd3d736caf454838daecd, siehe ADR-021)
sowie der bereits registrierten publicApi erstellt — kein neuer
funktionaler Freeze, reine nachträgliche Dokumentation eines
bestehenden Zustands. Ob und mit welchem frozenAtCommit/frozenDate
DIESER Contract selbst durch den Modul-Lifecycle (DRAFT -> REVIEW ->
FROZEN) geführt wird, ist eine offene Rückfrage an den
Projektverantwortlichen (siehe Abschnitt "Offene Fragen" unten).

## Header

- **Module**: Core
- **Version**: 1.0.0
- **Requires**: keine
- **Registry-Key (R18)**: keiner — R18 gilt ausdrücklich nur für
  Feature-Module ("jedes Feature-Modul (alles außer Core)"). Core
  registriert stattdessen drei benannte Singleton-Instanzen direkt unter
  den in R19 genannten Keys: `eventBus`, `projectManager`, `storage`.
- **Creates**:
  - planner/index.html
  - planner/css/main.css
  - planner/js/core/EventBus.js
  - planner/js/core/ObjectRegistry.js
  - planner/js/core/DOM.js
  - planner/js/core/events.js
  - planner/js/core/module-manifest.js
  - planner/js/core/ProjectManager.js
  - planner/js/core/Storage.js
  - planner/js/core/main.js
- **Modifies**: keine (Core selbst ändert nach Erstanlage keine eigene
  Datei mehr). Ausnahme gemäß R15/R18: `planner/js/core/module-manifest.js`
  wird von JEDEM künftigen Feature-Modul um genau einen angehängten
  Array-Eintrag erweitert — das ist eine Modifikation DURCH andere
  Module an einer Core-Datei, keine Selbstmodifikation von Core (siehe
  Bounded Context unten und bereits vollzogen durch Standards, siehe
  modules/standards/contract.md, Abschnitt Modifies).
- **Deletes**: keine

## Zweck

Technisches Fundament für alle Module: entkoppelte Event-Kommunikation
(EventBus), zentrales Singleton-Register (ObjectRegistry), einziger
Zugriffspunkt auf das globale `document`-Objekt (DOM), generisches
Projektmodell mit Collection-Verwaltung (ProjectManager), austauschbare
Persistenz (Storage/LocalStorageAdapter) sowie Bootstrap und
Modul-Ladefolge (main.js über module-manifest.js). Core enthält keine
Fachlogik/Validierung (R1/R2) — das bleibt Standards und den
Feature-Modulen vorbehalten.

## Verantwortlichkeiten

- Bereitstellung eines fachlogikfreien Event-Bus für Modul-Entkopplung
  (R13): `on`/`off`/`emit`, Fehler in Handlern werden strukturiert
  protokolliert (Event-Name + Fehlerobjekt getrennt), ein fehlschlagender
  Handler blockiert die übrigen Handler nicht.
- Zentrales Singleton-Register (ObjectRegistry), ausschließlich per
  `register`/`get`/`has`/`unregister`; Zugriff auf die verwalteten
  Core-Singletons (aktuell `eventBus`, `projectManager`, `storage`)
  ausschließlich über `registry.get(...)` (R19).
- Alleiniger Zugriffspunkt auf das globale `document`-Objekt (R14):
  `DOM.get(id)` (gecacht), `DOM.query`/`DOM.queryAll`/`DOM.create`.
- Verwaltung des Projektmodells als generische, typneutrale
  Collection-Struktur (`assets`, `cables`, `routes`, `materials`,
  `layers`) plus Settings/Metadaten (`id`, `name`, `schemaVersion`,
  `createdAt`, `updatedAt`, `standardsVersion`) — entspricht R8
  (Einstellungen→settings, Standards→standardsVersion als
  Versionsreferenz gemäß R4, Layer→layers, Anlagen→assets, Kabel→cables,
  Trassen→routes, Materialien→materials, Version→schemaVersion). Keine
  modulspezifische Fachlogik oder Validierung der Collection-Inhalte.
- Getter, die Collections/Objekte zurückgeben (`getProject`,
  `getCollection`, `getFromCollection`, `toJSON`), liefern ausschließlich
  Kopien (R17), erzeugt über `structuredClone` mit kontextualisiertem
  Fehler-Rethrow.
- Persistenz über einen austauschbaren Adapter (aktuell
  `LocalStorageAdapter`, R16-Adapter-Pattern); öffentliche `Storage`-API
  bleibt vom Adapter-Backend unabhängig. Führt zusätzlich einen
  Projekt-Index für `listProjects()`.
- Zentraler Einstiegspunkt für `CURRENT_SCHEMA_VERSION` und
  `migrateProject` (R12/ADR-016): genau eine projektweite
  Versionskonstante in `ProjectManager.js`; `Storage.migrateProject`
  ist aktuell ein Stub, der bei `fromVersion === toVersion` unverändert
  zurückgibt und sonst wirft (noch keine zweite Schemaversion
  existiert — konsistent mit R12: "Migrationslogik wird erst
  geschrieben, sobald eine neue Version tatsächlich existiert").
- Bootstrap-Orchestrierung (`main.js`): lädt das zuletzt aktualisierte
  Projekt oder legt ein neues an, initialisiert Feature-Module gemäß
  `module-manifest.js` (ruft deren exportierte `init()` auf, R18),
  emittiert `core:app-ready`. `main.js` exportiert selbst keine
  öffentliche API und ist kein Bestandteil der Provides-Liste unten.

## Datenmodell

Projekt-Objekt (persistiert, R8/R12):
`{id, name, schemaVersion, createdAt, updatedAt, settings:{}, standardsVersion, layers:[], assets:[], cables:[], routes:[], materials:[]}`.
`generateId(prefix)` erzeugt IDs im Format `<prefix>-<uuid>`
(`crypto.randomUUID()`, mit Fallback auf `crypto.getRandomValues`, R10);
`prefix` muss `/^[a-z]{2,20}$/` entsprechen.

## Public API (Provides)

- `EventBus.on(eventName, handler)` / `.off(eventName, handler)` / `.emit(eventName, payload)`
- `ObjectRegistry.register(key, value)` / `.get(key)` / `.has(key)` / `.unregister(key)`
- `DOM.get(id)` / `.query(selector, root)` / `.queryAll(selector, root)` / `.create(tagName, options)`
- `ProjectManager.createNewProject(name)`, `.loadProjectData(projectData)`, `.getProject()`, `.generateId(prefix)`, `.getCollection(name)`, `.getFromCollection(name, id)`, `.addToCollection(name, item)`, `.removeFromCollection(name, id)`, `.updateInCollection(name, id, patch)`, `.getSetting(path)`, `.setSetting(path, value)`, `.setStandardsVersion(version)`, `.getStandardsVersion()`, `.toJSON()`
- `Storage.saveProject(projectData)` [async], `.loadProject(id)` [async], `.listProjects()` [async], `.deleteProject(id)` [async], `.migrateProject(fromVersion, toVersion, projectData)` [async]
- Konstanten-/Klassen-Exporte: `CORE_EVENTS`, `MODULE_MANIFEST`, `CURRENT_SCHEMA_VERSION`, `EventBus` (Klasse), `ObjectRegistry` (Klasse), `LocalStorageAdapter` (Klasse) — Direktimport dieser Konstanten/Utility-Exporte ist Feature-Modulen laut R19 ausdrücklich erlaubt (nur die Singleton-*Instanzen* `eventBus`/`projectManager`/`storage` sind vom Direktimport-Verbot betroffen).

Deckungsgleich mit architecture/planner-registry.json, Feld `publicApi`
(Core-Eintrag) — keine Abweichung festgestellt.

## Events

- **Published**: `core:project-created`, `core:project-loaded`, `core:project-saved`, `core:project-changed`, `core:app-ready` (Konstanten in `js/core/events.js`, `CORE_EVENTS`)
- **Consumed**: keine

## Bounded Context (R15)

`planner/js/core/*`. Zusätzlich `planner/index.html` (Erstanlage durch
Core; danach laut R15 nur noch Änderungen für globale technische
Metadaten/Sicherheitsanforderungen nach expliziter
Architekturentscheidung, nie durch ein Modul auf eigene Faust). Ausnahme
`planner/js/core/module-manifest.js`: jedes künftige Feature-Modul hängt
genau einen eigenen Eintrag an (R15/R18), ohne dass dies eine Verletzung
von Cores Bounded Context darstellt — R15 benennt diese Ausnahme
ausdrücklich.

`planner/css/main.css` wird faktisch von Core erstellt (siehe Creates
oben, deckt sich mit architecture/planner-registry.json, Feld `files`),
ist aber in R15 keinem Modul-Bounded-Context ausdrücklich zugeordnet —
siehe "Offene Fragen" unten.

## Geprüfte Präzisierungen (R5/ADR-015, R12/ADR-016)

- **R5/ADR-015**: Core betrifft die GIS-/Karten-Präzisierung nicht
  direkt (Core baut keine Kartendarstellung). Core verwaltet die
  `layers`-Collection ausschließlich generisch (wie alle anderen
  Collections), ohne layer-spezifische Fachlogik oder Struktur
  vorzugeben — konsistent mit ADR-015 ("Layer → GIS-Modul", "keine
  Fachlogik/Validierung in der Karte"): Core lässt der künftigen
  GIS-Implementierung vollen Spielraum, keine Abweichung festgestellt.
- **R12/ADR-016**: Genau eine projektweite `CURRENT_SCHEMA_VERSION`
  (`ProjectManager.js`), `migrateProject` zentral in `Storage`
  (aufgerufen aus `Storage.loadProject` bei Versionsabweichung), kein
  Modul führt eine eigene parallele `schemaVersion` — keine Abweichung
  festgestellt. Der in ADR-016 beschriebene Koordinationsmechanismus für
  von Feature-Modulen gelieferte Migrations-Teilfunktionen ist im Code
  noch nicht sichtbar, was ADR-016 selbst als Normalfall vorsieht
  ("Migrationslogik wird erst geschrieben, sobald eine neue Version
  tatsächlich existiert") — keine Abweichung, da noch keine zweite
  Schemaversion existiert.

## Geklärte Fragen (Rückfrage an Projektverantwortlichen, 2026-07-24)

1. **R15 nennt keinen Bounded Context für CSS-Dateien.** Geklärt:
   künftige Feature-Module sollen perspektivisch eigenes CSS erhalten;
   R15 wird dafür ergänzt (siehe architecture/decisions.md, ADR-022,
   Status: proposed -- der konkrete Einbindungsmechanismus ist dort
   ausdrücklich noch offen und nicht Teil dieser Entscheidung). Für
   DIESEN Contract folgt daraus: `planner/css/main.css` bleibt, wie
   unter "Bounded Context" oben beschrieben, bis auf Weiteres Cores
   Bounded Context -- ADR-022 ändert daran rückwirkend nichts, sie
   betrifft ausschließlich künftige Module.
2. **frozenAtCommit/frozenDate für DIESEN Contract** (Modul-Lifecycle
   Schritt 5): Geklärt -- nicht d77d054 (das bleibt ausschließlich der
   Code-Freeze-Referenz aus ADR-010), sondern der Commit, zu dem dieses
   Dokument (modules/core/contract.md) selbst erstmals committet wird
   (analog zur Korrektur bei Standards, siehe
   modules/standards/contract.md, frozenAtCommit 22c832...30aff2, dort
   ebenfalls ausdrücklich nicht der Code-Freeze-Commit). Da diese Datei
   aktuell nur im Arbeitsstand existiert, steht der konkrete Hash-Wert
   erst nach dem tatsächlichen Commit fest -- wird beim Übergang
   REVIEW -> FROZEN (Modul-Lifecycle Schritt 5) nachgetragen.
