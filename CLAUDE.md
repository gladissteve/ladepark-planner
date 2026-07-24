# Ladepark Planner — Claude Code Instructions

## Rollenbasierte Sessions (verbindlich, siehe ADR-011)

Dieses Repository arbeitet mit vier dauerhaften, streng getrennten
Rollen: Architect, Builder, Auditor, Dirigent. Jede Rolle hat eine
eigene, vollstaendig in sich geschlossene Rollendefinition unter
planner-specs/architecture/roles/. Die verbindliche Liste aller Rollen
steht in planner-specs/architecture/role-registry.json.

Diese Datei (CLAUDE.md) legt selbst KEINE Rolle fest und ist absichtlich
rollenneutral. Grund: eine feste Rollenzuweisung in dieser projektweiten
Datei wuerde jede Session dauerhaft auf dieselbe Rolle festlegen und
verhindern, dass dasselbe Repository auch fuer Architect-, Auditor- oder
Dirigent-Sessions genutzt wird (siehe planner-specs/architecture/
roles/README.md, Abschnitt "Warum dieser Ordner existiert").

## Session-Start

Seit ADR-017 (siehe planner-specs/architecture/decisions.md) ist der
primaere Einstieg die native Skill-Struktur unter .claude/skills/, nicht
mehr die Command-Struktur unter .claude/commands/ (letztere bleibt aus
Registry-Konsistenzgruenden zusaetzlich bestehen, siehe role-registry.json,
Feld commandFile). Skills sind keine zweite Wissensquelle -- sie enthalten
ausschliesslich Einstieg, Rollenaktivierung und Verweise auf
planner-specs/; die einzige fachliche Quelle bleibt planner-specs/.

Zwei rollenneutrale Skills koennen jederzeit vorab oder unabhaengig
verwendet werden, ohne eine Rolle festzulegen:

- /kickoff -- reiner Statusbericht (Git-Stand, Architekturstatus,
  Registrystatus, naechster Schritt), nur lesend, keine
  Architekturentscheidung.
- /advisor -- Architektur-Sparringspartner (Ideen, Alternativen,
  Risiken, Trade-offs), schreibt nie Projektartefakte.

Jede Session, die sich auf eine Rolle festlegt, beginnt mit GENAU einem
der folgenden Skills bzw. gleichnamigen Befehle:

- /architect
- /builder
- /auditor

Diese laden die vollstaendige, dauerhafte Rollendefinition aus
planner-specs/architecture/roles/<rolle>.md. Ab diesem Zeitpunkt gilt
fuer den Rest der Session ausschliesslich diese eine Rollendefinition —
kein Rueckgriff auf diese CLAUDE.md-Rollenzuweisung (es gibt keine),
keine andere Rollendatei.

Die vierte, urspruenglich mit ADR-011 eingefuehrte Rolle Dirigent ist
seit ADR-017 deprecated und nicht mehr Teil des Standard-Workflows
(siehe planner-specs/architecture/roles/dirigent.md); ihre frueheren
Aufgaben sind auf /kickoff, /advisor und eine erweiterte
Auditor-Phase-2-Session verteilt.

Beginnt eine rollenfestlegende Session ohne einen dieser Skills/Befehle,
oder wird die Rolle sonst nicht eindeutig genannt: keine Aktion,
stattdessen Rueckfrage, welche Rolle gilt. Es gibt keine Standardrolle.

## Standardablauf

/kickoff → /advisor (optional) → /architect → /builder → /auditor →
Commit → Push (Projektverantwortlicher). Details und Begruendung:
planner-specs/architecture/roles/README.md, Abschnitt "Ablauf", und
ADR-017.

## Rollenwechsel

Eine Rolle gilt fuer die gesamte Session. Ein Wechsel der Rolle
innerhalb derselben Session ist nicht vorgesehen — insbesondere darf
eine Builder-Session sich nicht selbst zur Auditor-Session umdeklarieren
(Builder darf nie die eigene Arbeit abnehmen). Fuer eine andere Rolle:
neue Session mit dem passenden Befehl starten.

## Verbindliche Architekturquellen (fuer alle Rollen)

- planner-specs/architecture/planner-architecture.md — R1-R19,
  Rollentrennung (Kurzuebersicht), Header-Feldschema, globale
  Datenschemas.
- planner-specs/architecture/planner-registry.json — registrierte
  Module, Versionen, eingefrorene Schnittstellen.
- planner-specs/architecture/module-lifecycle.md — verbindliche
  Schritt-fuer-Schritt-Sequenz je Modul.
- planner-specs/architecture/role-registry.json — verbindliche Liste
  aller Rollen samt Rollendatei und Session-Startbefehl.
- planner-specs/architecture/roles/ — vollstaendige Rollendefinitionen.

Diese Dateien sind die einzige Quelle der Wahrheit. Bei Widersprüchen
gilt (siehe planner-specs/MIGRATION.md, "Autoritäts-Hierarchie"):
architecture/ > modules/<modul>/contract.md > schema.json >
seed-data.json > notes.md > eigene Annahmen. Fuer Rollenfragen im
Speziellen gilt architecture/planner-architecture.md (R1-R19) >
architecture/roles/<rolle>.md > architecture/roles/README.md.

Der Ordner docs/ ist HISTORISCH/ARCHIVIERT (siehe docs/README.md) und
darf nicht als Quelle verwendet werden.

## Was jede Rolle konkret tun bzw. lassen muss

Steht ausschliesslich in der jeweiligen Rollendatei unter
planner-specs/architecture/roles/ (architect.md, builder.md,
auditor.md, dirigent.md) — inklusive Zweck, Verantwortlichkeiten,
ausdruecklich verbotener Taetigkeiten, erlaubter Ein-/Ausgabeartefakte,
Lese-/Schreibrechten, Endebedingung und Nachfolgerolle. Diese Datei
dupliziert diese Inhalte absichtlich nicht, um zu vermeiden, dass zwei
Kopien derselben Regel auseinanderlaufen.

## Git-Regeln (fuer alle Rollen)

Arbeite ausschliesslich im aktuellen Repository.

Vor Änderungen:
- git status prüfen

Nach abgeschlossenen Änderungen:
- Änderungen zusammenfassen
- betroffene Dateien nennen
- keine Commits ohne ausdrückliche Aufforderung erstellen

## Kommunikationsmodus (fuer alle Rollen)

Bei Unklarheiten, die die eigene Rolle laut ihrer Rollendatei nicht
selbst entscheiden darf:
Nicht raten.
Problem beschreiben und Rückfrage stellen.
