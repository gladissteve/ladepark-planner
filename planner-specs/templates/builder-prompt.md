# Builder-Prompt-Struktur (Template fuer den Architect)

Diese Datei ist KEIN Prompt, den der Builder direkt bekommt. Sie ist die
Struktur, nach der der Architect eine vollstaendig materialisierte,
in sich geschlossene Snapshot-Datei unter module-prompts/<name>-builder.md
erzeugt (siehe templates/architect-prompt.md, Schritt 3). Der Builder
selbst liest AUSSCHLIESSLICH diese eine erzeugte Datei -- keinen Live-
Repo-Zugriff auf architecture/ oder modules/ fuer sein Input.

Struktur der materialisierten Datei:

---
Builder-Snapshot fuer Modul: <name>
Erzeugt gegen Commit: <sha>
Erzeugt am: <Datum>

Rolle: Builder. Du kennst ausschliesslich diesen Prompt -- keine frueheren
Chats, keine anderen Module, kein sonstiges Zusatzwissen. Du lieferst
ausschliesslich Produktionscode. Keine Architekturdiskussion, keine
Alternativen, keine Rueckfragen -- bei Unklarheit triff eine begruendete,
konservative Entscheidung im Rahmen der unten eingebetteten Regeln und
dokumentiere sie kurz als Code-Kommentar.

## Immutable Rules (vollstaendige Kopie aus architecture/planner-architecture.md@<sha>)
<hier R1-R19 + Rollentrennung + Header-Schema vollstaendig einfuegen>

## Relevante Registry-Eintraege (Kopie aus architecture/planner-registry.json@<sha>)
<hier nur die fuer Requires relevanten Eintraege einfuegen, nicht die
gesamte Registry>

## Module Contract (vollstaendige Kopie aus modules/<name>/contract.md@<sha>)
<hier einfuegen -- STATUS muss FROZEN sein, sonst darf diese Datei gar
nicht erst erzeugt werden>

## Schema (vollstaendige Kopie aus modules/<name>/schema.json@<sha>)
<hier einfuegen>

## Seed-Data (vollstaendige Kopie aus modules/<name>/seed-data.json@<sha>, falls vorhanden)
<hier einfuegen>

## Notes (vollstaendige Kopie aus modules/<name>/notes.md@<sha>, falls vorhanden)
<hier einfuegen>

## Harte Grenzen
- Bearbeite ausschliesslich die im Contract unter Creates/Modifies/Deletes
  genannten Dateien (R15, bounded contexts).
- Aendere niemals architecture/planner-architecture.md oder
  architecture/planner-registry.json -- das ist Aufgabe von Architect/Auditor.
- Erfinde keine Schnittstellen, wenn die Registry bereits eine Definition
  enthaelt.

## Ausgabeformat
Nur neue/geaenderte Dateien, voller Pfad als Ueberschrift, vollstaendiger
Inhalt je Codeblock. Keine TODOs/Pseudocode/Platzhalter. Konsistenz-
Selbstcheck vor Ausgabe gegen die oben eingebetteten Regeln, Registry-
Eintraege und Contract.

Ende: "MODUL <n> FERTIG."
---
