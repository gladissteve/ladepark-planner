---
Builder-Snapshot fuer Modul: Standards
Erzeugt gegen Commit: 22c83231c8d0cf58d148ebad0f6d62b00930aff2
Erzeugt am: 2026-07-23 (Commit-Referenz aktualisiert 2026-07-23, siehe Hinweis unten)
Contract eingefroren: STATUS FROZEN, frozenAtCommit 22c83231c8d0cf58d148ebad0f6d62b00930aff2, frozenDate 2026-07-23

## Input Fingerprint

architectureCommit: 22c83231c8d0cf58d148ebad0f6d62b00930aff2
contractFrozenDate: 2026-07-23

inputFiles:
  - path: planner-specs/architecture/planner-architecture.md
    sha256: c033ad7cb675523d78cdb85ed13593d287ccb7b964cb2e4c7d7e1c9e86965d0
  - path: planner-specs/architecture/planner-registry.json
    sha256: d1c90ffd50f5dc797059852b8d5ee6b7002850702550dcb67874f613e58b735
  - path: planner-specs/architecture/decisions.md
    sha256: 8c13f393e6f7f1242afad36106a86f6a2f4650100bfb38bba73c61f1f3beeed
  - path: planner-specs/modules/standards/contract.md
    sha256: 9f2bd73e439017dd758b129bde304901ed43cff87abbafc7654cc0f95f93cbf
  - path: planner-specs/modules/standards/schema.json
    sha256: 46542ec13bdf41a65b28e5537d6d2706c8f2c6a0a8321b3049aebd9e4cb7f7c
  - path: planner-specs/modules/standards/seed-data.json
    sha256: 2a31192121d01af002b5d55c08d062621fb3905fb47e85b55bd4702b452875
  - path: planner-specs/modules/standards/notes.md
    sha256: 5de4829b0e43effce8957a74827391d62299c28d028def37063be45cf8df514

HINWEIS zum Abgleich Commit vs. Hash (aktualisiert 2026-07-23): Der
fruehere Stand dieses Snapshots war gegen d77d054 materialisiert, obwohl
6 der 7 eingebetteten Dateien zu diesem Zeitpunkt noch uncommitted waren
(architectureCommit und sha256-Werte wichen bewusst voneinander ab, siehe
vorherige Snapshot-Fassung). Dieser Widerspruch ist jetzt aufgeloest:
planner-specs wurde ausserhalb dieser Sandbox lokal committed
(Commit "Freeze standards module specification",
22c83231c8d0cf58d148ebad0f6d62b00930aff2). Verifiziert: `git diff HEAD --
planner-specs/` ist leer, alle sieben sha256-Werte oben sind identisch
mit dem Stand vor dem Commit -- der Commit hat den Inhalt nicht
veraendert, nur fixiert. architectureCommit (22c83231c8d0cf58d148ebad0f6d62b00930aff2)
und alle sha256-Werte oben beziehen sich jetzt konsistent auf denselben,
tatsaechlich committeten Stand.

Rolle: Builder. Du kennst ausschliesslich diesen Prompt -- keine frueheren
Chats, keine anderen Module, kein sonstiges Zusatzwissen. Du lieferst
ausschliesslich Produktionscode. Keine Architekturdiskussion, keine
Alternativen, keine Rueckfragen -- bei Unklarheit triff eine begruendete,
konservative Entscheidung im Rahmen der unten eingebetteten Regeln und
dokumentiere sie kurz als Code-Kommentar.

# Immutable Rules (vollstaendige Kopie aus architecture/planner-architecture.md@22c83231c8d0cf58d148ebad0f6d62b00930aff2)

## Regeln (R1-R19, verbindlich, unveraenderlich ausser durch explizite Absprache)

R1  Datengetrieben: keine Anlagentypen/Kabeltypen/Zuordnungen/Regeln hart im Code, alles aus data/standards.json
R2  Anlage strikt getrennt von Material; Material wird nur ueber Regeln abgeleitet, nie direkt zugewiesen
R3  Regeln sind deklarativ {field, op, value, severity, message}, niemals eval()/new Function() auf Strings
R4  Standards sind versioniert (version, updated, author); Module referenzieren eine Versionsnummer, nie "die aktuellen Werte"
R5  Karte (GIS) ist reine Darstellung: liest nur Projekt->Assets (Marker) und Projekt->Kabel (Polyline), keine Fachlogik/Validierung in der Karte
R6  Mengenermittlung ist reine Aggregation ohne eigene Regeln, sammelt nur vorhandenes Material/Kabel aus dem Projekt
R7  Ordnerstruktur fix: planner/index.html, css/, js/, data/, projects/
R8  Projektmodell-Baum fix: Projekt -> Einstellungen, Standards, Layer, Anlagen, Kabel, Trassen, Materialien, Version
R9  Module greifen nie direkt auf interne Datenstrukturen anderer Module zu, nur ueber definierte Schnittstellen
R10 Keine externen Bibliotheken ausser ausdruecklich vorgesehenen (z. B. Leaflet); sonst ausschliesslich Browser-Standard-APIs
R11 Sprachlevel fix fuer alle Module: ES2023, native ES-Module, strict mode
R12 Jedes Modul, das Projektdaten persistiert, haelt eine schemaVersion und bietet migrateProject(fromVersion, toVersion) an; Migrationslogik wird erst geschrieben, sobald eine neue Version tatsaechlich existiert
R13 Module kommunizieren nur ueber einen zentralen EventBus (emit/on), nie ueber direkte Aufrufe fremder Module;
    Event-Namen sind zentrale Konstanten, keine verstreuten String-Literale; Fehler in Event-Handlern werden
    strukturiert protokolliert (Event-Name + Fehlerobjekt, kein reiner String)
R14 Keine geratenen IDs/Direktzugriffe (kein direkter Zugriff auf das globale document-Objekt ausserhalb von
    DOM.js -- auch nicht querySelector/createElement, nicht nur getElementById --, kein project.assets[0], kein
    verstreuter Typ-Stringvergleich); Zugriff nur ueber definierte Getter (z. B. AssetManager.getAsset(id),
    Standards.getAssetType(...), DOM.get(...)/DOM.query(...)/DOM.create(...))
R15 Bounded Contexts: jedes Modul legt/aendert/loescht Dateien nur im eigenen Verzeichnis.
    Core->js/core/*, Standards->js/standards/*+data/standards.json, Assets->js/assets/*,
    Kabel->js/cables/*, GIS->js/gis/*, Kabeleditor->js/cable-editor/*,
    Mengenermittlung->js/reporting/*, Export->js/export/*.
    index.html darf nach Core nicht mehr strukturell veraendert werden; Aenderungen ausschliesslich fuer globale
    technische Metadaten oder Sicherheitsanforderungen (z. B. PWA-Manifest, favicon, CSP) und nur nach
    expliziter Architekturentscheidung, nie durch ein Modul auf eigene Faust. Kuenftige Module tragen sich
    ausschliesslich als neuer Eintrag in js/core/module-manifest.js ein (nie main.js) -- ausschliesslich
    Anhaengen eines eigenen Eintrags erlaubt, niemals Aendern/Entfernen/Umsortieren bestehender fremder
    Eintraege; ein solcher Anhang ist strikt auf genau einen neuen Array-Eintrag am Dateiende beschraenkt,
    ohne jede Aenderung an Formatierung, Kommentaren, Leerzeilen oder Reihenfolge des bestehenden Dateiinhalts
R16 Oeffentliche Schnittstellen sind unabhaengig vom Speicher-/Implementierungs-Backend: Backend-Wechsel
    (z. B. Storage von localStorage auf Datei/API) duerfen die oeffentliche API eines Moduls nie aendern, nur
    die interne Umsetzung (Adapter-Pattern: oeffentliche Methode delegiert an austauschbaren internen
    Adapter). Das verlangt keine eigene Adapter-Klassenhierarchie oder Abstraktionsebene -- eine schlicht
    gekapselte, austauschbare interne Implementierung (z. B. eine einzelne intern verwendete
    Lade-/Speicherfunktion) genuegt, solange die oeffentliche API dadurch stabil bleibt
R17 Getter-Methoden, die Collections zurueckgeben, liefern niemals interne Referenzen, sondern Kopien;
    Mutation ausschliesslich ueber definierte Methoden (add/remove/update), nie ueber den Rueckgabewert eines Getters
R18 Modul-Registrierung: jedes Feature-Modul (alles ausser Core) stellt einen eigenen Entry Point
    <eigenes-verzeichnis>/main.js mit einer exportierten async init()-Funktion bereit; init() registriert
    die oeffentlichen Singleton(s)/Services des Moduls eigenstaendig in der registry (registry.register(...))
    -- niemals uebernimmt Core oder ein anderes Modul diese Registrierung. Registry-Key entspricht dem
    Modulnamen in Kleinschreibung (z. B. standards, assets, cables, gis). Dieser Entry Point ist genau der
    Pfad, auf den der zugehoerige module-manifest.js-Eintrag zeigt
R19 Zugriff auf die in der Registry verwalteten Core-Singleton-Instanzen (aktuell: eventBus, projectManager,
    storage) ausschliesslich ueber registry.get(...); ein direkter Import der jeweiligen Singleton-Variable
    aus ihrer Core-Quelldatei (z. B. import { eventBus } from '../core/EventBus.js') ist fuer Feature-Module
    verboten. Reine Konstanten- und Utility-Exporte aus Core (z. B. CORE_EVENTS, DOM) sind davon nicht
    betroffen und duerfen normal importiert werden

## Rollentrennung

- **Architect**: kennt Architektur + Registry + Modul-Contract, erzeugt nur den Builder-Prompt, danach Schluss
- **Builder**: kennt Architektur + Registry + eigenen Modul-Contract/-Schema/-Seed-Data, kein Schreibzugriff auf Registry
- **Auditor**: kennt Architektur + Registry + fertigen Code, prueft Konsistenz, erzeugt Manifest, schreibt Registry erst nach Bestaetigung

Builder darf nie die eigene Arbeit abnehmen. Architektur-Aenderungen (neue/geaenderte R-Regeln) erfolgen nur
nach expliziter Absprache -- keine Rolle aendert R1-R19 im Rahmen ihrer eigentlichen Aufgabe eigenstaendig.

## Header-Felder jedes Modul-Contracts

- **Module**: eindeutiger Modulname
- **Version**: SemVer des Moduls
- **Requires**: benoetigte Module mit Mindestversion
- **Provides**: oeffentliche Klassen/Services/APIs, die dieses Modul bereitstellt
- **Creates**: neu anzulegende Dateien
- **Modifies**: zu aendernde Dateien
- **Deletes**: zu entfernende Dateien (optional)

## Datenschemas (global, projektweit gueltig)

- **Anlage**: `{id, type, position:{x,y}, rotation, properties:{}, attributes:{}}`
- **Kabel**: `{id, fromAssetId, toAssetId, vertices:[{x,y}], material, category, conduit, reserve, length}`
- **Standards**: `{version, updated, author, assetTypes:{}, cables:{}, chargerTypes:{}, materials:{}, rules:[]}`

Modulspezifische Schemas (z. B. Standards-interne Detailstrukturen) liegen in modules/<name>/schema.json,
nicht hier. Das Standards-Modulschema unten (Abschnitt "Schema") konkretisiert assetTypes/cables/
chargerTypes/materials/rules verbindlich fuer dieses Modul.

# Requires (kompakt)

```json
{
  "requires": {
    "core": "1.0.0",
    "eventBus": true,
    "registry": true
  }
}
```

Standards braucht ausschliesslich `eventBus` (zum Emittieren eigener Events) und `registry` (zur
Selbstregistrierung, R18). Kein Zugriff auf ProjectManager, Storage oder DOM -- diese Teile der Core-API sind
absichtlich nicht eingebettet, um keine Kopplung an Funktionalitaet nahezulegen, die dieses Modul nicht
braucht (siehe Contract: keine eigene Persistenz, kein DOM-Zugriff).

## Genutzte Core-Signaturen (Kopie aus architecture/planner-registry.json@22c83231c8d0cf58d148ebad0f6d62b00930aff2, nur die zwei benoetigten Singletons)

```json
{
  "EventBus": {
    "publicApi": [
      "EventBus.on(eventName, handler)",
      "EventBus.off(eventName, handler)",
      "EventBus.emit(eventName, payload)"
    ]
  },
  "ObjectRegistry": {
    "publicApi": [
      "ObjectRegistry.register(key, value)",
      "ObjectRegistry.get(key)",
      "ObjectRegistry.has(key)",
      "ObjectRegistry.unregister(key)"
    ]
  },
  "status": "FROZEN",
  "frozenDate": "2026-07-23",
  "frozenAtCommit": "d77d054"
}
```

Zugriff ausschliesslich ueber `registry.get('eventBus')` (R19) -- niemals `import { eventBus } from
'../core/EventBus.js'`. Registrierung des eigenen Service unter Key `standards` erst nach erfolgreichem
Erstladen (siehe Contract, Abschnitt "Datenladen").

# Relevante Architecture Decision Records (Kopie aus architecture/decisions.md@22c83231c8d0cf58d148ebad0f6d62b00930aff2, nur Standards-relevant)

## ADR-002
Entscheidung: Alle Fachregeln (Anlagentypen, Kabeltypen, Zuordnungen, Validierungsregeln) datengetrieben in
data/standards.json statt hart im Code (R1); Regeln als deklaratives Format {field, op, value, severity,
message}, kein eval()/new Function() (R3).
Status: accepted

## ADR-006
Entscheidung: Interne technische IDs in data/standards.json (assetTypes, cables, chargerTypes, materials)
sind stabile lowercase-kebab-case Slugs (z. B. id: "abb-terra-184"), getrennt vom Hersteller-/Fachcode (z. B.
code: "ABB_TERRA_184") und vom Anzeigenamen (z. B. name: "Terra 184"). id ist der stabile technische
Schluessel fuer Getter-Zugriffe (R14, z. B. Standards.getAssetType(id)); code und name sind eigene,
unabhaengig aenderbare Felder, keine Aliase fuer id.
Status: accepted
(Ergaenzende Entscheidung vom 2026-07-23, Teil des Standards-Contracts unten: Split gilt einheitlich fuer
alle vier Kategorien; cables sind ein Eintrag pro Kabeltyp mit crossSections-Array, nicht ein Eintrag pro
Querschnitt-Variante.)

# Module Contract (vollstaendige Kopie aus modules/standards/contract.md@22c83231c8d0cf58d148ebad0f6d62b00930aff2, STATUS FROZEN)

STATUS: FROZEN
frozenAtCommit: 22c83231c8d0cf58d148ebad0f6d62b00930aff2
frozenDate: 2026-07-23

## Header

- **Module**: Standards
- **Version**: 1.0.0
- **Requires**: Core >=1.0.0 (FROZEN, siehe architecture/planner-registry.json, frozenAtCommit d77d054)
- **Registry-Key (R18)**: standards
- **Creates**:
  - planner/js/standards/main.js
  - planner/js/standards/Standards.js
  - planner/js/standards/events.js
  - planner/data/standards.json
- **Modifies**:
  - planner/js/core/module-manifest.js (ausschliesslich ein neuer, angehaengter Array-Eintrag, siehe R15/R18)
- **Deletes**: keine

## Zweck

Datengetriebene Verwaltung der Projektstandards gemaess R1: Anlagentypen, Kabelbibliothek, HPC-/
Lademodell-Bibliothek, Materialien, Regeln. Laedt, validiert und stellt data/standards.json bereit; wertet
die darin deklarierten Regeln aus (R3).

## Verantwortlichkeiten

- Laden von data/standards.json zur Laufzeit (kein Hardcoding, R1).
- Strukturelle Validierung des geladenen Inhalts gegen schema.json.
- Bereitstellung typisierter, kopie-basierter Getter (R17) fuer assetTypes, cables, chargerTypes, materials,
  rules.
- Auswertung deklarativer Regeln gegen einen Aufrufer-Kontext (R3).
- Keine eigene Persistenz: Standards schreibt data/standards.json nie selbst; ausschliesslich lesender
  Zugriff.
- Keine Fachlogik ausserhalb dessen, was schema.json/seed-data.json hergeben (keine hartcodierten
  Grenzwerte, Zuordnungen o. Ae.).

## Datenmodell (Details verbindlich in schema.json / seed-data.json unten)

- Vier Kategorien: assetTypes, cables, chargerTypes, materials. Jede ist ein Object, dessen Keys Slugs sind
  (`^[a-z0-9]+(-[a-z0-9]+)*$`, ADR-006). Jeder Eintrag traegt zusaetzlich ein eigenes `id`-Feld, das exakt
  mit seinem Object-Key uebereinstimmen muss (Selbstbeschreibung fuer den Fall, dass ein Eintrag aus der Map
  extrahiert wird, z. B. bei getAssetTypes()).
- id/code/name-Split gilt einheitlich fuer alle vier Kategorien (Entscheidung 2026-07-23, erweitert ADR-006):
  `id` = stabiler technischer Slug, `code` = Hersteller-/Fachbezeichner (Grossschreibung), `name` =
  Anzeigename.
- cables: ein Eintrag pro Kabeltyp (Familie: id, code, name, category), einzelne Querschnitt-Varianten
  liegen im `crossSections`-Array (`{crossSection, maxLength}`). Entscheidung 2026-07-23, loest die in
  ADR-006 offen gelassene Strukturfrage.
- Referenzen auf einen konkreten Kabel-Querschnitt (assetTypes.defaultCable, chargerTypes.defaultCable) sind
  Objekte `{cableId, crossSection}` oder `null` -- kein zusammengesetzter String mehr.
- materials ist im Seed aktuell leer (`{}`) -- bewusste Entscheidung, kein offener Punkt: die
  Materialbibliothek wird erst befuellt, sobald ein konkreter Bedarf (z. B. aus der Mengenermittlung)
  vorliegt. Das Schema ist bereits vollstaendig definiert, damit spaetere Eintraege ohne Schema-Aenderung
  moeglich sind.

## Datenladen (Entscheidung 2026-07-23)

Standards laedt seine Daten ausschliesslich zur Laufzeit ueber eine gekapselte, intern austauschbare
Ladefunktion (R16-Adapter-Pattern):

- Standardpfad: `data/standards.json`, relativ zu `planner/index.html`, geladen per `fetch()`
  (Browser-Standard-API, R10).
- `main.js` -> `init()` ruft beim Start einmalig die interne Erstladung auf und wartet sie ab, bevor sich
  Standards in der Registry registriert (R18): erst nach erfolgreichem Laden ist `registry.get('standards')`
  verfuegbar.
- `Standards.reload()` (Public API, async) kapselt denselben Ladevorgang fuer spaetere erneute Aufrufe. Der
  interne Loader darf spaeter ersetzt werden (z. B. anderer Pfad, andere Quelle), ohne dass sich die
  oeffentliche API aendert.
- Verboten: hartcodierte Stammdaten im JS (R1), statischer JSON-Modul-Import (`import ... assert { type:
  'json' }` o. Ae.), direkte Dateisystemzugriffe, eigene Schreib-/Persistenzlogik.
- Nach dem Laden: strukturelle Pruefung gegen die in schema.json festgelegten Pflichtfelder/Typen -- manuell
  in Standards.js implementiert, keine externe JSON-Schema-Bibliothek (R10).
- Erfolg: `STANDARDS_EVENTS.LOADED` wird emittiert (Payload: `{version}`), das von `init()`/`reload()`
  zurueckgegebene Promise wird resolved.
- Fehler (Netzwerk/Parse/Validierung): `STANDARDS_EVENTS.LOAD_ERROR` wird emittiert (Payload: strukturiertes
  Fehlerobjekt, R13 -- Event-Name und Fehlerobjekt getrennt, kein zusammengesetzter String), das Promise wird
  rejected. Ein zuvor bereits geladener valider Zustand bleibt bei einem fehlgeschlagenen `reload()`
  unveraendert erhalten (kein Teil-Update auf ungueltige Daten).

## Regel-Interpreter (R3, Implementierungsdetails siehe Notes unten)

`Standards.validate(context)` wertet alle Eintraege aus `rules` gegen einen flachen Aufrufer-Kontext aus
(Feldzugriff per Dot-Path, z. B. `"cable.length"`). Unterstuetzte Operatoren mindestens `>`, `>=`, `<`, `<=`,
`==`, `!=`. Niemals `eval()`/`new Function()`. Rueckgabe: Array der zutreffenden (verletzten) Regeln als
Kopien `{id, field, op, value, severity, message}`.

## Public API (Provides)

- `Standards.getAssetType(id)` -- wirft bei unbekannter id
- `Standards.getAssetTypes()` -- Kopie aller Eintraege als Array
- `Standards.getCable(id)` -- ganze Kabeltyp-Familie inkl. crossSections, wirft bei unbekannter id
- `Standards.getCables()` -- Kopie aller Kabeltyp-Familien als Array
- `Standards.getCableCrossSection(id, crossSection)` -- einzelne Variante als flaches Objekt `{id, code,
  name, category, crossSection, maxLength}`, wirft bei unbekannter Kombination
- `Standards.getChargerType(id)` -- wirft bei unbekannter id
- `Standards.getChargerTypes()` -- Kopie aller Eintraege als Array
- `Standards.getMaterial(id)` -- wirft bei unbekannter id
- `Standards.getMaterials()` -- Kopie aller Eintraege als Array
- `Standards.getRules()` -- Kopie aller Regeln als Array
- `Standards.validate(context)` -- Array verletzter Regeln, siehe oben
- `Standards.getVersion()` -- aktuelle `version` aus data/standards.json
- `Standards.reload()` [async] -- siehe "Datenladen"

## Events

- **Published**: `STANDARDS_EVENTS.LOADED` (`'standards:loaded'`, Payload `{version}`),
  `STANDARDS_EVENTS.LOAD_ERROR` (`'standards:load-error'`, Payload `{error}`)
- **Consumed**: keine

## Bounded Context (R15)

`planner/js/standards/*`, `planner/data/standards.json`. Ausnahme wie bei jedem Feature-Modul: genau ein
angehaengter Eintrag in `planner/js/core/module-manifest.js` (R18), keine sonstigen Aenderungen ausserhalb
dieses Verzeichnisses.

## Abnahmekriterien

- [ ] `Standards.init()` registriert sich erst nach erfolgreichem Erstladen selbst in der Registry unter Key
      `standards` (R18).
- [ ] Alle Getter liefern Kopien, keine internen Referenzen (R17).
- [ ] Keine hartcodierten Fachregeln im Code (R1) -- alle Werte kommen aus data/standards.json.
- [ ] Regel-Interpreter nutzt kein `eval()`/`new Function()` (R3).
- [ ] Zugriff auf Core-Singletons ausschliesslich ueber `registry.get(...)` (R19), kein Direktimport der
      Singleton-Variablen aus core/-Dateien.
- [ ] Event-Namen ausschliesslich als Konstanten aus `planner/js/standards/events.js` (R13).
- [ ] Bounded Context eingehalten: keine Dateien ausserhalb von `js/standards/*`, `data/standards.json` und
      dem einen Manifest-Anhang (R15).
- [ ] `defaultCable`-Referenzen sind `{cableId, crossSection}` oder `null`, keine zusammengesetzten Strings.
- [ ] Ein fehlgeschlagener `reload()` ueberschreibt keinen zuvor gueltigen Zustand.
- [ ] Jedes `id`-Feld ist identisch mit seinem Object-Key; alle Keys entsprechen `^[a-z0-9]+(-[a-z0-9]+)*$`.
- [ ] Kein direkter `document`-Zugriff (R14 -- Standards braucht ohnehin keinen DOM-Zugriff; falls doch,
      ausschliesslich ueber `DOM.*`).

# Schema (vollstaendige Kopie aus modules/standards/schema.json@22c83231c8d0cf58d148ebad0f6d62b00930aff2)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://planner.local/schemas/standards.schema.json",
  "title": "Standards (data/standards.json)",
  "type": "object",
  "required": ["version", "updated", "author", "assetTypes", "cables", "chargerTypes", "materials", "rules"],
  "$defs": {
    "slugId": {
      "type": "string",
      "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$",
      "description": "Lowercase-kebab-case Slug, stabiler technischer Schluessel (ADR-006). Muss identisch mit dem Object-Key sein, unter dem der Eintrag gefuehrt wird."
    },
    "cableReference": {
      "description": "Referenz auf eine konkrete Querschnitt-Variante eines Kabeltyps aus cables.",
      "oneOf": [
        { "type": "null" },
        {
          "type": "object",
          "required": ["cableId", "crossSection"],
          "properties": {
            "cableId": { "$ref": "#/$defs/slugId" },
            "crossSection": { "type": ["string", "null"] }
          }
        }
      ]
    },
    "crossSectionEntry": {
      "type": "object",
      "required": ["crossSection", "maxLength"],
      "properties": {
        "crossSection": { "type": ["string", "null"] },
        "maxLength": { "type": ["number", "null"] }
      }
    }
  },
  "properties": {
    "version": { "type": "string" },
    "updated": { "type": "string", "format": "date" },
    "author": { "type": "string" },
    "assetTypes": {
      "type": "object",
      "propertyNames": { "$ref": "#/$defs/slugId" },
      "additionalProperties": {
        "type": "object",
        "required": ["id", "code", "name", "color"],
        "properties": {
          "id": { "$ref": "#/$defs/slugId" },
          "code": { "type": "string" },
          "name": { "type": "string" },
          "color": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
          "defaultCable": { "$ref": "#/$defs/cableReference" },
          "attributes": { "type": "object" }
        }
      }
    },
    "cables": {
      "description": "Ein Eintrag pro Kabeltyp (Familie); einzelne Querschnitt-Varianten liegen im crossSections-Array (Entscheidung 2026-07-23, loest die in ADR-006 offen gelassene Strukturfrage).",
      "type": "object",
      "propertyNames": { "$ref": "#/$defs/slugId" },
      "additionalProperties": {
        "type": "object",
        "required": ["id", "code", "name", "category", "crossSections"],
        "properties": {
          "id": { "$ref": "#/$defs/slugId" },
          "code": { "type": "string" },
          "name": { "type": "string" },
          "category": { "type": "string" },
          "crossSections": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#/$defs/crossSectionEntry" }
          }
        }
      }
    },
    "chargerTypes": {
      "type": "object",
      "propertyNames": { "$ref": "#/$defs/slugId" },
      "additionalProperties": {
        "type": "object",
        "required": ["id", "code", "name", "powerKW", "defaultCable"],
        "properties": {
          "id": { "$ref": "#/$defs/slugId" },
          "code": { "type": "string" },
          "name": { "type": "string" },
          "powerKW": { "type": "number" },
          "defaultCable": { "$ref": "#/$defs/cableReference" }
        }
      }
    },
    "materials": {
      "type": "object",
      "propertyNames": { "$ref": "#/$defs/slugId" },
      "additionalProperties": {
        "type": "object",
        "required": ["id", "code", "name", "unit"],
        "properties": {
          "id": { "$ref": "#/$defs/slugId" },
          "code": { "type": "string" },
          "name": { "type": "string" },
          "unit": { "type": "string" }
        }
      }
    },
    "rules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "field", "op", "value", "severity", "message"],
        "properties": {
          "id": { "type": "string" },
          "field": { "type": "string" },
          "op": { "enum": [">", ">=", "<", "<=", "==", "!="] },
          "value": {},
          "severity": { "enum": ["warning", "error"] },
          "message": { "type": "string" }
        }
      }
    }
  },
  "_status": "FROZEN-ready -- final abgestimmt im Architect-Lauf fuer Modul 2 (2026-07-23), wartet auf contract.md STATUS FROZEN"
}
```

# Seed-Data (vollstaendige Kopie aus modules/standards/seed-data.json@22c83231c8d0cf58d148ebad0f6d62b00930aff2)

Diese Datei ist der Inhalt fuer die im Contract unter Creates genannte neue Datei
`planner/data/standards.json`. Kein Laufzeit-Fallback, keine Kopie im JS-Code -- einfach 1:1 als Inhalt der
neu anzulegenden Datei verwenden (ggf. `updated` unveraendert lassen, nicht neu datieren).

```json
{
  "version": "1.0.0",
  "updated": "2026-07-23",
  "author": "gladissteve",
  "assetTypes": {
    "trafo": {
      "id": "trafo",
      "code": "TRAFO",
      "name": "Trafostation (inkl. NSHV)",
      "color": "#e8871e",
      "defaultCable": null
    },
    "hpc": {
      "id": "hpc",
      "code": "HPC",
      "name": "HPC-Lader",
      "color": "#2f9e44",
      "defaultCable": null
    },
    "camera": {
      "id": "camera",
      "code": "CAM",
      "name": "Kamera (PoE)",
      "color": "#1c7ed6",
      "defaultCable": { "cableId": "cat6a", "crossSection": null }
    },
    "light": {
      "id": "light",
      "code": "LEU",
      "name": "Mastleuchte",
      "color": "#c98a00",
      "defaultCable": { "cableId": "nyy-j", "crossSection": "5x2_5" },
      "attributes": { "notAus": false }
    }
  },
  "cables": {
    "nyy-j": {
      "id": "nyy-j",
      "code": "NYY-J",
      "name": "NYY-J (Energie)",
      "category": "Energie",
      "crossSections": [
        { "crossSection": "5x2_5", "maxLength": null },
        { "crossSection": "4x16", "maxLength": null },
        { "crossSection": "4x25", "maxLength": null },
        { "crossSection": "4x35", "maxLength": null },
        { "crossSection": "4x50", "maxLength": null },
        { "crossSection": "4x70", "maxLength": null },
        { "crossSection": "4x95", "maxLength": null },
        { "crossSection": "4x120", "maxLength": null },
        { "crossSection": "4x150", "maxLength": null },
        { "crossSection": "4x185", "maxLength": null },
        { "crossSection": "4x240", "maxLength": null }
      ]
    },
    "nycwy-4konz": {
      "id": "nycwy-4konz",
      "code": "NYCWY-4KONZ",
      "name": "NYCWY 4-Konzentrisch (Energie)",
      "category": "Energie",
      "crossSections": [
        { "crossSection": "35-16", "maxLength": null },
        { "crossSection": "50-25", "maxLength": null },
        { "crossSection": "70-35", "maxLength": null },
        { "crossSection": "95-50", "maxLength": null },
        { "crossSection": "120-70", "maxLength": null },
        { "crossSection": "150-70", "maxLength": null }
      ]
    },
    "n2xch": {
      "id": "n2xch",
      "code": "N2XCH",
      "name": "N2XCH (Energie, Leistung)",
      "category": "Energie (Leistung)",
      "crossSections": [
        { "crossSection": "4x95", "maxLength": null },
        { "crossSection": "4x185", "maxLength": null },
        { "crossSection": "4x240", "maxLength": null }
      ]
    },
    "cat6a": {
      "id": "cat6a",
      "code": "CAT6A",
      "name": "Cat6A (Daten, PoE)",
      "category": "Daten",
      "crossSections": [
        { "crossSection": null, "maxLength": 90 }
      ]
    }
  },
  "chargerTypes": {
    "abb-terra-184": {
      "id": "abb-terra-184",
      "code": "ABB_TERRA_184",
      "name": "Terra 184",
      "powerKW": 180,
      "defaultCable": { "cableId": "n2xch", "crossSection": "4x95" }
    },
    "alpitronic-hyc300": {
      "id": "alpitronic-hyc300",
      "code": "ALPITRONIC_HYC300",
      "name": "HYC300",
      "powerKW": 300,
      "defaultCable": { "cableId": "n2xch", "crossSection": "4x185" }
    },
    "alpitronic-hyc400": {
      "id": "alpitronic-hyc400",
      "code": "ALPITRONIC_HYC400",
      "name": "HYC400",
      "powerKW": 400,
      "defaultCable": { "cableId": "n2xch", "crossSection": "4x240" }
    }
  },
  "materials": {},
  "rules": [
    {
      "id": "cat6a-max-length",
      "field": "cable.length",
      "op": ">",
      "value": 90,
      "severity": "warning",
      "message": "Cat6A laenger als 90 m (PoE/Signal-Grenzwert)"
    }
  ]
}
```

# Notes (vollstaendige Kopie aus modules/standards/notes.md@22c83231c8d0cf58d148ebad0f6d62b00930aff2)

Reine Implementierungshinweise, keine Architekturentscheidungen -- bei Widerspruch zum Contract oben gilt der
Contract (Autoritaets-Hierarchie ADR-007).

## Regel-Interpreter (R3)

- Kleiner, sicherer Interpreter fuer `{field, op, value}` -- niemals `eval()`/`new Function()`.
- Operatoren mindestens `>`, `>=`, `<`, `<=`, `==`, `!=`; einfache switch/if-Kette reicht, keine
  Ausdruckssprache noetig.
- `field` ist ein Dot-Path in den vom Aufrufer uebergebenen `context` (z. B. `"cable.length"` ->
  `context.cable.length`). Fehlt ein Segment im Kontext, gilt die Regel als nicht zutreffend (kein Treffer),
  nicht als Fehler.
- `Standards.validate(context)` iteriert alle `rules`, wertet pro Regel den Pfad gegen `context` aus,
  sammelt alle zutreffenden (verletzten) Regeln als Kopien ein und gibt sie zurueck (leeres Array = keine
  Verstoesse).

## Ladevorgang / reload()

- Interner Loader ist eine einzelne Funktion (z. B. `#fetchStandards()`), die von `init()` und von
  `reload()` gemeinsam genutzt wird -- kein duplizierter Code, keine zwei unabhaengigen Implementierungen.
- Ablauf: `fetch('data/standards.json')` -> JSON parsen -> gegen schema.json-Pflichtfelder pruefen (manuell,
  siehe unten) -> bei Erfolg internen Zustand ersetzen und `STANDARDS_EVENTS.LOADED` emittieren, bei jedem
  Fehler (Netzwerk, Parse, Validierung) `STANDARDS_EVENTS.LOAD_ERROR` emittieren und den bisherigen internen
  Zustand unveraendert lassen.
- Validierung muss mindestens pruefen: alle Top-Level-Pflichtfelder vorhanden, jede Kategorie ist ein
  Object, jeder Eintrag hat die in schema.json als `required` markierten Felder, jedes `id`-Feld entspricht
  dem eigenen Object-Key und dem Slug-Pattern `^[a-z0-9]+(-[a-z0-9]+)*$`. Eine vollstaendige
  JSON-Schema-Engine ist nicht noetig und waere eine externe Abhaengigkeit (R10) -- die obigen Pruefungen
  reichen fuer den Zweck (fruehes, klares Scheitern statt spaeterer kryptischer Fehler in anderen Modulen).
- `init()` propagiert einen Ladefehler als abgelehntes Promise (siehe main.js-Bootstrap-Konvention aus Core:
  Fehler strukturiert loggen, Anwendung nicht crashen lassen -- Entscheidung, wie ein fehlgeschlagenes
  Standards-Laden den App-Start beeinflusst, liegt beim Builder im Rahmen der bestehenden Core-Konvention,
  ist aber keine neue Architekturfrage).

## Getter-Kopien (R17)

- Einfachster Weg: `structuredClone()` wie in ProjectManager.js bereits etabliert (siehe
  planner/js/core/ProjectManager.js, `#cloneOrThrow`). Gleiches Muster kann in Standards.js wiederverwendet
  werden (kein Import aus core/ noetig, ist nur ein Implementierungsmuster).

# Harte Grenzen

- Bearbeite ausschliesslich die im Contract unter Creates/Modifies genannten Dateien (R15, bounded
  contexts): planner/js/standards/main.js, planner/js/standards/Standards.js,
  planner/js/standards/events.js, planner/data/standards.json (neu), sowie genau ein angehaengter Eintrag in
  planner/js/core/module-manifest.js.
- Aendere niemals architecture/planner-architecture.md oder architecture/planner-registry.json -- das ist
  Aufgabe von Architect/Auditor.
- Aendere in planner/js/core/module-manifest.js ausschliesslich durch Anhaengen genau eines neuen
  Array-Eintrags am Dateiende, z. B. `{ name: 'standards', entry: '../standards/main.js' }` -- keine
  Aenderung an Formatierung, Kommentaren, Leerzeilen oder Reihenfolge des bestehenden Inhalts (R15).
- Erfinde keine Schnittstellen, wenn die Registry oder der Contract oben bereits eine Definition enthaelt.
- Kein Zugriff auf andere Feature-Module (existieren noch nicht) und keine Annahmen darueber, wie sie
  Standards later nutzen werden -- nur das oben spezifizierte Public API bereitstellen.

# Ausgabeformat

Nur neue/geaenderte Dateien, voller Pfad als Ueberschrift, vollstaendiger Inhalt je Codeblock. Keine
TODOs/Pseudocode/Platzhalter. Konsistenz-Selbstcheck vor Ausgabe gegen die oben eingebetteten Regeln,
Registry-Eintraege, Contract, Schema und Seed-Data.

Ende: "MODUL STANDARDS FERTIG."
---
