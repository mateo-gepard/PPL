# SkyLab — PPL Aerodynamik

Ein vollständiges interaktives Lernsystem zur **EASA 081 „Principles of Flight"** (PPL-Aerodynamik).
11 Lerneinheiten mit **physikalisch echten Simulationen**, verknüpft mit dem Prüfungsstoff, plus
Quizzes und einem Prüfungssimulator.

## Starten

**Empfohlen (mit Speichern des Fortschritts):**

Doppelklick auf **`start.command`** — startet einen lokalen Server und öffnet den Browser.

Oder im Terminal:

```bash
python3 -m http.server 8755
```

Dann im Browser öffnen: <http://localhost:8755>

**Schnell (ohne Server):** `index.html` direkt im Browser öffnen. Alle Simulationen funktionieren;
nur das dauerhafte Speichern des Lernfortschritts braucht den Server (oben).

## Die 11 Einheiten

**Grundlagen der Strömung**
1. Atmosphäre & Staudruck — ISA-Modell, ρ/p/T mit der Höhe, q = ½ρv², IAS↔TAS
2. Kontinuität & Bernoulli — Venturi mit Strömung & Druck
3. Der Fahrtmesser — Pitot-Statik, IAS/CAS/TAS, Instrument

**Auftrieb, Widerstand & Polare**
4. Profil & Strömung — **echte Joukowski-Potentialströmung** (Stromlinien, Staupunkte, Druck, Zirkulation)
5. Auftrieb & Formel — A = c_A·F·½ρv², c_A-α-Kurve, Kräftegleichgewicht
6. Widerstand & Polare — schädlicher/induzierter Widerstand, Gesamtpolare, beste Gleitzahl
7. Geschwindigkeitspolare & Gleiten — bestes Gleiten, geringstes Sinken, Wind, Notlandung
8. Auftriebshilfen — Klappen & Vorflügel, Verschiebung der c_A-Kurve, V_S

**Steuerung & Flugzustände**
9. Steuerung & Achsen — 3D-Flugzeug, Rollen/Nicken/Gieren, Primär- & Sekundärwirkung
10. Kurvenflug & Lastvielfaches — n = 1/cos φ, V-n-Diagramm, V_A, Grenzlasten
11. Überziehen & Trudeln — Strömungsablösung, kritischer Anstellwinkel, Autorotation

Jede Einheit hat: **Simulation** · **Theorie** · **Quiz**. Dazu ein **Prüfungssimulator**
(20 gemischte Fragen, 75% zum Bestehen).

## Technik

Reines HTML/CSS/JavaScript, kein Build nötig. Alle Simulationen rechnen mit echten
physikalischen Modellen (ISA-Atmosphäre, Bernoulli/Kontinuität, konforme Joukowski-Abbildung
mit Kutta-Bedingung, Auftriebs-/Widerstandspolare, Lastvielfaches, Geschwindigkeitspolare).

## Vorherige Version

Die vorherige PPL-Trainer-Version bleibt im Repository unter `legacy/` erhalten.
