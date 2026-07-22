STATUS: DRAFT -- reine Implementierungshinweise, keine Architekturentscheidungen
(Architekturentscheidungen gehoeren in architecture/decisions.md, nicht hierher
-- z. B. die noch offene Frage Slug-Keys vs. Anzeige-Strings in seed-data.json,
die erst beim Architect-Lauf fuer Modul 2 als ADR entschieden wird)

- Regel-Auswertung (R3): kleiner, sicherer Interpreter fuer
  {field, op, value} -- niemals eval()/new Function(). Operatoren mindestens
  >, >=, <, <=, ==, !=.
- Initialisierung von data/standards.json aus seed-data.json beim ersten
  Start: wird im Architect-Lauf fuer Modul 2 vollstaendig festgelegt.
