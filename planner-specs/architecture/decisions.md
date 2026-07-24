# Architecture Decision Records

# ADR-001
Datum: 2026-07-XX
Entscheidung: Vollständige Neuentwicklung für Self-Hosting statt Claude-Artefakt (Mehrdatei-Webanwendung, echtes Leaflet/fetch statt Sandbox-Einzeldatei).
Status: accepted
Begründung: Live-Kartenkacheln, externe Bibliotheken und mehrere Dateien funktionieren im Claude-Artefakt-Sandbox nicht (kein Netzwerkzugriff auf beliebige Domains), im Self-Hosting bereits erfolgreich getestet.

# ADR-002
Datum: 2026-07-XX
Entscheidung: Alle Fachregeln (Anlagentypen, Kabeltypen, Zuordnungen, Validierungsregeln) datengetrieben in data/standards.json statt hart im Code (R1); Regeln als deklaratives Format {field, op, value, severity, message}, kein eval()/new Function() (R3).
Status: accepted
Begründung: Standards sollen zwischen Projekten/Kunden-Vorlagen austauschbar sein; ein importiertes JSON darf niemals Code ausführen können.

# ADR-003
Datum: 2026-07-XX
Entscheidung: Strikte Rollentrennung Architect (erzeugt nur Builder-Prompt) / Builder (schreibt nur Code, kein Registry-Zugriff) / Auditor (prüft, schreibt Registry erst nach Bestätigung).
Status: accepted
Begründung: Ein Modul darf nie die eigene Arbeit abnehmen; verhindert außerdem, dass verschiedene Builder-Chats unterschiedliche Architekturentscheidungen treffen.

# ADR-004
Datum: 2026-07-XX
Entscheidung: Module kommunizieren ausschließlich über einen zentralen EventBus (emit/on), nie über direkte Aufrufe fremder Module (R13); Zugriff auf Core-Singletons nur über registry.get(...), nie Direktimport (R19).
Status: accepted
Begründung: Entkopplung — spätere Module (GIS, Kabeleditor, Reporting) sollen ohneseitige Kopplung an interne Details anderer Module auskommen.

# ADR-005
Datum: 2026-07-XX
Entscheidung: Modul-Registry wird ausschließlich nach expliziter Bestätigung durch den Projektverantwortlichen aktualisiert, nie automatisch direkt bei Prompt-Erzeugung oder durch den Builder selbst.
Status: accepted
Begründung: Ein Manifest zum Zeitpunkt der Prompt-Erzeugung beschreibt nur die Absicht, nicht die tatsächliche Umsetzung; erster Gemini-Audit-Durchlauf zeigte zudem, dass Auditor-Ergebnisse fehlerhaft sein können und vor Übernahme verifiziert werden müssen.

# ADR-006
Datum: 2026-07-22 (Entscheidung bestätigt am 2026-07-23)
Entscheidung: Interne technische IDs in data/standards.json (assetTypes,
cables, chargerTypes, materials) sind stabile lowercase-kebab-case Slugs
(z. B. id: "abb-terra-184"), getrennt vom Hersteller-/Fachcode (z. B.
code: "ABB_TERRA_184") und vom Anzeigenamen (z. B. name: "Terra 184").
id ist der stabile technische Schlüssel für Getter-Zugriffe (R14, z. B.
Standards.getAssetType(id)); code und name sind eigene, unabhängig
änderbare Felder, keine Aliase für id.
Status: accepted
Begründung: Projektverantwortlicher-Entscheidung vom 2026-07-23. Trennung
von technischem Schlüssel, Hersteller-/Fachcode und Anzeigename
vermeidet, dass eine spätere Änderung an Schreibweise/Groß-
Kleinschreibung des Codes oder des Anzeigenamens einen bereits
referenzierten Schlüssel bricht.
Nicht Gegenstand dieses ADR: die strukturelle Frage "ein Eintrag pro
Kabeltyp mit crossSections-Array" vs. "ein Eintrag pro Querschnitt-
Variante" bei cables — das bleibt offener Punkt für den Architect-Lauf
zu Modul 2 selbst.

Historie (ursprünglicher Vorschlag vom 2026-07-22, verworfen, nie
umgesetzt): Objekt-Keys sollten der jeweilige Grossschreibungs-Code des
Eintrags sein (z. B. TRAFO, HPC, NYYJ, ABB_TERRA184), ohne zusätzlichen
separaten lowercase-Slug. Ersetzt durch die obige Entscheidung.

# ADR-010
Datum: 2026-07-22 (Entscheidung bestätigt am 2026-07-23)
Entscheidung: Core (v1.0.0) wird formal als FROZEN markiert (analog zur
contract.md-Konvention aus module-lifecycle.md, auch ohne nachträglich
angelegtes modules/core/contract.md, siehe MIGRATION.md). Im Core-Eintrag
von architecture/planner-registry.json werden die Felder frozenDate
(2026-07-23) und frozenAtCommit (d77d054) ergänzt.
Status: accepted
Begründung: Der Decision Gate für jedes Folgemodul (module-lifecycle.md,
Schritt 0) verlangt "Alle Requires-Abhängigkeiten in der Registry
FROZEN". Core ist Requires für praktisch jedes künftige Modul; eine
explizite Freeze-Markierung beseitigt jede Unklarheit, ob Core noch
änderbar ist, bevor der Architect-Lauf für Modul 2 beginnt.
Frozen-Referenz: frozenAtCommit d77d054 (main-Stand zum Zeitpunkt der
Bestätigung), frozenDate 2026-07-23. Ab diesem Zeitpunkt sind Änderungen
an Core nur noch über eine neue ADR zulässig, kein stilles Editieren.

# ADR-007
Datum: 2026-07-22
Entscheidung: Autoritäts-Hierarchie der Spezifikationsdateien: architecture/ (höchste Autorität) > modules/<name>/contract.md > schema.json > seed-data.json > notes.md (nur Implementierungshinweise, keine Architekturentscheidungen).
Status: accepted
Begründung: Verhindert, dass ein Builder bei widersprüchlichen Angaben nicht weiß, welche Datei verbindlich ist.

# ADR-008
Datum: 2026-07-22
Entscheidung: planner-registry.json und module-manifest.js beantworten verschiedene Fragen und sind keine konkurrierenden Wahrheiten:

| Aspekt   | Registry              | Manifest                  |
|----------|------------------------|----------------------------|
| Zweck    | Architektur            | Runtime                    |
| Besitzer | Mensch/Architect/Auditor | Code (module-manifest.js) |
| Zeitpunkt| vor Build               | nach Build                 |
| Wahrheit | geplant/freigegeben     | tatsächlich geladen        |

Ein Modul kann in der Registry stehen, ohne dass das Manifest es bereits lädt (z. B. während einer Übergangsphase) — das ist kein Widerspruch. Der Manifest-Eintrag eines Moduls ist Teil von dessen Abnahmekriterien (contract.md) und wird vom Auditor mitgeprüft, bevor das Modul in die Registry aufgenommen wird. Reihenfolge ist immer: Builder → Code → Auditor prüft Manifest → Mensch bestätigt → erst dann Registry-Update. Der Auditor selbst schreibt die Registry nie.
Status: accepted
Begründung: Ohne diese Klärung ist unklar, welche der beiden Dateien im Zweifel gilt, wenn sie auseinanderlaufen.

# ADR-009
Datum: 2026-07-22
Entscheidung: Der Architect liest architecture/ und modules/<name>/ für einen Modul-Lauf immer gegen einen fest benannten Commit-Hash, nie gegen den jeweils aktuellen Stand von main/HEAD. Der verwendete Hash wird in der materialisierten module-prompts/<name>-builder.md sowie im späteren Registry-Eintrag (Feld builtAgainstCommit) festgehalten.
Status: accepted
Begründung: Ein öffentliches Repo kann sich zwischen Architect-Lauf und Builder-Lauf ändern; ohne Pinning könnten beide Rollen faktisch auf unterschiedlichen Ständen arbeiten, ohne dass das sichtbar wird.


# ADR-011
Datum: 2026-07-23 (korrigiert am 2026-07-23, siehe "Historie" unten)
Entscheidung: Einführung einer dauerhaften Rollenarchitektur für
Claude-Code-Sessions. Vier Rollen (Architect, Builder, Auditor,
Dirigent), jede mit eigener, vollständig in sich geschlossener
Rollendefinition unter architecture/roles/<rolle>.md (verbindliche
Liste in architecture/role-registry.json, neu, append-only analog
R15/R18). Root-CLAUDE.md legt selbst keine Rolle mehr fest, sondern ist
rollenneutral; jede Session startet über genau einen von vier festen
Befehlen (/architect, /builder, /auditor, /dirigent, hinterlegt unter
.claude/commands/), der die vollständige Rollendatei laedt. Ein
Rollenwechsel innerhalb derselben Session ist nicht vorgesehen.

Registry-Schreibvorgang (ergänzt ADR-005/ADR-008 zum "Dass" um das
"Wer"): der Auditor schreibt architecture/planner-registry.json --
abweichend vom Wortlaut "Der Auditor selbst schreibt die Registry nie"
in ADR-008, der sich dort auf das unmittelbare Schreiben direkt im
Anschluss an die eigene Prüfung bezog. Der tatsächliche Schreibvorgang
geschieht ausschließlich in einer NEUEN, zweiten Auditor-Session
("Phase 2"), ausgelöst durch eine vom Dirigenten materialisierte Datei
module-prompts/<name>-registry-confirmation.md (Struktur: templates/
registry-confirmation-prompt.md), die die explizite Bestätigung des
Projektverantwortlichen referenziert und den bestätigten Manifest-
Inhalt wörtlich enthält. Diese zweite Session bewertet nichts neu,
sondern übernimmt den bereits geprüften und bestätigten Inhalt
unverändert. Der Dirigent bleibt reiner Koordinator: er stellt die
Bestätigung fest und materialisiert die Confirmation-Datei, schreibt
aber architecture/planner-registry.json zu keinem Zeitpunkt selbst.
Details: architecture/roles/README.md (Zustandsdiagramm), architecture/
roles/auditor.md, architecture/roles/dirigent.md.

Rolle Dirigent zusätzlich zuständig für: architecture/role-registry.json
pflegen (ausschließlich Anhängen). Details: architecture/roles/
README.md.

Ergänzung vom 2026-07-23 (Rückmeldung Projektverantwortlicher): explizit
aufgenommener Grundsatz "Trennung von Erzeugung und Bewertung" -- eine
Rolle darf niemals das Artefakt bewerten, freigeben oder nachträglich
korrigieren, das sie selbst erzeugt hat (Details und die vier
rollenspezifischen Ausprägungen: architecture/roles/README.md, gleich-
namiger Abschnitt; zusätzlich als kurzer Verweis in jeder einzelnen
Rollendatei verankert). Dieser Grundsatz war vorher bereits implizit in
Einzelregeln enthalten (Builder nimmt nie eigene Arbeit ab, Auditor
schreibt Findings nicht ohne Beleg um, Dirigent trifft keine fachlichen
Entscheidungen) und wird hiermit als eigenständiges, benanntes Prinzip
festgehalten, das bei künftigen Rollenerweiterungen zuerst geprüft
werden soll, bevor eine neue Ausnahme eingeführt wird.

Status: accepted (Korrekturhinweis 2026-07-24: dieses Feld stand von
Anfang an auf "accepted", obwohl die tatsaechliche Bestaetigung durch
den Projektverantwortlichen -- siehe Bestaetigungsvermerk am Ende dieses
ADR -- chronologisch erst nach der weiter unten dokumentierten
"Status-Pruefung" erfolgte; das war ein interner Widerspruch zwischen
diesem Statusfeld und dem tatsaechlichen Freigabeverlauf. Aufgeloest am
2026-07-24 auf ausdruecklichen Wunsch des Projektverantwortlichen: der
Bestaetigungsvermerk am Ende dieses ADR ist die massgebliche, finale
Freigabe; dieses Statusfeld gilt erst ab diesem Zeitpunkt als
widerspruchsfrei "accepted". Die dazwischenliegende "Status-Pruefung"
bleibt als Fundstelle/Historie stehen, ist aber durch die Bestaetigung
am Ende ueberholt.)
Begründung: Die bisherige Ein-Datei-CLAUDE.md legte dauerhaft die Rolle
Builder fest und verhinderte damit, dass dieselbe Codebasis auch für
Architect- oder Auditor-Sessions genutzt werden konnte, ohne CLAUDE.md
manuell umzuschreiben — mit dem Risiko, dass eine solche Umschreibung
unbeabsichtigt vom Chatverlauf statt von einer dauerhaften Quelle
abhängt. Die vier bisher schon informell genutzten Rollen
(planner-architecture.md "Rollentrennung"; templates/architect-
prompt.md, builder-prompt.md, auditor-prompt.md) hatten zudem keine
dauerhafte, sessionfähige Form und keine explizite Dirigenten-Rolle für
die Lifecycle-Orchestrierung und den bislang nicht eindeutig
zugewiesenen tatsächlichen Registry-Schreibschritt (module-
lifecycle.md Schritt 11 nannte bisher nur DASS, nicht WER schreibt). Der
Registry-Schreibvorgang liegt beim Auditor statt beim Dirigenten, weil
der Auditor bereits Registry, Code und Findings kennt und der Dirigent
ausdrücklich Koordinator, kein Qualitätsprüfer sein soll (Rückmeldung
Projektverantwortlicher, 2026-07-23).

Historie (ursprünglicher Entwurf vom 2026-07-23, noch am selben Tag vor
Bestätigung korrigiert): ursprünglich sollte der Dirigent selbst
architecture/planner-registry.json schreiben. Verworfen auf Rückmeldung
des Projektverantwortlichen: der Dirigent sei Koordinator, kein
Qualitätsprüfer; der Auditor kenne Registry, Code und Findings bereits
und solle den Schreibvorgang konsequenterweise selbst ausführen.
Ersetzt durch die obige, zweiphasige Auditor-Lösung.

Freigabe-Hinweis: dieses ADR wird NICHT vom Architect eigenständig auf
Status "accepted" gesetzt, auch nicht nach einer informellen Zustimmung
im Chat. Analog zur Änderung von R1–R19 ("nur nach expliziter
Absprache") setzt ausschließlich der Projektverantwortliche diesen
Status explizit und gesondert auf "accepted" -- der Architect trägt
diese Bestätigung danach lediglich nach (Datum + Bezug, wie bei
ADR-006/ADR-010). Erst ab "accepted" gelten die in dieser und der
vorangegangenen Session bereits vorgenommenen Änderungen an CLAUDE.md
und an planner-architecture.md ("Rollentrennung") als verbindlich
integriert.

Status-Pruefung (Architect, 2026-07-24, im Rahmen der Architektur-
Revalidierung Baseline 688f182): ADR-011 steht weiterhin auf Status
"proposed". In diesem Dokument ist keine explizite Bestaetigung des
Projektverantwortlichen nachgetragen (kein Datum+Bezug analog
ADR-006/ADR-010). Konsistent damit stehen alle vier Eintraege in
architecture/role-registry.json auf STATUS REVIEW, nicht FROZEN
(geprueft am 2026-07-24) -- die Rollenarchitektur ist also durchgaengig
noch als Entwurf markiert, obwohl root-CLAUDE.md und alle vier
Rollendateien bereits produktiv als verbindlich referenziert werden
(auch diese Session laeuft unter genau dieser, formal noch nicht
freigegebenen Rollendefinition, weil sie unter /architect ausdruecklich
so beauftragt wurde).

Vorbereiteter naechster Schritt (wird von dieser Session NICHT selbst
ausgefuehrt, siehe Freigabe-Hinweis oben -- der Architect setzt niemals
selbst auf "accepted"): sobald der Projektverantwortliche ADR-011
ausdruecklich bestaetigt, ergaenzt eine Architect-Session unmittelbar
unterhalb dieses Absatzes einen Bestaetigungsvermerk nach dem Muster
"Bestaetigt am <Datum> durch den Projektverantwortlichen (siehe
<Bezug>)" und hebt Status danach separat auf "accepted" -- analog zum
Vorgehen bei ADR-006/ADR-010. Erst danach gelten architecture/roles/**
und architecture/role-registry.json als abschliessend freigegeben statt
als Entwurf; ein Folgeschritt fuer role-registry.json (REVIEW -> FROZEN
je Rolleneintrag) ist in ADR-013 als allgemeines Lifecycle-Muster
mitgeklaert (dort fuer Modul-Registry-Eintraege formuliert, sinngemaess
uebertragbar).

Bestaetigt am 2026-07-24 durch den Projektverantwortlichen (siehe
Freigabe-Rueckmeldung zur Architektur-Revalidierung Baseline 688f182,
Architect-Auftrag vom 2026-07-24: ADR-011 AKZEPTIERT). Damit gelten
architecture/roles/** und architecture/role-registry.json ab sofort als
abschliessend freigegeben statt als Entwurf; der oben vorgemerkte
Folgeschritt fuer role-registry.json (REVIEW -> FROZEN je Rolleneintrag)
bleibt gesondert zu bestaetigen (siehe ADR-013).

Zweite, erneute Bestaetigung am 2026-07-24 im Rahmen der Rollen- und
Workflow-Ueberarbeitung (ADR-017): der Projektverantwortliche hat auf
Rueckfrage dieser Session ausdruecklich "Ja, beide jetzt akzeptieren"
zu ADR-011 UND ADR-017 erklaert und damit zusaetzlich den oben unter
"Korrekturhinweis 2026-07-24" beschriebenen Widerspruch zwischen dem
Statusfeld und dem tatsaechlichen Freigabeverlauf als aufgeloest
bestaetigt. ADR-011 gilt ab jetzt durchgaengig, ohne Vorbehalt, als
"accepted".

# ADR-012
Datum: 2026-07-23
Entscheidung: Korrektur einer in sich widersprüchlichen Formulierung in
modules/standards/contract.md, Abschnitt "Abnahmekriterien". Statt
"`Standards.init()` registriert sich erst nach erfolgreichem Erstladen
selbst in der Registry unter Key `standards` (R18)." nun: "Die in
`main.js` exportierte `init()`-Funktion (R18) registriert Standards erst
nach erfolgreichem Erstladen selbst in der Registry unter Key
`standards`." Contract-Version entsprechend von 1.0.0 auf 1.0.1
angehoben. Keine Änderung an R1-R19, an der Public API, an der Registry
oder am Anwendungscode.
Begründung: Auditor-Fund vom 2026-07-23: Der Abnahmekriterien-Satz
sprach von einer Methode "Standards.init()", waehrend sowohl R18
(planner-architecture.md) als auch der eigene Abschnitt "Datenladen"
desselben Contracts uebereinstimmend main.js als Entry Point mit einer
exportierten init()-Funktion definieren, die sich selbst in der Registry
registriert -- keine Methode auf dem Standards-Objekt. Das ist ein
Widerspruch innerhalb des Contracts, keine Architekturverletzung und
kein Builder-Fehler; der Builder-Code bleibt unveraendert. Da der
Contract STATUS FROZEN ist, erfolgt die Korrektur gemaess
module-lifecycle.md Schritt 5 ausschliesslich ueber diese neue ADR plus
Versionsanhebung, nicht durch stilles Editieren.
Status: accepted

# ADR-013
Datum: 2026-07-24 (Architekturprozess-Revalidierung Baseline 688f182;
Korrektur des Schritt-11/12-Widerspruchs am 2026-07-24, siehe
"Historie" unten)
Entscheidung (Vorschlag): Ergänzung eines bislang fehlenden Lifecycle-
Schritts in module-lifecycle.md, nach dem bestehenden Schritt 11
("Registry-Update"), als neuer Schritt 12 ("Registry-Freeze"),
zusammen mit einer Klarstellung des letzten Satzes von Schritt 11
(Punkt e unten). Beide Teile bilden zusammen den vollständigen
Vorschlag dieser ADR und werden bei Übernahme gemeinsam in einer
einzigen, dafür beauftragten Session in module-lifecycle.md
nachgetragen:

  12. Registry-Freeze (zeitlich getrennt von Schritt 11, nicht
      automatisch): Ein per Schritt 11 geschriebener Registry-Eintrag
      trägt unmittelbar nach dem Schreiben STATUS REVIEW, nicht FROZEN
      -- Schritt 11 selbst ändert daran nichts. STATUS REVIEW bedeutet:
      das Modul ist integriert und ladbar (Manifest bestätigt), gilt
      architektonisch aber noch nicht als stabile, unveränderliche
      Grundlage für andere Module. Ein Eintrag wird erst FROZEN, wenn
      ein folgendes Modul ihn tatsächlich als Requires-Abhängigkeit
      benötigt (Decision Gate Schritt 0 verlangt "Alle
      Requires-Abhängigkeiten in der Registry FROZEN") oder auf
      ausdrücklichen Wunsch des Projektverantwortlichen früher. Ablauf,
      analog zur Freeze-Entscheidung für Core (ADR-010) und zum
      Registry-Schreibvorgang in Schritt 10/11:
      a) Architect stellt beim Decision Gate (Schritt 0) eines neuen
         Moduls fest, dass eine benötigte Requires-Abhängigkeit noch
         REVIEW ist, und dokumentiert eine neue ADR (Status: proposed)
         mit dem Vorschlag, den betroffenen Registry-Eintrag auf
         FROZEN zu setzen (analog ADR-010), inkl. vorgeschlagenem
         frozenAtCommit/frozenDate.
      b) Der Projektverantwortliche bestätigt diese ADR explizit
         (Status -> accepted, nachgetragen wie bei ADR-006/ADR-010).
      c) Dirigent stellt die Bestätigung fest und materialisiert eine
         Confirmation-Datei (gleiche Struktur wie templates/
         registry-confirmation-prompt.md; Inhalt beschränkt auf die
         Statusänderung REVIEW -> FROZEN plus frozenAtCommit/
         frozenDate, kein neuer Manifest-Inhalt).
      d) Eine neue Auditor-Session (Phase 2, analog Schritt 11) schreibt
         ausschließlich Statusfeld sowie frozenAtCommit/frozenDate des
         betroffenen Eintrags in architecture/planner-registry.json um
         -- alle übrigen Felder des Eintrags bleiben unverändert. Der
         Auditor bewertet dabei nichts neu (kein erneutes Code-Audit),
         sondern übernimmt nur die bereits bestätigte Statusänderung,
         exakt wie in Schritt 11 für den ursprünglichen Eintrag.
      e) Klarstellung zu Schritt 11 (Bestandteil dieses Vorschlags,
         löst den unter "Historie" dokumentierten Widerspruch auf): der
         letzte Satz von Schritt 11 ("Erst jetzt gilt das Modul als
         integriert und darf von künftigen Modulen als Requires
         referenziert werden.") gilt ab Einführung dieses Schritt 12
         nur noch eingeschränkt fort. Die erste Hälfte des Satzes
         bleibt unverändert: das Modul ist ab Schritt 11 integriert und
         ladbar (Manifest bestätigt). Die zweite Hälfte ("...und darf
         von künftigen Modulen als Requires referenziert werden") wird
         durch Schritt 12 verdrängt: ein frisch per Schritt 11
         geschriebener Eintrag trägt STATUS REVIEW und zählt in dieser
         Form NICHT als erfüllte Requires-Abhängigkeit.
      Erst ab STATUS FROZEN (Ergebnis von Schritt 12) darf ein Eintrag
      von einem Decision Gate (Schritt 0) als erfüllte Requires-
      Abhängigkeit gezählt werden. Schritt 11 und Schritt 12 regeln
      damit zwei getrennte Zeitpunkte desselben Eintrags statt sich zu
      widersprechen: Schritt 11 = integriert/ladbar (REVIEW), Schritt
      12 = stabil/referenzierbar (FROZEN).

Diese ADR ändert module-lifecycle.md noch nicht selbst (kein stilles
Editieren eines Architekturdokuments) -- sowohl der neue Schritt 12
als auch die Anpassung des letzten Satzes von Schritt 11 (Punkt e
oben) sind ein Vorschlag zur Übernahme nach Bestätigung durch den
Projektverantwortlichen.

Zusammenfassung der zu bestätigenden Punkte:
1. Registry-Einträge können nach Integration (Schritt 11) zunächst
   STATUS REVIEW tragen.
2. STATUS REVIEW bedeutet: Modul integriert, Audit abgeschlossen, aber
   noch nicht als stabile Requires-Abhängigkeit freigegeben.
3. Nur STATUS FROZEN darf als Requires-Abhängigkeit neuer Module
   verwendet werden (Decision Gate Schritt 0).
4. Der Registry-Freeze (REVIEW -> FROZEN) ist ein eigener, von
   Schritt 11 zeitlich und inhaltlich getrennter Lifecycle-Schritt
   (Schritt 12, Ablauf a-d oben).
5. Schritt 11 und Schritt 12 widersprechen sich dadurch nicht mehr:
   Punkt e oben stellt die Abgrenzung her, statt sie -- wie in der
   vorherigen Fassung dieser ADR -- nur als offenen Nachtrag zu
   vermerken.

Status: accepted
Begründung: architecture/planner-registry.json enthält bereits zwei
unterschiedliche Statuswerte (Core: FROZEN mit frozenDate/
frozenAtCommit; Standards: REVIEW, frozenDate/frozenAtCommit beide
"n/a"), aber module-lifecycle.md Schritt 11 kennt nur "Registry-
Update" und nennt weder die Bedingungen noch den Ablauf für den
Übergang REVIEW -> FROZEN. Core wurde einmalig ad hoc per ADR-010
gefroren, weil Modul 2 (Standards) es als Requires-Abhängigkeit
brauchte -- ohne dass dieses Vorgehen als wiederholbarer
Lifecycle-Schritt festgehalten wurde. Ohne diese Ergänzung müsste jedes
künftige Modul dasselbe Ad-hoc-Vorgehen neu erfinden, mit dem Risiko
widersprüchlicher oder unvollständig dokumentierter Freeze-
Entscheidungen. Das gleiche REVIEW/FROZEN-Muster liegt auch bei
architecture/role-registry.json vor (alle vier Rolleneinträge aktuell
REVIEW, siehe Ergänzung zu ADR-011 oben) -- diese ADR regelt zunächst
nur den Modul-Registry-Fall (planner-registry.json); eine sinngemäße
Übertragung auf role-registry.json wäre ein eigener, gesondert zu
bestätigender Vorschlag.

Historie (ursprünglicher Vorschlag vom 2026-07-24, Widerspruch am
selben Tag durch Rückmeldung des Projektverantwortlichen festgestellt,
danach in dieser Fassung korrigiert): der ursprüngliche Schritt-12-
Vorschlag enthielt keinen Punkt e und schloss nur mit dem Satz "Erst ab
STATUS FROZEN darf ein Eintrag von einem Decision Gate (Schritt 0) als
erfüllte Requires-Abhängigkeit gezählt werden." Rückmeldung des
Projektverantwortlichen: "REVIEW->FROZEN Mechanismus ist akzeptiert,
aber der Widerspruch in module-lifecycle.md Schritt 11 muss vor
Annahme korrigiert werden" -- Schritt 11 endet mit dem Satz "Erst jetzt
gilt das Modul als integriert und darf von künftigen Modulen als
Requires referenziert werden", was dem vorgeschlagenen Schritt 12
widersprach, ohne dass die ursprüngliche Fassung dieser ADR eine
Auflösung dafür enthielt (die Korrektur war dort nur als ausstehender
Nachtrag vermerkt, module-lifecycle.md selbst blieb unangetastet).
Mit dieser Überarbeitung vom 2026-07-24 ist die Auflösung direkt in die
Entscheidung dieser ADR aufgenommen (Punkt e oben), statt nur als
offener Punkt vermerkt zu sein. Der zum damaligen Zeitpunkt dieser
Historie geltende Satz "Status bleibt weiterhin proposed" ist durch die
Bestätigung unten überholt.

Bestätigt am 2026-07-24 durch den Projektverantwortlichen ("ADR-013 ist
inhaltlich geprüft. Akzeptiere ADR-013 gemäß Prozess.": ADR-013
AKZEPTIERT). Damit ist Schritt 12 (Registry-Freeze) samt Klarstellung
zu Schritt 11 (Punkt e) ab sofort verbindlich und wird in derselben
Session in module-lifecycle.md nachgetragen. Anpassung beim Nachtrag,
notwendig zur Konsistenz mit dem zwischenzeitlich bereits akzeptierten
ADR-017 (Dirigent ersetzt/archiviert): Ablaufpunkte c)/d) oben nennen
noch den mittlerweile ersetzten Dirigenten als Confirmation-
Materialisierer -- beim Nachtrag in module-lifecycle.md wird das analog
zu Schritt 10/11 auf die dort bereits beschriebene direkte
Auditor-Phase-2-Bestätigung umgestellt, inhaltlich sonst unverändert
(kein neuer Regelinhalt, reine Rollenzuordnung wie bereits in ADR-017
für Schritt 10/11 vollzogen). Keine Änderung an R1-R19, am
Standards-Modul oder an architecture/planner-registry.json.

# ADR-014
Datum: 2026-07-24 (Architekturprozess-Revalidierung Baseline 688f182)
Entscheidung (Vorschlag): Korrektur einer veralteten Status-Referenz in
modules/standards/contract.md, Abschnitt "Contract-Korrektur". Der
dortige Klammerzusatz "(siehe ADR-012 in architecture/decisions.md,
Status: proposed -- Bestätigung durch den Projektverantwortlichen steht
noch aus)" ist veraltet: architecture/decisions.md (höchste
Autoritätsstufe, ADR-007) führt ADR-012 bereits als "Status: accepted",
ohne gesonderte Freigabe-Klausel wie bei ADR-011. Vorschlag: den
Klammerzusatz in contract.md durch "(siehe ADR-012 in architecture/
decisions.md, Status: accepted)" ersetzen. Da modules/standards/
contract.md STATUS FROZEN ist, ist gemäß module-lifecycle.md Schritt 5
für jede Änderung eine neue ADR plus Versionsanhebung erforderlich,
kein stilles Editieren -- auch für eine reine Statusangaben-Korrektur
ohne inhaltliche oder API-Änderung. Vorschlag: Contract-Version 1.0.1
-> 1.0.2, ausschließlich für diese Formulierungskorrektur; keine
Änderung an Public API, Abnahmekriterien, Registry oder Anwendungscode.
Diese ADR ändert modules/standards/contract.md noch nicht selbst
("keine Modul-Contracts" laut Auftrag dieser Session) -- die Korrektur
ist als vorbereiteter, noch nicht ausgeführter Schritt dokumentiert,
zur Ausführung durch eine spätere, dafür beauftragte Architect-Session
nach Bestätigung.

Bestaetigt am 2026-07-24 durch den Projektverantwortlichen (siehe
Freigabe-Rueckmeldung zur Architektur-Revalidierung Baseline 688f182,
Architect-Auftrag vom 2026-07-24: ADR-014 AKZEPTIERT). Die oben
vorbereitete Korrektur wird in derselben Architect-Session in
modules/standards/contract.md ausgefuehrt (Klammerzusatz-Korrektur,
Version 1.0.1 -> 1.0.2, neuer Korrekturhinweis), ohne Aenderung an
Public API, Abnahmekriterien, Registry oder Anwendungscode.
Status: accepted
Begründung: Gefunden im Rahmen der Architektur-Revalidierung:
architecture/decisions.md und modules/standards/contract.md
widersprechen sich zum Freigabestatus derselben ADR (ADR-012). Nach der
Autoritäts-Hierarchie aus ADR-007 (architecture/ > contract.md) ist
decisions.md maßgeblich; contract.md trägt lediglich eine veraltete
Momentaufnahme aus dem Zeitpunkt vor der Bestätigung mit sich.

# ADR-015
Datum: 2026-07-24 (Architekturprozess-Revalidierung Baseline 688f182)
Entscheidung (Vorschlag): Zuordnung der drei in R8 genannten, bislang
keinem Modul zugeordneten Zweige des Projektmodell-Baums ("... Layer,
..., Trassen, Materialien, ...", planner-architecture.md R8):

1. **Layer** -- fachlich Teil des GIS-Moduls (js/gis/*, Build-
   Reihenfolge Punkt 5). Layer sind reine Darstellungs-/
   Gruppierungsmetadaten (z. B. {id, name, visible, order}) für die
   Kartendarstellung, keine Fachlogik -- passt zu R5 ("GIS ist reine
   Darstellung"). Vorschlag zur Präzisierung von R5: "liest UND
   verwaltet Projekt→Layer (Sichtbarkeit/Reihenfolge von Assets-/Kabel-
   Gruppen), zusätzlich zu Projekt→Assets und Projekt→Kabel" -- R5
   nennt aktuell nur Assets und Kabel, obwohl R8 Layer als eigenen
   Baumzweig verlangt; das ist der ursprüngliche Widerspruch. Assets
   und Kabel erhalten dafür optional ein Referenzfeld layerId
   (Erweiterung ihrer jeweiligen modules/<name>/schema.json -- nicht
   Gegenstand dieser ADR, sondern der jeweiligen Modul-Contracts).

2. **Trassen** (Kabelrouten/Leerrohr-Trassen als wiederverwendbare, von
   einzelnen Kabeln unabhängige Geometrie) -- fachlich Teil des
   Kabeleditor-Moduls (js/cable-editor/*, Build-Reihenfolge Punkt 6),
   nicht des grundlegenden Kabelsystem-Moduls (Punkt 4). Kabel
   (Kabelsystem) hat bereits ein eigenes conduit-Feld (globales
   Datenschema "Kabel" in planner-architecture.md); Trassen sind die
   vom Kabeleditor verwaltete geteilte Infrastruktur, auf die mehrere
   Kabel per conduit (Fremdschlüssel auf Trasse.id) verweisen können,
   ohne dass das Kabelsystem-Modul selbst Trassen-Geometrie verwaltet
   (R9: kein Modul greift direkt auf interne Strukturen eines anderen
   zu -- Kabelsystem hält nur die Referenz-ID, keine Trassen-Geometrie).

3. **Materialien** (Projekt-Zweig -- zu unterscheiden von
   Standards.materials als Katalog!) -- kein eigenes Modul, sondern
   gemeinsam von Asset-System und Kabelsystem geschrieben. Jedes dieser
   Module leitet beim Anlegen/Ändern seiner eigenen Objekte (Anlage
   bzw. Kabel) das zugehörige Material über Standards.validate(...)/
   Standards-Regeln ab (R2: "Material wird nur über Regeln abgeleitet,
   nie direkt zugewiesen") und schreibt das Ergebnis in
   Projekt→Materialien (über ProjectManager.addToCollection('materials',
   ...)). Mengenermittlung (Build-Reihenfolge Punkt 7) liest diesen
   Zweig ausschließlich lesend/aggregierend (R6: "sammelt nur
   vorhandenes Material ... aus dem Projekt") und schreibt dort nichts.

Bestaetigt am 2026-07-24 durch den Projektverantwortlichen (siehe
Freigabe-Rueckmeldung zur Architektur-Revalidierung Baseline 688f182,
Architect-Auftrag vom 2026-07-24: ADR-015 AKZEPTIERT). Die oben unter 1.
vorgeschlagene redaktionelle R5-Praezisierung wird in derselben
Architect-Session in planner-architecture.md nachgetragen, zusammen mit
einer Dokumentation der bestaetigten Zuordnung Layer/GIS, Trassen/
Kabeleditor, Materialien/Asset-System+Kabelsystem; keine weiteren
R1-R19-Aenderungen, keine neuen Regeln.
Status: accepted
Begründung: R8 verlangt Layer, Trassen und Materialien als
Baumzweige, aber weder R15 (Bounded Contexts) noch die
Build-Reihenfolge nennen ein zuständiges Modul dafür; R5 schließt Layer
beim Lesezugriff des GIS-Moduls sogar ausdrücklich aus (nur Assets/
Kabel genannt). Ohne Klärung würde der nächste Architect-Lauf
(Asset-System, Build-Reihenfolge Punkt 3) mit einem unvollständigen
Decision Gate starten (Schritt 0: "ADRs für offene Architekturfragen zu
diesem Modul vorhanden"). Die Zuordnung ist eine Empfehlung des
Architect zur Bestätigung durch den Projektverantwortlichen, keine
eigenmächtige Entscheidung über R1-R19 hinweg.

# ADR-016
Datum: 2026-07-24 (Architekturprozess-Revalidierung Baseline 688f182)
Entscheidung (Vorschlag): Präzisierung von R12 für Feature-Module. R12
fordert wörtlich, dass "jedes Modul, das Projektdaten persistiert, eine
schemaVersion hält und migrateProject(fromVersion, toVersion) anbietet".
Core exportiert jedoch bereits eine einzige, projektweite
CURRENT_SCHEMA_VERSION sowie eine zentrale Storage.migrateProject
(fromVersion, toVersion, projectData) (siehe architecture/
planner-registry.json, Core-Eintrag) -- für EIN gemeinsames
Projektdokument nach dem festen Baum aus R8, nicht pro Modul getrennt.

Vorschlag zur Klarstellung (keine Änderung des R12-Wortlauts, sondern
Präzisierung der Zuständigkeit):
- Es gibt genau EINE projektweite schemaVersion (Core.
  CURRENT_SCHEMA_VERSION), keinen pro-Modul-Versionszähler. R12s
  Formulierung "hält eine schemaVersion" bezieht sich auf die Teilnahme
  an dieser einen Versionsnummer, nicht auf einen eigenen, unabhängigen
  Zähler je Modul.
- migrateProject bleibt zentral in Storage (Core) als EINE aufrufbare
  Funktion/Einstiegspunkt. Ändert ein Feature-Modul die Struktur seines
  eigenen Teilbaums (z. B. Anlagen-Schema), ist dieses Modul dafür
  zuständig, den für seinen Teilbaum nötigen Migrationsschritt
  beizusteuern (z. B. als eigene, vom zentralen migrateProject
  aufgerufene Teilfunktion) UND eine Erhöhung der projektweiten
  CURRENT_SCHEMA_VERSION anzustoßen (koordiniert über eine ADR, nicht
  durch mehrere Module unabhängig voneinander) -- das Modul hält also
  keine eigene, parallele schemaVersion, sondern ist Mitverantwortlicher
  der einen zentralen Versionsnummer und Lieferant des eigenen
  Migrationsschritts.
- Module, die keine Projektdaten persistieren (aktuell: Standards --
  siehe architecture/planner-registry.json, schemaVersion "n/a
  (Standards persistiert keine Projektdaten, R12 nicht anwendbar)"),
  bleiben unverändert ausgenommen.
- Diese Zuständigkeit gilt ab dem nächsten Feature-Modul in der
  Build-Reihenfolge (Asset-System) und ist vor dessen Architect-Lauf zu
  bestätigen (Decision Gate Schritt 0).

Bestaetigt am 2026-07-24 durch den Projektverantwortlichen (siehe
Freigabe-Rueckmeldung zur Architektur-Revalidierung Baseline 688f182,
Architect-Auftrag vom 2026-07-24: ADR-016 AKZEPTIERT). Die oben
beschriebene R12-Klarstellung (zentrale schemaVersion in Core, zentrale
Migration ueber Storage/ProjectManager, Feature-Module liefern nur
Migrationsteile) wird in derselben Architect-Session in
planner-architecture.md dokumentiert, ohne Aenderung des R12-Wortlauts
und ohne Codeaenderung.
Status: accepted
Begründung: R12 ist im Wortlaut pro Modul formuliert, während die
bereits gebaute Core-Schnittstelle (CURRENT_SCHEMA_VERSION, Storage.
migrateProject) einen einzigen zentralen Versionszähler für das gesamte
Projektdokument vorsieht. Ohne Klarstellung könnte ein künftiger
Builder pro Modul einen eigenen, unabhängigen schemaVersion-Zähler samt
eigener migrateProject-Funktion anlegen -- was bei einem einzigen,
gemeinsam persistierten Projektdokument (R8) zu widersprüchlichen oder
kollidierenden Versionszählern führen würde.

# ADR-017
Datum: 2026-07-24 (Rollen- und Workflow-Ueberarbeitung, Baseline 688f182,
Architect-Auftrag vom 2026-07-24: "Ueberarbeite die aktuelle Rollen- und
Workflow-Architektur")
Entscheidung (Vorschlag): Zwei zusammengehoerige Aenderungen an der mit
ADR-011 eingefuehrten Rollenarchitektur, auf ausdruecklichen Auftrag des
Projektverantwortlichen, die Zusammenarbeit zwischen Claude Desktop,
Claude Code, Git-Repository und Projektverantwortlichem zu vereinfachen.
Die bestehende Rollen-/Lifecycle-/planner-specs-Architektur bleibt dem
Grunde nach erhalten; R1-R19, bestehende Modul-Contracts und die
Registry-Inhalte (architecture/planner-registry.json,
architecture/role-registry.json) werden durch dieses ADR NICHT
geaendert.

1. **Native Skill-Struktur.** Einfuehrung von .claude/skills/<name>/
   SKILL.md als primaerer Sessionseinstieg, zusaetzlich zu (nicht
   anstelle von) den bestehenden .claude/commands/<rolle>.md-Dateien.
   Grund fuer "zusaetzlich": architecture/role-registry.json ist
   append-only und verweist je Rolle per Feld commandFile exakt auf die
   bestehende .claude/commands/<rolle>.md-Datei; da dieses ADR
   ausdruecklich keine Registryaenderung vornimmt, bleiben diese Dateien
   bestehen (mit einem kurzen Verweis auf den gleichnamigen Skill als
   empfohlenen Einstieg). Skills enthalten ausschliesslich Einstieg,
   Rollenaktivierung und Verweise auf zustaendige Dateien unter
   planner-specs/ -- keine Kopie von R1-R19, Lifecycle-Regeln,
   Modulregeln oder bereits getroffenen Architekturentscheidungen. Neu
   eingefuehrt: die rollenneutralen Einstiegs-Skills kickoff (reiner,
   lesender Statusbericht: Git-Stand, Architekturstatus, offene ADRs,
   Registrystatus, aktuelles Modul, naechster Schritt -- keine
   Architekturentscheidung) und advisor (Architektur-Sparringspartner:
   Ideen/Alternativen/Risiken/Trade-offs besprechen, vor Aenderungen
   warnen -- schreibt nie Code/Contracts/ADRs/Registry/
   Architekturdateien). Beide sind ausdruecklich KEINE Rollen im Sinne
   von architecture/role-registry.json (kein Artefakt-Schreibrecht, kein
   Lifecycle-Endpunkt, kein handsOffTo) und werden deshalb bewusst NICHT
   dort eingetragen -- sie sind Einstiegs-/Diskussionshilfen, keine
   Erweiterung der Rollenarchitektur.

2. **Dirigent ersetzt durch Kickoff + Advisor (archiviert, nicht
   abgeschafft).** Praezisierung nach Rueckmeldung des
   Projektverantwortlichen (2026-07-24): Dirigent wird NICHT geloescht
   und nicht als "abgeschafft" gefuehrt, sondern als archivierte Rolle
   markiert, deren bisherige Aufgaben auf Kickoff + Advisor + erweiterte
   Auditor-Phase-2 verteilt sind (STATUS: DEPRECATED bleibt als
   Lifecycle-Zustand bestehen, meint hier "archiviert/ersetzt", nicht
   "entfernt"). Der bestehende Registry-Eintrag in architecture/role-
   registry.json bleibt unveraendert (append-only, kein Loeschen/Aendern
   bestehender Eintraege), ebenso die Datei architecture/roles/
   dirigent.md selbst (erhaelt nur einen Ersetzungs-/Archiv-Hinweis) --
   beide bleiben aus Nachvollziehbarkeits- und Registry-
   Konsistenzgruenden erhalten, werden aber ab sofort nicht mehr fuer
   eine neue Session verwendet.

   Grund fuer "archiviert" statt "abgeschafft": Dirigent hatte
   historisch die Funktion der Prozess-Orchestrierung. Ein kuenftiger
   Bedarf an einem automatisierten Agenten, der mehrere Module plant,
   die Build-Reihenfolge optimiert und uebergreifenden Fortschritt
   ueberwacht, ist nicht ausgeschlossen. Sollte ein solcher Bedarf
   tatsaechlich entstehen, wird dafuer -- ueber den additiven
   Erweiterungsmechanismus aus architecture/roles/README.md, Abschnitt
   "Wie kuenftige Rollen erweitert werden" -- eine neue, eigene Rolle
   angelegt (z. B. ein Orchestrator-Nachfolger), statt die archivierte
   Dirigent-Rolle unveraendert zu reaktivieren; die Deprecation dieses
   ADR betrifft ausschliesslich den heutigen Zuschnitt der Rolle
   Dirigent, nicht die Idee einer Orchestrierungsrolle als solche.

   Begruendung je bisheriger Dirigenten-Aufgabe, warum sie jetzt
   anderweitig abgedeckt ist (Grundsatz "keine unnoetigen Rollen
   behalten", siehe Auftrag):
   - Lifecycle-Stand ermitteln, naechste faellige Rolle benennen: rein
     mechanisch aus module-lifecycle.md + Registry ableitbar, jetzt
     Aufgabe von /kickoff (reines Lesen, keine fachliche Bewertung).
   - Offene fachliche Fragen/Abwaegungen: das war beim bisherigen
     Dirigenten ohnehin ausdruecklich verboten ("trifft keine
     fachlichen Architekturentscheidungen") -- soweit ein Bedarf fuer
     Diskussion bestand, deckt das jetzt explizit /advisor ab.
   - Confirmation-Datei materialisieren (module-lifecycle.md Schritt
     10): entfaellt als eigener Rollen-/Sessionwechsel. Die Auditor-
     Phase-2-Session (architecture/roles/auditor.md) nimmt die explizite
     Bestaetigung des Projektverantwortlichen (Datum + woertlicher
     Bezug) ab sofort direkt zu Sessionbeginn entgegen und
     materialisiert die Confirmation-Datei (Struktur weiterhin nach
     templates/registry-confirmation-prompt.md) selbst, bevor sie den
     Registry-Schreibvorgang ausfuehrt -- inhaltlich unveraendert (kein
     erneutes Bewerten, keine neue Pruefung), nur ohne den bisher
     zwischengeschalteten separaten Dirigenten-Schritt. Einzelheiten:
     architecture/roles/auditor.md, Abschnitt Phase 2.
   - architecture/role-registry.json um eine neue Rolle erweitern
     (Anhaengen): das durfte der Architect unter explizitem
     Rollenarchitektur-Auftrag bereits vor diesem ADR (siehe
     architecture/roles/architect.md, Abschnitt "Verantwortlichkeiten",
     letzter Punkt) -- keine exklusive Dirigenten-Faehigkeit, die sonst
     verwaisen wuerde.

   Damit hat keine der bisherigen Dirigenten-Aufgaben nach Wegfall der
   Rolle keinen Besitzer mehr (Pruefung "Verantwortlichkeiten ohne
   Besitzer" aus dem Auftrag dieser Session).

3. **Konsequenzanpassung module-lifecycle.md Schritt 10.** Der Verweis
   auf eine vom Dirigenten materialisierte Confirmation-Datei wird durch
   den oben unter Punkt 2 beschriebenen direkten Ablauf in der
   Auditor-Phase-2-Session ersetzt. Kein anderer Lifecycle-Schritt
   aendert sich.

4. **Governance-Praezisierung** (Nachtrag 2026-07-24 nach Rueckmeldung
   des Projektverantwortlichen zum urspruenglichen ADR-017-Entwurf):
   - **Advisor-Grenze.** Damit Advisor nicht zum inoffiziellen Architect
     wird (dasselbe Risiko, das frueher beim Dirigenten bestand): Advisor
     darf ausschliesslich Optionen diskutieren, technische Alternativen
     bewerten, Risiken nennen, Rueckfragen stellen und Empfehlungen
     formulieren. Advisor darf NICHT Contracts aendern, ADRs schreiben,
     Registry aendern oder Architekturentscheidungen treffen. Verbindlich
     festgehalten in .claude/skills/advisor/SKILL.md.
   - **Kickoff-Ausgabeformat.** Damit jede Kickoff-Session reproduzierbar
     denselben Bericht liefert, wird ein festes Ausgabeschema
     vorgeschrieben (Felder: STATUS/Repository/Commit, ADR offen,
     Aktuelles Modul, Blocker, Empfohlener naechster Schritt als
     nummerierte Liste). Verbindlich festgehalten in .claude/skills/
     kickoff/SKILL.md.
   - **ADR-011-Konsistenzfund.** Im Rahmen dieser Ueberarbeitung
     festgestellt: architecture/decisions.md enthaelt bei ADR-011
     widerspruechliche Angaben zum eigenen Status -- ein fruehes "Status:
     accepted", eine spaetere "Status-Pruefung"-Notiz vom 2026-07-24, die
     ADR-011 als weiterhin "proposed" einstuft, und darunter einen
     Bestaetigungsvermerk "ADR-011 AKZEPTIERT" vom selben Tag. Diese drei
     Angaben widersprechen sich, ohne dass diese Session (Architect)
     eigenmaechtig entscheiden darf, welche gilt (Freigabe ist
     ausschliesslich Sache des Projektverantwortlichen). Empfehlung: der
     Projektverantwortliche bestaetigt ausdruecklich, ob ADR-011 als
     angenommen gilt (und ab wann), bevor ein naechstes Modul startet;
     erst danach traegt eine Architect-Session eine bereinigte,
     widerspruchsfreie Status-Angabe nach.
   - **Registry-Freeze Standards.** Der Übergang von Standards
     (architecture/planner-registry.json) von REVIEW auf FROZEN folgt
     dem in ADR-013 beschriebenen Mechanismus (Architect schlaegt vor,
     Projektverantwortlicher bestaetigt, Auditor-Phase-2 schreibt den
     Statuswechsel) und ist kein Bestandteil dieses ADR -- er wird beim
     Decision-Gate-Lauf (module-lifecycle.md Schritt 0) fuer das
     naechste Modul (Asset-System) als eigener Vorschlag nachgereicht,
     sofern noch nicht geschehen.

Neuer Standard-Workflow (ersetzt das Dirigent-zentrierte
Zustandsdiagramm aus architecture/roles/README.md):

```
/kickoff (Status, nur lesend)
   |
   v
/advisor (optional, Diskussion, schreibt nichts)
   |
   v
/architect (Contract/Builder-Snapshot bzw. Audit-Request)
   |
   v
/builder (Code)
   |
   v
/auditor (Phase 1: Pruefung; Phase 2: Registry-Schreibvorgang nach
          Bestaetigung durch den Projektverantwortlichen)
   |
   v
Commit -> Push (Projektverantwortlicher)
```

Status: accepted
Begründung: Direkter, ausdruecklicher Auftrag des Projektverantwortlichen
zur Vereinfachung der Rollen-/Workflow-Architektur (dieser Architect-
Lauf, 2026-07-24), inklusive eines bereits im Auftrag selbst
enthaltenen Ziel-Workflows (/kickoff -> /advisor (optional) -> /architect
-> /builder -> /auditor -> Commit -> Push), der die Rolle Dirigent nicht
mehr enthaelt. Der bisherige Dirigent war reiner Koordinator ohne
fachliche Entscheidungsbefugnis (ADR-011); seine mechanischen Aufgaben
lassen sich vollstaendig auf einen reinen Lesevorgang (Kickoff)
reduzieren, seine einzige verbleibende Schreibaufgabe (Confirmation-
Datei) laesst sich verlustfrei in die ohnehin folgende Auditor-Phase-2-
Session vorziehen, ohne den Grundsatz "Trennung von Erzeugung und
Bewertung" zu verletzen (die Auditor-Session bewertet dabei weiterhin
nichts neu, sie uebernimmt nur bereits bestaetigten Inhalt -- wie zuvor,
nur ohne zwischengeschalteten Rollenwechsel). Diese ADR aendert damit
weder R1-R19 noch bestehende Modul-Contracts noch Registry-Inhalte,
sondern ausschliesslich Rollenzuschnitt und Prozessdokumentation.

Bestaetigt am 2026-07-24 durch den Projektverantwortlichen (Rueckmeldung
zu den vier Feedback-Punkten dieser Session -- Advisor-Grenze,
Kickoff-Ausgabeformat, Dirigent-Archivierung statt Abschaffung,
Governance-Konsistenz -- sowie ausdruecklich: "Ja, beide jetzt
akzeptieren" auf die Rueckfrage zu ADR-011/ADR-017: ADR-017 AKZEPTIERT).
Damit gelten die native Skill-Struktur (Punkt 1), die Dirigent-
Ersetzung/-Archivierung (Punkt 2), die Lifecycle-Anpassung (Punkt 3)
und die Governance-Praezisierung (Punkt 4) ab sofort als abschliessend
freigegeben statt als Entwurf.

# ADR-018
Datum: 2026-07-24 (Architect-Auftrag: "Freeze Standards Module Registry
Entry" vorbereiten, im Rahmen der Rollen-/Workflow-Ueberarbeitung)
Entscheidung (Vorschlag): Registry-Freeze (module-lifecycle.md Schritt
12, eingefuehrt durch ADR-013) fuer den bestehenden Standards-Eintrag in
architecture/planner-registry.json: Statusuebergang REVIEW -> FROZEN,
zusammen mit frozenAtCommit und frozenDate. Diese ADR aendert selbst
weder R1-R19 noch modules/standards/contract.md noch Anwendungscode und
nimmt KEINE Registry-Aenderung vor -- sie ist ausschliesslich der unter
ADR-013(a) vorgesehene Architect-Vorschlag zur Bestaetigung durch den
Projektverantwortlichen.

Begründung, warum der Freeze faellig ist (Voraussetzungen aus
module-lifecycle.md/ADR-013 gegen den tatsaechlichen Stand geprueft):

- **Contract FROZEN.** modules/standards/contract.md steht auf
  STATUS: FROZEN, frozenAtCommit 22c83231c8d0cf58d148ebad0f6d62b00930aff2,
  frozenDate 2026-07-23 ("Freeze standards module specification").
- **Audit Phase 1 abgeschlossen.** planner-specs/module-prompts/
  standards-audit-request.md liegt vor; der darauf basierende
  Manifest-Vorschlag wurde geprueft (Auditor Phase 1).
- **Registry-Confirmation liegt vor.** planner-specs/module-prompts/
  standards-registry-confirmation.md dokumentiert die Bestaetigung des
  Projektverantwortlichen (Steve, 2026-07-23): "Manifest-Vorschlag aus
  Audit Phase 1 fuer Modul Standards wird bestaetigt. [...] Status
  bleibt gemaess Prozess REVIEW/FROZEN-Uebergang unveraendert [...]" --
  d. h. der Registry-Eintrag wurde bewusst zunaechst nur auf REVIEW
  geschrieben (Schritt 11), der Freeze (Schritt 12) war explizit als
  gesonderter Folgeschritt vorgesehen.
- **Aktueller Registry-Eintrag steht auf REVIEW.** architecture/
  planner-registry.json, Eintrag "Standards": "status": "REVIEW",
  "frozenDate": "n/a", "frozenAtCommit": "n/a".
- **Nachfolgende Module benoetigen FROZEN-Abhaengigkeiten.** Das
  naechste Modul der Build-Reihenfolge (Asset-System, planner-
  architecture.md Punkt 3) haengt von Standards ab (Requires); Decision
  Gate (module-lifecycle.md Schritt 0) verlangt "Alle
  Requires-Abhaengigkeiten in der Registry FROZEN" -- ohne diesen Freeze
  bliebe das Decision Gate fuer Asset-System unerfuellt.

Vorgeschlagener Ablauf (ADR-013(a)-(d)):

a) Dieser Architect-Vorschlag (dieses ADR, Status: proposed) benennt den
   Standards-Eintrag als Freeze-Kandidat, mit vorgeschlagenem
   frozenAtCommit 688f1829ad92f64734de20c918abd53d8f165268 (HEAD zum
   Zeitpunkt dieser Session -- "feat(standards): add standards module
   and registry integration", enthaelt sowohl den Standards-Code als
   auch den bestehenden REVIEW-Registry-Eintrag) und frozenDate =
   Datum der Bestaetigung durch den Projektverantwortlichen.
b) Der Projektverantwortliche bestaetigt diese ADR explizit (Status ->
   accepted, nachgetragen wie bei ADR-006/ADR-010).
c) Eine Auditor-Phase-2-Session (bzw. bis ADR-017 vollstaendig
   eingespielt ist: der bisher vorgesehene Weg) materialisiert die
   Bestaetigung als Grundlage fuer Schritt d.
d) Eine neue Auditor-Phase-2-Session schreibt AUSSCHLIESSLICH
   Statusfeld sowie frozenAtCommit/frozenDate des Standards-Eintrags in
   architecture/planner-registry.json um -- alle uebrigen Felder des
   Eintrags (exports, publicApi, eventsPublished, files, hash, etc.)
   bleiben unveraendert. Kein erneutes Code-Audit, keine neue fachliche
   Bewertung.

Bestaetigt am 2026-07-24 durch den Projektverantwortlichen (direkter
Auftrag dieser Session: "ADR-018 \"Freeze Standards Module Registry
Entry\" wird hiermit akzeptiert. Fuehre die formale Annahme gemaess
bestehendem ADR-Prozess durch.": ADR-018 AKZEPTIERT). Damit ist Schritt
b) des oben unter "Vorgeschlagener Ablauf" beschriebenen
ADR-013(a)-(d)-Prozesses abgeschlossen. Die Schritte c) und d)
(Materialisierung der Bestaetigung durch eine Auditor-Phase-2-Session
bzw. den bisherigen Weg, sowie der anschliessende Statusuebertrag
REVIEW -> FROZEN samt frozenAtCommit/frozenDate fuer den
Standards-Eintrag in architecture/planner-registry.json) sind
ausdruecklich nicht Teil dieser Aenderung und bleiben einer gesonderten
Session vorbehalten; architecture/planner-registry.json und
module-lifecycle.md werden durch diese Bestaetigung nicht geaendert.

Status: accepted
Begründung: Direkter Architect-Auftrag dieser Session ("Freeze Standards
Module Registry Entry" vorbereiten), ausdruecklich nur als ADR-Entwurf,
keine Registry-Aenderung. Wartet auf explizite Bestaetigung des
Projektverantwortlichen, bevor irgendein Status oder Registry-Eintrag
geaendert wird (siehe Ablaufpunkte b-d oben) -- diese Bestaetigung liegt
mit dem Vermerk oben nun vor; Ablaufpunkte c) und d) stehen weiterhin
aus.

## Status-Semantik für diese Entscheidungen (gilt für alle ADRs oben und künftige)

- **accepted** = verbindliche Architektur, muss umgesetzt werden
- **proposed** = Entscheidungsvorschlag, darf NICHT als verbindliche Vorgabe implementiert werden — als offenen Punkt behandeln und beim Architect-Lauf klären
- **rejected** = verworfen, ignorieren

Ein Builder, der eine "proposed"-Entscheidung stillschweigend umsetzt, handelt außerhalb seines Mandats.
