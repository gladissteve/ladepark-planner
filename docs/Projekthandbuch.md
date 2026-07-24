# Ladepark Planner — Projekthandbuch

Stand: 2026-07-24, gegen Repo-Commit `6ed6a20` (Branch `main`).

Dieses Handbuch ist für dich als Projektverantwortlichen geschrieben —
nicht für einen Entwickler, der sich in den Code einarbeiten will. Es
beantwortet an jeder Stelle vier Fragen: Was musst du wissen? Was
musst du entscheiden? Was übernimmt Claude? Was übernimmt Git? Es ist
kein Architekturdokument und kopiert keine Regeln — Details stehen
immer verlinkt unter `planner-specs/`.

## 0. Wie benutze ich dieses Projekt?

Weißt du nach einer Pause nicht mehr, wo das Projekt gerade steht:
starte `/kickoff`. Das gibt dir einen reinen Statusbericht, bevor du
irgendetwas anderes tust.

Vier typische Situationen und was jeweils passiert:

**Ich habe eine Idee, will aber noch nichts festlegen.** Sprich
einfach mit Claude — normales Gespräch, keine Rolle, keine Änderung
(Details: Abschnitt 5). Wird die Idee konkreter, wechsle in den
Advisor.

**Ich möchte etwas frei diskutieren** — eine Fachfrage, eine
Architekturfrage, ein „was wäre, wenn“. Öffne den Advisor. Das ist
dein Denkraum: Es wird nichts geändert, nichts committet, keine
Architektur festgelegt (Abschnitt 6).

**Ich möchte ein neues Modul bauen oder eine echte Änderung
umsetzen.** Das ist der Modul-Workflow: Advisor (optional) → Architect
→ Builder → Auditor → Commit. Details in Abschnitt 7, Kurzfassung in
der Checkliste am Ende (Abschnitt 11).

**Ich möchte nur verstehen, wie etwas funktioniert oder warum es so
gebaut wurde.** Advisor — oder dieses Handbuch.

Die Grundregel, die alles andere trägt: Nichts am Projekt ändert sich
ungefragt. Eine echte Code- oder Architekturänderung entsteht
ausschließlich über Architect/Builder (Abschnitt 7), und erst ein
Commit macht sie für dich und Claude gemeinsam endgültig sichtbar
(Abschnitt 5).

## 1. Projektziel

Der Ladepark Planner ist eine selbst gehostete Web-Anwendung zur
Planung von Ladeparks für Elektrofahrzeuge: Anlagen (Trafos,
Ladesäulen/HPC etc.), Verkabelung und Kabeltrassen, Kartendarstellung
(GIS) und darauf aufbauend Mengenermittlung und Export.

Das Problem, das gelöst werden soll: Ladepark-Planung hängt stark von
Herstellerkatalogen, Kabeltypen und projekt- bzw. kundenspezifischen
Regeln ab, die sich häufig ändern. Ein Werkzeug, das diese Standards
fest im Code verdrahtet, veraltet schnell. Ein eigener Planner lohnt
sich, weil er Standards als austauschbare Daten behandelt statt als
Code (Abschnitt 2) — und weil eine Standard-Software diesen
spezifischen Zuschnitt (Anlage/Kabel/Trasse/Mengenermittlung in einem
Werkzeug, datengetrieben, selbst gehostet) am Markt nicht abdeckt.

Die langfristige Vision ist der schrittweise Ausbau entlang einer
festen Build-Reihenfolge: Core → Standards → Asset-System →
Kabelsystem → GIS → Kabeleditor → Mengenermittlung → Export. Aktuell
fertig und eingefroren sind **Core** und **Standards**; alles danach
ist noch nicht gebaut.

## 2. Grundprinzipien der Architektur

Für den Alltag reicht es, die Ideen dahinter zu kennen — nicht jede
Einzelregel. Die vollständige Liste (R1–R19) steht in
[`planner-specs/architecture/planner-architecture.md`](../planner-specs/architecture/planner-architecture.md).

- **Datengetrieben:** Fachliche Inhalte (Anlagentypen, Kabeltypen,
  Regeln) liegen in `data/standards.json`, nicht im Code. Standards
  lassen sich so ändern oder zwischen Projekten austauschen, ohne
  Code anzufassen.
- **Core vs. Feature-Module:** Core liefert generische Bausteine
  (Ereignis-System, Projektverwaltung, Speicherung). Fachliche Module
  (Standards, künftig Assets, Kabel, GIS, …) bauen darauf auf, ändern
  Core aber nie mit.
- **Module reden nicht direkt miteinander**, sondern nur über einen
  zentralen, definierten Kanal. Das verhindert, dass ein Modul heimlich
  von internen Details eines anderen Moduls abhängt und beim nächsten
  Umbau kaputtgeht.
- **Jedes Modul hat sein eigenes Verzeichnis** und darf nur dort
  schreiben. Das macht es möglich, Module unabhängig voneinander (auch
  in getrennten Chat-Sessions) zu bauen, ohne dass sie sich gegenseitig
  beschädigen.
- **Contracts vor Code:** Bevor ein Modul gebaut wird, wird schriftlich
  festgelegt, was es tun soll (Zweck, Schnittstelle, Abnahmekriterien).
  Das verhindert, dass Architekturfragen erst beim fertigen Code
  auffallen — und ist der Punkt, an dem du als Projektverantwortlicher
  am meisten mitentscheidest (Abschnitt 7).

## 3. Architekturübersicht

Aktueller Stand (Core und Standards gebaut; alles Gestrichelte ist
geplant, aber noch nicht gestartet):

```
                     Planner Application
                            |
                            v
        Core (Grundfunktionen: Ereignisse, Projekt, Speicherung)
                            |
                            v
                        Standards
              (Anlagentypen, Kabelbibliothek,
               Materialien, Regeln — data/standards.json)
                            |
              ┌─────────────┼──────────────┬───────────────┐
              v             v              v               v
          Assets         Kabel           GIS         Kabeleditor
         (geplant)     (geplant)       (geplant)      (geplant)
              └─────────────┴──────┬───────┴───────────────┘
                                   v
                    Mengenermittlung  /  Export
                              (geplant)
```

## 4. Aufbau der Codebasis

```
planner/
├── index.html            Einstiegspunkt der Anwendung
├── css/main.css
├── js/core/               Core — fertig, änderbar nur über eine
│                          neue, ausdrücklich abgestimmte Entscheidung
├── js/standards/          Standards-Modul — ebenfalls fertig/fest
└── data/standards.json    Stammdaten des Standards-Moduls
```

Für dich wichtig: Code entsteht ausschließlich über den Builder
(Abschnitt 7), und zwar nur innerhalb genau der Dateien, die vorher im
Contract für das jeweilige Modul festgelegt wurden. Ein fertiges,
„eingefrorenes“ Modul wird nicht mehr still bearbeitet — jede spätere
Änderung braucht wieder einen kleinen Architect-Durchlauf. Das ist
der praktische Sinn der getrennten Verzeichnisse: Ein Modul kann
strukturell gar nicht versehentlich in ein anderes hineinschreiben.

## 5. Wie Claude mit dir arbeitet: Desktop, Code und Git

Du arbeitest mit zwei unterschiedlichen Claude-Umgebungen im selben
Windows-Projektordner (`C:\Projects\ladepark-planner`):

**Claude Desktop** (dieser Chat) ist der Ort für Gespräche, Planung,
Analyse und Dokumentation — auch dieses Handbuch ist so entstanden.
Hier kannst du frei denken, Ideen entwickeln und Dokumente erzeugen
lassen, ohne dass automatisch ein kontrollierter Modul-Workflow
angestoßen wird.

**Claude Code** läuft im Terminal (PowerShell) direkt im Projektordner
und führt die eigentliche, kontrollierte Projektarbeit aus: liest
Dateien, schreibt Code, prüft Ergebnisse, erstellt Commits. Architect,
Builder und Auditor folgen dabei immer exakt der jeweiligen
Rollendefinition — unabhängig von der Plattform (Rolle und Plattform
sind getrennte Begriffe, siehe `planner-specs/architecture/roles/
README.md`, Abschnitt „Vier-Schichten-Modell"); aktuell existiert für
diese drei Rollen ausschließlich hier ein technischer Einstiegskanal
(Stand siehe Adapter-Zuordnung ebendort) — ein technischer, jederzeit
revidierbarer Zustand, keine Eigenschaft der Rolle. Beabsichtigt ist
damit, dass Code-Änderungen nachvollziehbar und wiederholbar bleiben,
statt vom Zufall eines Chatverlaufs abzuhängen.

Warum zwei getrennte Umgebungen? Damit freies Denken (Desktop) und
diszipliniertes Umsetzen (Code) nicht denselben Regeln unterliegen
müssen. Im Advisor oder in einem normalen Gespräch soll nichts
versehentlich Code oder Architektur verändern; beim Builder soll
umgekehrt nichts unkontrolliert dazuerfunden werden.

**Normaler Gesprächsmodus.** Sprichst du einfach mit Claude — Fragen
stellen, etwas erklären lassen, überlegen — ohne eine Rolle zu starten
und ohne einen konkreten Auftrag zu erteilen, ändert sich am Projekt
nichts. Weder Architektur noch Code noch Registry ändern sich von
selbst durch bloßes Reden. Etwas ändert sich erst, wenn du einen
klaren Auftrag gibst (z. B. „ändere Datei X“ oder einen Rollenbefehl
wie `/architect`) — und selbst dann bleibt eine Änderung intern, bis
sie committet ist.

**Git ist die gemeinsame Übergabeschicht.** Claude Desktop und Claude
Code sehen nicht automatisch denselben Stand — beide arbeiten auf
demselben Ordner, aber eine Änderung gilt erst als real und für beide
Seiten verbindlich, wenn sie committet ist. Push teilt sie zusätzlich
mit der Außenwelt (z. B. GitHub). Committen und Pushen bleibt dabei
immer deine Entscheidung, nie eine automatische Aktion von Claude
(siehe `CLAUDE.md`, Git-Regeln).

Der tägliche Ablauf in einem Bild:

```
Du
 |
 v
Claude Desktop  (Gespraech -- keine Rolle, keine Aenderung)
 |
 |  optional: Idee konkretisieren
 v
Advisor  (Diskussion, Alternativen, Risiken -- schreibt nichts)
 |
 |  Entscheidung: das soll jetzt tatsaechlich umgesetzt werden
 v
Architect -> Builder -> Auditor   (aktuell: Claude Code, siehe Abschnitt 7)
 |
 v
Git Commit / Push   (durch dich)
 |
 v
Gemeinsamer Projektstand
 (das, was Desktop und Code ab jetzt beide sehen)
```

## 6. Rollen: dein Denkraum und die kontrollierte Umsetzung

**Advisor — dein Denkraum.** Der Advisor ist kein technisches Werkzeug,
sondern der Ort, an dem du frei denken kannst. Dort gibt es
ausdrücklich **keine Denkverbote**: Du kannst jede Idee, jede
Alternative, jeden Änderungswunsch besprechen, auch unausgereifte oder
„falsche“ Gedanken laut durchspielen. Der Advisor bewertet, ordnet ein,
nennt Risiken und Alternativen — aber:

- es entstehen keine Änderungen an Code oder Architektur,
- es entstehen keine Commits,
- es wird keine Architekturentscheidung festgelegt.

Der Advisor ist damit der sichere Ort für alles, was noch nicht
Entscheidung sein soll, sondern erst durchdacht werden muss. Wird aus
der Diskussion eine echte Entscheidung, ist der nächste Schritt der
Architect — das ist bewusst ein Übergang, keine automatische Folge.

**Freier Denkmodus — was darf ich einfach fragen?** Alles. Ein paar
Beispiele, die genau in den Advisor gehören:

- „Wäre eine andere Datenstruktur besser?“
- „Sollten wir GIS früher bauen als geplant?“
- „Ist diese Architektur zu kompliziert?“
- „Was passiert, wenn wir React statt Vanilla JS nehmen?“
- „Welche Risiken siehst du in der aktuellen Modulreihenfolge?“

Der Ablauf dahinter ist immer derselbe:

```
Frage -> Advisor -> Diskussion -> Entscheidung durch dich
                     (keine Datei wird veraendert)
```

Erst wenn du dich entschieden hast, geht es weiter:

```
Entscheidung -> Architect -> Contract -> Builder
```

Diese Trennung ist wichtig, damit du dich nicht selbst durch den
Prozess einsperrst: Fragen und Nachdenken sind immer erlaubt und
kostenlos in dem Sinne, dass nichts davon automatisch zu einer
Änderung führt.

**Kickoff (`/kickoff`)** gibt dir auf Wunsch einen reinen
Statusbericht (Git-Stand, was ist fertig, was ist offen) — ohne selbst
etwas zu bewerten oder festzulegen. Weißt du nach einer Pause nicht
mehr, wo das Projekt gerade steht: starte hiermit.

**Architect (`/architect`).** Hier entscheidest du inhaltlich mit: Der
Architect handelt mit dir aus, was ein neues Modul können soll, und
hält das schriftlich fest (Contract). Deine Entscheidung: Ist das, was
der Architect vorschlägt, tatsächlich das, was gebaut werden soll? Der
Architect selbst schreibt keinen Anwendungscode — er legt aber
tatsächlich schon eine reale Datei im Projekt an (den Contract). Das
ist kein Widerspruch zur Grundregel „nichts ändert sich ungefragt“: Du
hast diesen Schritt durch die Freigabe ausdrücklich ausgelöst, und
verbindlich für das gemeinsame Projekt wird auch diese Datei erst mit
einem Commit (Abschnitt 5).

Als Faustregel für den Übergang Advisor → Architect: Sobald du den Satz
sagen kannst „Das soll jetzt tatsächlich gebaut werden“, ist die Idee
reif für den Architect. Vorher bleibt sie im Advisor.

**Builder (`/builder`).** Sobald der Contract feststeht, erzeugt der
Builder daraus Code — ohne eigene fachliche Entscheidungen zu treffen.
Deine Aufgabe danach: kurz ausprobieren, ob es funktioniert
(Smoke-Test).

**Auditor (`/auditor`) — kein Tester, sondern Architektur-Prüfer.** Der Auditor
probiert nicht aus, ob eine Funktion wie gewünscht läuft (das machst
du selbst, direkt nach dem Builder, als kurzer Smoke-Test). Er prüft
eine andere Frage: Entspricht das Ergebnis dem, was vereinbart wurde —
Contract, Architektur, Prozess? Kurz gesagt:

```
Builder:  "Ich habe es gebaut."
Auditor:  "Entspricht es Contract, Architektur und Prozess?"
```

Nicht: „Ich teste, ob der Knopf klickt.“ Das Ausprobieren der
tatsächlichen Funktion ist dein Teil (Smoke-Test); der Auditor prüft
die Einhaltung der Spielregeln. Er legt dir das Ergebnis zur
Bestätigung vor — deine Entscheidung ist, es zu bestätigen oder
Korrekturen zu verlangen. Erst nach deiner ausdrücklichen Bestätigung
trägt der Auditor das Modul offiziell ein.

Eine vierte, ältere Rolle (**Dirigent**) wird nicht mehr verwendet;
ihre Aufgaben sind auf Kickoff, Advisor und den Auditor verteilt.

## 7. Ablauf für ein neues Modul

```
Du hast eine Idee
      |
      v
Advisor  (optional: Idee/Alternativen durchdenken, schreibt nichts)
      |
      v
Architect erstellt/verhandelt den Contract mit dir
      |
      v
Architect erzeugt daraus einen vollstaendigen Bauplan fuer den Builder
      |
      v
Builder erzeugt den Code
      |
      v
Du: kurzer Test (Smoke-Test)
      |
      v
Auditor prueft den Code und legt dir das Ergebnis vor
      |
      v
Du bestaetigst das Ergebnis
      |
      v
Auditor traegt das Modul offiziell ein
      |
      v
Du: Commit -> Push
```

Zwei Punkte, an denen ausdrücklich deine Entscheidung gefragt ist:
das Freigeben des Contracts beim Architect (bevor überhaupt Code
entsteht) und das Bestätigen des Prüfergebnisses beim Auditor (bevor
das Modul offiziell als fertig gilt). Dazwischen kann es je nach
Prüfergebnis auch einmal zurück zu Builder oder Architect gehen —
Details dazu stehen in `planner-specs/architecture/module-lifecycle.md`.

## 8. Warum dieser Aufwand?

Der Aufwand ist beabsichtigt. Er verhindert Chaos, wenn mehrere Module
über getrennte Chat-Sessions entstehen, die sich sonst nicht kennen
würden. Er verhindert, dass eine Claude-Session im Vorbeigehen eine
Architekturentscheidung trifft — jede fachliche Weichenstellung
kommt entweder aus einer bereits von dir bestätigten Entscheidung oder
wird dir als Rückfrage vorgelegt. Er verhindert versteckte
Abhängigkeiten zwischen Modulen. Und er macht jede Änderung
nachvollziehbar, auch noch in einem halben Jahr.

Das hat einen Preis, den man nicht kleinreden sollte: mehr
Dokumentation, ein langsamerer Start pro Modul, und an mehreren
Stellen Disziplin — etwa, dass ein fertig geprüftes Modul erst nach
deiner ausdrücklichen Bestätigung wirklich als abgeschlossen gilt.

## 9. Bekannte Baustellen

Ein paar Stellen im Projekt sind aktuell noch nicht ganz deckungsgleich
mit ihrer eigenen Beschreibung — für den Alltag nicht blockierend,
aber gut zu wissen:

- Die Kurzbefehle `/kickoff` und `/advisor` sind als Konzept bereits
  ausführlich beschrieben, technisch aber noch nicht vollständig
  hinterlegt (die Kickoff-Datei ist aktuell leer, für Advisor fehlt die
  Datei ganz). Bis das nachgezogen ist, funktionieren Kickoff und
  Advisor am zuverlässigsten, indem du die Rolle im Gespräch einfach
  ausdrücklich benennst.
- Ein, zwei ältere Übersichtsdateien unter `planner-specs/` (z. B. die
  README zu den Modul-Snapshots) spiegeln nicht mehr ganz den
  aktuellen Stand — im Zweifel gilt immer `architecture/decisions.md`
  als aktuellste Quelle.
- Der Ordner `docs/` (außer dieser Datei) ist bewusst archiviert und
  keine aktuelle Quelle — das steht auch in seiner eigenen README.
- Die vier Rollen gelten formal noch als „in Prüfung“, obwohl sie
  bereits im Alltag verwendet werden — das ist ein offener, bekannter
  Punkt, keine akute Störung.

## 10. Wichtige Dokumente

| Datei | Zweck |
|---|---|
| `CLAUDE.md` | Einstieg, Session-Regeln, Git-Regeln |
| `planner-specs/architecture/planner-architecture.md` | Vollständige Architekturregeln, Datenschemas, Build-Reihenfolge |
| `planner-specs/architecture/module-lifecycle.md` | Genauer Ablauf je Modul, Schritt für Schritt |
| `planner-specs/architecture/decisions.md` | Alle Architekturentscheidungen mit Stand (aktuellste Quelle bei Widersprüchen) |
| `planner-specs/architecture/roles/*.md` | Vollständige Rollendefinitionen (Architect, Builder, Auditor) |
| `planner-specs/modules/<name>/contract.md` | Vertrag je Modul: was es können soll |
| `LICENSE` | Softwarelizenz des Quellcodes (AGPLv3) |

## 11. Checkliste für den Alltag

- **Idee, noch offen** → Advisor
- **Nur verstehen, warum etwas so ist** → Advisor
- **Architektur/Contract für ein neues Modul festlegen** → Architect
- **Code erzeugen** → Builder
- **Code prüfen lassen** → Auditor
- **Ergebnis bestätigen** → du, ausdrücklich
- **Änderung endgültig machen** → Commit
- **Mit der Außenwelt teilen** → Push

Im Zweifel gilt: Solange du nicht ausdrücklich einen Auftrag erteilst
oder eine Rolle startest, ändert sich nichts. Und solange nicht
committet ist, ist eine Änderung noch nicht endgültig.

## 12. Lizenz und Nutzungsbedingungen

**Softwarelizenz.** Der Quellcode dieses Projekts steht unter der GNU
Affero General Public License v3.0 (AGPLv3), Copyright 2026 Steve
Gladis — siehe [`LICENSE`](../LICENSE). Nutzung, Veränderung und
Weitergabe des Codes sind im Rahmen der AGPLv3 möglich; bei
abgeleiteten Versionen gelten deren Pflichten (u. a. Offenlegung des
Quellcodes auch bei Nutzung über ein Netzwerk).

**Projektidentität.** Projektname und Projektidentität werden durch
die AGPL nicht automatisch mit übertragen. Eine gesonderte
Marken-/Namensregelung ist davon unabhängig und nicht Gegenstand
dieses Handbuchs.

**Ausgabeprodukte.** Erzeugt der Planner Pläne, Dokumente oder andere
Ergebnisse, folgt daraus keine automatische Pflicht zu einer
bestimmten Kennzeichnung dieser Ergebnisse allein aus der Codelizenz.
