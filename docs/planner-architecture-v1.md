# Planner Architecture v1.0

## Regeln (R1–R17, verbindlich, unveränderlich außer durch explizite Absprache)

R1  Datengetrieben: keine Anlagentypen/Kabeltypen/Zuordnungen/Regeln hart im Code, alles aus data/standards.json
R2  Anlage strikt getrennt von Material; Material wird nur über Regeln abgeleitet, nie direkt zugewiesen
R3  Regeln sind deklarativ {field, op, value, severity, message}, niemals eval()/new Function() auf Strings
R4  Standards sind versioniert (version, updated, author); Module referenzieren eine Versionsnummer, nie "die aktuellen Werte"
R5  Karte (GIS) ist reine Darstellung: liest nur Projekt→Assets (Marker) und Projekt→Kabel (Polyline), keine Fachlogik/Validierung in der Karte
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
    Anhängen eines eigenen Eintrags erlaubt, niemals Ändern/Entfernen/Umsortieren bestehender fremder Einträge
R16 Öffentliche Schnittstellen sind unabhängig vom Speicher-/Implementierungs-Backend: Backend-Wechsel
    (z. B. Storage von localStorage auf Datei/API) dürfen die öffentliche API eines Moduls nie ändern, nur
    die interne Umsetzung (Adapter-Pattern: öffentliche Methode delegiert an austauschbaren internen Adapter)
R17 Getter-Methoden, die Collections zurückgeben, liefern niemals interne Referenzen, sondern Kopien;
    Mutation ausschließlich über definierte Methoden (add/remove/update), nie über den Rückgabewert eines Getters

## Rollentrennung

- **Architect**: kennt nur Architecture + Registry, erzeugt nur den Modulprompt, danach Schluss
- **Builder**: kennt nur den Modulprompt, kein Registry-Zugriff
- **Auditor**: kennt Architecture + Registry + fertigen Code, prüft Konsistenz, erzeugt Manifest, schreibt Registry erst nach Bestätigung

Builder darf nie die eigene Arbeit abnehmen.

## Header-Felder jedes Modulprompts

- **Module**: eindeutiger Modulname
- **Version**: SemVer des Moduls
- **Requires**: benötigte Module mit Mindestversion
- **Provides**: öffentliche Klassen/Services/APIs, die dieses Modul bereitstellt
- **Creates**: neu anzulegende Dateien
- **Modifies**: zu ändernde Dateien
- **Deletes**: zu entfernende Dateien (optional)

## Datenschemas

- **Anlage**: `{id, type, position:{x,y}, rotation, properties:{}, attributes:{}}`
- **Kabel**: `{id, fromAssetId, toAssetId, vertices:[{x,y}], material, category, conduit, reserve, length}`
- **Standards**: `{version, updated, author, assetTypes:{}, cables:{}, chargerTypes:{}, materials:{}, rules:[]}`

## Startbibliotheken

**Anlagentypen:** Trafostation (inkl. NSHV, Code TRAFO, Farbe #e8871e), HPC-Lader (Code HPC, Farbe #2f9e44), Kamera PoE (Code CAM, Farbe #1c7ed6, Standardkabel Cat6A), Mastleuchte (Code LEU, Farbe #c98a00, Standardkabel NYY-J 5x2,5, optionales Attribut Not-Aus)

**Kabelbibliothek:** NYY-J 4x16 bis 4x240, NYCWY 4+konz.x35/16 bis x150/70, N2XCH 4x95/185/240, Cat6A (Kategorie Daten, maxLength 90 m, PoE)

**HPC-/Lademodelle:** ABB Terra 184 (180 kW, N2XCH 4x95), Alpitronic HYC300 (300 kW, N2XCH 4x185), Alpitronic HYC400 (400 kW, N2XCH 4x240)

## Build-Reihenfolge (ein Modul = ein neuer Chat)

1. Core (EventBus, ObjectRegistry, DOM, ProjectManager, Storage, ModuleLoader/main.js)
2. Standards
3. Asset-System
4. Kabelsystem
5. GIS
6. Kabeleditor
7. Mengenermittlung
8. Export
