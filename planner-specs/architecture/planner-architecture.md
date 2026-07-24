# Planner Architecture v1.0

## Regeln (R1–R19, verbindlich, unveränderlich außer durch explizite Absprache)

R1  Datengetrieben: keine Anlagentypen/Kabeltypen/Zuordnungen/Regeln hart im Code, alles aus data/standards.json
R2  Anlage strikt getrennt von Material; Material wird nur über Regeln abgeleitet, nie direkt zugewiesen
R3  Regeln sind deklarativ {field, op, value, severity, message}, niemals eval()/new Function() auf Strings
R4  Standards sind versioniert (version, updated, author); Module referenzieren eine Versionsnummer, nie "die aktuellen Werte"
R5  Karte (GIS) ist reine Darstellung: liest UND verwaltet Projekt→Layer (Sichtbarkeit/Reihenfolge von Assets-/Kabel-Gruppen), zusätzlich zu Projekt→Assets (Marker) und Projekt→Kabel (Polyline), keine Fachlogik/Validierung in der Karte (redaktionelle Präzisierung gemäß ADR-015, kein neuer Regelinhalt)
R6  Mengenermittlung ist reine Aggregation ohne eigene Regeln, sammelt nur vorhandenes Material/Kabel aus dem Projekt
R7  Ordnerstruktur fix: planner/index.html, css/, js/, data/, projects/
R8  Projektmodell-Baum fix: Projekt → Einstellungen, Standards, Layer, Anlagen, Kabel, Trassen, Materialien, Version
R9  Module greifen nie direkt auf interne Datenstrukturen anderer Module zu, nur über definierte Schnittstellen
R10 Keine externen Bibliotheken außer ausdrücklich vorgesehenen (z. B. Leaflet); sonst ausschließlich Browser-Standard-APIs
R11 Sprachlevel fix für alle Module: ES2023, native ES-Module, strict mode
R12 Jedes Modul, das Projektdaten persistiert, hält eine schemaVersion und bietet migrateProject(fromVersion, toVersion) an; Migrationslogik wird erst geschrieben, sobald eine neue Version tatsächlich existiert
R13 Module kommunizieren nur über einen zentralen EventBus (emit/on), nie über direkte Aufrufe fremder Module;
    Event-Namen sind zentrale Konstanten, keine verstreuten String-Literale; Fehler in Event-Handlern werden
    strukturiert protokolliert (Event-Name + Fehlerobjekt, kein reiner String)
R14 Keine geratenen IDs/Direktzugriffe (kein direkter Zugriff auf das globale document-Objekt außerhalb von
    DOM.js — auch nicht querySelector/createElement, nicht nur getElementById —, kein project.assets[0], kein
    verstreuter Typ-Stringvergleich); Zugriff nur über definierte Getter (z. B. AssetManager.getAsset(id),
    Standards.getAssetType(...), DOM.get(...)/DOM.query(...)/DOM.create(...))
R15 Bounded Contexts: jedes Modul legt/ändert/löscht Dateien nur im eigenen Verzeichnis.
    Core→js/core/*, Standards→js/standards/*+data/standards.json, Assets→js/assets/*,
    Kabel→js/cables/*, GIS→js/gis/*, Kabeleditor→js/cable-editor/*,
    Mengenermittlung→js/reporting/*, Export→js/export/*.
    index.html darf nach Core nicht mehr strukturell verändert werden; Änderungen ausschließlich für globale
    technische Metadaten oder Sicherheitsanforderungen (z. B. PWA-Manifest, favicon, CSP) und nur nach
    expliziter Architekturentscheidung, nie durch ein Modul auf eigene Faust. Künftige Module tragen sich
    ausschließlich als neuer Eintrag in js/core/module-manifest.js ein (nie main.js) — ausschließlich
    Anhängen eines eigenen Eintrags erlaubt, niemals Ändern/Entfernen/Umsortieren bestehender fremder
    Einträge; ein solcher Anhang ist strikt auf genau einen neuen Array-Eintrag am Dateiende beschränkt,
    ohne jede Änderung an Formatierung, Kommentaren, Leerzeilen oder Reihenfolge des bestehenden Dateiinhalts
R16 Öffentliche Schnittstellen sind unabhängig vom Speicher-/Implementierungs-Backend: Backend-Wechsel
    (z. B. Storage von localStorage auf Datei/API) dürfen die öffentliche API eines Moduls nie ändern, nur
    die interne Umsetzung (Adapter-Pattern: öffentliche Methode delegiert an austauschbaren internen
    Adapter). Das verlangt keine eigene Adapter-Klassenhierarchie oder Abstraktionsebene — eine schlicht
    gekapselte, austauschbare interne Implementierung (z. B. eine einzelne intern verwendete
    Lade-/Speicherfunktion) genügt, solange die öffentliche API dadurch stabil bleibt
R17 Getter-Methoden, die Collections zurückgeben, liefern niemals interne Referenzen, sondern Kopien;
    Mutation ausschließlich über definierte Methoden (add/remove/update), nie über den Rückgabewert eines Getters
R18 Modul-Registrierung: jedes Feature-Modul (alles außer Core) stellt einen eigenen Entry Point
    <eigenes-verzeichnis>/main.js mit einer exportierten async init()-Funktion bereit; init() registriert
    die öffentlichen Singleton(s)/Services des Moduls eigenständig in der registry (registry.register(...))
    — niemals übernimmt Core oder ein anderes Modul diese Registrierung. Registry-Key entspricht dem
    Modulnamen in Kleinschreibung (z. B. standards, assets, cables, gis). Dieser Entry Point ist genau der
    Pfad, auf den der zugehörige module-manifest.js-Eintrag zeigt
R19 Zugriff auf die in der Registry verwalteten Core-Singleton-Instanzen (aktuell: eventBus, projectManager,
    storage) ausschließlich über registry.get(...); ein direkter Import der jeweiligen Singleton-Variable
    aus ihrer Core-Quelldatei (z. B. import { eventBus } from '../core/EventBus.js') ist für Feature-Module
    verboten. Reine Konstanten- und Utility-Exporte aus Core (z. B. CORE_EVENTS, DOM) sind davon nicht
    betroffen und dürfen normal importiert werden

## Zuordnung R8-Baumzweige zu Modulen (ADR-015, bestätigt 2026-07-24)

R8 nennt Layer, Trassen und Materialien als eigene Zweige des
Projektmodell-Baums, ohne ein zuständiges Modul zu benennen. Bestätigte
Zuordnung (dokumentierend, erzeugt keine neue Regel, ändert R1-R19 nicht
außer der oben bei R5 vermerkten redaktionellen Präzisierung):

- **Layer** → GIS-Modul (js/gis/*). Reine Darstellungs-/
  Gruppierungsmetadaten (z. B. {id, name, visible, order}) für die
  Kartendarstellung, siehe präzisiertes R5.
- **Trassen** → Kabeleditor-Modul (js/cable-editor/*), nicht das
  Kabelsystem-Modul. Kabel referenzieren eine Trasse ausschließlich über
  ihr bestehendes conduit-Feld (Fremdschlüssel auf Trasse.id, R9);
  Kabelsystem verwaltet keine Trassen-Geometrie selbst.
- **Materialien** (Projekt-Zweig, zu unterscheiden von
  Standards.materials als Katalog) → gemeinsam von Asset-System und
  Kabelsystem geschrieben. Jedes der beiden Module leitet das Material
  seiner eigenen Objekte über Standards.validate(...)/Standards-Regeln
  ab (R2) und schreibt es nach Projekt→Materialien; Mengenermittlung
  liest diesen Zweig ausschließlich lesend/aggregierend (R6).

Details und Begründung: architecture/decisions.md, ADR-015.

## R12-Klarstellung für Feature-Module (ADR-016, bestätigt 2026-07-24)

Präzisierung der Zuständigkeit unter R12, ohne Änderung des R12-Wortlauts:

- Es gibt genau EINE projektweite schemaVersion (Core.
  CURRENT_SCHEMA_VERSION), keinen pro-Modul-Versionszähler.
- migrateProject bleibt zentral in Storage/ProjectManager (Core) als
  EINE aufrufbare Funktion/Einstiegspunkt. Ändert ein Feature-Modul die
  Struktur seines eigenen Teilbaums, liefert dieses Modul dafür den
  nötigen Migrationsschritt als eigene, vom zentralen migrateProject
  aufgerufene Teilfunktion und stößt eine Erhöhung der projektweiten
  CURRENT_SCHEMA_VERSION an (koordiniert über eine ADR) — das Modul hält
  selbst keine eigene, parallele schemaVersion.
- Module ohne Projektdaten-Persistenz (aktuell: Standards) bleiben
  unverändert ausgenommen.

Details und Begründung: architecture/decisions.md, ADR-016. Keine
Codeänderung durch diese Klarstellung.

## Rollentrennung

Drei dauerhafte Rollen (Architect, Builder, Auditor), jede mit eigener,
vollständig in sich geschlossener Rollendefinition unter
architecture/roles/ (verbindliche Liste in
architecture/role-registry.json, Gesamtüberblick inkl.
Zustandsdiagramm in architecture/roles/README.md; Session-Start je
Rolle über die Skills bzw. gleichnamigen Befehle /architect, /builder,
/auditor, siehe CLAUDE.md). Ergänzend zwei rollenneutrale
Einstiegs-Skills ohne eigenen Registry-Eintrag: /kickoff (reiner
Statusbericht, nur lesend) und /advisor (Architektur-Sparringspartner,
schreibt keine Projektartefakte). Die vierte, ursprünglich mit ADR-011
eingeführte Rolle Dirigent ist seit ADR-017 deprecated (ihre Aufgaben
sind auf /kickoff, /advisor und eine erweiterte Auditor-Phase-2
verteilt); Details: ADR-017, architecture/roles/dirigent.md. Diese
kompakte Übersicht hier ersetzt nicht die
Detaildefinition in den einzelnen Rollendateien — bei Widerspruch gilt
die jeweilige Rollendatei als Detailquelle, R1–R19 in diesem Dokument
bleiben in jedem Fall übergeordnet (siehe ADR-011).

- **Architect**: kennt Architektur + Registry + Modul-Contract, verhandelt Contracts, erzeugt Builder-Snapshot und (nach Builder-Abschluss) Audit-Request, schreibt niemals Registry oder Anwendungscode. Haengt unter explizitem Rollenarchitektur-Auftrag auch neue Eintraege in role-registry.json an (seit ADR-017 die einzige Rolle mit diesem Schreibzugriff).
- **Builder**: kennt ausschließlich den ihm übergebenen Builder-Snapshot, liefert Produktionscode innerhalb des Bounded Context, kein Schreibzugriff auf Registry/Architektur/Contract, darf nie die eigene Arbeit abnehmen.
- **Auditor**: kennt Architektur + Registry + fertigen Code + Audit-Request, prüft Konsistenz, erzeugt Manifest-Vorschlag; schreibt planner-registry.json in einer zweiten, eigenen Session (Phase 2), die seit ADR-017 die menschliche Bestätigung direkt entgegennimmt und die Confirmation-Datei selbst materialisiert (zuvor: über den mittlerweile deprecateten Dirigenten, ADR-011).

Jede Rolle gilt ausschließlich für eine Claude-Code-Session; ein
Rollenwechsel innerhalb derselben Session ist nicht vorgesehen (das
verhindert insbesondere, dass eine Builder-Session sich selbst zur
Auditor-Session umdeklariert).

Builder darf nie die eigene Arbeit abnehmen; Auditor schreibt oder ändert nie Anwendungscode. Architektur-Änderungen (neue/geänderte R-Regeln) erfolgen nur
nach expliziter Absprache — keine Rolle ändert R1–R19 im Rahmen ihrer eigentlichen Aufgabe eigenständig.

## Header-Felder jedes Modul-Contracts

- **Module**: eindeutiger Modulname
- **Version**: SemVer des Moduls
- **Requires**: benötigte Module mit Mindestversion
- **Provides**: öffentliche Klassen/Services/APIs, die dieses Modul bereitstellt
- **Creates**: neu anzulegende Dateien
- **Modifies**: zu ändernde Dateien
- **Deletes**: zu entfernende Dateien (optional)

## Datenschemas (global, projektweit gültig)

- **Anlage**: `{id, type, position:{x,y}, rotation, properties:{}, attributes:{}}`
- **Kabel**: `{id, fromAssetId, toAssetId, vertices:[{x,y}], material, category, conduit, reserve, length}`
- **Standards**: `{version, updated, author, assetTypes:{}, cables:{}, chargerTypes:{}, materials:{}, rules:[]}`

Modulspezifische Schemas (z. B. Standards-interne Detailstrukturen) liegen in modules/<name>/schema.json,
nicht hier.

## Build-Reihenfolge (ein Modul = ein neuer Builder-Chat)

1. Core (EventBus, ObjectRegistry, DOM, ProjectManager, Storage, ModuleLoader/main.js)
2. Standards
3. Asset-System
4. Kabelsystem
5. GIS
6. Kabeleditor
7. Mengenermittlung
8. Export
