---
Audit-Request fuer Modul: Standards
Builder-Snapshot: planner-specs/module-prompts/standards-builder.md
Builder-Snapshot sha256: ba3b3e108c366034beae652b3200663d894a25938fead38c288d2ac995200aea
Build-Commit: OFFEN -- der vom Builder erzeugte Code liegt im aktuellen
  Arbeitsverzeichnis vor (planner/js/standards/*, planner/data/standards.json,
  angehaengter Eintrag in planner/js/core/module-manifest.js), ist aber
  absichtlich noch nicht committed: der Audit soll vor dem Commit
  stattfinden. Der Auditor prueft daher den tatsaechlichen Dateibestand im
  Arbeitsverzeichnis, nicht einen Commit-Stand.
Erzeugt am: 2026-07-23

Rolle: Auditor. Du pruefst fertigen Code eines Moduls gegen Architektur,
Registry und Contract und erzeugst ein Manifest. Du schreibst selbst
keinen Anwendungscode und aktualisierst die Registry NICHT automatisch --
du lieferst ein Manifest zur Pruefung, das erst nach expliziter
Bestaetigung durch den Projektverantwortlichen uebernommen wird.

WICHTIG -- Zuverlaessigkeits-Anforderung: Fuer JEDEN Befund zitierst du
die exakte betroffene Code-Zeile bzw. den exakten Codeausschnitt woertlich
als Beleg. Ein Befund ohne reproduzierbaren Beleg ist kein Befund -- er
wird verworfen, nicht gemeldet. Ein Beleg muss aus dem tatsaechlich
geprueften Code stammen -- nicht aus diesem Prompt, aus
Architekturannahmen oder aus der erwarteten/typischen Implementierung.
Erfinde niemals Methodennamen oder Code-Stellen, die im gelieferten
Material nicht existieren.

VERBINDLICH -- Pruefgrundlage (eingebetteter Code vs. Arbeitsverzeichnis):
Der in diesem Prompt eingebettete Code (Abschnitt "Zu pruefende Dateien")
dient ausschliesslich als Referenzmaterial. Massgeblich fuer das Audit ist
ausschliesslich der tatsaechliche Dateistand im aktuellen
Arbeitsverzeichnis. Der Auditor verifiziert zu Beginn des Audits, dass die
eingebetteten Codebloecke und die Dateien im Arbeitsverzeichnis
uebereinstimmen. Bei Abweichungen gilt ausschliesslich der Dateistand im
Arbeitsverzeichnis. Jede Abweichung ist als eigener Finding mit Dateiname
und Begruendung zu dokumentieren; das Audit wird anschliessend gegen den
tatsaechlichen Dateistand fortgesetzt.

VERBINDLICH -- Scope: Der Auditor prueft ausschliesslich den aktuellen
Build im Arbeitsverzeichnis. Fruehere Commits, Reflog, Stash, Archive oder
Prototypen (z. B. planner-specs/archive/) sind keine Pruefgrundlage und
duerfen nur beruecksichtigt werden, wenn der Contract oder dieser
Audit-Request ausdruecklich darauf verweist.

## Immutable Rules (vollstaendige Kopie R1-R19 + Rollentrennung, aus architecture/planner-architecture.md@22c83231c8d0cf58d148ebad0f6d62b00930aff2)

### Regeln (R1-R19, verbindlich, unveraenderlich ausser durch explizite Absprache)

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

### Rollentrennung

- **Architect**: kennt Architektur + Registry + Modul-Contract, erzeugt nur den Builder-Prompt, danach Schluss
- **Builder**: kennt Architektur + Registry + eigenen Modul-Contract/-Schema/-Seed-Data, kein Schreibzugriff auf Registry
- **Auditor**: kennt Architektur + Registry + fertigen Code, prueft Konsistenz, erzeugt Manifest, schreibt Registry erst nach Bestaetigung

Builder darf nie die eigene Arbeit abnehmen. Architektur-Aenderungen (neue/geaenderte R-Regeln) erfolgen nur
nach expliziter Absprache -- keine Rolle aendert R1-R19 im Rahmen ihrer eigentlichen Aufgabe eigenstaendig.

### Header-Felder jedes Modul-Contracts

- **Module**: eindeutiger Modulname
- **Version**: SemVer des Moduls
- **Requires**: benoetigte Module mit Mindestversion
- **Provides**: oeffentliche Klassen/Services/APIs, die dieses Modul bereitstellt
- **Creates**: neu anzulegende Dateien
- **Modifies**: zu aendernde Dateien
- **Deletes**: zu entfernende Dateien (optional)

### Datenschemas (global, projektweit gueltig)

- **Anlage**: `{id, type, position:{x,y}, rotation, properties:{}, attributes:{}}`
- **Kabel**: `{id, fromAssetId, toAssetId, vertices:[{x,y}], material, category, conduit, reserve, length}`
- **Standards**: `{version, updated, author, assetTypes:{}, cables:{}, chargerTypes:{}, materials:{}, rules:[]}`

## Contract (vollstaendige Kopie aus modules/standards/contract.md@22c83231c8d0cf58d148ebad0f6d62b00930aff2, STATUS FROZEN)

STATUS: FROZEN
frozenAtCommit: 22c83231c8d0cf58d148ebad0f6d62b00930aff2
frozenDate: 2026-07-23

### Header

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

### Zweck

Datengetriebene Verwaltung der Projektstandards gemaess R1: Anlagentypen, Kabelbibliothek, HPC-/
Lademodell-Bibliothek, Materialien, Regeln. Laedt, validiert und stellt data/standards.json bereit; wertet
die darin deklarierten Regeln aus (R3).

### Verantwortlichkeiten

- Laden von data/standards.json zur Laufzeit (kein Hardcoding, R1).
- Strukturelle Validierung des geladenen Inhalts gegen schema.json.
- Bereitstellung typisierter, kopie-basierter Getter (R17) fuer assetTypes, cables, chargerTypes, materials,
  rules.
- Auswertung deklarativer Regeln gegen einen Aufrufer-Kontext (R3).
- Keine eigene Persistenz: Standards schreibt data/standards.json nie selbst; ausschliesslich lesender
  Zugriff.
- Keine Fachlogik ausserhalb dessen, was schema.json/seed-data.json hergeben (keine hartcodierten
  Grenzwerte, Zuordnungen o. Ae.).

### Datenmodell

- Vier Kategorien: assetTypes, cables, chargerTypes, materials. Jede ist ein Object, dessen Keys Slugs sind
  (`^[a-z0-9]+(-[a-z0-9]+)*$`, ADR-006). Jeder Eintrag traegt zusaetzlich ein eigenes `id`-Feld, das exakt
  mit seinem Object-Key uebereinstimmen muss.
- id/code/name-Split gilt einheitlich fuer alle vier Kategorien: `id` = stabiler technischer Slug, `code` =
  Hersteller-/Fachbezeichner (Grossschreibung), `name` = Anzeigename.
- cables: ein Eintrag pro Kabeltyp (Familie: id, code, name, category), einzelne Querschnitt-Varianten
  liegen im `crossSections`-Array (`{crossSection, maxLength}`).
- Referenzen auf einen konkreten Kabel-Querschnitt (assetTypes.defaultCable, chargerTypes.defaultCable) sind
  Objekte `{cableId, crossSection}` oder `null` -- kein zusammengesetzter String mehr.
- materials ist im Seed aktuell leer (`{}`) -- bewusste Entscheidung, kein offener Punkt.

### Datenladen

Standards laedt seine Daten ausschliesslich zur Laufzeit ueber eine gekapselte, intern austauschbare
Ladefunktion (R16-Adapter-Pattern):

- Standardpfad: `data/standards.json`, relativ zu `planner/index.html`, geladen per `fetch()`.
- `main.js` -> `init()` ruft beim Start einmalig die interne Erstladung auf und wartet sie ab, bevor sich
  Standards in der Registry registriert (R18): erst nach erfolgreichem Laden ist `registry.get('standards')`
  verfuegbar.
- `Standards.reload()` (Public API, async) kapselt denselben Ladevorgang fuer spaetere erneute Aufrufe.
- Verboten: hartcodierte Stammdaten im JS (R1), statischer JSON-Modul-Import, direkte
  Dateisystemzugriffe, eigene Schreib-/Persistenzlogik.
- Nach dem Laden: strukturelle Pruefung gegen die in schema.json festgelegten Pflichtfelder/Typen -- manuell
  in Standards.js implementiert, keine externe JSON-Schema-Bibliothek (R10).
- Erfolg: `STANDARDS_EVENTS.LOADED` wird emittiert (Payload: `{version}`), das von `init()`/`reload()`
  zurueckgegebene Promise wird resolved.
- Fehler (Netzwerk/Parse/Validierung): `STANDARDS_EVENTS.LOAD_ERROR` wird emittiert (Payload: strukturiertes
  Fehlerobjekt, R13), das Promise wird rejected. Ein zuvor bereits geladener valider Zustand bleibt bei einem
  fehlgeschlagenen `reload()` unveraendert erhalten.

### Regel-Interpreter (R3)

`Standards.validate(context)` wertet alle Eintraege aus `rules` gegen einen flachen Aufrufer-Kontext aus
(Feldzugriff per Dot-Path, z. B. `"cable.length"`). Unterstuetzte Operatoren mindestens `>`, `>=`, `<`, `<=`,
`==`, `!=`. Niemals `eval()`/`new Function()`. Rueckgabe: Array der zutreffenden (verletzten) Regeln als
Kopien `{id, field, op, value, severity, message}`.

### Public API (Provides)

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

### Events

- **Published**: `STANDARDS_EVENTS.LOADED` (`'standards:loaded'`, Payload `{version}`),
  `STANDARDS_EVENTS.LOAD_ERROR` (`'standards:load-error'`, Payload `{error}`)
- **Consumed**: keine

### Bounded Context (R15)

`planner/js/standards/*`, `planner/data/standards.json`. Ausnahme wie bei jedem Feature-Modul: genau ein
angehaengter Eintrag in `planner/js/core/module-manifest.js` (R18), keine sonstigen Aenderungen ausserhalb
dieses Verzeichnisses.

### Abnahmekriterien

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

Hinweis fuer den Auditor zu diesem Kriterium: "`Standards.init()` registriert sich erst nach erfolgreichem
Erstladen selbst in der Registry unter Key `standards` (R18)." -- der Contract-Wortlaut spricht woertlich
von `Standards.init()` als Methode. R18 selbst und die "Public API (Provides)"-Liste oben sehen jedoch kein
`init()` auf der `Standards`-Klasse vor, sondern ein modulweites, exportiertes `init()` in `main.js`
(`<eigenes-verzeichnis>/main.js` mit exportierter `async init()`-Funktion). Das ist ein Widerspruch
innerhalb des Contracts selbst, keine Aussage ueber den Code. Dieser Audit-Request loest ihn nicht auf --
der Auditor bewertet das Kriterium ausdruecklich unter Nennung dieses Wortlaut-Widerspruchs (PASS/FAIL plus
Begruendung, welche Lesart angelegt wurde), statt ihn stillschweigend zu uebergehen.

## Vorab-Verifikation (vor Beginn der eigentlichen Pruefung, siehe auch Pruefgrundlage-Klausel oben)

Bevor der Auditor mit den Pruefbereichen unten beginnt, prueft er der Reihe nach:

- [ ] Builder-Snapshot sha256 stimmt: sha256 von `planner-specs/module-prompts/standards-builder.md` im
      Arbeitsverzeichnis entspricht dem oben im Header angegebenen Wert (`ba3b3e108c366034beae652b3200663d894a25938fead38c288d2ac995200aea`).
- [ ] Alle unter Contract Creates/Modifies genannten Dateien existieren tatsaechlich im Arbeitsverzeichnis
      (`planner/js/standards/main.js`, `planner/js/standards/Standards.js`, `planner/js/standards/events.js`,
      `planner/data/standards.json`, `planner/js/core/module-manifest.js`). Fehlt eine Datei: FAIL mit
      Dateipfad, keine Annahme ueber ihren vermutlichen Inhalt.
- [ ] Keine Datei ausserhalb dieser Liste wurde fuer dieses Modul angelegt oder veraendert (Bounded-Context-
      Abgleich gegen den tatsaechlichen Verzeichnisinhalt, nicht nur gegen die Liste).
- [ ] Das Arbeitsverzeichnis ist der alleinige Pruefgegenstand (siehe Scope-Klausel oben) -- kein Ruecksprung
      auf Commits, Reflog, Stash oder Archive.

## Zu pruefende Dateien (aus Contract Creates/Modifies, Stand: Arbeitsverzeichnis, uncommitted)

Hinweis fuer den Auditor: die folgenden Dateien liegen im Repo-Arbeitsverzeichnis vor, sind aber noch nicht
committed (siehe Build-Commit oben). Bitte zusaetzlich pruefen, ob im tatsaechlichen Arbeitsverzeichnis
ausserhalb dieser Liste weitere neue/geaenderte Dateien fuer dieses Modul existieren
(Bounded-Context-Verletzung, siehe Pruefbereich 2) -- Stand zum Zeitpunkt der Pruefung selbst verifizieren.

### planner/js/standards/main.js (neu, Creates)

```javascript
import { registry } from '../core/ObjectRegistry.js';
import { Standards } from './Standards.js';

export async function init() {
  const eventBus = registry.get('eventBus');
  const standards = new Standards(eventBus);
  await standards.reload();
  registry.register('standards', standards);
  return standards;
}
```

### planner/js/standards/Standards.js (neu, Creates)

```javascript
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
```

### planner/js/standards/events.js (neu, Creates)

```javascript
// Bounded Context: js/standards/* (R15). Event-Namen ausschließlich als
// Konstanten hier (R13), keine verstreuten String-Literale.
export const STANDARDS_EVENTS = {
  LOADED: 'standards:loaded',
  LOAD_ERROR: 'standards:load-error'
};
```

### planner/data/standards.json (neu, Creates)

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

### planner/js/core/module-manifest.js (Modifies -- Diff gegen den zuletzt registrierten Stand)

Vollstaendiger aktueller Dateiinhalt:

```javascript
export const MODULE_MANIFEST = [
  // Core trägt sich hier nicht ein. Künftige Module fügen GENAU EINEN
  // neuen, eigenen Eintrag hinzu — niemals bestehende Einträge anderer
  // Module ändern, entfernen oder umsortieren:
  // { name: '<modulname>', entry: '<relativer Pfad zur eigenen main.js, von js/core/ aus>' }
  { name: 'standards', entry: '../standards/main.js' }
];
```

Diff gegen den committeten Stand (zur Info, Bounded-Context-Pruefung R15):

```diff
   // neuen, eigenen Eintrag hinzu — niemals bestehende Einträge anderer
   // Module ändern, entfernen oder umsortieren:
   // { name: '<modulname>', entry: '<relativer Pfad zur eigenen main.js, von js/core/ aus>' }
+  { name: 'standards', entry: '../standards/main.js' }
 ];
```

## Pruefbereiche

1. Architekturkonformitaet (R1-R19) -- pro Verstoss: Regel-ID, Datei, exaktes Zitat der betroffenen Stelle,
   Begruendung, Empfehlung
2. Bounded-Context-Verletzungen (R15) -- wurden nur die im Contract unter Creates/Modifies genannten Dateien
   angelegt/geaendert? Abgleich gegen den tatsaechlichen Diff/Dateibestand im Arbeitsverzeichnis, nicht nur
   gegen die Liste oben
3. Abnahmekriterien -- jedes einzelne Kriterium aus dem Contract wird mit PASS oder FAIL bewertet, FAIL immer
   mit woertlichem Code-Zitat als Beleg
4. API-Konformitaet -- entspricht die Public API exakt dem Contract (Methodennamen, Signaturen,
   Rueckgabeverhalten)?
5. Abgleich gegen bereits registrierte Module (architecture/planner-registry.json) -- Namenskollisionen,
   gebrochene eingefrorene Signaturen. Aktuell registriert: nur "Core" (Registry-Key core-intern; kein Eintrag
   mit Namen/Key "standards" vorhanden, daher keine bestehende Kollision zu erwarten -- vom Auditor dennoch
   explizit zu verifizieren)
6. Manifest-Eintrag (R18/ADR-008) -- ist der Eintrag in planner/js/core/module-manifest.js tatsaechlich
   vorhanden, korrekt (Registry-Key, Pfad) und als einziger neuer, angehaengter Eintrag ohne Veraenderung
   bestehender fremder Eintraege umgesetzt?
7. Fehlerbehandlung, offensichtliche Laufzeitfehler

## Ausgabeformat

1. Abnahmekriterien-Tabelle: jedes Kriterium aus dem Contract, Status PASS/FAIL, bei FAIL woertliches Zitat +
   Datei + Zeile(nbereich) als Beleg. Kein Kriterium darf fehlen oder ausgelassen werden.
2. Liste weiterer Findings ausserhalb der Abnahmekriterien (nur mit woertlichem Beleg, siehe oben)
3. Vorgeschlagenes Manifest (JSON, Schema wie in planner-registry.json)
4. Ausdruecklich: "Dieses Manifest wurde NICHT gespeichert. Bestaetigung erforderlich."

Ende: "AUDIT STANDARDS ABGESCHLOSSEN."
---
