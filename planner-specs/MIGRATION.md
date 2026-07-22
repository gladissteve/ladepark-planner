# Migrationsübersicht: alte Prompt-Inhalte → neue Struktur

| Bisher im Prompt enthalten                                | Neuer Ort                                   |
|-------------------------------------------------------------|----------------------------------------------|
| R1–R19 komplett ausgeschrieben                               | architecture/planner-architecture.md          |
| Rollentrennung (Architect/Builder/Auditor)                   | architecture/planner-architecture.md          |
| Header-Feldschema (Module/Version/Requires/...)               | architecture/planner-architecture.md          |
| Globale Datenschemas (Anlage, Kabel, Standards-Top-Level)      | architecture/planner-architecture.md          |
| Registry-Zustand (bereits registrierte Module/Exports/Events)  | architecture/planner-registry.json            |
| Anlagentypen-/Kabel-/HPC-Startbibliothek                       | modules/standards/seed-data.json              |
| Modulspezifische Detail-Schemas                                | modules/<modul>/schema.json                   |
| Ziel, Verantwortlichkeiten, Public API, Events, Bounded Context| modules/<modul>/contract.md                   |
| Modulspezifische Implementierungshinweise (Regex, Merge-Regel)| modules/<modul>/notes.md                      |
| Abnahmekriterien                                               | modules/<modul>/contract.md                   |
| Rein orchestrierende Anweisung an Architect                    | templates/architect-prompt.md                 |
| Rein orchestrierende Anweisung an Builder                      | templates/builder-prompt.md                   |
| Rein orchestrierende Anweisung an Auditor                      | templates/auditor-prompt.md                   |
| Architekturentscheidungen, die sonst nur im Chat-Verlauf leben  | architecture/decisions.md (ADR-Format)        |
| Ablauf Builder→Auditor→Registry, bisher nur implizit beschrieben| architecture/module-lifecycle.md              |

## Autoritäts-Hierarchie bei Widersprüchen

architecture/ (höchste Autorität) > modules/<name>/contract.md > schema.json
> seed-data.json > notes.md (ausschließlich Implementierungshinweise, nie
Architekturentscheidungen — solche gehören in architecture/decisions.md).

## Harte Sperre gegen unfertige Contracts

Jede Spezifikationsdatei trägt eine STATUS-Zeile. Der Builder-Prompt prüft
das zwingend vor jeder Codezeile: alles außer FROZEN → Abbruch mit
Meldung, welche Datei/welches Feld betroffen ist. contract.md für Modul 2
steht aktuell auf DRAFT und wird erst beim vollständigen Architect-Lauf
auf FROZEN gesetzt.

## Was NICHT verloren geht

Jede Regel (R1–R19), jedes Schema, jede Bibliothek und jedes Abnahme-
kriterium aus den bisherigen Modul-1-Prompts ist 1:1 in einer der obigen
Dateien wiederzufinden — nichts wurde gekürzt, nur verschoben.

## Was sich für Modul 1 (Core) ändert

Nichts Rückwirkendes nötig. Core ist fertig und in der Registry
eingetragen. Optional könnte man nachträglich modules/core/contract.md
aus dem bereits genutzten Modul-1-Prompt extrahieren, rein zur
Vollständigkeit/Dokumentation — funktional notwendig ist das nicht mehr,
da Core bereits abgeschlossen und eingefroren ist.

## Was sich für Modul 2 (Standards) und alle Folgemodule ändert

Ab jetzt: modules/<modul>/contract.md wird beim Architect-Lauf vollständig
ausgehandelt (wie bisher der riesige Prompt-Text), aber als eigene Datei
gespeichert statt nur im Chat zu leben. Der eigentliche Builder-Prompt
danach ist kurz (siehe templates/builder-prompt.md) — Claude Code liest
Contract/Schema/Seed-Data/Notes selbst aus dem Repo.

## Gelöste Fragen aus der vorigen Runde

1. Repo ist öffentlich (Apache 2.0) — templates/architect-prompt.md nutzt
   jetzt web_fetch auf die rohen GitHub-URLs als Standardweg, memory_read
   nur noch als Fallback für den Zeitraum einer geplanten Umbenennung/
   Neuveröffentlichung.
2. Slug-Keys-Frage wird NICHT vorab als ADR dokumentiert — erst wenn sie
   beim Architect-Lauf für Modul 2 tatsächlich entschieden wird (siehe
   architecture/decisions.md, ADR-006-Platzhalter).

## Diese Runde: Input-Snapshot statt Live-Dateizugriff für den Builder

Bisher las der Builder architecture/ und modules/<name>/ live aus dem
Repo. Neu: der Architect liest diese Dateien selbst (gegen einen fest
benannten Commit-Hash, ADR-009), bettet ihren Inhalt vollständig in eine
einzige Datei module-prompts/<name>-builder.md ein, und NUR diese eine
Datei bekommt der Builder als Input zu lesen. templates/builder-prompt.md
ist damit kein Prompt mehr, den der Builder selbst sieht, sondern die
Struktur-Vorlage, nach der der Architect die Snapshot-Datei baut.
Grund: Reproduzierbarkeit — Architect-Entscheidung und Builder-Umsetzung
arbeiten so garantiert auf demselben Stand, auch wenn sich das öffentliche
Repo zwischen beiden Läufen ändert.

## Weiterhin offen

Gemini als Auditor: bis zur Verifikation, dass es referenzierte Dateien
zuverlässig liest, bekommt es weiterhin vollen Inhalt statt nur
Dateipfade (siehe templates/auditor-prompt.md).

## Korrektur: Builder-Leseumfang

Frühere Fassung sagte "alle Dateien im Repo lesen" — das widersprach dem
Isolationsprinzip und erhöhte die Gefahr, dass ein Builder unabsichtlich
Contracts/Notes anderer Module liest. templates/builder-prompt.md listet
jetzt eine feste, geschlossene Dateiliste; andere Module werden nur über
den bereits registrierten Registry-Eintrag berücksichtigt, nicht durch
Lesen ihrer Contracts/Notes.

## Checkliste (laut Anforderung)

- Sind alle bisherigen Regeln weiterhin auffindbar? Ja — siehe Tabelle oben.
- Gibt es eine eindeutige Quelle der Wahrheit? Ja für Builder (Repo-Dateien,
  von Claude Code direkt gelesen). Für Architect: ja, sobald Frage 1 oben
  geklärt ist — vorher bleibt es eine manuell synchron gehaltene Kopie.
- Können künftige Module mit deutlich kürzeren Prompts gebaut werden?
  Ja für den Builder-Prompt (siehe templates/builder-prompt.md, ca. 20
  Zeilen statt der bisherigen ~250). Der Architect-Prompt selbst bleibt
  ähnlich lang wie bisher, weil er weiterhin die vollständige Aushandlung
  eines neuen Contracts leisten muss — das ist inhaltliche Arbeit, keine
  Wiederholung, und lässt sich nicht weiter kürzen ohne Informationsverlust.
