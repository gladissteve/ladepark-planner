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
  (Phase 2), erzeugt vom Dirigenten NACH menschlicher Bestaetigung des
  Auditor-Manifest-Vorschlags (siehe templates/registry-confirmation-
  prompt.md fuer die Struktur, ADR-011). Enthaelt den bestaetigten
  Manifest-Inhalt woertlich; diese Datei loest den tatsaechlichen
  Schreibvorgang von architecture/planner-registry.json aus.

Aktuell: standards-builder.md liegt vor (Modul 2, Contract FROZEN
2026-07-23). standards-audit-request.md und standards-registry-
confirmation.md existieren noch nicht -- werden erst erzeugt, sobald
der Builder tatsaechlich Code geliefert hat bzw. sobald danach ein
Manifest bestaetigt wurde.
