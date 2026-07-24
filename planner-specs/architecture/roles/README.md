STATUS: REVIEW (Teil von ADR-011, vereinfacht durch ADR-017 -- siehe
architecture/decisions.md)

# Rollenarchitektur

Dieser Ordner enthaelt die dauerhaften, streng getrennten Rollen fuer
Claude-Code-Sessions in diesem Projekt: Architect, Builder, Auditor.
Dirigent ist seit ADR-017 deprecated und nicht mehr Teil des
Standard-Workflows (siehe dirigent.md und Abschnitt "Ablauf" unten) --
die Datei bleibt aus Registry-Konsistenzgruenden erhalten. Jede aktive
Rolle ist eine eigene, vollstaendig in sich geschlossene Datei
(architect.md, builder.md, auditor.md). Die verbindliche Liste aller
Rollen samt Verweis auf Rollendatei und Session-Startbefehl steht in
architecture/role-registry.json (unveraendert durch ADR-017, append-
only).

Zusaetzlich gibt es seit ADR-017 zwei rollenneutrale Einstiegs-Skills,
die bewusst NICHT in role-registry.json stehen, weil sie keine
Artefakte im Sinne der Rollenarchitektur erzeugen: kickoff (reiner
Statusbericht, nur lesend) und advisor (Architektur-Sparringspartner,
schreibt nie Projektartefakte). Details: .claude/skills/kickoff/,
.claude/skills/advisor/, ADR-017.

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
- **Dirigent** (deprecated seit ADR-017) veraenderte niemals fachliche
  Inhalte, sondern reichte sie ausschliesslich weiter -- dasselbe
  Prinzip gilt jetzt fuer die Auditor-Phase-2-Session, die die
  Confirmation-Datei nur mit woertlich uebernommenem, bereits
  bestaetigtem Inhalt materialisiert, ohne eigene fachliche Bewertung
  (siehe architecture/roles/auditor.md, architecture/roles/dirigent.md).

## Grundsatz: Vier-Schichten-Modell (ADR-019, verbindlich fuer alle Rollen und Skills)

Vier Begriffe, die nicht vermischt werden duerfen (siehe
architecture/decisions.md, ADR-019):

- **Rolle** -- Kickoff, Advisor sowie die vier Rollen aus
  architecture/role-registry.json (Architect, Builder, Auditor,
  Dirigent). Bleibt plattformneutral: eine Rolle definiert Zweck,
  Verantwortung, erlaubte/verbotene Taetigkeiten, Ein-/Ausgabeartefakte
  -- unabhaengig davon, auf welcher Plattform oder ueber welchen Kanal
  sie aktiviert wird.
- **Einstiegskanal** -- der Skill/Befehl (z. B. /architect) oder ein
  plattformneutraler Chattext, der dieselbe Rolle eindeutig benennt.
  Enthaelt selbst keinen Rolleninhalt, sondern verweist ausschliesslich
  auf die vollstaendige Rollen-/Skilldatei.
- **Plattform** -- z. B. Claude Desktop, Claude Code. Ist keine
  Eigenschaft einer Rolle, sondern die technische Umgebung, in der eine
  Session laeuft. Dieselbe Rolle kann grundsaetzlich auf mehreren
  Plattformen existieren.
- **Adapter-Zuordnung** -- eine eigene, separate Zuordnung (Tripel aus
  Rolle x Plattform x Einstiegskanal), die festhaelt, ob fuer eine
  gegebene Rolle auf einer gegebenen Plattform tatsaechlich ein
  technischer Adapter existiert (Tabelle unten, ADR-020).

Klarstellung: Prompt und Agent sind verwandte, nicht normative Begriffe
und stellen keine zusaetzlichen Schichten dar.

### Adapter-Zuordnung (ADR-020)

Werte fuer "Adapter vorhanden":

- **Ja** -- ein technischer Einstiegskanal (Skill/Befehl/Text-Trigger)
  existiert auf dieser Plattform tatsaechlich.
- **Nein, aktuell** -- kein Adapter vorhanden, aber technisch
  grundsaetzlich moeglich; ein zeitlicher, jederzeit revidierbarer
  Zustand, keine Eigenschaft der Rolle.
- **Nein, dauerhaft** -- fuer diese Rolle/Plattform-Kombination ist
  bewusst kein Adapter vorgesehen.

| Rolle     | Plattform | Adapter vorhanden | Einstiegskanal | Begruendung |
|-----------|-----------|--------------------|-----------------|------------|
| Kickoff   | Desktop   | Ja | plattformneutraler Text-Trigger "/kickoff" (CLAUDE.md) | reiner Statusbericht, plattformneutral nutzbar |
| Kickoff   | Code      | Ja | .claude/skills/kickoff/, .claude/commands/kickoff.md | wie bisher (ADR-017) |
| Advisor   | Desktop   | Ja | plattformneutraler Text-Trigger "/advisor" (CLAUDE.md) | reiner Denkraum, schreibt nie -- keine Dopplung, da nur eine Advisor-Instanz existiert |
| Advisor   | Code      | Ja | .claude/skills/advisor/, .claude/commands/advisor.md | wie bisher (ADR-017) |
| Architect | Desktop   | Nein, aktuell | -- | kein technischer Adapter auf Desktop vorhanden; zeitlicher Zustand, kein Verbot |
| Architect | Code      | Ja | .claude/skills/architect/, .claude/commands/architect.md | wie bisher |
| Builder   | Desktop   | Nein, aktuell | -- | s. Architect/Desktop |
| Builder   | Code      | Ja | .claude/skills/builder/, .claude/commands/builder.md | wie bisher |
| Auditor   | Desktop   | Nein, aktuell | -- | s. Architect/Desktop |
| Auditor   | Code      | Ja | .claude/skills/auditor/, .claude/commands/auditor.md | wie bisher |

Keine Aenderung an architecture/role-registry.json durch ADR-019/020
(weiterhin ausschliesslich die vier bestehenden Eintraege, append-only).

## Warum dieser Ordner existiert

Vor Einfuehrung dieser Struktur legte eine einzige, projektweite
CLAUDE.md dauerhaft eine feste Rolle (Builder) fest. Das verhinderte,
dass dieselbe Codebasis auch fuer Architect- oder Auditor-Sessions
genutzt werden konnte, ohne CLAUDE.md jedes Mal manuell umzuschreiben --
und ohne Garantie, dass eine solche Umschreibung nicht versehentlich
Rollenwissen aus einem fruaeheren Chatverlauf uebernimmt. Die Loesung:
CLAUDE.md selbst ist rollenneutral (siehe root-CLAUDE.md); die Rolle
wird pro Session explizit und reproduzierbar ueber einen der festen
Rollen-Skills/-Befehle geladen (siehe "Session-Start" unten). Jede Rollendatei ist so
geschrieben, dass sie ausschliesslich aus sich selbst heraus verstanden
werden kann -- ohne Rueckgriff auf den Chatverlauf, in dem sie geladen
wurde, und ohne Rueckgriff auf eine andere Rollendatei.

## Session-Start (reproduzierbar, unabhaengig vom Chatverlauf)

Jede neue Claude-Code-Session, die sich auf eine Rolle festlegt, beginnt
mit GENAU einem der folgenden Skills bzw. gleichnamigen Befehle
(Befehle unter .claude/commands/ bleiben aus Registry-
Konsistenzgruenden zusaetzlich bestehen, siehe ADR-017; Skills unter
.claude/skills/ sind der empfohlene Einstieg):

| Skill/Befehl | Laedt                                    |
|--------------|-------------------------------------------|
| /architect   | architecture/roles/architect.md            |
| /builder     | architecture/roles/builder.md               |
| /auditor     | architecture/roles/auditor.md               |

Davor bzw. unabhaengig davon koennen die rollenneutralen Skills
/kickoff (Status, nur lesend) und /advisor (Diskussion, schreibt nichts)
jederzeit verwendet werden, ohne dass damit eine Rolle im Sinne dieser
Datei aktiviert wird -- siehe Abschnitt oben und ADR-017. /dirigent
(architecture/roles/dirigent.md) ist deprecated (ADR-017) und wird fuer
neue Sessions nicht mehr verwendet.

Jeder dieser Rollen-Skills/-Befehle ist absichtlich kurz und enthaelt selbst keine
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

Vereinfacht durch ADR-017 (2026-07-24): Dirigent entfaellt. Status-
Ermittlung uebernimmt der rollenneutrale Skill /kickoff (reines Lesen),
die Confirmation-Datei materialisiert die Auditor-Phase-2-Session selbst
direkt aus der Bestaetigung des Projektverantwortlichen, ohne
zwischengeschalteten Rollenwechsel.

Plattformkennzeichnung je Schritt (Adapter-Zuordnung, ADR-020): [Desktop+Code]
bedeutet Adapter auf beiden Plattformen vorhanden; [Code] bedeutet Adapter
aktuell nur auf Code vorhanden (Desktop: "Nein, aktuell", kein Verbot).

```
/kickoff [Desktop+Code] (Status, nur lesend, keine Rolle)
   |
   v
/advisor [Desktop+Code] (optional, Diskussion, keine Rolle, schreibt nichts)
   |
   |  Decision Gate offen / Contract fehlt oder nicht FROZEN
   v
Architect [Code] (Contract aushandeln, FROZEN setzen)
   |
   |  Builder-Snapshot erzeugt
   v
Builder [Code] (Code erzeugen, "MODUL <n> FERTIG.")
   |
   |  Mensch: Smoke-Test
   v
Architect [Code] (Audit-Request materialisieren)
   |
   v
Auditor Phase 1 [Code] (pruefen, Manifest-Vorschlag, "AUDIT <NAME> ABGESCHLOSSEN.")
   |
   |  Mensch bestaetigt Manifest (Datum + woertlicher Bezug)
   v
Auditor Phase 2, neue Session [Code] (Confirmation-Datei materialisieren UND
          Registry schreiben, "REGISTRY <NAME> AKTUALISIERT.")
   |
   v
Commit -> Push (Projektverantwortlicher) / naechstes Modul: zurueck zu
          /kickoff
```

Bei Korrekturbedarf (Audit Phase 1 findet FAIL-Kriterien): zurueck zu
Builder (Code-Korrektur) oder Architect (Contract war unklar/
widerspruechlich), je nachdem, was der Befund betrifft -- das entscheidet
der Projektverantwortliche anhand des Audit-Berichts (bzw. /advisor zur
Einordnung), nicht mehr der Dirigent.

## Wie kuenftige Rollen erweitert werden, ohne bestehende Rollen anzupassen

1. Eine neue Datei architecture/roles/<neue-rolle>.md anlegen, nach
   derselben schlanken Struktur wie die bestehenden aktiven Dateien
   (Zweck, Verantwortung, Erlaubte Aktionen, Verbotene Aktionen,
   Benoetigte Eingabeartefakte, Erwartete Ausgabe). Bestehende
   Rollendateien werden dabei nicht veraendert.
2. Eine neue Datei .claude/skills/<neue-rolle>/SKILL.md anlegen (gleiche
   Struktur wie die bestehenden Skills: Einstieg, Rollenaktivierung,
   Verweis auf die Rollendatei -- keine Kopie von Architekturregeln).
   Optional zusaetzlich .claude/commands/<neue-rolle>.md aus Registry-
   Konsistenzgruenden (siehe ADR-017).
3. Genau einen neuen Eintrag in architecture/role-registry.json
   anhaengen -- seit Dirigent-Deprecation (ADR-017) durch die Rolle
   Architect unter explizitem Rollenarchitektur-Auftrag (siehe
   architecture/roles/architect.md, Abschnitt "Verantwortung") --
   niemals bestehende Eintraege aendern, entfernen oder umsortieren.
   Dasselbe Anhaenge-Prinzip wie bei R15/R18 fuer module-manifest.js.
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
