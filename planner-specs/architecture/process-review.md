STATUS: REVIEW (Analyse-Dokument, keine Architekturquelle)
Erstellt: 2026-07-24 (Architect-Auftrag: Architektur- und Prozess-Review)
Geltungsbereich: reine Bestandsaufnahme gegen den aktuellen Repository-
Stand. Enthaelt KEINE neuen Regeln, KEINE Aenderung an R1-R19, KEINE
Rollen-, Registry- oder ADR-Aenderung. Wo dieses Dokument "Empfehlung:
ja" vermerkt, ist damit ein Vorschlag fuer einen kuenftigen, dafuer
beauftragten Architect-Lauf gemeint -- keine bereits vollzogene
Entscheidung.

# Architektur- und Prozess-Review

## Executive Summary

Die Governance-Struktur (Rollen, Lifecycle, ADR-Log, Skills/Commands)
funktioniert und hat in dieser Session mehrfach echten Nutzen gezeigt --
zuletzt, als die Rollentrennung selbst verhindert hat, dass eine
Architect-Session versehentlich einen Registry-Schreibvorgang uebernimmt,
der ausschliesslich dem Auditor zusteht. Die Kernmechanik (Contract-
Freeze, materialisierte Snapshots, zweiphasiger Auditor, ADR-Log fuer
Architekturentscheidungen) ist notwendige Komplexitaet fuer ein
KI-unterstuetztes Projekt und sollte nicht abgebaut werden.

Gleichzeitig zeigt der aktuelle Stand fuer ein Projekt mit bislang zwei
Modulen (Core, Standards) bereits sichtbare Ueberlastungs- und
Drift-Symptome: 18 ADRs, davon sieben reine Prozess-/Meta-Entscheidungen
und zwei volle ADR-Zyklen fuer einzelne Formulierungskorrekturen in
einem FROZEN-Contract; eine Skill-Struktur, die laut Dokumentation der
"primaere Einstieg" sein soll, im tatsaechlichen Repository aber nur zu
einem Fuenftel existiert (nur .claude/skills/kickoff/SKILL.md ist
tatsaechlich abgelegt); und ein CLAUDE.md, das sich in seinem eigenen
ersten Absatz selbst widerspricht (nennt weiterhin "vier Rollen inkl.
Dirigent", waehrend der Rest derselben Datei korrekt drei aktive Rollen
plus deprecateten Dirigenten beschreibt).

Empfehlung in einem Satz: nicht vereinfachen um der Vereinfachung willen,
sondern zuerst Soll und Ist wieder deckungsgleich machen (Skills
vollstaendig ausrollen, offensichtliche Widersprueche redaktionell
beheben), und danach gezielt die ADR-Schwelle fuer Trivialfaelle senken,
bevor ein Projekthandbuch daraus entsteht.

---

## 1. Aktuelle Struktur

### 1.1 Dokumentenstruktur

| Datei/Ordner | Rolle | Bewertung |
|---|---|---|
| CLAUDE.md | Einstiegspunkt, rollenneutral | verbindlich, aber intern widerspruechlich (siehe 2.3) |
| planner-specs/architecture/planner-architecture.md | R1-R19, Rollentrennung-Kurzuebersicht, Header-/Datenschemas | verbindlich |
| planner-specs/architecture/decisions.md | ADR-Log | verbindlich, aber sehr umfangreich (18 ADRs, siehe 1.4) |
| planner-specs/architecture/module-lifecycle.md | Schritt-fuer-Schritt-Prozess (0-12) | verbindlich |
| planner-specs/architecture/role-registry.json | Rollenliste, Status, Startbefehl | verbindlich, aber alle vier Eintraege stehen weiterhin auf REVIEW ohne definierten Freeze-Pfad (siehe 3) |
| planner-specs/architecture/roles/{architect,builder,auditor}.md | Rollendefinitionen (aktiv) | verbindlich, schlank |
| planner-specs/architecture/roles/dirigent.md | ehemalige Rollendefinition | historisch/archiviert, mit Deprecation-Banner |
| planner-specs/architecture/roles/README.md | Ueberblick, Ablaufdiagramm, Erweiterungsmechanismus | Ableitung (raeumt selbst ein, bei Widerspruch der jeweiligen Rollendatei zu weichen), aktuell gehalten |
| planner-specs/architecture/planner-registry.json | Modul-Registry-Zustand | verbindlich |
| .claude/commands/*.md (4 Dateien) | Legacy-Launcher | Ableitung/technischer Pointer, vollstaendig vorhanden, aber dirigent.md ohne Deprecation-Hinweis (Schreibzugriff auf .claude/ war in dieser Session technisch blockiert) |
| .claude/skills/*/SKILL.md | laut CLAUDE.md/ADR-017 primaerer Einstieg | nur kickoff tatsaechlich im Repo vorhanden; advisor/architect/builder/auditor fehlen im Ist-Zustand (siehe 1.3) |
| planner-specs/README.md | Projektstruktur-Ueberblick | veraltet (nennt "ADR-001..009" und "module-prompts leer" -- beides laengst ueberholt) |
| planner-specs/MIGRATION.md | Snapshot der Umstellung Prompt-Text -> Dateistruktur | historisch, war nie als lebendes Dokument gedacht, korrekt einzuordnen |
| planner-specs/module-prompts/README.md | Erklaerung der Snapshot-Dateien | veraltet (beschreibt Dirigent als Ersteller der Registry-Confirmation -- seit ADR-017 falsch) |
| planner-specs/modules/standards/{contract.md,schema.json,seed-data.json,notes.md} | Modul-Contract Standards | verbindlich (contract.md FROZEN, Autoritaetsstufe siehe ADR-007) |
| planner-specs/module-prompts/standards-*.md | materialisierte Snapshots | Ableitung/Zeitpunktkopie, korrekt als historisch-fuer-dieses-Modul zu lesen |
| planner-specs/templates/*.md | Struktur-Vorlagen fuer Snapshots | verbindlich fuer das Format, nicht fuer den Inhalt |
| docs/README.md, docs/planner-architecture-v1.md, docs/planner-module-registry.json | Vor-Umstellungs-Stand | explizit und korrekt als HISTORISCH/ARCHIVIERT gekennzeichnet, keine Handlung noetig |

Zusammenfuehrungskandidaten: CLAUDE.md ("Session-Start") und
architecture/roles/README.md ("Session-Start", "Ablauf") beschreiben
denselben Sachverhalt (welcher Befehl/Skill laedt welche Rolle, welches
Zustandsdiagramm gilt) in zwei separaten Dateien mit unterschiedlicher
Ausfuehrlichkeit -- echtes Doppelungsrisiko, siehe 2.1.

### 1.2 Rollenmodell

| Rolle | Notwendig? | Ueberschneidung |
|---|---|---|
| Kickoff | Ja -- reiner Lesevorgang, kein Schreibrisiko, ersetzt sauber den frueheren Dirigenten-Statuscheck | keine |
| Advisor | Ja, mit Einschraenkung -- einzige Rolle ohne Schreibrecht, dadurch risikofrei fuer freies Brainstorming; ueberschneidet sich aber inhaltlich mit dem, was Architect ohnehin per Rueckfrage tun soll (siehe 4, Vorschlag 8) | teilweise mit Architect |
| Architect | Ja -- Kernrolle | keine |
| Builder | Ja -- Kernrolle | keine |
| Auditor (Phase 1+2) | Ja -- Kernrolle, Zwei-Phasen-Trennung ist bewusste Sicherheitsmassnahme (ADR-011) | keine |
| Dirigent (ehemalig) | Nein mehr -- Aufgaben sauber auf Kickoff/Advisor/Auditor-Phase-2 verteilt (ADR-017); bereits vollzogenes, gutes Beispiel fuer erfolgreiche Vereinfachung | -- |

Keine unnoetige zusaetzliche "Maschinenebene" gefunden: die aktuelle
Rollenzahl (3 aktive Rollen + 2 rollenneutrale Skills) ist nicht
aufgeblaeht. Die einzige Ueberschneidung mit realem Diskussionsbedarf ist
Advisor/Architect (siehe Vereinfachungsvorschlag 8).

### 1.3 Skill-/Command-Struktur

.claude/commands/ ist der urspruengliche, weiterhin technisch
funktionierende Launcher-Mechanismus (kurzer Text, laedt die Rollendatei).
.claude/skills/ soll laut CLAUDE.md und ADR-017 der empfohlene,
primaere Einstieg sein und enthaelt zusaetzlich die beiden rollenneutralen
Skills kickoff/advisor, die es als Commands nie gab.

Ist-Zustand (Repository-Pruefung dieser Session): .claude/commands/
enthaelt alle vier historischen Dateien (architect.md, builder.md,
auditor.md, dirigent.md). .claude/skills/ enthaelt ausschliesslich
kickoff/SKILL.md -- advisor, architect, builder und auditor existieren
bislang nur als in dieser Session erzeugte, dem Projektverantwortlichen
uebergebene Dateien, nicht im Repository selbst.

Das ist die konkreteste Doppelungs-/Drift-Gefahr im gesamten Review: wer
heute den Ordner .claude/ oeffnet, sieht das Gegenteil dessen, was die
Dokumentation als "primaeren Einstieg" beschreibt. Ein Mensch kann sich
aktuell NICHT allein aus dem Dateisystem heraus zuverlaessig
beantworten, "welchen Einstieg benutze ich fuer welches Problem" --
er muesste zusaetzlich CLAUDE.md lesen, um zu wissen, dass vier von fuenf
Skills noch fehlen. Sobald der Rollout vervollstaendigt ist (siehe
Vereinfachungsvorschlag 1), ist die Trennung selbst klar: Kickoff/Advisor
= rollenneutral, keine Artefakte; Architect/Builder/Auditor = Skills UND
Commands fuehren zur selben Rollendatei, Skills sind nur die kuerzere,
empfohlene Variante.

### 1.4 ADR-System

18 ADRs (ADR-001 bis ADR-018), grobe Kategorisierung:

- Produkt-/Datenmodell-Entscheidungen: ADR-001, 002, 004, 006, 015, 016
  (7 von 18 sind reine Prozess-/Meta-Entscheidungen ueber die
  Governance-Struktur selbst, s.u.)
- Rollentrennung/Prozess-Meta-Entscheidungen: ADR-003, 005, 008, 009,
  011, 013, 017
- Reine Formulierungs-/Konsistenzkorrekturen in einem bereits FROZEN
  Contract, jeweils mit vollem ADR-Zyklus plus Versionsanhebung: ADR-012,
  ADR-014
- Freeze-Vollzug einzelner Registry-Eintraege (mechanische Anwendung des
  immer gleichen ADR-013-Verfahrens): ADR-010 (Core), ADR-018 (Standards)

Risiko einer ADR-Ueberverwaltung: gegeben. Fuer zwei fertiggestellte
Module ist die Zahl der prozessbezogenen bzw. rein mechanischen ADRs
(11 von 18) bereits groesser als die Zahl der eigentlichen
Produktentscheidungen. Ohne Gegensteuerung erzeugt jedes kuenftige Modul
schaetzungsweise mindestens eine Freeze-ADR (analog ADR-010/018) sobald
es Requires-Abhaengigkeiten hat, plus moeglicherweise weitere
Korrektur-ADRs nach demselben ADR-012/014-Muster, sobald sein Contract
FROZEN ist und ein kleiner Fehler auffaellt.

Empfohlene ADR-Grenze (Vorschlag zur kuenftigen Bestaetigung, siehe 5):

Braucht ein ADR: neue oder geaenderte R-Regeln; neue/geaenderte Rollen
oder Lifecycle-Schritte; Datenmodell-/Schema-Entscheidungen mit
Tragweite ueber ein einzelnes Modul hinaus; Autoritaets-/Freigabefragen
(wer darf was, wann).

Braucht kuenftig kein eigenes ADR mehr (Vorschlag): reine
Formulierungs-/Tippfehlerkorrekturen ohne inhaltliche oder API-Aenderung
in einem FROZEN-Dokument (bisheriges Muster: ADR-012, ADR-014) --
stattdessen ein einfacher, direkt im Dokument vermerkter
Korrekturhinweis mit Datum und Kurzbegruendung, ohne Versionssprung;
ebenso der mechanische Freeze-Vollzug einzelner Registry-Eintraege
(bisheriges Muster: ADR-010, ADR-018), da das WIE bereits ein fuer alle
Mal durch ADR-013 geregelt ist und jede weitere Anwendung keine neue
architektonische Aussage trifft -- ein einfaches, tabellarisches
Freeze-Log koennte hier ausreichen.

### 1.5 Registry- und Lifecycle-Prozess

Der Ablauf Architect -> Builder -> Auditor (Phase 1) -> Auditor (Phase 2)
ist sinnvoll und notwendig fuer das explizite Ziel "Schutz vor
KI-Fehlentscheidungen": die Trennung von Erzeugung und Bewertung hat
sich in dieser Session konkret bewaehrt (siehe Executive Summary).

Kein Schritt prueft nachweislich zweimal denselben Sachverhalt. Was
jedoch strukturell zunimmt: jede Requires-Kante zwischen zwei Modulen
durchlaeuft aktuell einen eigenen, vollstaendigen Freeze-Zyklus (ADR
+ Bestaetigung + eigene Auditor-Phase-2-Session, Schritt 12 a-d) --
bei einem wachsenden Modulgraphen (Asset-System braucht Core UND
Standards; GIS braucht vermutlich Assets UND Kabel usw.) waechst dieser
Aufwand mit der Anzahl der Abhaengigkeitskanten, nicht mit der Anzahl
der Module. Das ist die im Review identifizierte Skalierungsgefahr
(siehe 3).

Prozessschritte ohne klaren Verantwortlichen: aktuell keine mehr
gefunden fuer den Modul-Lifecycle (Schritt 10 war bis ADR-017 an den
inzwischen deprecateten Dirigenten gebunden, ist seither korrekt dem
Auditor zugeordnet). Eine Luecke besteht jedoch bei
architecture/role-registry.json selbst: ADR-013 benennt in der eigenen
Begruendung ausdruecklich, dass dasselbe REVIEW/FROZEN-Muster auch dort
vorliegt (alle vier Rolleneintraege stehen weiterhin auf REVIEW), aber
"eine sinngemaesse Uebertragung auf role-registry.json waere ein
eigener, gesondert zu bestaetigender Vorschlag" -- dieser Vorschlag
wurde bislang nicht gemacht. Es gibt also aktuell keinen definierten
Weg, wie/ob Rolleneintraege jemals FROZEN werden sollen (siehe 3 und
Vereinfachungsvorschlag 7).

---

## 2. Erkannte Doppelungen

1. **Session-Start/Ablauf doppelt beschrieben.** CLAUDE.md
   ("Session-Start", "Standardablauf") und architecture/roles/README.md
   ("Session-Start", "Ablauf") beschreiben denselben Sachverhalt
   (Skills/Befehle, Zustandsdiagramm) in zwei separaten Dateien.
   architecture/roles/README.md erklaert zwar selbst eine
   Nachrangigkeitsregel fuer Widersprueche, aber beide Texte muessen bei
   jeder kuenftigen Prozessaenderung synchron gepflegt werden -- ein
   klassisches Zwei-Kopien-Risiko.
2. **Commands/Skills als zwei parallele Launcher fuer dieselbe
   Information.** Fuer architect/builder/auditor existieren (sollen
   existieren) zwei nahezu wortgleiche Einstiegsdateien
   (.claude/commands/<rolle>.md und .claude/skills/<rolle>/SKILL.md).
   Bereits jetzt ist ein Drift-Beispiel entstanden: die Rollendatei
   architecture/roles/dirigent.md traegt einen Deprecation-Hinweis, die
   zugehoerige .claude/commands/dirigent.md nicht (technisch bedingt,
   aber genau das Risikomuster, das zwei parallele Quellen erzeugen).
3. **Veraltete Ableitungsdokumente ohne Aktualisierungspflicht.**
   planner-specs/README.md und planner-specs/module-prompts/README.md
   sind beide inhaltlich hinter dem tatsaechlichen Stand zurueck
   (README.md: ADR-Zahl, Modul-Prompt-Bestand; module-prompts/README.md:
   Dirigent als Ersteller der Confirmation-Datei). Beide sind
   "Ableitungen", fuer die es aber keine Regel gibt, WANN sie
   nachgezogen werden muessen -- im Unterschied zu den verbindlichen
   Architekturdateien, die per ADR-Pflicht aktuell gehalten werden.
4. **CLAUDE.md widerspricht sich selbst.** Der einleitende Absatz
   ("Rollenbasierte Sessions") nennt weiterhin "vier dauerhafte, streng
   getrennte Rollen: Architect, Builder, Auditor, Dirigent", waehrend
   der Abschnitt "Session-Start" derselben Datei korrekt nur drei
   Rollen-Skills/-Befehle auffuehrt und Dirigent explizit als deprecated
   bezeichnet. Das ist keine externe Doppelung, sondern eine interne --
   dieselbe Datei enthaelt zwei sich widersprechende Aussagen ueber die
   Anzahl der Rollen.

---

## 3. Risiken

- **Soll/Ist-Luecke bei .claude/skills/.** Solange nur kickoff
  tatsaechlich existiert, verlaesst sich jede Aussage "Skills sind der
  primaere Einstieg" auf einen Zustand, der im Repository nicht
  nachpruefbar ist. Risiko: ein neuer Mitwirkender (Mensch oder
  KI-Session) findet .claude/commands/ vollstaendig und
  .claude/skills/ fast leer vor und zieht daraus den falschen Schluss,
  Skills seien unfertig/nicht ernst gemeint.
- **CLAUDE.md-Selbstwiderspruch.** Ein Einstiegsdokument, das sich im
  ersten Absatz selbst widerspricht, untergraebt die Kernidee, dass es
  DIE verbindliche, rollenneutrale Quelle ist.
- **ADR-Wachstum ohne Schwelle.** Ohne Gegensteuerung generiert jedes
  kuenftige Modul mindestens eine Freeze-ADR und potenziell weitere
  Korrektur-ADRs nach dem ADR-012/014-Muster -- bei acht geplanten
  Modulen (Build-Reihenfolge, planner-architecture.md) ist ein Anwachsen
  auf 40-60+ ADRs realistisch, von denen ein erheblicher Teil keine
  eigene architektonische Aussage traegt.
- **Fehlender Freeze-Pfad fuer role-registry.json.** Von ADR-013 selbst
  benannt, nie aufgeloest. Kein akutes Problem (Rollen aendern sich
  selten), aber eine offene Flanke, die bei der naechsten
  Rollenerweiterung (z. B. der bereits skizzierten Maintainer-Rolle)
  unvorbereitet auftauchen wuerde.
- **Skalierung des Freeze-Zyklus mit der Kantenzahl des Modulgraphen.**
  Siehe 1.5 -- kein akutes Risiko bei zwei Modulen, aber ein
  vorhersehbares bei acht.

---

## 4. Komplexitätsanalyse

**A) Notwendig** (nicht antasten):
- Rollentrennung Architect/Builder/Auditor samt Grundsatz "Trennung von
  Erzeugung und Bewertung".
- Contract-Lifecycle DRAFT -> REVIEW -> FROZEN mit ADR-Pflicht fuer
  Aenderungen an FROZEN-Dokumenten.
- Vollstaendig materialisierte, in sich geschlossene Snapshots
  (kein Live-Repo-Zugriff fuer Builder/Auditor) -- Reproduzierbarkeit
  und Isolation.
- Zweiphasiger Auditor (Phase 1 Bewertung, Phase 2 Schreibvorgang nach
  menschlicher Bestaetigung).
- ADR-Log fuer echte, folgenreiche Architekturentscheidungen.

**B) Sinnvoll, aber optimierbar:**
- Advisor als eigene Rolle/Skill statt informeller Rueckfrage an
  Architect (Nutzen: Schreibgarantie; Kosten: ein zusaetzlicher
  Launcher mit inhaltlicher Naehe zu Architect).
- Freeze-Ablauf pro Requires-Kante als volle ADR (ADR-010/018-Muster) --
  Mechanik ist richtig, Gewicht pro Anwendung ist vermutlich zu hoch.
- Parallelbetrieb commands/ + skills/ waehrend der Uebergangsphase --
  sinnvoll als Uebergang, nicht als Dauerzustand.
- role-registry.json-Status ohne eigenen Freeze-Pfad -- aktuell folgenlos,
  sollte aber nicht auf unbestimmte Zeit offen bleiben.

**C) Vermutlich Overengineering:**
- Voller ADR-Zyklus plus Versionsanhebung fuer reine
  Formulierungskorrekturen in FROZEN-Dateien (ADR-012, ADR-014-Muster).
- Zwei vollstaendige, weitgehend deckungsgleiche Beschreibungen desselben
  Session-Start-/Ablauf-Sachverhalts in CLAUDE.md und
  architecture/roles/README.md.
- Veraltete Ableitungsdokumente ohne jede Kennzeichnung ihrer
  Nicht-Aktualitaet (planner-specs/README.md,
  planner-specs/module-prompts/README.md) -- nicht ihre Existenz ist das
  Problem, sondern das Fehlen eines "Stand: ueberholt"-Hinweises.

Einordnung der Bewertungskriterien aus der Aufgabenstellung:
Schutz vor KI-Fehlentscheidungen und Nachvollziehbarkeit werden fast
ausschliesslich durch die A-Kategorie getragen -- hier gibt es keinen
Sparpotenzial ohne echten Sicherheitsverlust. Wartbarkeit leidet
aktuell am staerksten unter den C-Punkten (Doppelungen, veraltete
Ableitungen). Geschwindigkeit der Entwicklung wird am staerksten durch
das ADR-Gewicht der C-Punkte gebremst (zwei ADRs fuer reine
Tippfehlerkorrekturen sind reiner Prozess-Overhead ohne Sicherheitsnutzen,
da die eigentliche Aenderung inhaltlich trivial ist).

---

## 5. Vereinfachungsvorschläge

Format je Vorschlag: Nutzen / Risiko / Aufwand / Empfehlung (ja/nein/offen).
"Empfehlung: ja" markiert rein redaktionelle Korrekturen ohne
Architekturwirkung; "offen" markiert echte Architekturentscheidungen,
die ausserhalb dieses Reviews in einem eigens dafuer beauftragten
Architect-Lauf entschieden werden muessten (dieses Review selbst nimmt
laut Auftrag keine Architektur-, Rollen-, Registry- oder ADR-Aenderung vor).

**1. Skill-Rollout vervollstaendigen** (advisor/architect/builder/auditor
tatsaechlich nach .claude/skills/ kopieren, Inhalte liegen bereits vor)
Nutzen: Soll=Ist, keine Fehleinschaetzung mehr, welches System primaer ist.
Risiko: keins (rein additiv).
Aufwand: gering.
Empfehlung: ja.

**2. CLAUDE.md-Kopfabsatz korrigieren** (Widerspruch "vier Rollen inkl.
Dirigent" vs. restliche Datei)
Nutzen: beseitigt eine sofort sichtbare, interne Inkonsistenz im
zentralen Einstiegsdokument.
Risiko: keins (redaktionell, keine Aussageaenderung gegenueber dem Rest
der Datei).
Aufwand: gering.
Empfehlung: ja.

**3. planner-specs/README.md und module-prompts/README.md aktualisieren
oder explizit als "Stand ueberholt" kennzeichnen**
Nutzen: verhindert Fehlgebrauch als aktuelle Quelle.
Risiko: keins.
Aufwand: gering bis mittel.
Empfehlung: ja.

**4. .claude/commands/* nach vollstaendigem Skill-Rollout auf reinen
Verweis reduzieren oder retiren**
Nutzen: eine Wahrheitsquelle statt zwei parallelen, inhaltlich
duplizierten Launchern.
Risiko: role-registry.json Feld commandFile zeigt danach auf eine
Verweisdatei statt auf inhaltlichen Text -- vertretbar, aber eine echte
Entwurfsfrage (behaelt commandFile ueberhaupt noch Sinn?).
Aufwand: gering.
Empfehlung: offen (Architekturentscheidung fuer einen kuenftigen
Architect-Lauf).

**5. ADR-Schwelle einfuehren** (keine volle ADR mehr fuer reine
Formulierungskorrekturen in FROZEN-Dokumenten, siehe 1.4)
Nutzen: bremst absehbares ADR-Wachstum deutlich, ohne echte
Nachvollziehbarkeit zu verlieren (Korrekturhinweis bleibt erhalten,
nur ohne eigenen ADR-Eintrag).
Risiko: gering -- Grenzfaelle ("ist das wirklich nur Formulierung?")
brauchen weiterhin eine bewusste Entscheidung im Zweifelsfall per ADR.
Aufwand: mittel (Kriterium muss selbst irgendwann formal verankert
werden, z. B. als Ergaenzung zu ADR-007).
Empfehlung: offen (echte Architekturentscheidung).

**6. Freeze-Log statt Voll-ADR pro Requires-Kante**
Nutzen: skaliert deutlich besser mit wachsendem Modulgraphen.
Risiko: gering bis mittel -- der Freeze ist sicherheitsrelevant
(Decision Gate haengt daran), ein zu leichtgewichtiges Log koennte
Nachvollziehbarkeit schwaechen, wenn es nicht sorgfaeltig gestaltet wird.
Aufwand: mittel.
Empfehlung: offen (echte Architekturentscheidung).

**7. Freeze-Pfad fuer role-registry.json definieren (oder bewusst
verwerfen)**
Nutzen: schliesst die von ADR-013 selbst benannte, bislang offene Luecke.
Risiko: gering.
Aufwand: gering bis mittel.
Empfehlung: offen (echte Architekturentscheidung).

**8. Advisor mit Architect zusammenlegen**
Nutzen: ein Launcher weniger.
Risiko: mittel bis hoch -- Advisor existiert gerade WEIL Architect (im
Gegensatz zu freiem Brainstorming) einen Aktivierungsritus und
Schreibrechte traegt; die Zusammenlegung wuerde die schreibfreie
Diskussionsmoeglichkeit wieder verlieren, die erst kuerzlich explizit
eingefuehrt wurde, um genau das Dirigenten-Problem (informelle
Vermischung von Diskussion und Entscheidung) nicht zu wiederholen.
Aufwand: gering.
Empfehlung: nein.

**9. Zweiphasigen Auditor zu einer Session zusammenlegen**
Nutzen: ein Sessionwechsel weniger pro Modul.
Risiko: hoch -- widerspricht direkt der ADR-011-Kernerkenntnis
(Bestaetigung darf nicht in derselben Session wie die Bewertung
erfolgen, sonst Gefahr der Selbstbestaetigung).
Aufwand: gering.
Empfehlung: nein.

---

## 6. Empfohlene Zielstruktur

Nicht als sofortige Aenderung, sondern als Orientierung, worauf die
"ja"-Vorschlage aus Abschnitt 5 hinauslaufen, und worueber ein kuenftiger
Architect-Lauf separat entscheiden muesste (die "offen"-Vorschlaege):

| Thema | Zielzustand |
|---|---|
| Session-Einstieg | .claude/skills/{kickoff,advisor,architect,builder,auditor}/SKILL.md vollstaendig vorhanden und tatsaechlich der genutzte Einstieg; .claude/commands/* bleibt vorerst parallel bestehen (Registry-Konsistenz), Inhalt auf reinen Verweis reduzierbar (offen) |
| CLAUDE.md | rollenneutral, ohne internen Widerspruch, weiterhin schlank (keine Kopie von Rolleninhalten) |
| roles/README.md | bleibt Ableitung/Ueberblick, Nachrangigkeitsregel gegenueber Rollendateien bleibt bestehen |
| ADR-Log | weiterhin Pflicht fuer echte Architekturentscheidungen; Trivialkorrekturen und Freeze-Vollzuege ueber ein leichteres Format (Korrekturhinweis im Dokument bzw. Freeze-Log), sofern ein kuenftiger Architect-Lauf das bestaetigt |
| role-registry.json | Status-Semantik (REVIEW/FROZEN) entweder analog Schritt 12 definiert oder bewusst und dokumentiert als "nicht anwendbar fuer Rollen" verworfen |
| planner-specs/README.md, module-prompts/README.md | entweder synchron gehalten oder mit explizitem "Stand ueberholt"-Hinweis versehen, analog zu docs/README.md |

Die Trennung Advisor=Denken / Architect=Architekturentscheidung /
Builder=Umsetzung / Auditor=Pruefung bleibt in dieser Zielstruktur
vollstaendig erhalten -- keiner der Vorschlaege in diesem Review
veraendert diese Grundordnung, mehrere (5, 6, 9) bestaetigen sie
ausdruecklich als schuetzenswert.

---

## 7. Nachtrag (Rueckmeldung Projektverantwortlicher, 2026-07-24)

Ergaenzung nach Durchsicht dieses Reviews durch den
Projektverantwortlichen -- kein neuer Architekturbeschluss, sondern eine
Praezisierung/Bestaetigung einzelner Punkte:

- **Advisor als Experimentierzone.** Der wichtigste im urspruenglichen
  Review fehlende Punkt: Advisor ist nicht nur "eine Rolle ohne
  Schreibrecht", sondern der bewusst einzige Ort im Projekt ohne
  Denkverbot -- Ziel: freies Denken (Hypothesen entwickeln, Architektur
  hinterfragen, Alternativen vergleichen, Risiken benennen), Output
  ausschliesslich Gespraech/Empfehlung, nie eine Datei. Diese Framing
  ist inzwischen in .claude/skills/advisor/SKILL.md uebernommen (siehe
  dortiger Abschnitt "Ziel: freies Denken").
- **Bestaetigung der ADR-Kategorisierung.** Der Projektverantwortliche
  bestaetigt die in Abschnitt 1.4/4 vorgenommene Dreiteilung (echte
  Architekturentscheidungen / Korrekturhistorie / Prozessnotizen) und
  schlaegt als moegliche Zielstruktur eine Ordnertrennung
  decisions/accepted/ vs. decisions/history/ vor. Das ist eine
  eigenstaendige, nicht triviale Strukturaenderung an decisions.md
  (Querverweise aus contract.md, anderen ADRs und Rollendateien auf
  einzelne ADR-Nummern muessten mitgefuehrt werden) -- sie wird hier nur
  als Vorschlag festgehalten, nicht in diesem Review umgesetzt (siehe
  Auftragsgrenze oben: keine ADR-Aenderungen in dieser Session).
- **Priorisierung bestaetigt.** Vor jeder weiteren Architekturarbeit
  (inkl. der oben genannten ADR-Ordnerstruktur und einer moeglichen
  Dokumentations-Neugliederung docs/Projekthandbuch.md +
  architecture/architecture.md + process/workflow.md) soll zuerst
  Soll=Ist beim Skill-Rollout hergestellt werden (Vereinfachungsvorschlag
  1). Deckt sich mit der Reihenfolge dieses Reviews: Vorschlaege 1-3 sind
  "Empfehlung: ja" (rein redaktionell), alle strukturellen Vorschlaege
  bleiben "offen" bis zu einem dafuer beauftragten Architect-Lauf.
