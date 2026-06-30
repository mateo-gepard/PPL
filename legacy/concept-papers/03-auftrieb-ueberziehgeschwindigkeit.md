# Konzeptpaper 03 - Auftrieb und Ueberziehgeschwindigkeit

## PDF-Anker

- Kapitel 4, Seiten 25-31
- Entstehung des Auftriebs, Einfluesse, Auftriebsformel, ca-alpha

## Lernziel

Schueler sollen die Kette `v -> q -> ca-Anforderung -> Auftrieb -> Stallreserve` intuitiv beherrschen. Besonders wichtig ist: Stall passiert bei alpha_krit, waehrend die angezeigte Stallgeschwindigkeit von Gewicht, Dichte, Flaeche, ca_max und Lastvielfachem abhaengt.

## Visualisierung

Kombination aus 3D und 2D:

- 3D-Fluegel mit Anstroemung und Auftriebs-/Gewichtsvektor
- 2D ca-alpha-Diagramm mit aktuellem Punkt und alpha_krit
- Reserveanzeige und Vs-Rechnung

## Interaktionen

- Geschwindigkeit
- alpha
- Fluegelflaeche
- Masse
- Klappen
- Dichtehoehe

## Physikalisches Modell

- `A = ca * F * q`
- `q = 0.5 * rho * v^2`
- `G = m * g`
- `Vs = sqrt(2G / (rho * F * ca_max))`
- ca steigt linear bis ca_max und faellt nach alpha_krit ab.

## Paedagogische Missionen

1. Langsamflug: v reduzieren, alpha erhoehen, Reserve beobachten.
2. Dichtehoehe: gleiche IAS-Idee mit hoeherer TAS verbinden.
3. Klappen: ca_max steigt, kritischer alpha sinkt.

## Pruefungsfallen

- "Stall bei zu geringer Geschwindigkeit" ist unvollstaendig; die direkte Ursache ist alpha.
- Mehr Masse erhoeht Vs.
- Mehr Klappen senken Vs, aber nicht ohne Widerstands-/alpha-Nebenwirkungen.

## Abnahme

- Vektoren skalieren sichtbar mit Modellwerten.
- Stallstatus wechselt bei alpha_krit oder mangelnder Auftriebsreserve.
- Diagramm und 3D-Szene zeigen denselben Zustand.
