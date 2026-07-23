Hier legt der Architect die vollstaendig materialisierten,
in sich geschlossenen Snapshots ab -- pro Modul zwei Dateien in
zeitlicher Reihenfolge:

- <name>-builder.md: Input fuer den Builder, erzeugt nach Contract FROZEN
  (siehe templates/architect-prompt.md Schritt 3, templates/builder-prompt.md
  fuer die Struktur). Enthaelt zusaetzlich einen Input-Fingerprint
  (sha256 je eingebetteter Quelldatei) -- der Commit-Hash allein pinnt
  nur den Repo-Stand, nicht zwingend den exakten Inhalt noch nicht
  committeter Spezifikationsdateien (z. B. waehrend der Contract gerade
  erst FROZEN wurde).
- <name>-audit-request.md: Input fuer den Auditor, erzeugt NACH
  Abschluss der Builder-Arbeit (siehe templates/auditor-prompt.md fuer
  die Struktur). Enthaelt Builder-Snapshot-Hash, Build-Commit,
  vollstaendigen Code aller im Contract genannten Dateien und die
  Abnahmekriterien-Liste als Pruefgrundlage.

Aktuell: standards-builder.md liegt vor (Modul 2, Contract FROZEN
2026-07-23). standards-audit-request.md existiert noch nicht -- wird erst
erzeugt, sobald der Builder tatsaechlich Code geliefert hat.
