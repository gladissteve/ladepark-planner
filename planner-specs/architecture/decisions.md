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


# ADR-011
Datum: 2026-07-23 (korrigiert am 2026-07-23, siehe "Historie" unten)
Entscheidung: Einführung einer dauerhaften Rollenarchitektur für
Claude-Code-Sessions. Vier Rollen (Architect, Builder, Auditor,
Dirigent), jede mit eigener, vollständig in sich geschlossener
Rollendefinition unter architecture/roles/<rolle>.md (verbindliche
Liste in architecture/role-registry.json, neu, append-only analog
R15/R18). Root-CLAUDE.md legt selbst keine Rolle mehr fest, sondern ist
rollenneutral; jede Session startet über genau einen von vier festen
Befehlen (/architect, /builder, /auditor, /dirigent, hinterlegt unter
.claude/commands/), der die vollständige Rollendatei laedt. Ein
Rollenwechsel innerhalb derselben Session ist nicht vorgesehen.

Registry-Schreibvorgang (ergänzt ADR-005/ADR-008 zum "Dass" um das
"Wer"): der Auditor schreibt architecture/planner-registry.json --
abweichend vom Wortlaut "Der Auditor selbst schreibt die Registry nie"
in ADR-008, der sich dort auf das unmittelbare Schreiben direkt im
Anschluss an die eigene Prüfung bezog. Der tatsächliche Schreibvorgang
geschieht ausschließlich in einer NEUEN, zweiten Auditor-Session
("Phase 2"), ausgelöst durch eine vom Dirigenten materialisierte Datei
module-prompts/<name>-registry-confirmation.md (Struktur: templates/
registry-confirmation-prompt.md), die die explizite Bestätigung des
Projektverantwortlichen referenziert und den bestätigten Manifest-
Inhalt wörtlich enthält. Diese zweite Session bewertet nichts neu,
sondern übernimmt den bereits geprüften und bestätigten Inhalt
unverändert. Der Dirigent bleibt reiner Koordinator: er stellt die
Bestätigung fest und materialisiert die Confirmation-Datei, schreibt
aber architecture/planner-registry.json zu keinem Zeitpunkt selbst.
Details: architecture/roles/README.md (Zustandsdiagramm), architecture/
roles/auditor.md, architecture/roles/dirigent.md.

Rolle Dirigent zusätzlich zuständig für: architecture/role-registry.json
pflegen (ausschließlich Anhängen). Details: architecture/roles/
README.md.

Ergänzung vom 2026-07-23 (Rückmeldung Projektverantwortlicher): explizit
aufgenommener Grundsatz "Trennung von Erzeugung und Bewertung" -- eine
Rolle darf niemals das Artefakt bewerten, freigeben oder nachträglich
korrigieren, das sie selbst erzeugt hat (Details und die vier
rollenspezifischen Ausprägungen: architecture/roles/README.md, gleich-
namiger Abschnitt; zusätzlich als kurzer Verweis in jeder einzelnen
Rollendatei verankert). Dieser Grundsatz war vorher bereits implizit in
Einzelregeln enthalten (Builder nimmt nie eigene Arbeit ab, Auditor
schreibt Findings nicht ohne Beleg um, Dirigent trifft keine fachlichen
Entscheidungen) und wird hiermit als eigenständiges, benanntes Prinzip
festgehalten, das bei künftigen Rollenerweiterungen zuerst geprüft
werden soll, bevor eine neue Ausnahme eingeführt wird.

Status: proposed
Begründung: Die bisherige Ein-Datei-CLAUDE.md legte dauerhaft die Rolle
Builder fest und verhinderte damit, dass dieselbe Codebasis auch für
Architect- oder Auditor-Sessions genutzt werden konnte, ohne CLAUDE.md
manuell umzuschreiben — mit dem Risiko, dass eine solche Umschreibung
unbeabsichtigt vom Chatverlauf statt von einer dauerhaften Quelle
abhängt. Die vier bisher schon informell genutzten Rollen
(planner-architecture.md "Rollentrennung"; templates/architect-
prompt.md, builder-prompt.md, auditor-prompt.md) hatten zudem keine
dauerhafte, sessionfähige Form und keine explizite Dirigenten-Rolle für
die Lifecycle-Orchestrierung und den bislang nicht eindeutig
zugewiesenen tatsächlichen Registry-Schreibschritt (module-
lifecycle.md Schritt 11 nannte bisher nur DASS, nicht WER schreibt). Der
Registry-Schreibvorgang liegt beim Auditor statt beim Dirigenten, weil
der Auditor bereits Registry, Code und Findings kennt und der Dirigent
ausdrücklich Koordinator, kein Qualitätsprüfer sein soll (Rückmeldung
Projektverantwortlicher, 2026-07-23).

Historie (ursprünglicher Entwurf vom 2026-07-23, noch am selben Tag vor
Bestätigung korrigiert): ursprünglich sollte der Dirigent selbst
architecture/planner-registry.json schreiben. Verworfen auf Rückmeldung
des Projektverantwortlichen: der Dirigent sei Koordinator, kein
Qualitätsprüfer; der Auditor kenne Registry, Code und Findings bereits
und solle den Schreibvorgang konsequenterweise selbst ausführen.
Ersetzt durch die obige, zweiphasige Auditor-Lösung.

Freigabe-Hinweis: dieses ADR wird NICHT vom Architect eigenständig auf
Status "accepted" gesetzt, auch nicht nach einer informellen Zustimmung
im Chat. Analog zur Änderung von R1–R19 ("nur nach expliziter
Absprache") setzt ausschließlich der Projektverantwortliche diesen
Status explizit und gesondert auf "accepted" -- der Architect trägt
diese Bestätigung danach lediglich nach (Datum + Bezug, wie bei
ADR-006/ADR-010). Erst ab "accepted" gelten die in dieser und der
vorangegangenen Session bereits vorgenommenen Änderungen an CLAUDE.md
und an planner-architecture.md ("Rollentrennung") als verbindlich
integriert.

# ADR-012
Datum: 2026-07-23
Entscheidung: Korrektur einer in sich widersprüchlichen Formulierung in
modules/standards/contract.md, Abschnitt "Abnahmekriterien". Statt
"`Standards.init()` registriert sich erst nach erfolgreichem Erstladen
selbst in der Registry unter Key `standards` (R18)." nun: "Die in
`main.js` exportierte `init()`-Funktion (R18) registriert Standards erst
nach erfolgreichem Erstladen selbst in der Registry unter Key
`standards`." Contract-Version entsprechend von 1.0.0 auf 1.0.1
angehoben. Keine Änderung an R1-R19, an der Public API, an der Registry
oder am Anwendungscode.
Begründung: Auditor-Fund vom 2026-07-23: Der Abnahmekriterien-Satz
sprach von einer Methode "Standards.init()", waehrend sowohl R18
(planner-architecture.md) als auch der eigene Abschnitt "Datenladen"
desselben Contracts uebereinstimmend main.js als Entry Point mit einer
exportierten init()-Funktion definieren, die sich selbst in der Registry
registriert -- keine Methode auf dem Standards-Objekt. Das ist ein
Widerspruch innerhalb des Contracts, keine Architekturverletzung und
kein Builder-Fehler; der Builder-Code bleibt unveraendert. Da der
Contract STATUS FROZEN ist, erfolgt die Korrektur gemaess
module-lifecycle.md Schritt 5 ausschliesslich ueber diese neue ADR plus
Versionsanhebung, nicht durch stilles Editieren.
Status: accepted

## Status-Semantik für diese Entscheidungen (gilt für alle ADRs oben und künftige)

- **accepted** = verbindliche Architektur, muss umgesetzt werden
- **proposed** = Entscheidungsvorschlag, darf NICHT als verbindliche Vorgabe implementiert werden — als offenen Punkt behandeln und beim Architect-Lauf klären
- **rejected** = verworfen, ignorieren

Ein Builder, der eine "proposed"-Entscheidung stillschweigend umsetzt, handelt außerhalb seines Mandats.
