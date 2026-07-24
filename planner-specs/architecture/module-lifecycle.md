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
9. Bevor der Auditor startet: module-prompts/<name>-audit-request.md wird
   materialisiert (nach templates/auditor-prompt.md), analog zum
   Builder-Snapshot aus Schritt 6 -- vollstaendig eingebettete R1-R19,
   Contract inkl. Abnahmekriterien, vollstaendiger Code aller im Contract
   genannten Dateien, Build-Commit-Hash und sha256 des verwendeten
   Builder-Snapshots. Der Auditor liest ausschliesslich diese eine Datei
   als Referenzmaterial (plus den tatsaechlichen Code im Repo als
   Pruefgegenstand). Der Auditor prueft fertigen Code gegen Architektur +
   Registry + Contract, bewertet jedes Abnahmekriterium einzeln
   (PASS/FAIL mit woertlichem Beleg), und erzeugt ein Manifest --
   inklusive Pruefung, ob der Manifest-Eintrag in module-manifest.js (R18)
   tatsaechlich vorhanden und korrekt ist (siehe ADR-008: Registry- vs.
   Runtime-Sicht). Jeder Befund braucht einen reproduzierbaren Beleg aus
   dem echten Code -- ein Befund ohne Beleg ("entspricht vermutlich der
   Architektur") wird verworfen, nicht gemeldet.
10. Mensch bestaetigt das vorgeschlagene Manifest (oder verlangt
    Korrekturen -- zurueck zu Schritt 7/9, je nachdem was betroffen ist).
    Rollenzuordnung seit ADR-017 (loest die urspruengliche ADR-011-
    Zuordnung an den mittlerweile deprecateten Dirigenten ab, siehe
    architecture/roles/dirigent.md): die neue Auditor-Phase-2-Session
    (siehe Schritt 11) nimmt diese Bestaetigung direkt zu Sessionbeginn
    entgegen (Datum + woertlicher Bezug des Projektverantwortlichen) und
    materialisiert daraus selbst module-prompts/<name>-registry-
    confirmation.md (Struktur weiterhin nach templates/registry-
    confirmation-prompt.md) -- enthaelt den bestaetigten Manifest-Inhalt
    woertlich, ohne ihn erneut zu bewerten.
11. Registry-Update -- architecture/planner-registry.json wird per
    vollstaendigem Neuschreiben aktualisiert (bestehende Eintraege
    unveraendert, neuer Eintrag inkl. builtAgainstCommit angehaengt).
    Rollenzuordnung seit ADR-011, Sessionzuschnitt praezisiert durch
    ADR-017: dieselbe Auditor-Phase-2-Session, die in Schritt 10 die
    Confirmation-Datei materialisiert hat, fuehrt unmittelbar
    anschliessend auch den Schreibvorgang aus (siehe architecture/roles/
    auditor.md, Phase 2). Erst jetzt gilt das Modul als integriert und
    ladbar (Manifest bestaetigt) -- der Eintrag traegt dabei STATUS
    REVIEW, noch nicht FROZEN. Praezisiert durch ADR-013 (Punkt e),
    akzeptiert 2026-07-24: ein frisch per diesem Schritt geschriebener
    Eintrag zaehlt in dieser Form (REVIEW) NICHT bereits als erfuellte
    Requires-Abhaengigkeit fuer ein kuenftiges Modul -- dafuer ist
    zusaetzlich Schritt 12 (Registry-Freeze) erforderlich.

12. Registry-Freeze (zeitlich getrennt von Schritt 11, nicht
    automatisch; eingefuehrt durch ADR-013, akzeptiert 2026-07-24). Ein
    per Schritt 11 geschriebener Registry-Eintrag traegt unmittelbar
    nach dem Schreiben STATUS REVIEW, nicht FROZEN -- Schritt 11 selbst
    aendert daran nichts. STATUS REVIEW bedeutet: das Modul ist
    integriert und ladbar (Manifest bestaetigt), gilt architektonisch
    aber noch nicht als stabile, unveraenderliche Grundlage fuer andere
    Module. Ein Eintrag wird erst FROZEN, wenn ein folgendes Modul ihn
    tatsaechlich als Requires-Abhaengigkeit benoetigt (Decision Gate
    Schritt 0 verlangt "Alle Requires-Abhaengigkeiten in der Registry
    FROZEN") oder auf ausdruecklichen Wunsch des Projektverantwortlichen
    frueher. Erst ab STATUS FROZEN darf ein Eintrag von einem Decision
    Gate (Schritt 0) als erfuellte Requires-Abhaengigkeit gezaehlt
    werden. Ablauf (analog zur Freeze-Entscheidung fuer Core, ADR-010,
    und zum Registry-Schreibvorgang in Schritt 10-11; Rollenzuordnung
    hier bereits konsistent mit ADR-017 -- kein Dirigent, siehe Schritt
    10-11 oben):
    a) Architect stellt beim Decision Gate (Schritt 0) eines neuen
       Moduls fest, dass eine benoetigte Requires-Abhaengigkeit noch
       REVIEW ist, und dokumentiert eine neue ADR (Status: proposed) mit
       dem Vorschlag, den betroffenen Registry-Eintrag auf FROZEN zu
       setzen (analog ADR-010), inkl. vorgeschlagenem
       frozenAtCommit/frozenDate.
    b) Der Projektverantwortliche bestaetigt diese ADR explizit (Status
       -> accepted, nachgetragen wie bei ADR-006/ADR-010).
    c) Eine neue Auditor-Phase-2-Session nimmt diese Bestaetigung direkt
       zu Sessionbeginn entgegen (Datum + woertlicher Bezug) und
       materialisiert daraus module-prompts/<name>-registry-
       confirmation.md (Inhalt beschraenkt auf die Statusaenderung
       REVIEW -> FROZEN plus frozenAtCommit/frozenDate, kein neuer
       Manifest-Inhalt) -- derselbe Ablauf wie in Schritt 10, kein
       zwischengeschalteter Dirigenten-Schritt.
    d) Dieselbe Auditor-Phase-2-Session schreibt ausschliesslich
       Statusfeld sowie frozenAtCommit/frozenDate des betroffenen
       Eintrags in architecture/planner-registry.json um -- alle
       uebrigen Felder des Eintrags bleiben unveraendert. Kein erneutes
       Code-Audit, keine neue fachliche Bewertung, nur Uebernahme der
       bereits bestaetigten Statusaenderung, exakt wie in Schritt 11 fuer
       den urspruenglichen Eintrag.
    Schritt 11 und Schritt 12 regeln damit zwei getrennte Zeitpunkte
    desselben Eintrags, ohne sich zu widersprechen: Schritt 11 =
    integriert/ladbar (REVIEW), Schritt 12 = stabil/referenzierbar
    (FROZEN).
