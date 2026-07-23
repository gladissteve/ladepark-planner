# Registry-Confirmation-Prompt-Struktur (Template fuer den Dirigenten)

Neu seit ADR-011 (Korrektur vom 2026-07-23, Rueckmeldung Projekt-
verantwortlicher): der Dirigent schreibt architecture/planner-
registry.json nicht selbst. Stattdessen materialisiert er nach
Bestaetigung eines Auditor-Manifest-Vorschlags durch den Projekt-
verantwortlichen eine vollstaendig eingebettete, in sich geschlossene
Datei module-prompts/<name>-registry-confirmation.md nach der Struktur
unten. Eine NEUE Auditor-Session (Phase 2, siehe architecture/roles/
auditor.md) liest ausschliesslich diese eine Datei als Auftrag und
fuehrt den eigentlichen Schreibvorgang aus -- der Dirigent selbst
schreibt keine Registry-Datei.

## Struktur von module-prompts/<name>-registry-confirmation.md

---
Registry-Confirmation fuer Modul: <name>
Bezug: module-prompts/<name>-audit-request.md (Auditor-Phase-1-Pruefung)
Bestaetigt durch: <Name/Aussage des Projektverantwortlichen>
Bestaetigt am: <Datum>
Erzeugt am: <Datum>

Rolle: Dirigent hat diese Datei erzeugt. Adressat: eine neue Auditor-
Session (Phase 2). Diese Session prueft ausschliesslich strukturell
(Schema, Kollisionen mit bestehenden FROZEN-Eintraegen) und schreibt
den Inhalt unten UNVERAENDERT in architecture/planner-registry.json --
kein erneutes fachliches Bewerten, keine Nachbesserung. Eine
abweichende Einschaetzung waere ein neuer, unbestaetigter Vorschlag und
gehoert in eine neue Phase-1-Pruefung, nicht in diese Session.

## Bestaetigter Manifest-Inhalt (woertliche Kopie aus dem Auditor-Phase-1-Ergebnis)
<hier das vollstaendige, vom Projektverantwortlichen bestaetigte
Manifest-JSON einfuegen, unveraendert gegenueber dem Auditor-Vorschlag>

## Harte Grenzen fuer die schreibende Auditor-Session
- Schreibt ausschliesslich architecture/planner-registry.json, per
  vollstaendigem Neuschreiben (bestehende Eintraege bleiben
  unveraendert, der Eintrag oben wird angehaengt).
- Bricht ab und meldet, falls diese Datei keine explizite Bestaetigung
  (Name/Aussage + Datum) referenziert.
- Bricht ab und meldet, falls der Eintrag mit einem bereits
  vorhandenen, insbesondere FROZEN, Eintrag kollidiert.

## Ausgabeformat
Vollstaendiger neuer Inhalt von architecture/planner-registry.json als
Codeblock. Abschluss: "REGISTRY <NAME> AKTUALISIERT."
---
