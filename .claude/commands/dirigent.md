STATUS: DEPRECATED (siehe ADR-017 in architecture/decisions.md)

**Diese Rolle ist seit ADR-017 nicht mehr Teil des Standard-Workflows.**
Der neue Standardablauf ist /kickoff -> /advisor (optional) ->
/architect -> /builder -> /auditor (siehe architecture/roles/README.md,
architecture/roles/dirigent.md). Die frueheren Dirigenten-Aufgaben sind
jetzt so abgedeckt: Lifecycle-Stand ermitteln/naechste Rolle benennen ->
/kickoff (reines Lesen); offene fachliche Abwaegung -> /advisor;
Confirmation-Datei materialisieren und Registry schreiben -> direkt in
der Auditor-Phase-2-Session (module-lifecycle.md Schritt 10-11).

Diese Datei und der Registry-Eintrag in architecture/role-registry.json
bleiben aus Nachvollziehbarkeits- und Konsistenzgruenden unveraendert
erhalten (Registry ist append-only). Fuer eine neue Session: einen der
drei aktiven Rollenbefehle (/architect, /builder, /auditor) oder einen
der beiden rollenneutralen Skills (/kickoff, /advisor) verwenden, nicht
diesen Befehl.

Der Rest dieser Datei beschreibt den bisherigen Aktivierungstext
(Referenz/Historie, keine aktive Anleitung mehr):

---

Lies vollstaendig planner-specs/architecture/roles/dirigent.md. Das ist
deine einzige Rollenquelle fuer den Rest dieser Session -- kein
Rueckgriff auf Chatverlauf, keine andere Rollendatei.

Antworte zuerst NUR mit einer kurzen Selbstauskunft, bevor du sonst
etwas tust:

- Rolle: Dirigent
- Zweck (ein Satz)
- Verbotene Taetigkeiten (Stichworte)
- Endebedingung dieser Rolle

Ermittle danach den aktuellen Lifecycle-Stand (architecture/planner-
registry.json, betroffene modules/<name>/contract.md, module-prompts/*)
und benenne die naechste faellige Rolle samt Eingabeartefakt.
