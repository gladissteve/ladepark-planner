# Architecture Decision Records

# ADR-001
Datum: 2026-07-XX
Entscheidung: Vollständige Neuentwicklung für Self-Hosting statt Claude-Artefakt (Mehrdatei-Webanwendung, echtes Leaflet/fetch statt Sandbox-Einzeldatei).
Status: accepted
Begründung: Live-Kartenkacheln, externe Bibliotheken und mehrere Dateien funktionieren im Claude-Artefakt-Sandbox nicht (kein Netzwerkzugriff auf beliebige Domains), im Self-Hosting bereits erfolgreich getestet.

# ADR-002
Datum: 2026-07-XX
Entscheidung: Alle Fachregeln (Anlagentypen, Kabeltypen, Zuordnungen, Validierungsregeln) datengetrieben in data/standards.json statt hart im Code (R1); Regeln als deklaratives Format {field, op, value, severity, message}, kein eval()/new Function() (R3).
Status: accepted
Begründung: Standards sollen zwischen Projekten/Kunden-Vorlagen austauschbar sein; ein importiertes JSON darf niemals Code ausführen können.

# ADR-003
Datum: 2026-07-XX
Entscheidung: Strikte Rollentrennung Architect (erzeugt nur Builder-Prompt) / Builder (schreibt nur Code, kein Registry-Zugriff) / Auditor (prüft, schreibt Registry erst nach Bestätigung).
Status: accepted
Begründung: Ein Modul darf nie die eigene Arbeit abnehmen; verhindert außerdem, dass verschiedene Builder-Chats unterschiedliche Architekturentscheidungen treffen.

# ADR-004
Datum: 2026-07-XX
Entscheidung: Module kommunizieren ausschließlich über einen zentralen EventBus (emit/on), nie über direkte Aufrufe fremder Module (R13); Zugriff auf Core-Singletons nur über registry.get(...), nie Direktimport (R19).
Status: accepted
Begründung: Entkopplung — spätere Module (GIS, Kabeleditor, Reporting) sollen ohneseitige Kopplung an interne Details anderer Module auskommen.

# ADR-005
Datum: 2026-07-XX
Entscheidung: Modul-Registry wird ausschließlich nach expliziter Bestätigung durch den Projektverantwortlichen aktualisiert, nie automatisch direkt bei Prompt-Erzeugung oder durch den Builder selbst.
Status: accepted
Begründung: Ein Manifest zum Zeitpunkt der Prompt-Erzeugung beschreibt nur die Absicht, nicht die tatsächliche Umsetzung; erster Gemini-Audit-Durchlauf zeigte zudem, dass Auditor-Ergebnisse fehlerhaft sein können und vor Übernahme verifiziert werden müssen.

# ADR-006
Datum: 2026-07-22
Entscheidungsvorschlag (Dirigent, zur Bestätigung durch den Projektverantwortlichen):
Objekt-Keys in data/standards.json (assetTypes, cables, chargerTypes,
materials) sind der jeweilige Grossschreibungs-Code des Eintrags (z. B.
TRAFO, HPC, NYYJ, ABB_TERRA184) — kein zusätzlicher, separater
lowercase-Slug.
Status: proposed
Begründung: planner-architecture.md benennt jeden Eintrag der
Start-Bibliotheken bereits über sein "Code"-Feld (Code TRAFO, Code HPC,
Code CAM, Code LEU) — der Code ist damit bereits der eindeutige, stabile
Fachbezeichner. Ein zweiter, paralleler lowercase-Slug als Key wäre eine
zusätzliche ID für dieselbe Sache. R14 verlangt ohnehin Zugriff nur über
Getter (Standards.getAssetType(code)); Code == Key vermeidet eine
zusätzliche Mapping-Ebene zwischen Aufrufer-Code und internem Key. Ein
lauffähiger Präzedenzfall mit dieser Konvention liegt bereits im
archivierten Prototyp vor (planner-specs/archive/standards-prototype-v0)
— als Referenz, nicht als Übernahme-Grundlage.
Nicht Gegenstand dieses ADR: die strukturelle Frage "ein Eintrag pro
Kabeltyp mit crossSections-Array" vs. "ein Eintrag pro Querschnitt-
Variante" bei cables — das bleibt offener Punkt für den Architect-Lauf
zu Modul 2 selbst.

# ADR-010
Datum: 2026-07-22
Entscheidungsvorschlag (Dirigent, zur Bestätigung durch den Projektverantwortlichen):
Core (v1.0.0) wird formal als FROZEN markiert (analog zur
contract.md-Konvention aus module-lifecycle.md, auch ohne nachträglich
angelegtes modules/core/contract.md, siehe MIGRATION.md). Dazu werden im
Core-Eintrag von architecture/planner-registry.json die Felder
frozenDate und frozenAtCommit ergänzt.
Status: proposed
Begründung: Der Decision Gate für jedes Folgemodul (module-lifecycle.md,
Schritt 0) verlangt "Alle Requires-Abhängigkeiten in der Registry
FROZEN". Core ist Requires für praktisch jedes künftige Modul; eine
explizite Freeze-Markierung beseitigt jede Unklarheit, ob Core noch
änderbar ist, bevor der Architect-Lauf für Modul 2 beginnt.
Offener Punkt: aus dem gelieferten Repo-Snapshot liegt kein Commit-Hash
vor (kein .git enthalten). frozenAtCommit bleibt "n/a (Hash ausstehend)",
bis der tatsächliche Commit-Hash des aktuellen main-Standes genannt wird.

# ADR-007
Datum: 2026-07-22
Entscheidung: Autoritäts-Hierarchie der Spezifikationsdateien: architecture/ (höchste Autorität) > modules/<name>/contract.md > schema.json > seed-data.json > notes.md (nur Implementierungshinweise, keine Architekturentscheidungen).
Status: accepted
Begründung: Verhindert, dass ein Builder bei widersprüchlichen Angaben nicht weiß, welche Datei verbindlich ist.

# ADR-008
Datum: 2026-07-22
Entscheidung: planner-registry.json und module-manifest.js beantworten verschiedene Fragen und sind keine konkurrierenden Wahrheiten:

| Aspekt   | Registry              | Manifest                  |
|----------|------------------------|----------------------------|
| Zweck    | Architektur            | Runtime                    |
| Besitzer | Mensch/Architect/Auditor | Code (module-manifest.js) |
| Zeitpunkt| vor Build               | nach Build                 |
| Wahrheit | geplant/freigegeben     | tatsächlich geladen        |

Ein Modul kann in der Registry stehen, ohne dass das Manifest es bereits lädt (z. B. während einer Übergangsphase) — das ist kein Widerspruch. Der Manifest-Eintrag eines Moduls ist Teil von dessen Abnahmekriterien (contract.md) und wird vom Auditor mitgeprüft, bevor das Modul in die Registry aufgenommen wird. Reihenfolge ist immer: Builder → Code → Auditor prüft Manifest → Mensch bestätigt → erst dann Registry-Update. Der Auditor selbst schreibt die Registry nie.
Status: accepted
Begründung: Ohne diese Klärung ist unklar, welche der beiden Dateien im Zweifel gilt, wenn sie auseinanderlaufen.

# ADR-009
Datum: 2026-07-22
Entscheidung: Der Architect liest architecture/ und modules/<name>/ für einen Modul-Lauf immer gegen einen fest benannten Commit-Hash, nie gegen den jeweils aktuellen Stand von main/HEAD. Der verwendete Hash wird in der materialisierten module-prompts/<name>-builder.md sowie im späteren Registry-Eintrag (Feld builtAgainstCommit) festgehalten.
Status: accepted
Begründung: Ein öffentliches Repo kann sich zwischen Architect-Lauf und Builder-Lauf ändern; ohne Pinning könnten beide Rollen faktisch auf unterschiedlichen Ständen arbeiten, ohne dass das sichtbar wird.


## Status-Semantik für diese Entscheidungen (gilt für alle ADRs oben und künftige)

- **accepted** = verbindliche Architektur, muss umgesetzt werden
- **proposed** = Entscheidungsvorschlag, darf NICHT als verbindliche Vorgabe implementiert werden — als offenen Punkt behandeln und beim Architect-Lauf klären
- **rejected** = verworfen, ignorieren

Ein Builder, der eine "proposed"-Entscheidung stillschweigend umsetzt, handelt außerhalb seines Mandats.
