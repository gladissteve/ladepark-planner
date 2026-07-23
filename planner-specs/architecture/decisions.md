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
Datum: 2026-07-22 (Entscheidung bestätigt am 2026-07-23)
Entscheidung: Interne technische IDs in data/standards.json (assetTypes,
cables, chargerTypes, materials) sind stabile lowercase-kebab-case Slugs
(z. B. id: "abb-terra-184"), getrennt vom Hersteller-/Fachcode (z. B.
code: "ABB_TERRA_184") und vom Anzeigenamen (z. B. name: "Terra 184").
id ist der stabile technische Schlüssel für Getter-Zugriffe (R14, z. B.
Standards.getAssetType(id)); code und name sind eigene, unabhängig
änderbare Felder, keine Aliase für id.
Status: accepted
Begründung: Projektverantwortlicher-Entscheidung vom 2026-07-23. Trennung
von technischem Schlüssel, Hersteller-/Fachcode und Anzeigename
vermeidet, dass eine spätere Änderung an Schreibweise/Groß-
Kleinschreibung des Codes oder des Anzeigenamens einen bereits
referenzierten Schlüssel bricht.
Nicht Gegenstand dieses ADR: die strukturelle Frage "ein Eintrag pro
Kabeltyp mit crossSections-Array" vs. "ein Eintrag pro Querschnitt-
Variante" bei cables — das bleibt offener Punkt für den Architect-Lauf
zu Modul 2 selbst.

Historie (ursprünglicher Vorschlag vom 2026-07-22, verworfen, nie
umgesetzt): Objekt-Keys sollten der jeweilige Grossschreibungs-Code des
Eintrags sein (z. B. TRAFO, HPC, NYYJ, ABB_TERRA184), ohne zusätzlichen
separaten lowercase-Slug. Ersetzt durch die obige Entscheidung.

# ADR-010
Datum: 2026-07-22 (Entscheidung bestätigt am 2026-07-23)
Entscheidung: Core (v1.0.0) wird formal als FROZEN markiert (analog zur
contract.md-Konvention aus module-lifecycle.md, auch ohne nachträglich
angelegtes modules/core/contract.md, siehe MIGRATION.md). Im Core-Eintrag
von architecture/planner-registry.json werden die Felder frozenDate
(2026-07-23) und frozenAtCommit (d77d054) ergänzt.
Status: accepted
Begründung: Der Decision Gate für jedes Folgemodul (module-lifecycle.md,
Schritt 0) verlangt "Alle Requires-Abhängigkeiten in der Registry
FROZEN". Core ist Requires für praktisch jedes künftige Modul; eine
explizite Freeze-Markierung beseitigt jede Unklarheit, ob Core noch
änderbar ist, bevor der Architect-Lauf für Modul 2 beginnt.
Frozen-Referenz: frozenAtCommit d77d054 (main-Stand zum Zeitpunkt der
Bestätigung), frozenDate 2026-07-23. Ab diesem Zeitpunkt sind Änderungen
an Core nur noch über eine neue ADR zulässig, kein stilles Editieren.

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
