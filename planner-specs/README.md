# Ladepark Planner — Architektur-Artefakte (finaler Stand aus dem Chat)

Dieser Ordner enthält den vollständigen, aktuellen Stand aller
Architektur-Artefakte, wie sie in der Chat-Session ausgehandelt wurden.
Ab dem Zeitpunkt, an dem dieser Ordner ins Repo übertragen wird, ist der
Chat nur noch Referenz/Historie — das Repo ist die alleinige Quelle der
Wahrheit (siehe auch ADR-001 ff. in architecture/decisions.md).

## Struktur

```
architecture/
  planner-architecture.md   R1-R19, Rollentrennung, Header-Schema, globale
                             Datenschemas, Build-Reihenfolge
  planner-registry.json     Eingefrorene Modul-Schnittstellen (bisher: Core)
  decisions.md               Architecture Decision Records (ADR-001..009)
  module-lifecycle.md        Verbindliche Schritt-für-Schritt-Sequenz
                             (inkl. Decision Gate als Schritt 0)

modules/
  standards/
    contract.md              STATUS: DRAFT — noch nicht final ausgehandelt
    schema.json               JSON Schema Draft 2020-12 für data/standards.json
    seed-data.json             Vollständig befüllte Startbibliothek
    notes.md                   Reine Implementierungshinweise

templates/
  architect-prompt.md         Kurzer, dateibasierter Architect-Prompt
  builder-prompt.md           Struktur-Vorlage für materialisierte
                               Builder-Snapshots (kein direkter Builder-Input)
  auditor-prompt.md            Auditor-Prompt mit Beleg-Pflicht pro Finding

module-prompts/
  (leer, README.md erklärt Zweck — hier landen künftige
  <modul>-builder.md-Snapshots)

MIGRATION.md                  Vollständige Zuordnung: alte Prompt-Inhalte →
                               neuer Ort, plus offene Punkte
```

## Aktueller Projektstatus (Kurzfassung, Details in decisions.md)

- Modul 1 (Core) ist fertig, gepatcht und in planner-registry.json
  eingetragen.
- Modul 2 (Standards) ist noch nicht spezifiziert — contract.md steht auf
  DRAFT. Vor dem Start: Decision Gate in module-lifecycle.md prüfen.
- Repo ist öffentlich (Apache 2.0); Architect liest per web_fetch gegen
  einen fest benannten Commit-Hash (ADR-009), nicht gegen main/HEAD.
- Auditor-Rolle (aktuell testweise Gemini) benötigt weiterhin vollständig
  eingebetteten Inhalt statt Dateiverweisen, bis die zuverlässige
  Verarbeitung referenzierter Dateien bestätigt ist.
