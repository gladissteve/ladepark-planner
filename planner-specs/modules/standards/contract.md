STATUS: FROZEN
frozenAtCommit: 22c83231c8d0cf58d148ebad0f6d62b00930aff2
frozenDate: 2026-07-23

Lifecycle-Hinweis (aus module-lifecycle.md): Aenderungen ab hier nur noch
ueber eine neue ADR (architecture/decisions.md) plus Versionsanhebung,
nie durch stilles Editieren dieser Datei. Freigegeben durch den
Projektverantwortlichen am 2026-07-23. Korrektur frozenAtCommit am
2026-07-23 (Projektverantwortlicher): urspruenglich faelschlich auf
d77d054 (Core-Freeze-Commit) gesetzt -- korrekt ist der Commit, der den
tatsaechlich eingefrorenen Contract-Inhalt traegt,
22c83231c8d0cf58d148ebad0f6d62b00930aff2 ("Freeze standards module
specification"). Core selbst bleibt bei frozenAtCommit d77d054.

Contract-Korrektur (Architect, 2026-07-23, siehe ADR-012 in
architecture/decisions.md, Status: accepted): Abschnitt "Abnahmekriterien"
widersprach R18 und dem eigenen Abschnitt "Datenladen" (beide definieren
main.js mit exportierter init()-Funktion, keine Methode
Standards.init()). Reine Formulierungskorrektur, keine Architektur- oder
Public-API-Aenderung. Version entsprechend auf 1.0.1 angehoben.

Contract-Korrektur (Architect, 2026-07-24, siehe ADR-014 in
architecture/decisions.md, Status: accepted): der Klammerzusatz zur
ADR-012-Referenz im obigen Absatz war veraltet (nannte "Status:
proposed -- Bestaetigung durch den Projektverantwortlichen steht noch
aus", obwohl architecture/decisions.md ADR-012 gemaess ADR-007
(hoechste Autoritaetsstufe) bereits als "Status: accepted" fuehrt) und
wurde entsprechend auf "Status: accepted" korrigiert. Reine
Statusangaben-Korrektur, keine Aenderung an Public API,
Abnahmekriterien, Registry oder Anwendungscode. Version entsprechend
von 1.0.1 auf 1.0.2 angehoben.

## Header

- **Module**: Standards
- **Version**: 1.0.2
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

Datengetriebene Verwaltung der Projektstandards gemaess R1: Anlagentypen,
Kabelbibliothek, HPC-/Lademodell-Bibliothek, Materialien, Regeln. Laedt,
validiert und stellt data/standards.json bereit; wertet die darin
deklarierten Regeln aus (R3).

## Verantwortlichkeiten

- Laden von data/standards.json zur Laufzeit (kein Hardcoding, R1).
- Strukturelle Validierung des geladenen Inhalts gegen schema.json.
- Bereitstellung typisierter, kopie-basierter Getter (R17) fuer
  assetTypes, cables, chargerTypes, materials, rules.
- Auswertung deklarativer Regeln gegen einen Aufrufer-Kontext (R3).
- Keine eigene Persistenz: Standards schreibt data/standards.json nie
  selbst; ausschliesslich lesender Zugriff.
- Keine Fachlogik ausserhalb dessen, was schema.json/seed-data.json
  hergeben (keine hartcodierten Grenzwerte, Zuordnungen o. Ae.).

## Datenmodell (Details verbindlich in schema.json / seed-data.json)

- Vier Kategorien: assetTypes, cables, chargerTypes, materials. Jede ist
  ein Object, dessen Keys Slugs sind (`^[a-z0-9]+(-[a-z0-9]+)*$`, ADR-006).
  Jeder Eintrag traegt zusaetzlich ein eigenes `id`-Feld, das exakt mit
  seinem Object-Key uebereinstimmen muss (Selbstbeschreibung fuer den
  Fall, dass ein Eintrag aus der Map extrahiert wird, z. B. bei
  getAssetTypes()).
- id/code/name-Split gilt einheitlich fuer alle vier Kategorien
  (Entscheidung 2026-07-23, erweitert ADR-006): `id` = stabiler
  technischer Slug, `code` = Hersteller-/Fachbezeichner (Grossschreibung),
  `name` = Anzeigename.
- cables: ein Eintrag pro Kabeltyp (Familie: id, code, name, category),
  einzelne Querschnitt-Varianten liegen im `crossSections`-Array
  (`{crossSection, maxLength}`). Entscheidung 2026-07-23, loest die in
  ADR-006 offen gelassene Strukturfrage.
- Referenzen auf einen konkreten Kabel-Querschnitt (assetTypes.defaultCable,
  chargerTypes.defaultCable) sind Objekte `{cableId, crossSection}` oder
  `null` -- kein zusammengesetzter String mehr.
- materials ist im Seed aktuell leer (`{}`) -- bewusste Entscheidung, kein
  offener Punkt: die Materialbibliothek wird erst befuellt, sobald ein
  konkreter Bedarf (z. B. aus der Mengenermittlung) vorliegt. Das Schema
  ist bereits vollstaendig definiert, damit spaetere Eintraege ohne
  Schema-Aenderung moeglich sind.

## Datenladen (Entscheidung 2026-07-23)

Standards laedt seine Daten ausschliesslich zur Laufzeit ueber eine
gekapselte, intern austauschbare Ladefunktion (R16-Adapter-Pattern):

- Standardpfad: `data/standards.json`, relativ zu `planner/index.html`,
  geladen per `fetch()` (Browser-Standard-API, R10).
- `main.js` -> `init()` ruft beim Start einmalig die interne Erstladung
  auf und wartet sie ab, bevor sich Standards in der Registry registriert
  (R18): erst nach erfolgreichem Laden ist `registry.get('standards')`
  verfuegbar.
- `Standards.reload()` (Public API, async) kapselt denselben Ladevorgang
  fuer spaetere erneute Aufrufe. Der interne Loader darf spaeter ersetzt
  werden (z. B. anderer Pfad, andere Quelle), ohne dass sich die
  oeffentliche API aendert.
- Verboten: hartcodierte Stammdaten im JS (R1), statischer JSON-Modul-
  Import (`import ... assert { type: 'json' }` o. Ae.), direkte
  Dateisystemzugriffe, eigene Schreib-/Persistenzlogik.
- Nach dem Laden: strukturelle Pruefung gegen die in schema.json
  festgelegten Pflichtfelder/Typen -- manuell in Standards.js
  implementiert, keine externe JSON-Schema-Bibliothek (R10).
- Erfolg: `STANDARDS_EVENTS.LOADED` wird emittiert (Payload: `{version}`),
  das von `init()`/`reload()` zurueckgegebene Promise wird resolved.
- Fehler (Netzwerk/Parse/Validierung): `STANDARDS_EVENTS.LOAD_ERROR` wird
  emittiert (Payload: strukturiertes Fehlerobjekt, R13 -- Event-Name und
  Fehlerobjekt getrennt, kein zusammengesetzter String), das Promise wird
  rejected. Ein zuvor bereits geladener valider Zustand bleibt bei einem
  fehlgeschlagenen `reload()` unveraendert erhalten (kein Teil-Update auf
  ungueltige Daten).

## Regel-Interpreter (R3, Implementierungsdetails in notes.md)

`Standards.validate(context)` wertet alle Eintraege aus `rules` gegen
einen flachen Aufrufer-Kontext aus (Feldzugriff per Dot-Path, z. B.
`"cable.length"`). Unterstuetzte Operatoren mindestens `>`, `>=`, `<`,
`<=`, `==`, `!=`. Niemals `eval()`/`new Function()`. Rueckgabe: Array der
zutreffenden (verletzten) Regeln als Kopien
`{id, field, op, value, severity, message}`.

## Public API (Provides)

- `Standards.getAssetType(id)` -- wirft bei unbekannter id
- `Standards.getAssetTypes()` -- Kopie aller Eintraege als Array
- `Standards.getCable(id)` -- ganze Kabeltyp-Familie inkl. crossSections, wirft bei unbekannter id
- `Standards.getCables()` -- Kopie aller Kabeltyp-Familien als Array
- `Standards.getCableCrossSection(id, crossSection)` -- einzelne Variante als flaches Objekt `{id, code, name, category, crossSection, maxLength}`, wirft bei unbekannter Kombination
- `Standards.getChargerType(id)` -- wirft bei unbekannter id
- `Standards.getChargerTypes()` -- Kopie aller Eintraege als Array
- `Standards.getMaterial(id)` -- wirft bei unbekannter id
- `Standards.getMaterials()` -- Kopie aller Eintraege als Array
- `Standards.getRules()` -- Kopie aller Regeln als Array
- `Standards.validate(context)` -- Array verletzter Regeln, siehe oben
- `Standards.getVersion()` -- aktuelle `version` aus data/standards.json
- `Standards.reload()` [async] -- siehe "Datenladen"

## Events

- **Published**: `STANDARDS_EVENTS.LOADED` (`'standards:loaded'`, Payload `{version}`), `STANDARDS_EVENTS.LOAD_ERROR` (`'standards:load-error'`, Payload `{error}`)
- **Consumed**: keine

## Bounded Context (R15)

`planner/js/standards/*`, `planner/data/standards.json`. Ausnahme wie bei
jedem Feature-Modul: genau ein angehaengter Eintrag in
`planner/js/core/module-manifest.js` (R18), keine sonstigen Aenderungen
ausserhalb dieses Verzeichnisses.

## Abnahmekriterien

- [ ] Die in `main.js` exportierte `init()`-Funktion (R18) registriert
      Standards erst nach erfolgreichem Erstladen selbst in der Registry
      unter Key `standards`.
- [ ] Alle Getter liefern Kopien, keine internen Referenzen (R17).
- [ ] Keine hartcodierten Fachregeln im Code (R1) -- alle Werte kommen aus
      data/standards.json.
- [ ] Regel-Interpreter nutzt kein `eval()`/`new Function()` (R3).
- [ ] Zugriff auf Core-Singletons ausschliesslich ueber `registry.get(...)`
      (R19), kein Direktimport der Singleton-Variablen aus core/-Dateien.
- [ ] Event-Namen ausschliesslich als Konstanten aus
      `planner/js/standards/events.js` (R13).
- [ ] Bounded Context eingehalten: keine Dateien ausserhalb von
      `js/standards/*`, `data/standards.json` und dem einen
      Manifest-Anhang (R15).
- [ ] `defaultCable`-Referenzen sind `{cableId, crossSection}` oder
      `null`, keine zusammengesetzten Strings.
- [ ] Ein fehlgeschlagener `reload()` ueberschreibt keinen zuvor gueltigen
      Zustand.
- [ ] Jedes `id`-Feld ist identisch mit seinem Object-Key; alle Keys
      entsprechen `^[a-z0-9]+(-[a-z0-9]+)*$`.
- [ ] Kein direkter `document`-Zugriff (R14 -- Standards braucht ohnehin
      keinen DOM-Zugriff; falls doch, ausschliesslich ueber `DOM.*`).
