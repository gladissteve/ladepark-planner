# Planner Architecture v1 — R1–R19

## Regeln

- R1 Datengetrieben: keine Anlagentypen/Kabeltypen/Zuordnungen/Regeln hart im Code, alles aus data/standards.json
- R2 Anlage strikt getrennt von Material; Material wird nur über Regeln abgeleitet, nie direkt zugewiesen
- R3 Regeln sind deklarativ {field, op, value, severity, message}, niemals eval()/new Function() auf Strings
- R4 Standards sind versioniert (version, updated, author); Module referenzieren eine Versionsnummer, nie "die aktuellen Werte"
- R5 Karte (GIS) ist reine Darstellung: liest nur Projekt→Assets (Marker) und Projekt→Kabel (Polyline), keine Fachlogik/Validierung in der Karte
- R6 Mengenermittlung ist reine Aggregation ohne eigene Regeln, sammelt nur vorhandenes Material/Kabel aus dem Projekt
- R7 Ordnerstruktur fix: planner/index.html, css/, js/, data/, projects/
- R8 Projektmodell-Baum fix: Projekt → Einstellungen, Standards, Layer, Anlagen, Kabel, Trassen, Materialien, Version
- R9 Module greifen nie direkt auf interne Datenstrukturen anderer Module zu, nur über definierte Schnittstellen
- R10 Keine externen Bibliotheken außer ausdrücklich vorgesehenen (z. B. Leaflet); sonst ausschließlich Browser-Standard-APIs
- R11 Sprachlevel fix für alle Module: ES2023, native ES-Module, strict mode
- R12 Jedes Modul, das Projektdaten persistiert, hält eine schemaVersion und bietet migrateProject(fromVersion, toVersion) an; Migrationslogik wird erst geschrieben, sobald eine neue Version tatsächlich existiert
- R13 Module kommunizieren nur über einen zentralen EventBus (emit/on), nie über direkte Aufrufe fremder Module; Event-Namen sind zentrale Konstanten, keine verstreuten String-Literale; Fehler in Event-Handlern werden strukturiert protokolliert (Event-Name + Fehlerobjekt, kein reiner String)
- R14 Keine geratenen IDs/Direktzugriffe (kein direkter Zugriff auf das globale document-Objekt außerhalb von DOM.js — auch nicht querySelector/createElement, nicht nur getElementById —, kein project.assets[0], kein verstreuter Typ-Stringvergleich); Zugriff nur über definierte Getter (z. B. AssetManager.getAsset(id), Standards.getAssetType(...), DOM.get(...)/DOM.query(...)/DOM.create(...))
- R15 Bounded Contexts: jedes Modul legt/ändert/löscht Dateien nur im eigenen Verzeichnis. Core→js/core/*, Standards→js/standards/*+data/standards.json, Assets→js/assets/*, Kabel→js/cables/*, GIS→js/gis/*, Kabeleditor→js/cable-editor/*, Mengenermittlung→js/reporting/*, Export→js/export/*. index.html darf nach Core nicht mehr strukturell verändert werden; Änderungen ausschließlich für globale technische Metadaten oder Sicherheitsanforderungen (z. B. PWA-Manifest, favicon, CSP) und nur nach expliziter Architekturentscheidung, nie durch ein Modul auf eigene Faust. Künftige Module tragen sich ausschließlich als neuer Eintrag in js/core/module-manifest.js ein (nie main.js) — ausschließlich Anhängen eines eigenen Eintrags erlaubt, niemals Ändern/Entfernen/Umsortieren bestehender fremder Einträge; ein solcher Anhang ist strikt auf genau einen neuen Array-Eintrag am Dateiende beschränkt, ohne jede Änderung an Formatierung, Kommentaren, Leerzeilen oder Reihenfolge des bestehenden Dateiinhalts
- R16 Öffentliche Schnittstellen sind unabhängig vom Speicher-/Implementierungs-Backend: Backend-Wechsel (z. B. Storage von localStorage auf Datei/API) dürfen die öffentliche API eines Moduls nie ändern, nur die interne Umsetzung (Adapter-Pattern: öffentliche Methode delegiert an austauschbaren internen Adapter). Das verlangt keine eigene Adapter-Klassenhierarchie oder Abstraktionsebene — eine schlicht gekapselte, austauschbare interne Implementierung (z. B. eine einzelne intern verwendete Lade-/Speicherfunktion) genügt, solange die öffentliche API dadurch stabil bleibt
- R17 Getter-Methoden, die Collections zurückgeben, liefern niemals interne Referenzen, sondern Kopien; Mutation ausschließlich über definierte Methoden (add/remove/update), nie über den Rückgabewert eines Getters
- R18 Modul-Registrierung: jedes Feature-Modul (alles außer Core) stellt einen eigenen Entry Point <eigenes-verzeichnis>/main.js mit einer exportierten async init()-Funktion bereit; init() registriert die öffentlichen Singleton(s)/Services des Moduls eigenständig in der registry (registry.register(...)) — niemals übernimmt Core oder ein anderes Modul diese Registrierung. Registry-Key entspricht dem Modulnamen in Kleinschreibung (z. B. standards, assets, cables, gis). Dieser Entry Point ist genau der Pfad, auf den der zugehörige module-manifest.js-Eintrag zeigt
- R19 Zugriff auf die in der Registry verwalteten Core-Singleton-Instanzen (aktuell: eventBus, projectManager, storage) ausschließlich über registry.get(...); ein direkter Import der jeweiligen Singleton-Variable aus ihrer Core-Quelldatei (z. B. import { eventBus } from '../core/EventBus.js') ist für Feature-Module verboten. Reine Konstanten- und Utility-Exporte aus Core (z. B. CORE_EVENTS, DOM) sind davon nicht betroffen und dürfen normal importiert werden

## Rollentrennung

Architect (kennt nur Architecture+Registry, erzeugt nur den Modulprompt, danach Schluss) · Builder (kennt nur den Modulprompt, kein Registry-Zugriff) · Auditor (kennt Architecture+Registry+fertigen Code, prüft Konsistenz, erzeugt Manifest, schreibt Registry erst nach Bestätigung) – Builder darf nie die eigene Arbeit abnehmen

## Header-Felder jedes Modulprompts

Module (eindeutiger Modulname) · Version (SemVer des Moduls) · Requires (benötigte Module mit Mindestversion) · Provides (öffentliche Klassen/Services/APIs, die dieses Modul bereitstellt) · Creates (neu anzulegende Dateien) · Modifies (zu ändernde Dateien) · Deletes (zu entfernende Dateien, optional)

## Datenschemas

- Anlage-Schema: {id, type, position:{x,y}, rotation, properties:{}, attributes:{}}
- Kabel-Schema: {id, fromAssetId, toAssetId, vertices:[{x,y}], material, category, conduit, reserve, length}
- Standards-Schema: {version, updated, author, assetTypes:{}, cables:{}, chargerTypes:{}, materials:{}, rules:[]}

## Start-Bibliotheken (Standards-Seed-Daten)

- Anlagentypen-Startbibliothek: Trafostation (inkl. NSHV, Code TRAFO, Farbe #e8871e), HPC-Lader (Code HPC, Farbe #2f9e44), Kamera PoE (Code CAM, Farbe #1c7ed6, Standardkabel Cat6A), Mastleuchte (Code LEU, Farbe #c98a00, Standardkabel NYY-J 5x2,5, optionales Attribut Not-Aus)
- Kabelbibliothek-Startbasis: NYY-J 4x16 bis 4x240, NYCWY 4+konz.x35/16 bis x150/70, N2XCH 4x95/185/240, Cat6A (Kategorie Daten, maxLength 90 m, PoE)
- HPC-/Lademodell-Startbibliothek: ABB Terra 184 (180 kW, N2XCH 4x95), Alpitronic HYC300 (300 kW, N2XCH 4x185), Alpitronic HYC400 (400 kW, N2XCH 4x240)

## Build-Reihenfolge

Ein Modul = ein neuer Chat: Core (ProjectManager, EventBus, ObjectRegistry, Storage), Standards, Asset-System, Kabelsystem, GIS, Kabeleditor, Mengenermittlung, Export
