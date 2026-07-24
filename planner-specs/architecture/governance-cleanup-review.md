STATUS: REVIEW (Analyse-/Entscheidungsgrundlage, keine Architekturquelle)
Erstellt: 2026-07-24 (Architect-Auftrag: Governance-Cleanup nach
abgeschlossenem Process Review, gegen architecture/process-review.md)
Geltungsbereich: reine Bestandsaufnahme und Klassifizierung gegen den
aktuellen Repository-Stand (geprüft am 2026-07-24, Arbeitsverzeichnis
inkl. nicht committeter Änderungen). Enthält KEINE Änderung an R1-R19,
an Contracts, an der Modul- oder Rollen-Registry, an Code oder am
Rollenstatus. Wo unten "Kategorie A" steht, ist das eine Einschätzung,
keine bereits vollzogene Änderung — nichts in diesem Dokument wurde von
dieser Session selbst umgesetzt.

# Governance-Cleanup-Review

## 0. Ausgangslage und Verhältnis zu process-review.md

architecture/process-review.md (2026-07-24) hat bereits eine vollständige
Bestandsaufnahme der schlanken Rollenarchitektur (Kickoff/Advisor/
Architect/Builder/Auditor, Dirigent deprecated) geliefert, inklusive
Vereinfachungsvorschlägen 1–9. Dieses Dokument prüft diese Bestandsaufnahme
gegen den *tatsächlichen, heutigen* Dateisystem- und ADR-Stand nach,
bestätigt sie größtenteils, korrigiert zwei Stellen, an denen sich der
Ist-Zustand seither verändert hat, deckt einen bislang nicht erkannten
Funktionsfehler auf und bringt das Ergebnis in die vom Auftrag verlangte
Form (A/redaktionell sofort möglich / B/braucht ADR-Entscheidung /
C/nicht anfassen).

Zwei Korrekturen gegenüber process-review.md vorab, damit nicht aus einem
veralteten Zwischenstand weitergearbeitet wird:

- **planner-specs/README.md und module-prompts/README.md sind entgegen
  process-review.md, Abschnitt 1.1/2.3, bereits aktualisiert** (nicht
  committet, aber im Arbeitsverzeichnis vorhanden). Sie nennen den
  korrekten ADR-Stand (bis ADR-018) und die korrekte Auditor-Phase-2-
  Zuständigkeit statt des Dirigenten. Vereinfachungsvorschlag 3 aus
  process-review.md ist damit inhaltlich bereits erledigt, nur noch nicht
  committet.
- **CLAUDE.md ist entgegen process-review.md, Executive Summary/2.3,
  bereits korrigiert**: der im Review beschriebene Selbstwiderspruch
  ("vier Rollen inkl. Dirigent" im ersten Absatz) existiert im aktuellen
  Arbeitsstand nicht mehr — der Absatz nennt korrekt drei aktive Rollen
  plus deprecateten Dirigenten. Vereinfachungsvorschlag 2 ist damit
  ebenfalls inhaltlich bereits erledigt, nur noch nicht committet.

Beide Korrekturen sind reine Zustandsfeststellungen dieser Session, keine
in dieser Session vorgenommenen Änderungen (siehe `git diff`, welches
diese Anpassungen bereits als vorhandene, nicht committete Änderungen
zeigt).

Ein Befund aus process-review.md ist dagegen **noch nicht behoben und
schwerwiegender als dort beschrieben**: siehe 1.2 unten (leere
kickoff/SKILL.md).

---

## 1. Skill-/Command-Struktur

### 1.1 Ist-Zustand (geprüft per Dateisystem, nicht nur per Dokumentation)

`.claude/commands/` enthält alle vier historischen Launcher
(architect.md, builder.md, auditor.md, dirigent.md), jeweils mit
nicht-leerem Inhalt.

`.claude/skills/` enthält ausschließlich `kickoff/SKILL.md`. Die Dateien
`advisor/SKILL.md`, `architect/SKILL.md`, `builder/SKILL.md`,
`auditor/SKILL.md`, die laut CLAUDE.md, roles/README.md und ADR-017 der
"primäre" bzw. "empfohlene" Einstieg sein sollen, existieren im
Repository nicht — weder committet noch im Arbeitsverzeichnis. Das
bestätigt process-review.md, Abschnitt 1.3, unverändert.

### 1.2 Neuer Befund: kickoff/SKILL.md ist leer

`.claude/skills/kickoff/SKILL.md` existiert als Datei, hat aber **0
Byte Inhalt** — und das nicht erst im Arbeitsverzeichnis, sondern bereits
im letzten Commit (der lokale Diff zeigt für diese Datei ausschließlich
eine Dateimodus-Änderung, keinen Inhaltsunterschied). ADR-017, Punkt 4,
schreibt jedoch ausdrücklich ein festes Kickoff-Ausgabeschema vor und
erklärt es als "verbindlich festgehalten in
`.claude/skills/kickoff/SKILL.md`" — das ist faktisch nicht der Fall.
Der einzige tatsächlich ausgerollte Skill ist damit selbst funktionslos:
eine Session, die `/kickoff` als nativen Skill lädt, findet keine
Anweisung vor. Das ist kein Dokumentationsdrift wie bei den fehlenden
übrigen Skills, sondern ein Bruch zwischen einer bereits akzeptierten
ADR-Vorgabe und dem tatsächlichen Dateiinhalt.

### 1.3 Doppelte Verantwortlichkeit commands/ vs. skills/

Sobald der Skill-Rollout vervollständigt wird, existieren für
Architect/Builder/Auditor zwei Launcher-Dateien mit identischem Zweck
(`.claude/commands/<rolle>.md` und `.claude/skills/<rolle>/SKILL.md`).
Ein Drift-Beispiel ist bereits eingetreten: `architecture/roles/
dirigent.md` trägt einen Deprecation-Hinweis, die zugehörige
`.claude/commands/dirigent.md` (geprüft, siehe 1.1) nicht — wer nur den
Commands-Ordner liest, sieht nicht, dass Dirigent nicht mehr Teil des
Standard-Workflows ist.

### 1.4 Einordnung

- **Kategorie A (redaktionell, sofort möglich):** fehlenden
  Deprecation-Hinweis in `.claude/commands/dirigent.md` ergänzen (Verweis
  auf `architecture/roles/dirigent.md` und ADR-017, keine
  Architekturaussage, reine Konsistenz zwischen zwei bereits bestehenden
  Dokumenten).
- **Kategorie A (redaktionell, sofort möglich, aber dringend):**
  `.claude/skills/kickoff/SKILL.md` mit dem in ADR-017 bereits
  akzeptierten Ausgabeschema befüllen. Das ist keine neue
  Architekturentscheidung, sondern der Vollzug einer bereits
  beschlossenen, seit 2026-07-24 "accepted" ADR — das Fehlen ist ein
  Ausführungsfehler, keine offene Entscheidung.
- **Kategorie A (redaktionell, sofort möglich):** die übrigen vier
  Skill-Dateien (advisor, architect, builder, auditor) analog zu
  `kickoff/SKILL.md` und den bestehenden `.claude/commands/*.md`
  tatsächlich unter `.claude/skills/` ablegen (Vereinfachungsvorschlag 1
  aus process-review.md) — Inhalte sind laut process-review.md bereits
  einmal erzeugt worden, müssen nur noch in den Ordner übernommen werden.
- **Kategorie B (braucht Entscheidung):** ob `.claude/commands/*` auf
  reinen Verweis reduziert oder langfristig zurückgebaut wird
  (Vereinfachungsvorschlag 4 aus process-review.md). Berührt das Feld
  `commandFile` in `architecture/role-registry.json` und ist damit eine
  Registry-relevante Architekturfrage, keine reine Redaktion.

---

## 2. Dirigent-Deprecation

Geprüft gegen `architecture/role-registry.json`, `architecture/roles/
dirigent.md`, `architecture/decisions.md` (ADR-011, ADR-017) und
`architecture/roles/README.md`.

**Muss der Dirigent-Eintrag in role-registry.json unangetastet
bleiben?** Ja. Die Registry ist ausdrücklich append-only (R15/R18-Analogon,
im Datei-Kommentar selbst festgehalten), ADR-017 Punkt 2 bestätigt das
für den Dirigenten-Fall ausdrücklich noch einmal ("Der bestehende
Registry-Eintrag ... bleibt unverändert"). Keine Änderung nötig oder
zulässig. **Kategorie C.**

**Brauchen wir eine neue ADR für die formale Deprecation?** Nein.
ADR-017 IST bereits diese ADR — sie deklariert die Ersetzung/Archivierung
ausdrücklich und ist am 2026-07-24 vom Projektverantwortlichen bestätigt
("accepted", siehe Bestätigungsvermerk am Ende von ADR-017). Eine weitere
ADR für denselben Sachverhalt wäre eine Doppelung ohne neuen Inhalt —
genau das Muster, vor dem Abschnitt 3 unten warnt. **Kategorie C (kein
weiterer ADR-Bedarf).**

**Reicht die bestehende Dokumentation?** Größtenteils ja:
`architecture/roles/dirigent.md` trägt ein vollständiges
Deprecation-Banner mit Verweis auf ADR-017, `roles/README.md` und
`planner-architecture.md` ("Rollentrennung") nennen den deprecateten
Status korrekt, `module-lifecycle.md` Schritt 10/11 ist bereits auf die
Auditor-Phase-2-Zuordnung umgestellt. Die einzige tatsächlich fehlende
Stelle ist `.claude/commands/dirigent.md` ohne Hinweis (siehe 1.3) —
**Kategorie A**, keine neue Entscheidung nötig, nur eine bereits
getroffene Entscheidung an einer vergessenen Stelle nachtragen.

Ein Nebenbefund, der nicht Teil der ursprünglichen drei Fragen war, aber
zur selben Registry-Datei gehört: der einleitende Kommentar in
`role-registry.json` ("Ausschließlich die Rolle Dirigent hängt neue
Einträge an") ist seit ADR-017 Punkt 2 / `roles/README.md`, Abschnitt
"Wie künftige Rollen erweitert werden", Schritt 3, sachlich überholt —
diese Aufgabe liegt inzwischen beim Architect. Da es sich um eine
Änderung an einer Registry-Datei handelt, fällt das nicht unter die für
diese Session zulässigen redaktionellen Korrekturen (Auftrag: "keine
Registry-Änderungen ohne expliziten Auftrag"), auch wenn der Inhalt der
Korrektur selbst trivial und bereits an anderer Stelle entschieden ist.
**Kategorie B (kein neuer ADR nötig, aber expliziter Architect-Auftrag
zur Korrektur dieses einen Kommentarfelds erforderlich, bevor es
geändert wird).**

---

## 3. ADR-Governance

Geprüft gegen den vollständigen Inhalt von `architecture/decisions.md`
(ADR-001 bis ADR-018).

### 3.1 Bestandsaufnahme (bestätigt process-review.md, Abschnitt 1.4)

18 ADRs, davon eine grobe Dreiteilung:

- Echte Produkt-/Datenmodell-Entscheidungen: ADR-001, 002, 004, 006, 015,
  016 (6 von 18).
- Rollentrennung/Prozess-Architektur-Entscheidungen mit echter
  Tragweite: ADR-003, 005, 007, 008, 009, 011, 013, 017 (8 von 18).
- Reine Formulierungskorrekturen in bereits FROZEN-Dokumenten mit vollem
  ADR-Zyklus plus Versionsanhebung: ADR-012, ADR-014 (2 von 18).
- Mechanischer Freeze-Vollzug nach bereits feststehendem Verfahren
  (ADR-013): ADR-010, ADR-018 (2 von 18).

Damit tragen 4 von 18 ADRs (ADR-010, 012, 014, 018) keine eigene
architektonische Aussage, sondern wenden ein an anderer Stelle bereits
entschiedenes Verfahren mechanisch an oder korrigieren reine Formulierung
in einem FROZEN-Dokument. Bei zwei fertiggestellten Modulen ist das schon
spürbar; bei den geplanten acht Modulen (Build-Reihenfolge,
planner-architecture.md) ist ein Anwachsen auf 40+ ADRs überwiegend
prozessualen statt architektonischen Inhalts realistisch, wenn sich daran
nichts ändert.

### 3.2 Empfehlung (deckt sich mit den im Auftrag genannten Beispielen)

ADR-pflichtig bleibt: neue oder geänderte Rolle, Änderung am
Modul-Lifecycle, Änderung an einem Architekturprinzip, Änderung an
R1-R19, Änderung an der Governance-Struktur selbst (also auch: eine
künftige Einführung der hier vorgeschlagenen ADR-Schwelle selbst wäre
ADR-pflichtig, da sie eine Governance-Änderung ist).

Nicht ADR-pflichtig sollte künftig sein: reine
Formulierungs-/Tippfehlerkorrekturen ohne inhaltliche oder API-Änderung
in einem FROZEN-Dokument (Muster ADR-012/ADR-014) — stattdessen ein
direkt im betroffenen Dokument vermerkter, datierter Korrekturhinweis
ohne Versionssprung bzw. mit einer reinen Patch-Versionsanhebung ohne
ADR-Bezug; ebenso der mechanische Freeze-Vollzug einzelner
Registry-Einträge nach einem bereits per ADR-013 feststehenden Verfahren
(Muster ADR-010/ADR-018) — ein einfaches, tabellarisches Freeze-Log
könnte hier ausreichen, da das WIE bereits ein für alle Mal geklärt ist
und jede weitere Anwendung keine neue Aussage trifft.

**Kategorie B.** Diese Empfehlung selbst ist eine Governance-Änderung
(sie verändert, wann künftig ein ADR verlangt wird) und braucht damit
nach der eigenen Logik dieser Empfehlung eine ausdrückliche Entscheidung
des Projektverantwortlichen, sinnvollerweise in Form einer eigenen ADR,
bevor sie angewendet wird. Diese Session trifft diese Entscheidung nicht
selbst.

---

## 4. Arbeitsmodell für zukünftige Entwicklung

Geprüft gegen `architecture/module-lifecycle.md`, `architecture/roles/
README.md` ("Ablauf") und ADR-017.

Der Ablauf `/kickoff → /advisor (optional) → /architect → Builder-Snapshot
→ /builder → /auditor (Phase 1 + Phase 2) → Commit → Push` ist in sich
konsistent dokumentiert (module-lifecycle.md Schritte 0–12, roles/
README.md-Zustandsdiagramm, ADR-017-Workflow-Grafik stimmen überein) und
bildet die Trennung von Erzeugung und Bewertung sauber ab. Kein Schritt
prüft nachweislich zweimal denselben Sachverhalt; der zweiphasige Auditor
und die materialisierten Snapshots sind bewusste Sicherheitsmaßnahmen,
keine zufällige Redundanz.

Zwei konkrete Reibungspunkte, unabhängig von process-review.md neu
eingeordnet:

- **Der Ablauf funktioniert heute nicht wie dokumentiert**, weil sein
  eigener erster Schritt (`/kickoff` als nativer Skill) auf eine leere
  Datei zeigt (siehe 1.2). Das ist der dringendste Reibungspunkt, weil er
  nicht struktureller, sondern rein handwerklicher Natur ist. **Kategorie
  A.**
- **Registry-Freeze-Pfad für role-registry.json bleibt offen** — von
  ADR-013 selbst benannt ("eine sinngemäße Übertragung auf
  role-registry.json wäre ein eigener, gesondert zu bestätigender
  Vorschlag"), bislang nicht gemacht. Kein akutes Problem, da Rollen sich
  selten ändern, aber eine offene Flanke vor der nächsten
  Rollenerweiterung (z. B. der bereits skizzierten Maintainer-Rolle,
  roles/README.md "Ausblick"). **Kategorie B.**

Keine unnötigen Prozessschritte gefunden. Insbesondere: Advisor mit
Architect zusammenzulegen oder die zwei Auditor-Phasen zu einer Session
zu verschmelzen (process-review.md, Vorschläge 8 und 9) würde jeweils
einen der beiden zentralen Sicherheitsmechanismen (schreibfreier
Denkraum bzw. keine Selbstbestätigung) aufheben — beide Vorschläge werden
hier nicht wiederholt, sondern **explizit als Kategorie C (nicht ändern)**
bestätigt, da sie dem Auftrag "keine Vereinfachung um jeden Preis"
widersprächen.

---

## 5. Erkannte Doppelungen (Gesamtübersicht)

1. **Session-Start/Ablauf doppelt beschrieben** in CLAUDE.md und
   `roles/README.md` — bereits durch eine explizite Nachrangigkeitsregel
   entschärft (roles/README.md weicht bei Widerspruch), bleibt aber ein
   Zwei-Kopien-Pflegerisiko.
2. **commands/ und skills/ als zwei Launcher für dieselbe Information**
   (siehe 1.3) — sobald der Rollout vervollständigt ist, wird das der
   Regelfall statt der Ausnahme.
3. **docs/Projekthandbuch.md als dritte Beschreibung desselben
   Session-Einstiegs**, jetzt zusätzlich zu CLAUDE.md und roles/README.md
   im Repository vorhanden (neu, noch nicht committet). Das Dokument
   erklärt sich selbst korrekt als Ableitung ("kein Architekturdokument,
   kopiert keine Regeln") und richtet sich an eine andere Zielgruppe
   (Projektverantwortlicher statt Entwickler/Rollen-Session) — das ist
   eine bewusste, vertretbare Doppelung nach Zielgruppe, keine
   unbeabsichtigte Drift, solange der Disclaimer erhalten bleibt.
   **Kategorie C (kein Handlungsbedarf, nur beobachten)** — sollte aber
   bei der nächsten inhaltlichen Workflow-Änderung als dritte
   Nachzieh-Stelle mitgedacht werden.
4. **Veraltete Ableitungsdokumente ohne Aktualisierungspflicht.**
   `planner-specs/README.md` und `module-prompts/README.md` waren laut
   process-review.md veraltet, sind es im aktuellen Arbeitsstand jedoch
   nicht mehr (siehe 0.) — die zugrunde liegende strukturelle Lücke
   bleibt aber bestehen: es gibt keine Regel, WANN Ableitungsdokumente
   nachgezogen werden müssen, im Unterschied zu den ADR-pflichtigen
   Architekturdateien. **Kategorie B**, falls eine verbindliche Regel
   dafür gewünscht ist; ansonsten **Kategorie C**, wenn Ad-hoc-Pflege wie
   bisher als ausreichend gilt.

---

## 6. Unnötige Komplexität

Bestätigt process-review.md, Abschnitt 4 (Kategorie C dort), keine
neuen Funde: voller ADR-Zyklus für reine Formulierungskorrekturen in
FROZEN-Dateien (ADR-012/014-Muster) und der doppelte
Session-Start-/Ablauf-Text in CLAUDE.md/roles/README.md sind die einzigen
konkret identifizierten Overengineering-Kandidaten. Beide sind in
Abschnitt 3 bzw. 5 oben bereits einsortiert.

Kein Fund, der die Kernmechanik (Contract-Freeze, materialisierte
Snapshots, zweiphasiger Auditor, ADR-Pflicht für echte
Architekturentscheidungen) infrage stellt — diese bleibt notwendige
Komplexität für ein KI-unterstütztes Projekt mit dem expliziten Ziel
"Schutz vor KI-Fehlentscheidungen".

---

## 7. Gesamtklassifizierung

### A) Sofortige redaktionelle Änderungen möglich (keine Architekturaussage, kein Registry-Zugriff)

| # | Änderung | Datei |
|---|---|---|
| A1 | Kickoff-Ausgabeschema aus ADR-017 tatsächlich eintragen (Datei ist leer) | `.claude/skills/kickoff/SKILL.md` |
| A2 | Fehlende Skill-Dateien advisor/architect/builder/auditor tatsächlich ablegen (Inhalte laut process-review.md bereits erzeugt) | `.claude/skills/{advisor,architect,builder,auditor}/SKILL.md` |
| A3 | Deprecation-Hinweis ergänzen, analog zur Rollendatei | `.claude/commands/dirigent.md` |

### B) Benötigt ADR/Entscheidung des Projektverantwortlichen

| # | Frage | Bezug |
|---|---|---|
| B1 | `.claude/commands/*` langfristig auf Verweis reduzieren oder zurückbauen? Berührt Feld `commandFile` in role-registry.json | Vereinfachungsvorschlag 4, process-review.md |
| B2 | Veralteten Append-only-Kommentar in role-registry.json korrigieren (Dirigent → Architect für neue Einträge) | Registry-Datei, expliziter Auftrag nötig |
| B3 | ADR-Schwelle einführen (Formulierungskorrekturen/mechanischer Freeze künftig ohne vollen ADR-Zyklus) | Abschnitt 3.2 |
| B4 | Freeze-Pfad (REVIEW→FROZEN) für role-registry.json definieren oder bewusst verwerfen | ADR-013, offen benannt |
| B5 | Ob/wie veraltete Ableitungsdokumente künftig verbindlich nachgezogen werden müssen | Abschnitt 5, Punkt 4 |

### C) Nicht ändern

| # | Gegenstand | Grund |
|---|---|---|
| C1 | Dirigent-Eintrag in role-registry.json | Append-only, bereits mehrfach bestätigt (ADR-017) |
| C2 | Formale Dirigent-Deprecation an sich | Bereits durch ADR-017 vollzogen, kein weiterer ADR nötig |
| C3 | Advisor/Architect zusammenlegen | Hebt schreibfreien Denkraum auf (process-review.md, Vorschlag 8) |
| C4 | Zweiphasigen Auditor zusammenlegen | Hebt Trennung von Erzeugung/Bewertung auf, widerspricht ADR-011-Kernprinzip (Vorschlag 9) |
| C5 | docs/Projekthandbuch.md als dritte Session-Einstiegsbeschreibung | Bewusste, deklarierte Doppelung nach Zielgruppe, kein Drift-Risiko solange Disclaimer bleibt |
| C6 | R1-R19, Contracts, Registry-Inhalte, Code, Rollenstatus | Außerhalb des Auftrags dieser Session |

---

## 8. Ausdrücklich nicht Gegenstand dieser Session

Diese Session hat keine der oben genannten A/B-Punkte selbst umgesetzt,
keine Registry-Datei geändert, keinen ADR-Status verändert und keine
Datei unter `.claude/` oder `planner-specs/architecture/roles/`
angefasst. Dieses Dokument ist ausschließlich Entscheidungsgrundlage für
einen dafür separat beauftragten Architect-Lauf bzw. für eine direkte
Rückmeldung des Projektverantwortlichen.
