# Ladepark Planner — Architektur-Artefakte

Dieser Ordner enthaelt den vollstaendigen, aktuellen Stand aller
Architektur-Artefakte. Diese Datei ist ein Ueberblick/eine Ableitung,
keine eigene Wahrheitsquelle -- bei Widerspruch gelten ausschliesslich
die einzelnen Dateien unter architecture/ (siehe deren jeweilige
Autoritaetsstufe, root-CLAUDE.md, Abschnitt "Verbindliche
Architekturquellen").

## Struktur

```
architecture/
  planner-architecture.md   R1-R19, Rollentrennung (Kurzuebersicht),
                             Header-Schema, globale Datenschemas
  planner-registry.json     Eingefrorene/aktuelle Modul-Schnittstellen
                             (Core, Standards)
  role-registry.json        Verbindliche Liste aller (auch archivierter)
                             Rollen samt Rollendatei und Startbefehl
  decisions.md               Architecture Decision Records (ADR-001..018)
  module-lifecycle.md        Verbindliche Schritt-fuer-Schritt-Sequenz
                             (0-12, inkl. Decision Gate und Registry-Freeze)
  process-review.md          Analyse-Dokument (keine Architekturquelle):
                             Review der Governance-Struktur, 2026-07-24
  roles/
    architect.md, builder.md, auditor.md   aktive Rollendefinitionen
    dirigent.md                             archiviert (deprecated, ADR-017)
    README.md                               Ueberblick/Ablaufdiagramm

modules/
  standards/
    contract.md              STATUS: FROZEN (Version 1.0.2)
    schema.json, seed-data.json, notes.md

templates/
  architect-prompt.md, builder-prompt.md, auditor-prompt.md,
  registry-confirmation-prompt.md

module-prompts/
  standards-builder.md, standards-audit-request.md,
  standards-registry-confirmation.md (materialisierte Snapshots fuer
  Modul Standards, README.md erklaert den Zweck der drei Dateitypen)

MIGRATION.md                  Historischer Snapshot der Umstellung von
                               Prompt-Text auf Datei-Struktur (nicht mehr
                               lebend gepflegt)
```

## Aktueller Projektstatus (Kurzfassung, Details in decisions.md und planner-registry.json)

- Modul 1 (Core): FROZEN, frozenAtCommit d77d054.
- Modul 2 (Standards): FROZEN seit 2026-07-24, frozenAtCommit
  688f1829ad92f64734de20c918abd53d8f165268 (ADR-018).
- Naechstes Modul laut Build-Reihenfolge: Asset-System (Decision Gate
  vor Start pruefen, module-lifecycle.md Schritt 0).
- Rollenarchitektur: Architect/Builder/Auditor aktiv, Dirigent seit
  ADR-017 deprecated/archiviert; zusaetzlich die rollenneutralen Skills
  /kickoff und /advisor (keine Rollen im Sinne von role-registry.json).
- Governance-Review vorhanden: architecture/process-review.md
  (2026-07-24) -- Bestandsaufnahme moeglicher Vereinfachungen, selbst
  keine verbindliche Architekturquelle.
