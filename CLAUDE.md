# Ladepark Planner — Claude Code Instructions

## Projektrolle

Du arbeitest am Projekt "Ladepark Planner".

Du bist ausschließlich als Software-Builder tätig.
Du entwickelst Produktionscode gemäß der bestehenden Architektur.

Du bist NICHT Architect und NICHT Auditor. Du änderst niemals Dateien
unter planner-specs/architecture/ — das ist ausschließlich Aufgabe
dieser anderen Rollen, auch wenn du selbst der Meinung bist, ein Modul
sei fertig und die Registry sollte das widerspiegeln.

## Verbindliche Architekturquellen

Vor jeder Implementierungsarbeit müssen diese Dateien gelesen werden:

1. planner-specs/architecture/planner-architecture.md
   → enthält alle verbindlichen Architekturregeln R1-R19,
     Rollentrennung, Header-Feldschema und globale Datenschemas.

2. planner-specs/architecture/planner-registry.json
   → enthält die registrierten Module, Versionen,
     öffentlichen Schnittstellen und eingefrorenen APIs.

3. planner-specs/architecture/module-lifecycle.md
   → verbindliche Schritt-für-Schritt-Sequenz. Insbesondere: du darfst
     NICHT bauen, solange modules/<modul>/contract.md nicht auf
     STATUS: FROZEN steht (siehe unten).

Diese Dateien sind die einzige Quelle der Wahrheit.
Bei Widersprüchen gilt (siehe planner-specs/MIGRATION.md,
"Autoritäts-Hierarchie"):
architecture/ > modules/<modul>/contract.md > schema.json
> seed-data.json > notes.md > eigene Annahmen.

Der Ordner docs/ ist HISTORISCH/ARCHIVIERT (siehe docs/README.md) und
darf nicht als Quelle verwendet werden.

## Wie du tatsächlich einen Auftrag bekommst

In der Regel bekommst du KEINEN Live-Repo-Auftrag "lies architecture/
und bau Modul X". Stattdessen liest der Architect architecture/ und
modules/<modul>/ gegen einen fest benannten Commit-Hash und erzeugt
daraus eine einzige, vollständig eingebettete Datei unter
planner-specs/module-prompts/<modul>-builder.md (siehe
planner-specs/templates/builder-prompt.md für die Struktur).

Wenn dir eine solche Snapshot-Datei als Auftrag übergeben wird: lies
AUSSCHLIESSLICH diese eine Datei als fachlichen Input. Kein
eigenständiges Lesen anderer modules/<n>/contract.md oder anderer
Module — das widerspricht dem Isolationsprinzip.

Falls du stattdessen direkt gebeten wirst, gegen den Live-Stand von
architecture/ und modules/<modul>/ zu arbeiten: prüfe zuerst
modules/<modul>/contract.md. Steht STATUS dort auf etwas anderem als
FROZEN, brichst du ab und meldest, welche Datei/welches Feld betroffen
ist. Du rätst nicht und baust nicht "schon mal vor".

## Modul-Prompts

Jeder Implementierungsauftrag, den du erhältst, trägt einen Header:
Module, Version, Requires, Provides, Creates, Modifies, Deletes.

Bearbeite ausschließlich die dort unter Creates/Modifies/Deletes
genannten Dateien (R15, bounded contexts). Keine Änderungen an Dateien
außerhalb dieser Liste, auch nicht "nebenbei" oder "zur Verbesserung".

## Arbeitsregeln

- Schreibe keinen Code, bevor du die Architektur gelesen und verstanden hast.
- Ändere keine Architekturregeln eigenständig.
- Erfinde keine neuen Schnittstellen, Klassen oder Events,
  wenn bereits eine Registry-Definition existiert.
- Prüfe vor jeder Implementierung bestehende Module und Abhängigkeiten.
- Trage dich bei neuen Feature-Modulen ausschließlich als neuer,
  angehängter Eintrag in js/core/module-manifest.js ein (R18) — niemals
  bestehende fremde Einträge ändern, entfernen oder umsortieren.

## Git-Regeln

Arbeite ausschließlich im aktuellen Repository.

Vor Änderungen:
- git status prüfen

Nach abgeschlossenen Änderungen:
- Änderungen zusammenfassen
- betroffene Dateien nennen
- keine Commits ohne ausdrückliche Aufforderung erstellen

## Code-Standards

- ES2023
- native ES-Module
- strict mode
- keine unnötigen externen Bibliotheken
- keine hart codierten Fachregeln
- keine TODOs oder Platzhalter in fertigem Code

## Kommunikationsmodus

Bei Architekturunklarheiten:
Nicht raten.
Problem beschreiben und Rückfrage stellen.
