# Konzeptpaper 01 - Grundlagen, Kontinuitaet und Bernoulli

## PDF-Anker

- Kapitel 2, Seiten 7-13
- Vereinfachungen, Kontinuitaet, Bernoulli, Fahrtmesser, Grenzschicht

## Lernziel

Schueler sollen verstehen, dass Geschwindigkeit, Staudruck und statischer Druck zusammenhaengen. Die wichtigste Pruefungsleistung ist nicht Rechnen allein, sondern das Erkennen: Verengung fuehrt zu hoeherer Geschwindigkeit, hoeherem Staudruck und niedrigerem statischem Druck.

## Visualisierung

2D ist hier didaktisch besser als 3D, weil Bernoulli und Kontinuitaet als Kanalmodell und Druckbalken gelesen werden. Die Simulation zeigt:

- Venturi-Kanal mit bewegten Stromlinien
- Geschwindigkeit in der Engstelle
- Staudruck vor und in der Engstelle
- Dichtehoehe und IAS/TAS-Unterschied

## Interaktionen

- Geschwindigkeit
- Querschnitt der Engstelle
- Hoehe/Dichte

## Physikalisches Modell

- `q = 0.5 * rho * v^2`
- `p_stat + q = p_ges`
- `v2 = v1 / (A2/A1)` als didaktische Kontinuitaetsnaeherung
- `rho = rho0 * exp(-h/8500m)` als einfache Dichtehoehennaeherung

## Paedagogische Missionen

1. Venturi verengen und Druckabfall sehen.
2. Geschwindigkeit verdoppeln und Vierfach-Staudruck erkennen.
3. Hoehe erhoehen und IAS/TAS-Unterschied begreifen.

## Pruefungsfallen

- Staudruck waechst quadratisch, nicht linear.
- Der Fahrtmesser misst nicht TAS direkt.
- Bernoulli bedeutet nicht, dass Druck generell "weg" ist, sondern dass Druckformen ineinander uebergehen.

## Abnahme

- Stromlinien bewegen sich.
- Engstelle beeinflusst sichtbar Geschwindigkeit und Druckwerte.
- Hoehe beeinflusst Dichte und IAS/TAS-Ausgabe.
