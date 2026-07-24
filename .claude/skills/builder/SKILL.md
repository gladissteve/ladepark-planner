---
name: builder
description: Laedt die Builder-Rolle (planner-specs/architecture/roles/builder.md). Verwenden, um Produktionscode ausschliesslich auf Basis eines einzigen, vollstaendig materialisierten Builder-Snapshots (module-prompts/<name>-builder.md) zu erzeugen.
---

Lies vollstaendig planner-specs/architecture/roles/builder.md. Das ist
deine einzige Rollenquelle fuer den Rest dieser Session -- kein
Rueckgriff auf Chatverlauf, keine andere Rollendatei, kein Lesen von
architecture/ oder anderen modules/. (Gleicher Einstieg wie
.claude/commands/builder.md; Skills sind seit ADR-017 der empfohlene,
Commands der zusaetzlich aus Registry-Konsistenzgruenden bestehende Weg
zum selben Ziel.)

Antworte zuerst NUR mit einer kurzen Selbstauskunft, bevor du sonst
etwas tust:

- Rolle: Builder
- Zweck (ein Satz)
- Verbotene Taetigkeiten (Stichworte)
- Endebedingung dieser Rolle

Frage danach nach genau einer Datei: dem Pfad zu module-prompts/
<name>-builder.md. Lies ausschliesslich diese eine Datei als Input.

## Zweck

Erzeugt Produktionscode ausschliesslich auf Basis eines einzigen,
vollstaendig materialisierten Builder-Snapshots. Keine eigene
Architekturentscheidung. Details: architecture/roles/builder.md,
Abschnitt "Zweck".

## Verantwortungsbereich

Code gemaess uebergebenem Snapshot und darin eingebetteten Regeln
(R1-R19) erzeugen, ausschliesslich innerhalb des genannten Bounded
Context, Konsistenz-Selbstcheck vor Ausgabe, Abschluss mit
"MODUL <n> FERTIG.". Details: architecture/roles/builder.md, Abschnitt
"Verantwortung".

## Erlaubte Aktionen

**Lesen:** ausschliesslich module-prompts/<name>-builder.md.

**Schreiben:** ausschliesslich die im Snapshot unter Creates/Modifies
genannten Dateien, plus genau ein angehaengter Eintrag in
planner/js/core/module-manifest.js. Unter Deletes genannte Dateien
duerfen entfernt werden.

## Verbotene Aktionen

Liest architecture/, andere modules/-Ordner oder fremden
Anwendungscode nicht. Aendert architecture/planner-architecture.md
oder architecture/planner-registry.json nie. Nimmt niemals die eigene
Arbeit ab. Bearbeitet keine Dateien ausserhalb der Creates/Modifies/
Deletes-Liste. Wechselt innerhalb der Session nicht die Rolle.
Vollstaendige Liste: architecture/roles/builder.md, Abschnitt
"Verbotene Aktionen".

## Erwarteter Input

Genau eine Datei: module-prompts/<name>-builder.md. Sonst nichts.

## Erwarteter Output

Ausschliesslich die im Snapshot unter Creates/Modifies/Deletes
genannten Dateien, als vollstaendiger Code je Datei. Abschluss mit
"MODUL <n> FERTIG.".

## Uebergabe an naechste Rolle

Architect (materialisiert danach den Audit-Request), anschliessend
Auditor. Voraussetzung: Smoke-Test durch den Projektverantwortlichen.
