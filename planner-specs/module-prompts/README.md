Hier legen Architect und Dirigent die vollstaendig materialisierten,
in sich geschlossenen Snapshots ab -- pro Modul bis zu drei Dateien in
zeitlicher Reihenfolge:

- <name>-builder.md: Input fuer den Builder, erzeugt nach Contract FROZEN
  (siehe templates/architect-prompt.md Schritt 3, templates/builder-prompt.md
  fuer die Struktur). Enthaelt zusaetzlich einen Input-Fingerprint
  (sha256 je eingebetteter Quelldatei) -- der Commit-Hash allein pinnt
  nur den Repo-Stand, nicht zwingend den exakten Inhalt noch nicht
  committeter Spezifikationsdateien (z. B. waehrend der Contract gerade
  erst FROZEN wurde).
- <name>-audit-request.md: Input fuer den Auditor (Phase 1), erzeugt
  NACH Abschluss der Builder-Arbeit (siehe templates/auditor-prompt.md
  fuer die Struktur). Enthaelt Builder-Snapshot-Hash, Build-Commit,
  vollstaendigen Code aller im Contract genannten Dateien und die
  Abnahmekriterien-Liste als Pruefgrundlage.
- <name>-registry-confirmation.md: Input fuer eine neue Auditor-Session
  (Phase 2), erzeugt von dieser Auditor-Phase-2-Session selbst direkt zu
  Sessionbeginn NACH menschlicher Bestaetigung des Auditor-Manifest-
  Vorschlags (siehe templates/registry-confirmation-prompt.md fuer die
  Struktur; urspruenglich ADR-011, Rollenzuordnung seit ADR-017 auf den
  Auditor selbst praezisiert -- kein zwischengeschalteter Dirigenten-
  Schritt mehr, siehe architecture/roles/auditor.md, Phase 2). Enthaelt
  den bestaetigten Manifest-Inhalt woertlich; diese Datei loest den
  tatsaechlichen Schreibvorgang von architecture/planner-registry.json
  aus. Fuer einen reinen Registry-Freeze (module-lifecycle.md Schritt 12,
  ADR-013/ADR-018) ist der Inhalt auf die Statusaenderung REVIEW ->
  FROZEN plus frozenAtCommit/frozenDate beschraenkt, kein neuer
  Manifest-Inhalt.

Aktuell (Stand 2026-07-24): fuer Modul 2 (Standards) liegen alle drei
Dateien vor -- standards-builder.md, standards-audit-request.md und
standards-registry-confirmation.md. Standards ist FROZEN
(frozenAtCommit 688f1829ad92f64734de20c918abd53d8f165268, ADR-018).
