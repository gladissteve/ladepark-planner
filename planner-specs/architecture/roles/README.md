STATUS: REVIEW (Teil von ADR-011, siehe architecture/decisions.md)

# Rollenarchitektur

Dieser Ordner enthaelt die vier dauerhaften, streng getrennten Rollen
fuer Claude-Code-Sessions in diesem Projekt: Architect, Builder,
Auditor, Dirigent. Jede Rolle ist eine eigene, vollstaendig in sich
geschlossene Datei (architect.md, builder.md, auditor.md, dirigent.md).
Die verbindliche Liste aller Rollen samt Verweis auf Rollendatei und
Session-Startbefehl steht in architecture/role-registry.json.

## Grundsatz: Trennung von Erzeugung und Bewertung (verbindlich fuer alle Rollen)

Eine Rolle darf niemals das Artefakt bewerten, freigeben oder
nachtraeglich korrigieren, das sie selbst erzeugt hat. Dieser Grundsatz
steht ueber den einzelnen Rollendateien -- er ist der gemeinsame Grund
fuer mehrere sonst isoliert wirkende Einzelregeln dort und soll bei
kuenftigen Erweiterungen (neue Rollen, neue Sonderfaelle) als erste
Pruefung dienen, bevor eine neue Ausnahme eingefuehrt wird. Konkret:

- **Builder** darf niemals eigenen Code auditieren oder die eigenen
  Abnahmekriterien selbst mit PASS/FAIL bewerten -- dafuer immer eine
  neue, unabhaengige Auditor-Session (siehe architecture/roles/
  builder.md, architecture/roles/auditor.md).
- **Architect** darf den eigenen Architekturvorschlag oder Contract
  niemals selbst freigeben -- Freigabe ist immer Sache des
  Projektverantwortlichen, nie eine Selbstbestaetigung im selben Zug
  (siehe architecture/roles/architect.md, Abschnitt "Verbotene
  Taetigkeiten"; siehe auch die Freigabe-Hoheit fuer ADR-011 selbst,
  unten).
- **Auditor** darf eigene Findings nicht nachtraeglich "korrigieren",
  ohne dass ein neuer, eigenstaendiger Auditlauf (neue Session)
  gestartet wird -- deshalb ist der Registry-Schreibvorgang (Phase 2)
  bewusst als separate, spaetere Session definiert, die den bereits
  bestaetigten Inhalt nur noch uebernimmt, nicht neu bewertet (siehe
  architecture/roles/auditor.md).
- **Dirigent** veraendert niemals fachliche Inhalte, sondern reicht sie
  ausschliesslich weiter und steuert den Workflow -- deshalb
  materialisiert er die Registry-Confirmation-Datei nur mit woertlich
  uebernommenem, bereits bestaetigtem Inhalt, ohne eigene fachliche
  Bewertung (siehe architecture/roles/dirigent.md).

## Warum dieser Ordner existiert

Vor Einfuehrung dieser Struktur legte eine einzige, projektweite
CLAUDE.md dauerhaft eine feste Rolle (Builder) fest. Das verhinderte,
dass dieselbe Codebasis auch fuer Architect- oder Auditor-Sessions
genutzt werden konnte, ohne CLAUDE.md jedes Mal manuell umzuschreiben --
und ohne Garantie, dass eine solche Umschreibung nicht versehentlich
Rollenwissen aus einem fruaeheren Chatverlauf uebernimmt. Die Loesung:
CLAUDE.md selbst ist rollenneutral (siehe root-CLAUDE.md); die Rolle
wird pro Session explizit und reproduzierbar ueber einen von vier festen
Befehlen geladen (siehe "Session-Start" unten). Jede Rollendatei ist so
geschrieben, dass sie ausschliesslich aus sich selbst heraus verstanden
werden kann -- ohne Rueckgriff auf den Chatverlauf, in dem sie geladen
wurde, und ohne Rueckgriff auf eine andere Rollendatei.

## Session-Start (reproduzierbar, unabhaengig vom Chatverlauf)

Jede neue Claude-Code-Session beginnt mit GENAU einem der folgenden
Befehle, hinterlegt unter .claude/commands/:

| Befehl      | Laedt                                    |
|-------------|-------------------------------------------|
| /architect  | architecture/roles/architect.md            |
| /builder    | architecture/roles/builder.md               |
| /auditor    | architecture/roles/auditor.md               |
| /dirigent   | architecture/roles/dirigent.md              |

Jeder dieser Befehle ist absichtlich kurz und enthaelt selbst keine
Rollenlogik -- er weist ausschliesslich an, die vollstaendige
Rollendatei zu lesen und ab sofort ausschliesslich danach zu arbeiten,
und verlangt eine kurze Selbstauskunft (Rolle, Zweck in einem Satz,
Verbote in Stichworten, Endebedingung) als erste Antwort der Session.
Diese Selbstauskunft entsteht bei jedem Sessionstart neu aus der
Rollendatei -- sie ist kein Gedaechtnis frueherer Sessions, sondern eine
frische Ableitung aus einer aktuell gelesenen Datei. Das ist die
Grundlage fuer Reproduzierbarkeit: zwei unabhaengige /builder-Sessions
mit demselben Snapshot verhalten sich gleich, weil beide ausschliesslich
aus derselben Datei arbeiten, nie aus Chatverlauf.

Beginnt eine Session ohne einen dieser Befehle und ohne dass die Rolle
sonst eindeutig genannt wurde, gilt keine Standardrolle -- siehe
root-CLAUDE.md, Abschnitt "Session-Start".

## Rollenwechsel innerhalb einer Session

Nicht vorgesehen. Eine Rolle gilt fuer die gesamte Session. Das
verhindert strukturell, dass z. B. eine Builder-Session sich selbst zur
Auditor-Session umdeklariert (Builder darf nie die eigene Arbeit
abnehmen, siehe architecture/planner-architecture.md, Abschnitt
"Rollentrennung"). Fuer eine andere Rolle: neue, unabhaengige Session
mit dem passenden Befehl starten. Da Auditor- und Builder-Sessions immer
getrennte, frische Sessions sind, kann eine Auditor-Session strukturell
nicht auf das Kontextfenster oder die Argumentation der zugehoerigen
Builder-Session zugreifen -- sie hat ausschliesslich module-prompts/
<name>-audit-request.md und den tatsaechlichen Code als Grundlage.

## Ablauf (Rollen-Zustandsdiagramm)

Korrigiert am 2026-07-23 nach Rueckmeldung des Projektverantwortlichen:
der Dirigent ist Koordinator, kein Qualitaetspruefer -- er schreibt die
Registry nicht selbst. Der Auditor kennt Registry, Code und Findings
und fuehrt den Schreibvorgang in einer zweiten, eigenen Session aus,
nachdem der Dirigent die menschliche Bestaetigung eingeholt und dafuer
eine Confirmation-Datei materialisiert hat.

```
Dirigent (Status pruefen)
   |
   |  Decision Gate offen / Contract fehlt oder nicht FROZEN
   v
Architect (Contract aushandeln, FROZEN setzen)
   |
   |  Builder-Snapshot erzeugt
   v
Builder (Code erzeugen, "MODUL <n> FERTIG.")
   |
   |  Mensch: Smoke-Test
   v
Architect (Audit-Request materialisieren)
   |
   v
Auditor Phase 1 (pruefen, Manifest-Vorschlag, "AUDIT <NAME> ABGESCHLOSSEN.")
   |
   |  Mensch bestaetigt Manifest
   v
Dirigent (Confirmation-Datei materialisieren, module-prompts/<name>-
          registry-confirmation.md)
   |
   v
Auditor Phase 2, neue Session (Registry schreiben, "REGISTRY <NAME>
          AKTUALISIERT.")
   |
   v
Dirigent (naechstes Modul: zurueck zum Start) / Ende
```

Bei Korrekturbedarf (Audit Phase 1 findet FAIL-Kriterien): zurueck zu
Builder (Code-Korrektur) oder Architect (Contract war unklar/
widerspruechlich), je nachdem, was der Befund betrifft -- der Dirigent
entscheidet, welcher Ruecksprung zutrifft, benennt ihn aber nur, er
fuehrt ihn nicht selbst aus.

## Wie kuenftige Rollen erweitert werden, ohne bestehende Rollen anzupassen

1. Eine neue Datei architecture/roles/<neue-rolle>.md anlegen, nach
   derselben Struktur wie die vier bestehenden Dateien (Zweck,
   Verantwortlichkeiten, Verbotene Taetigkeiten, Ein-/Ausgabeartefakte,
   Lesen/Schreiben, Ende, Naechste Rolle). Bestehende Rollendateien
   werden dabei nicht veraendert.
2. Eine neue Datei .claude/commands/<neue-rolle>.md anlegen (gleiche
   Struktur wie die vier bestehenden Befehle).
3. Genau einen neuen Eintrag in architecture/role-registry.json
   anhaengen (ausschliesslich durch die Rolle Dirigent, siehe
   architecture/roles/dirigent.md) -- niemals bestehende Eintraege
   aendern, entfernen oder umsortieren. Dasselbe Anhaenge-Prinzip wie
   bei R15/R18 fuer module-manifest.js.
4. Optional: in architecture/planner-architecture.md, Abschnitt
   "Rollentrennung", einen zusaetzlichen Stichpunkt fuer die neue Rolle
   ergaenzen -- die Detaildefinition bleibt aber ausschliesslich in der
   neuen Rollendatei, nicht dort.

Dieses Vorgehen aendert nie R1-R19 und nie eine bestehende Rollendatei
-- neue Rollen sind ausschliesslich additiv.

## Ausblick: geplante, noch nicht eingefuehrte fuenfte Rolle

Benannter Kandidat (Rueckmeldung Projektverantwortlicher, 2026-07-23):
**Maintainer** -- Refactoring, technische Schulden, Versionsmigrationen,
Buildsystem, Tooling, Testinfrastruktur, ausdruecklich OHNE Module
fachlich anzufassen. Trennt Wartung von Featureentwicklung. Bewusst
NICHT heute eingefuehrt -- wird, sobald tatsaechlich gebraucht, ueber
den Erweiterungsmechanismus oben (Schritte 1-4) als fuenfter, rein
additiver Eintrag angelegt, ohne dass eine der vier bestehenden
Rollendateien dafuer geaendert werden muss.

## Bezug zu architecture/planner-architecture.md

Die kompakte Uebersicht im Abschnitt "Rollentrennung" von
planner-architecture.md bleibt bestehen und bleibt uebergeordnet fuer
R1-R19. Bei Widerspruch zwischen dieser kompakten Uebersicht und einer
einzelnen Rollendatei hier gilt die Rollendatei als Detailquelle fuer
alles, was diese Uebersicht nicht selbst regelt (Autoritaets-Hierarchie
sinngemaess wie in MIGRATION.md: architecture/planner-architecture.md
[R1-R19 selbst] > architecture/roles/<rolle>.md > diese README).
