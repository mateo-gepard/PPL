# PPL Aerodynamik Simulator - Systemkonzept

## Ziel

Das System soll PPL-Schueler nicht nur abfragen, sondern aerodynamische Ursache-Wirkungs-Ketten sichtbar machen. Jede Einheit verknuepft PDF-Stoff, Simulation, Missionen und Pruefungsfragen. Das Zielniveau ist 95%+ in der PPL-Aerodynamikpruefung durch robuste mentale Modelle.

## Leitprinzipien

- 3D wird eingesetzt, wenn Raeumlichkeit fuer Verstehen wichtig ist: Fluegelstroemung, Achsen, Kurve, Stall/Trudeln, Slip.
- 2D wird eingesetzt, wenn Diagrammlesen wichtiger ist: Bernoulli-Kanal, ca-alpha, Widerstandskurve, Gesamtpolare, Geschwindigkeitspolare.
- Jede Simulation hat Regler, sichtbare Kraft-/Druck-/Stroemungsreaktionen, Zahlenwerte und Missionen.
- Jede Einheit nennt PDF-Seiten und Formeln, damit Lernende den Simulator mit dem Originalstoff zurueckverknuepfen.
- Die Modelle sind didaktisch-naeherungsweise, nicht flughandbuch- oder zulassungstechnisch.

## Interaktionsmodell

1. Schueler waehlt eine Einheit.
2. Schueler manipuliert Regler und sieht sofort visuelle und numerische Folgen.
3. Missionen laden typische Pruefungssituationen.
4. Quick Check fragt die entscheidende Folgerung ab.
5. Pruefungsmodus mischt Stoff aus allen Einheiten und meldet Schwaechen nach PDF-Kapitel.

## Visueller Stil

- Light mode, minimal, klares Arbeitswerkzeug.
- Keine Landingpage, kein Marketing-Hero.
- Canvas-Simulation als Hauptflaeche.
- Kennfarben: Orange fuer Anstroemung/Widerstand/Bedienflaechen, Teal fuer aerodynamische Beziehungswerte, Gruen fuer sichere Reserve, Rot fuer Grenzzustaende.

## Technische Architektur

- Statische App: `index.html`, `styles.css`, `content.js`, `app.js`.
- Keine Build-Kette, keine Netzwerkabhaengigkeit.
- 3D wird ueber eine eigene kleine Projektionsschicht im Canvas umgesetzt, damit die App offline laeuft.
- Fortschritt wird lokal in `localStorage` gespeichert.

## Abnahme

- Alle 9 Einheiten laden ohne Fehler.
- Canvas ist auf Desktop und Mobile sichtbar und interaktiv.
- Mindestens 4 Module haben echte 3D-Darstellungen.
- Jede Einheit hat ein Konzeptpaper, Quellenanker, Missionen und Quizfragen.
- Pruefungsmodus funktioniert und wertet Ergebnis + Schwaechen aus.
