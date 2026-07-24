---
name: kickoff
description: Rollenneutraler, rein lesender Statusbericht (Git-Stand, Architekturstatus, Registrystatus, aktuelles Modul, naechster Schritt). Verwenden als Einstieg in eine neue Session oder jederzeit, um den Projektstand zu ermitteln, bevor ggf. eine Rolle (/architect, /builder, /auditor) geladen wird. Schreibt nie eine Datei, trifft keine Architekturentscheidung.
---

Rollenneutraler Einstiegs-Skill (kein Rollen-Skill im Sinne von
architecture/role-registry.json -- kein Artefakt-Schreibrecht, kein
Lifecycle-Endpunkt, kein handsOffTo). Quelle: ADR-017 (Punkt 1 "Native
Skill-Struktur" und Punkt 4 "Kickoff-Ausgabeformat", siehe
architecture/decisions.md), architecture/roles/README.md.

## Zweck

Reiner, lesender Statusbericht ueber den aktuellen Projektstand: Git-
Stand, Architekturstatus, offene ADRs, Registrystatus, aktuelles
Modul, naechster Schritt. Keine Architekturentscheidung, kein
Schreibzugriff auf irgendeine Datei.

## Wann verwendet

Zu Beginn einer neuen Session, bzw. jederzeit unabhaengig davon, um
den aktuellen Stand zu ermitteln, bevor ggf. eine Rolle (/architect,
/builder, /auditor) geladen wird. Erster Schritt des Standardablaufs
/kickoff -> /advisor (optional) -> /architect -> /builder -> /auditor
-> Commit -> Push (siehe CLAUDE.md, architecture/roles/README.md,
Abschnitt "Ablauf").

## Ablauf

Lesend ermitteln, ohne etwas zu schreiben oder fachlich zu bewerten:

- Git-Stand (aktueller Branch, letzter Commit)
- Architekturstatus / relevante ADRs (architecture/decisions.md)
- Registrystatus (architecture/planner-registry.json,
  architecture/role-registry.json)
- aktuelles Modul und dessen Stand gegen
  architecture/module-lifecycle.md
- offene Blocker

## Pflichtausgabeformat

Die Ausgabe folgt immer genau diesem Schema (ADR-017, Punkt 4):

```
STATUS
Repository/Commit: <Branch, letzter Commit-Hash>
Relevante ADRs: <offene bzw. fuer den aktuellen Stand relevante ADRs>
Aktuelles Modul: <Modulname + Lifecycle-Stand>
Offene Blocker: <Liste, oder "keine">
Naechster Schritt:
1. ...
2. ...
```

## Verbotene Taetigkeiten

Trifft keine Architekturentscheidung, schreibt keine Datei, bewertet
keinen Code, keine Contracts, keine Findings.
