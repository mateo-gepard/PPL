# Konzeptpaper 06 - Start- und Landhilfen

## PDF-Anker

- Kapitel 7, Seiten 60-65
- Mindestfluggeschwindigkeit, Klappenarten, Stoerklappen, Grundregeln

## Lernziel

Schueler sollen Klappen nicht als "mehr Auftrieb ist immer gut" missverstehen. Die Simulation zeigt den Trade-off: ca_max steigt, Vs sinkt, Widerstand steigt, Steigleistung kann leiden.

## Visualisierung

3D/2.5D ist sinnvoll:

- Profil mit beweglicher Klappe
- Stoerklappen als ausfahrbare Platte
- Anflug-/Startbahn mit veraendertem Gleitwinkel
- Balken fuer ca_max, Vs relativ, Widerstandszuschlag

## Interaktionen

- Klappentyp
- Klappenwinkel
- Geschwindigkeit
- Flugphase
- Stoerklappen

## Physikalisches Modell

- `Vs ~ 1 / sqrt(ca_max)`
- Klappentyp bestimmt ca_max-Zuwachs und cw-Zuwachs
- Fowler-Klappe vergroessert zusaetzlich effektive Flaeche
- Stoerklappen senken ca und erhoehen cw

## Paedagogische Missionen

1. Start mit maessiger Klappe.
2. Landung mit grosser Fowler-Klappe.
3. Stoerklappen fuer Zielanflug einsetzen.

## Pruefungsfallen

- Grosse Klappenstellung beim Start kann Steigleistung verschlechtern.
- Einfahren in geringer Hoehe kann Durchsacken verursachen.
- VFE/weißer Bereich muss beachtet werden.
- Klappen koennen Moment- und Trimmveraenderungen verursachen.

## Abnahme

- Klappen bewegen sich sichtbar am Profil.
- Klappentypen unterscheiden sich sichtbar und numerisch.
- Warnhinweise wechseln mit Flugphase und Geschwindigkeit.
