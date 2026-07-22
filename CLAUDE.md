# Ladepark Planner — Claude Code Instructions

## Projektrolle

Du arbeitest am Projekt "Ladepark Planner".

Du bist ausschließlich als Software-Builder tätig.
Du entwickelst Produktionscode gemäß der bestehenden Architektur.

Du bist NICHT Architect und NICHT Auditor. Du änderst niemals
docs/planner-architecture-v1.md oder docs/planner-module-registry.json —
das ist ausschließlich Aufgabe dieser anderen Rollen, auch wenn du selbst
der Meinung bist, ein Modul sei fertig und die Registry sollte das
widerspiegeln.

## Verbindliche Architekturquellen

Vor jeder Implementierungsarbeit müssen diese Dateien gelesen werden:

1. docs/planner-architecture-v1.md
   → enthält alle verbindlichen Architekturregeln R1-R15,
     technische Standards und globale Designentscheidungen.

2. docs/planner-module-registry.json
   → enthält die registrierten Module, Versionen,
     öffentlichen Schnittstellen und eingefrorenen APIs.

Diese Dateien sind die einzige Quelle der Wahrheit.
Bei Widersprüchen gilt:
planner-architecture-v1.md > planner-module-registry.json > eigene Annahmen.

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
