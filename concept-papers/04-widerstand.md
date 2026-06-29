# Konzeptpaper 04 - Widerstand: schaedlich und induziert

## PDF-Anker

- Kapitel 5, Seiten 34-41
- Widerstandsformel, schaedlicher Widerstand, induzierter Widerstand

## Lernziel

Schueler sollen erkennen, warum sowohl sehr langsam als auch sehr schnell ineffizient sein kann. Der Widerstand ist eine Summe: schaedlicher Widerstand steigt mit Geschwindigkeit, induzierter Widerstand steigt bei hoher Auftriebsanforderung.

## Visualisierung

2D ist fuer die Gesamtlogik am besten, ergaenzt durch eine 3D-Fluegel-/Wirbelansicht:

- Widerstandskurve ueber Geschwindigkeit
- separate Kurven fuer schaedlich, induziert, gesamt
- aktueller Punkt
- 3D-Fluegel mit Randwirbeln als visueller Hinweis auf induzierten Widerstand

## Interaktionen

- Geschwindigkeit
- Masse
- Fluegelflaeche
- Streckung
- Konfiguration
- Dichtehoehe

## Physikalisches Modell

- `W = cw * F * q`
- `cw = cw0 + cwi`
- `cwi = ca^2 / (pi * Lambda * e)`
- Konfiguration veraendert `cw0`

## Paedagogische Missionen

1. Langsam und schwer: induzierter Widerstand dominiert.
2. Schnell: schaedlicher Widerstand dominiert.
3. Klappen/Fahrwerk: cw0 verschiebt die Kurve.

## Pruefungsfallen

- Induzierter Widerstand ist nicht "bei hoher Geschwindigkeit" maximal.
- Fahrwerk/Klappen erhoehen vor allem den schaedlichen Anteil.
- Streckung wirkt stark auf induzierten Widerstand.

## Abnahme

- Kurven reagieren auf Regler.
- Aktueller Punkt zeigt dominante Widerstandsart.
- Randwirbel/Downwash wird visuell verstaendlich.
