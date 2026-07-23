STATUS: ARCHIVIERT — kein freigegebenes Modul, kein Bestandteil von planner/

Dieser Ordner enthaelt den Code- und Datenstand, der vor der Dirigenten-
Bestandsaufnahme unter planner/js/standards/ und planner/data/standards.json
lag. Er wurde von dort entfernt und hierher verschoben, weil er ausserhalb
des Lifecycle entstanden ist:

- modules/standards/contract.md stand (und steht) auf STATUS: DRAFT.
  module-lifecycle.md Schritt 1 verbietet dem Builder in diesem Zustand
  jede Implementierung.
- Kein Architect-Lauf fuer Modul 2 hat stattgefunden, kein
  module-prompts/standards-builder.md-Snapshot existiert.
- Der Code war nie in architecture/planner-registry.json eingetragen und
  wurde nie von einem Auditor geprueft.

Der Code selbst ist nicht wertlos, weicht aber inhaltlich vom aktuellen
Spec-Entwurf ab und wurde deshalb NICHT uebernommen (Steve-Entscheidung,
siehe Chat-Uebergabe der Dirigenten-Rolle):

- Key-Konvention: nutzt Grossschreibungs-Codes (TRAFO, HPC, NYYJ,
  ABB_TERRA184, ...) als Objekt-Keys, statt der in
  modules/standards/seed-data.json vorgesehenen lowercase-Slugs
  (trafo, hpc, nyy-j-4x16, abb-terra-184, ...). Genau diese Frage war laut
  notes.md bewusst als offener Punkt fuer den Architect-Lauf vorgesehen
  (siehe ADR-006) und wurde hier eigenmaechtig vorentschieden.
- Kabel-Datenmodell strukturell anders als im Schema-Entwurf: ein Eintrag
  pro Kabeltyp mit crossSections-Array, statt einem Eintrag pro
  Querschnitt-Variante.
- chargerTypes.defaultCable ist hier in defaultCable (Code) +
  defaultCrossSection (Zahl) aufgespalten, statt eines kombinierten Slugs.
- rules ist ein leeres Array; die in notes.md als offen markierte
  Regel-Auswertungslogik ({field, op, value}-Interpreter) fehlt komplett.

Verwendungszweck dieses Archivs: Lernartefakt / Referenz fuer den
kommenden Architect-Lauf zu Modul 2 (zeigt eine denkbare, lauffaehige
API-Form fuer Standards), nicht mehr. Kein Code aus diesem Ordner darf
ohne erneuten, vollstaendigen Lifecycle-Durchlauf (Contract -> FROZEN ->
Builder-Snapshot -> Auditor -> Registry-Update) uebernommen werden.
