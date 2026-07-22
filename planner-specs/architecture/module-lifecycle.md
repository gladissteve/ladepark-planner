# Modul-Lifecycle

Verbindliche Sequenz fuer jedes Modul, von der ersten Contract-Fassung bis
zur Aufnahme in die Registry. Kein Schritt wird uebersprungen.

0. Decision Gate (vor dem Start eines neuen Moduls, immer zuerst):
   [ ] Contract vorhanden
   [ ] Contract STATUS >= REVIEW
   [ ] Alle Requires-Abhaengigkeiten in der Registry FROZEN
   [ ] Registry-Eintrag der Abhaengigkeiten existiert
   [ ] Manifest-Konflikte geprueft (Registry vs. module-manifest.js, ADR-008)
   [ ] ADRs fuer offene Architekturfragen zu diesem Modul vorhanden
   Nur wenn alle Punkte erfuellt sind: Architect starten. Sonst baut ihr
   spaeter ein Modul auf Annahmen, die rueckwirkend widerrufen werden.

1. Contract DRAFT -- Architect legt modules/<name>/contract.md an oder
   aendert sie (STATUS: DRAFT). Builder darf in diesem Zustand nicht bauen.
2. Architect handelt Contract vollstaendig aus (Rueckfragen an den
   Projektverantwortlichen, keine offenen Felder/Platzhalter am Ende).
3. Contract REVIEW -- Architect setzt STATUS auf REVIEW, legt dem
   Projektverantwortlichen die fertige Fassung zur Pruefung vor.
4. Mensch bestaetigt Contract.
5. Contract FROZEN -- STATUS wird auf FROZEN gesetzt, zusammen mit
   frozenAtCommit (Commit-Hash) und frozenDate. Aenderungen ab hier nur
   noch ueber eine neue ADR plus Versionsanhebung, nie durch stilles
   Editieren.
6. Architect liest Architektur/Registry/Contract/Schema/Seed/Notes gegen
   einen FESTEN Commit-Hash (nicht "aktueller Stand") und prueft dabei,
   ob dieser Hash von frozenAtCommit abweicht -- falls ja, meldet er das,
   bevor er weitermacht. Danach materialisiert er daraus
   module-prompts/<name>-builder.md als vollstaendig eingebettete, in
   sich geschlossene Kopie (kein Live-Dateizugriff fuer den Builder) --
   nach templates/builder-prompt.md. Der verwendete Commit-Hash wird in
   dieser Datei vermerkt.
7. Builder liest AUSSCHLIESSLICH module-prompts/<name>-builder.md und
   erzeugt Code (nur innerhalb des Bounded Context, siehe Contract
   Creates/Modifies/Deletes).
8. Tests/Smoke-Test durch den Projektverantwortlichen (z. B. lokaler
   Server-Start, Konsole pruefen).
9. Auditor prueft fertigen Code gegen Architektur + Registry + Contract,
   erzeugt ein Manifest (nach templates/auditor-prompt.md) -- inklusive
   Pruefung, ob der Manifest-Eintrag in module-manifest.js (R18) tatsaechlich
   vorhanden und korrekt ist (siehe ADR-008: Registry- vs. Runtime-Sicht),
   und inklusive dem Commit-Hash, gegen den gebaut wurde. Jeder Befund
   braucht einen reproduzierbaren Beleg aus dem echten Code.
10. Mensch bestaetigt das vorgeschlagene Manifest (oder verlangt
    Korrekturen -- zurueck zu Schritt 7/9, je nachdem was betroffen ist).
11. Registry-Update -- architecture/planner-registry.json wird per
    vollstaendigem Neuschreiben aktualisiert (bestehende Eintraege
    unveraendert, neuer Eintrag inkl. builtAgainstCommit angehaengt).
    Erst jetzt gilt das Modul als integriert und darf von kuenftigen
    Modulen als Requires referenziert werden.
