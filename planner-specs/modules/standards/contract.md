STATUS: DRAFT

Lifecycle (verbindlich fuer jedes contract.md):
- DRAFT   -- Architect darf aendern. Builder: Bauen verboten.
- REVIEW  -- Inhalt fachlich fertig, menschliche Pruefung noch offen.
             Builder: Bauen weiterhin verboten.
- FROZEN  -- Builder darf bauen. Aenderungen danach nur ueber eine neue
             ADR (architecture/decisions.md) plus Versionsanhebung, nie
             durch stilles Editieren dieser Datei. Bei Uebergang auf
             FROZEN werden zusaetzlich zwei Felder gesetzt:

             STATUS: FROZEN
             frozenAtCommit: <commit-hash, gegen den eingefroren wurde>
             frozenDate: <ISO-Datum>

             Damit ist spaeter nachvollziehbar, gegen welchen exakten
             Architektur-/Repo-Stand dieser Contract eingefroren wurde --
             unabhaengig davon, gegen welchen Commit ein spaeterer
             Builder-Snapshot (module-prompts/<name>-builder.md) gebaut
             wird. Weichen beide Hashes voneinander ab, ist das kein
             automatischer Fehler, aber ein Punkt, den der Architect vor
             dem Materialisieren des Snapshots explizit prueft und meldet
             (hat sich architecture/ zwischen Einfrieren und Bauen
             geaendert?).

Der Builder-Prompt prueft ausschliesslich STATUS in dieser Datei (nicht in
schema.json/notes.md) und bricht bei jedem Wert ausser FROZEN ab.

Sobald der Architect-Lauf fuer Modul 2 abgeschlossen ist, wird dieser
gesamte Dateiinhalt durch die vollstaendig ausgehandelte, konkrete Fassung
ersetzt (Zweck, Verantwortlichkeiten, Public API, Events, Bounded Context,
Abnahmekriterien -- alles mit konkreten Werten, keine offenen Felder) und
STATUS zuerst auf REVIEW, nach menschlicher Bestaetigung auf FROZEN
gesetzt (inkl. frozenAtCommit/frozenDate).

Bereits feststehend (aus architecture/ und ADR-002 -- konkretisiert diese
hoehere Ebene, widerspricht ihr nicht):
- Module: Standards
- Requires: Core >=1.0.0
- Registry-Key (R18): standards
- Zweck: datengetriebene Verwaltung der Projektstandards gemaess R1
  (Anlagentypen, Kabelbibliothek, HPC-/Lademodell-Bibliothek, Materialien,
  Regeln), laedt/verwaltet data/standards.json.
