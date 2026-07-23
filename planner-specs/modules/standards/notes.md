STATUS: DRAFT -- reine Implementierungshinweise, keine Architekturentscheidungen
(alle Architekturentscheidungen zu diesem Modul stehen in contract.md bzw.
architecture/decisions.md, nicht hier)

## Regel-Interpreter (R3)

- Kleiner, sicherer Interpreter fuer `{field, op, value}` -- niemals
  `eval()`/`new Function()`.
- Operatoren mindestens `>`, `>=`, `<`, `<=`, `==`, `!=`; einfache
  switch/if-Kette reicht, keine Ausdruckssprache noetig.
- `field` ist ein Dot-Path in den vom Aufrufer uebergebenen `context`
  (z. B. `"cable.length"` -> `context.cable.length`). Fehlt ein Segment
  im Kontext, gilt die Regel als nicht zutreffend (kein Treffer), nicht
  als Fehler.
- `Standards.validate(context)` iteriert alle `rules`, wertet pro Regel
  den Pfad gegen `context` aus, sammelt alle zutreffenden (verletzten)
  Regeln als Kopien ein und gibt sie zurueck (leeres Array = keine
  Verstoesse).

## Ladevorgang / reload()

- Interner Loader ist eine einzelne Funktion (z. B.
  `#fetchStandards()`), die von `init()` und von `reload()` gemeinsam
  genutzt wird -- kein duplizierter Code, keine zwei unabhaengigen
  Implementierungen.
- Ablauf: `fetch('data/standards.json')` -> JSON parsen -> gegen
  schema.json-Pflichtfelder pruefen (manuell, siehe unten) -> bei Erfolg
  internen Zustand ersetzen und `STANDARDS_EVENTS.LOADED` emittieren,
  bei jedem Fehler (Netzwerk, Parse, Validierung) `STANDARDS_EVENTS.LOAD_ERROR`
  emittieren und den bisherigen internen Zustand unveraendert lassen.
- Validierung muss mindestens pruefen: alle Top-Level-Pflichtfelder
  vorhanden, jede Kategorie ist ein Object, jeder Eintrag hat die in
  schema.json als `required` markierten Felder, jedes `id`-Feld
  entspricht dem eigenen Object-Key und dem Slug-Pattern
  `^[a-z0-9]+(-[a-z0-9]+)*$`. Eine vollstaendige JSON-Schema-Engine ist
  nicht noetig und waere eine externe Abhaengigkeit (R10) -- die obigen
  Pruefungen reichen fuer den Zweck (fruehes, klares Scheitern statt
  spaeterer kryptischer Fehler in anderen Modulen).
- `init()` propagiert einen Ladefehler als abgelehntes Promise (siehe
  main.js-Bootstrap-Konvention aus Core: Fehler strukturiert loggen,
  Anwendung nicht crashen lassen -- Entscheidung, wie ein fehlgeschlagenes
  Standards-Laden den App-Start beeinflusst, liegt beim Builder im Rahmen
  der bestehenden Core-Konvention, ist aber keine neue Architekturfrage).

## Getter-Kopien (R17)

- Einfachster Weg: `structuredClone()` wie in ProjectManager.js bereits
  etabliert (siehe planner/js/core/ProjectManager.js, `#cloneOrThrow`).
  Gleiches Muster kann in Standards.js wiederverwendet werden (kein
  Import aus core/ noetig, ist nur ein Implementierungsmuster).

## Verworfene Formulierung (nicht mehr relevant)

Der fruehere Hinweis "Initialisierung von data/standards.json aus
seed-data.json beim ersten Start wird im Architect-Lauf festgelegt" ist
erledigt -- siehe contract.md, Abschnitt "Datenladen". seed-data.json
dient dem Builder als Inhalt fuer die neu anzulegende Datei
`planner/data/standards.json` (Creates), nicht als Laufzeit-Fallback.
