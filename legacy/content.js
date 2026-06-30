window.PPL_CONTENT = {
  sourceTitle: "PPL(A) Principles of Flight / Aerodynamik, 081",
  units: [
    {
      id: "fundamentals",
      index: "2",
      title: "Grundlagen, Kontinuitaet und Bernoulli",
      chapter: "Kapitel 2",
      pages: "7-13",
      sim: "wind",
      summary:
        "Der Einstieg verknuepft Stroemungslinien, Kontinuitaetsgesetz, Bernoulli und Fahrtmesser. Du siehst, wie Geschwindigkeit, statischer Druck, Staudruck und angezeigte Fahrt zusammenhaengen.",
      tags: ["Kontinuitaet", "Bernoulli", "Staudruck", "IAS/TAS", "Grenzschicht"],
      related: ["lift", "drag", "polar"],
      concepts: [
        {
          term: "Ruhendes Flugzeug im Luftstrom",
          body:
            "Fuer die Aerodynamik darf man das Flugzeug gedanklich festhalten und die Luft vorbeistroemen lassen. Entscheidend ist die Relativbewegung."
        },
        {
          term: "Kontinuitaet",
          body:
            "Wird ein Stroemungskanal enger, muss bei gleicher Volumenstroemung die Geschwindigkeit steigen. Oeffnet er sich, sinkt sie."
        },
        {
          term: "Bernoulli",
          body:
            "Bei reibungsarmer, inkompressibler Stroemung bleibt die Summe aus statischem Druck und Staudruck naeherungsweise konstant."
        },
        {
          term: "Fahrtmesser",
          body:
            "Das Pitot-Statik-System misst die Druckdifferenz zwischen Gesamtdruck und statischem Druck. Diese Differenz ist der Staudruck."
        }
      ],
      formulas: [
        { name: "Staudruck", body: "q = 0.5 * rho * v^2" },
        { name: "Bernoulli", body: "p_stat + q = p_ges" },
        { name: "Faustregel TAS", body: "TAS steigt ca. 2% pro 1000 ft gegenueber IAS" }
      ],
      sources: [
        {
          title: "Vereinfachungen und Kontinuitaet",
          pages: "S. 7-8",
          body: "Stroemungslinien und Verengung/Erweiterung als Grundlage fuer alle folgenden Simulationen."
        },
        {
          title: "Gesetz von Bernoulli",
          pages: "S. 8",
          body: "Statischer Druck plus Staudruck ergibt den Gesamtdruck."
        },
        {
          title: "Fahrtmesser",
          pages: "S. 10",
          body: "Pitot-Rohr, statischer Druck, IAS und TAS-Faustregel."
        }
      ],
      missions: [
        {
          title: "Venturi lesen",
          prompt: "Stelle die Kanalenge auf 55% und erhoehe die Geschwindigkeit. Beobachte, wie q und p_stat gegeneinander laufen.",
          values: { speed: 48, throat: 55, altitude: 0 }
        },
        {
          title: "Hoehe verstehen",
          prompt: "Halte IAS gedanklich konstant und erhoehe die Hoehe. Warum braucht TAS fuer die Navigation eine Dichtekorrektur?",
          values: { speed: 45, throat: 75, altitude: 5000 }
        },
        {
          title: "Pruefungsfalle",
          prompt: "Verdopple die Geschwindigkeit. Der Staudruck steigt nicht doppelt, sondern vierfach.",
          values: { speed: 80, throat: 100, altitude: 0 }
        }
      ]
    },
    {
      id: "profile",
      index: "3",
      title: "Profilgeometrie und Fluegelform",
      chapter: "Kapitel 3",
      pages: "17-22",
      sim: "profile",
      summary:
        "Dieses Modul macht Profilsehne, Profiltiefe, Woelbung, Dicke, Druckpunkt, V-Stellung, Einstellwinkel und Streckung sichtbar.",
      tags: ["Profilsehne", "Profiltiefe", "Woelbung", "Streckung", "Druckpunkt"],
      related: ["lift", "drag", "abnormal"],
      concepts: [
        {
          term: "Profilsehne",
          body:
            "Die gerade Verbindung von Vorderkante zu Hinterkante. Der Anstellwinkel wird gegen diese Linie gemessen."
        },
        {
          term: "Profiltiefe",
          body:
            "Die Laenge des Profils von Vorderkante bis Hinterkante. Relative Angaben beziehen sich meist auf diese Tiefe."
        },
        {
          term: "Woelbung und Dicke",
          body:
            "Mehr Woelbung verschiebt die ca-Kurve nach oben; mehr relative Dicke kann ca_max erhoehen, vergroessert aber oft den Mindestwiderstand."
        },
        {
          term: "Streckung",
          body:
            "Hohe Streckung verteilt Auftrieb ueber mehr Spannweite und reduziert den induzierten Widerstand."
        }
      ],
      formulas: [
        { name: "Streckung", body: "Lambda = b^2 / F" },
        { name: "Zuspitzung", body: "lambda = t_aussen / t_innen" },
        { name: "Geometrischer Bezug", body: "alpha = Winkel zwischen Profilsehne und Anstroemrichtung" }
      ],
      sources: [
        {
          title: "Geometrie der Tragfluegelprofile",
          pages: "S. 17",
          body: "Profilsehne, Profiltiefe, Skelettlinie, Woelbung und Dicke."
        },
        {
          title: "Geometrie der Fluegel",
          pages: "S. 19-22",
          body: "Spannweite, Flaeche, Pfeilung, V-Stellung und Einstellwinkel."
        }
      ],
      missions: [
        {
          title: "Dicke gegen Widerstand",
          prompt: "Erhoehe die Dicke und beobachte Druckpunkt und erwarteten Mindestwiderstand.",
          values: { thickness: 16, camber: 3, alpha: 4, roughness: 20, sweep: 0 }
        },
        {
          title: "Woelbung verschiebt ca",
          prompt: "Vergleiche symmetrisches Profil und gewoelbtes Profil bei gleichem alpha.",
          values: { thickness: 12, camber: 5, alpha: 3, roughness: 10, sweep: 0 }
        },
        {
          title: "Ablosung provozieren",
          prompt: "Erhoehe alpha, bis die Ablosungszone nach vorne wandert.",
          values: { thickness: 12, camber: 2, alpha: 15, roughness: 45, sweep: 0 }
        }
      ]
    },
    {
      id: "lift",
      index: "4",
      title: "Auftrieb und Ueberziehgeschwindigkeit",
      chapter: "Kapitel 4",
      pages: "25-31",
      sim: "lift",
      summary:
        "Hier steuerst du Geschwindigkeit, Anstellwinkel, Dichte, Flaeche, Masse und Klappen. Die App zeigt Auftrieb, ca, ca_max, Reserve und Stall-Grenze.",
      tags: ["Auftrieb", "ca", "alpha", "ca_max", "Fluechenbelastung"],
      related: ["fundamentals", "flaps", "turn", "abnormal"],
      concepts: [
        {
          term: "Auftriebsentstehung",
          body:
            "Die Stroemung erzeugt Druckunterschiede am Profil. Die resultierende Kraft senkrecht zur Anstroemung ist der Auftrieb."
        },
        {
          term: "Anstellwinkel",
          body:
            "alpha ist der Winkel zwischen Profilsehne und Anstroemrichtung. Stall haengt primaer an alpha, nicht an einer festen Fluglage."
        },
        {
          term: "ca-Kurve",
          body:
            "Bis nahe alpha_krit steigt ca mit alpha. Nach ca_max reisst die Stroemung zunehmend ab und ca nimmt ab."
        },
        {
          term: "Fluechenbelastung",
          body:
            "Gewicht pro Flaeche bestimmt, welcher Staudruck und welcher ca noetig sind, um das Gewicht zu tragen."
        }
      ],
      formulas: [
        { name: "Auftrieb", body: "A = ca * F * q = ca * F * 0.5 * rho * v^2" },
        { name: "Horizontalflug", body: "A = G" },
        { name: "Ueberziehgeschwindigkeit", body: "V_s = sqrt(2G / (rho * F * ca_max))" }
      ],
      sources: [
        {
          title: "Entstehung des Auftriebs",
          pages: "S. 25",
          body: "Stroemung ueber/unter dem Profil und Druckdifferenz."
        },
        {
          title: "Einfluesse auf den Auftrieb",
          pages: "S. 26",
          body: "Staudruck, Flaeche, Profilform und Anstellwinkel."
        },
        {
          title: "Auftriebsformel und ca(alpha)",
          pages: "S. 28-29",
          body: "Formel A = ca * F * q und aufgeloestes Polardiagramm."
        }
      ],
      missions: [
        {
          title: "Langsamflug ohne Stall",
          prompt: "Reduziere v, bis nur noch wenig Reserve bleibt. Dann erhoehe alpha, nicht die Flaeche.",
          values: { speed: 47, alpha: 11, wingArea: 16, mass: 850, flap: 0, altitude: 0 }
        },
        {
          title: "Dichtehoehe",
          prompt: "Fliege dieselbe Masse in 7000 ft. Warum steigt die TAS fuer denselben Staudruck?",
          values: { speed: 58, alpha: 8, wingArea: 16, mass: 850, flap: 0, altitude: 7000 }
        },
        {
          title: "Klappenreserve",
          prompt: "Setze mittlere Klappen. ca_max steigt, aber der kritische alpha wird kleiner.",
          values: { speed: 44, alpha: 10, wingArea: 17, mass: 850, flap: 25, altitude: 0 }
        }
      ]
    },
    {
      id: "drag",
      index: "5",
      title: "Widerstand: schaedlich und induziert",
      chapter: "Kapitel 5",
      pages: "34-41",
      sim: "drag",
      summary:
        "Das Modul trennt Reibungs-, Form-, Interferenz- und induzierten Widerstand. Du siehst, warum langsam nicht automatisch effizient ist.",
      tags: ["Widerstand", "cw", "Formwiderstand", "Reibung", "Induziert"],
      related: ["profile", "polar", "turn"],
      concepts: [
        {
          term: "Schaedlicher Widerstand",
          body:
            "Reibungs-, Form- und Interferenzwiderstand steigen im Grundsatz mit dem Staudruck, also stark mit der Geschwindigkeit."
        },
        {
          term: "Induzierter Widerstand",
          body:
            "Er entsteht durch Auftrieb und Randwirbel. Bei gleichem Gewicht wird er bei kleiner Geschwindigkeit und kleiner Streckung groesser."
        },
        {
          term: "Grenzschicht",
          body:
            "Laminar bedeutet geringe Reibung, turbulent hoehere Reibung und mehr Wandnaehe. Ablosung erzeugt starken Formwiderstand."
        },
        {
          term: "Streckung",
          body:
            "Mehr Spannweite bei gleicher Flaeche senkt die Abwindgeschwindigkeit und damit den induzierten Widerstand."
        }
      ],
      formulas: [
        { name: "Widerstand", body: "W = cw * F * q = cw * F * 0.5 * rho * v^2" },
        { name: "Induzierter Anteil", body: "cw_i = ca^2 / (pi * Lambda * e)" },
        { name: "Gesamt", body: "cw = cw0 + cw_i" }
      ],
      sources: [
        {
          title: "Widerstand allgemein",
          pages: "S. 34",
          body: "Widerstandsformel analog zur Auftriebsformel."
        },
        {
          title: "Schaedlicher Widerstand",
          pages: "S. 36",
          body: "Reibung, Formwiderstand, Ablosung und Wirbel hinter Koerpern."
        },
        {
          title: "Induzierter Widerstand",
          pages: "S. 38-39",
          body: "Randwirbel, Abwind, effektive Anstroemung und induzierter Winkel."
        }
      ],
      missions: [
        {
          title: "Zu langsam ist teuer",
          prompt: "Setze 45 kt und hohe Masse. Der induzierte Anteil dominiert.",
          values: { speed: 45, mass: 950, area: 16, aspect: 6, config: "clean", altitude: 0 }
        },
        {
          title: "Zu schnell ist auch teuer",
          prompt: "Setze 120 kt in sauberer Konfiguration. Der schaedliche Anteil dominiert.",
          values: { speed: 120, mass: 850, area: 16, aspect: 8, config: "clean", altitude: 0 }
        },
        {
          title: "Klappen/Fahrwerk",
          prompt: "Erhoehe den Formwiderstand und beobachte, wie sich das Minimum verschiebt.",
          values: { speed: 70, mass: 850, area: 16, aspect: 8, config: "flapsGear", altitude: 0 }
        }
      ]
    },
    {
      id: "polar",
      index: "6",
      title: "Polare, Gleiten und Steigflug",
      chapter: "Kapitel 6",
      pages: "44-56",
      sim: "polar",
      summary:
        "Du trainierst ca/cw-Polare, beste Gleitzahl, geringstes Sinken, Gewichtseinfluss, Dichtehoehe und Leistung im Steigflug.",
      tags: ["Polare", "Gleitzahl", "Sinkrate", "Steigen", "Dichte"],
      related: ["drag", "lift", "flaps"],
      concepts: [
        {
          term: "Aufgeloestes Polardiagramm",
          body:
            "ca und cw koennen gegen alpha dargestellt werden. Das zeigt Stallnaehe und Widerstandsbeiwert separat."
        },
        {
          term: "Lilienthal-Polare",
          body:
            "ca gegen cw erlaubt direkte Betrachtung der Gleitzahl. Eine Gerade vom Ursprung entspricht konstantem ca/cw."
        },
        {
          term: "Beste Gleitzahl",
          body:
            "Der Beruehrpunkt der Ursprungstangente an die Polare liefert das beste Verhaeltnis ca/cw."
        },
        {
          term: "Geschwindigkeitspolare",
          body:
            "Zeigt Sinkrate ueber Geschwindigkeit. Gewicht verschiebt die Polare zu hoeheren Geschwindigkeiten und groesserem Sinken."
        }
      ],
      formulas: [
        { name: "Gleitzahl", body: "E = ca / cw = Strecke / Hoehe" },
        { name: "Sinkwinkel naeherungsweise", body: "tan gamma = cw / ca" },
        { name: "Steigrate", body: "ROC ~ (P_verfuegbar - P_benoetigt) / Gewicht" }
      ],
      sources: [
        {
          title: "Parameter und Darstellung",
          pages: "S. 45",
          body: "Aufgeloestes Polardiagramm und Lilienthal-Polare."
        },
        {
          title: "Gesamtpolare",
          pages: "S. 50",
          body: "Beste Gleitzahl als Ursprungstangente; Gleitzahl als Verhaeltnis 1 zu ..."
        },
        {
          title: "Geschwindigkeitspolare und Steigflug",
          pages: "S. 54-55",
          body: "Sinkrate ueber v, Einfluss von Gewicht/Dichte und Steigflugkraefte."
        }
      ],
      missions: [
        {
          title: "Bestes Gleiten",
          prompt: "Setze saubere Konfiguration und suche die Geschwindigkeit nahe bester Gleitzahl.",
          values: { weight: 850, densityAlt: 0, config: "clean", power: 0, speed: 76 }
        },
        {
          title: "Geringstes Sinken",
          prompt: "Vergleiche die Geschwindigkeit fuer geringstes Sinken mit bester Gleitzahl.",
          values: { weight: 850, densityAlt: 0, config: "clean", power: 0, speed: 62 }
        },
        {
          title: "Steigflug mit Leistung",
          prompt: "Fuege Leistung hinzu. Du siehst, warum groessere Geschwindigkeit nicht automatisch mehr Steigrate bedeutet.",
          values: { weight: 850, densityAlt: 3000, config: "clean", power: 78, speed: 78 }
        }
      ]
    },
    {
      id: "flaps",
      index: "7",
      title: "Start- und Landhilfen",
      chapter: "Kapitel 7",
      pages: "60-65",
      sim: "flaps",
      summary:
        "Klappen, Fowler-Fluegel und Stoerklappen werden als Trade-off dargestellt: ca_max hoch, Vs runter, Widerstand und Sinkwinkel hoch.",
      tags: ["Klappen", "Fowler", "Stoerklappen", "Vs", "Ballooning"],
      related: ["lift", "polar", "abnormal"],
      concepts: [
        {
          term: "Mindestfluggeschwindigkeit",
          body:
            "Start- und Landhilfen senken Vs durch groesseren ca_max und teils mehr Flaeche, aber fast immer mit mehr Widerstand."
        },
        {
          term: "Klappentypen",
          body:
            "Woelb-, Spreiz-, Spalt-, Doppelspalt- und Fowler-Klappen unterscheiden sich in ca_max und Widerstandszunahme."
        },
        {
          term: "Startregel",
          body:
            "Beim Start nur geringe bis maessige Klappen, wenn noetig. Viel Widerstand verschlechtert Steigwinkel und Steigrate."
        },
        {
          term: "Landeregel",
          body:
            "Bei der Landung sind grosse Klappenstellung und groesserer Widerstand erwuenscht, weil sie steileren, langsameren Anflug ermoeglichen."
        }
      ],
      formulas: [
        { name: "Vs mit Klappen", body: "Vs sinkt mit groesserem ca_max: Vs ~ 1 / sqrt(ca_max)" },
        { name: "Gleitwinkel", body: "Mehr cw bei gleichem ca bedeutet schlechtere Gleitzahl" },
        { name: "Kritischer alpha", body: "Mit ausgefahrenen Klappen kann alpha_krit kleiner werden" }
      ],
      sources: [
        {
          title: "Herabsetzung der Mindestfluggeschwindigkeit",
          pages: "S. 60",
          body: "ca_max, Flaeche, Widerstand und Gleitzahl im Start/Lande-Kontext."
        },
        {
          title: "Wirkungsweise von Klappen",
          pages: "S. 61",
          body: "Uebersicht Hinterkantenklappen und typische ca_max-Werte."
        },
        {
          title: "Grundregeln",
          pages: "S. 63-64",
          body: "Start, Landung, Einfahren, Balloning, VFE und Nachtrimmen."
        }
      ],
      missions: [
        {
          title: "Start nur maessig",
          prompt: "Setze Startphase, 15 Grad Klappen. Vergleiche Vs und Steigreserve.",
          values: { flapType: "plain", flapAngle: 15, speed: 58, phase: "start", spoiler: 0 }
        },
        {
          title: "Landung steil",
          prompt: "Setze Landung, 35 Grad Fowler. Die Geschwindigkeit sinkt, der Gleitwinkel wird steiler.",
          values: { flapType: "fowler", flapAngle: 35, speed: 55, phase: "landing", spoiler: 0 }
        },
        {
          title: "Stoerklappen",
          prompt: "Fahre Stoerklappen aus. Auftrieb sinkt, Widerstand steigt: ideal fuer Zielanflug, nicht fuer Start.",
          values: { flapType: "clean", flapAngle: 0, speed: 60, phase: "landing", spoiler: 70 }
        }
      ]
    },
    {
      id: "controls",
      index: "8",
      title: "Steuerungsanlagen und Ruderwirkungen",
      chapter: "Kapitel 8",
      pages: "68-75",
      sim: "controls",
      summary:
        "Du manipulierst Quer-, Hoehen- und Seitenruder und siehst Primaerwirkung, Sekundaerwirkung, negatives Wendemoment und Trimmung.",
      tags: ["Rollen", "Nicken", "Gieren", "Trimmung", "Sekundaerwirkung"],
      related: ["turn", "abnormal", "flaps"],
      concepts: [
        {
          term: "Drei Achsen",
          body:
            "Laengsachse: Rollen mit Querruder. Hochachse: Gieren mit Seitenruder. Querachse: Nicken mit Hoehenruder."
        },
        {
          term: "Ruderkraft",
          body:
            "Ruderwirkungen skalieren mit Staudruck. Bei hoher Fahrt wirken kleine Ausschlaege stark."
        },
        {
          term: "Negatives Wendemoment",
          body:
            "Beim Querruderausschlag erzeugt die nach unten gehende Klappe mehr Auftrieb und mehr Widerstand. Das Flugzeug giert zunaechst entgegen der Rollrichtung."
        },
        {
          term: "Trimmung",
          body:
            "Trimmen nimmt Dauersteuerkraefte weg. Kopflastigkeit verlangt dauerndes Ziehen, Schwanzlastigkeit verhaelt sich gegenteilig."
        }
      ],
      formulas: [
        { name: "Ruderwirkung", body: "Moment ~ q * Ruderausschlag * Hebelarm" },
        { name: "Dynamischer Ausgleich", body: "Schwerpunkt des Ruders nahe hinter Drehachse reduziert Steuerkraft" },
        { name: "Differentialquerruder", body: "Aufwaerts mehr Ausschlag als abwaerts reduziert negatives Wendemoment" }
      ],
      sources: [
        {
          title: "Achsen und Primaerwirkung",
          pages: "S. 68",
          body: "Laengs-, Hoch- und Querachse mit zugehoerigen Rudern."
        },
        {
          title: "Ruderausgleich und Hilfsruder",
          pages: "S. 70-71",
          body: "Dynamischer/aerodynamischer Ausgleich, Verstaerkungsruder, Flettner und Trimmung."
        },
        {
          title: "Sekundaerwirkung",
          pages: "S. 73-74",
          body: "Seitenruder erzeugt Rollmoment, Querruder erzeugt negatives Wendemoment."
        }
      ],
      missions: [
        {
          title: "Koordinierte Kurve vorbereiten",
          prompt: "Setze Querruder rechts und etwas Seitenruder rechts. Negatives Wendemoment wird kompensiert.",
          values: { aileron: 38, elevator: 8, rudder: 18, trim: 0, speed: 78 }
        },
        {
          title: "Slip einleiten",
          prompt: "Querruder links, Seitenruder rechts: die Laengsachse und Flugrichtung trennen sich.",
          values: { aileron: -45, elevator: 4, rudder: 45, trim: 0, speed: 62 }
        },
        {
          title: "Trimmlast",
          prompt: "Setze Hoehenruder hoch und trimme langsam nach, bis die Dauerlast kleiner wird.",
          values: { aileron: 0, elevator: 22, rudder: 0, trim: 18, speed: 70 }
        }
      ]
    },
    {
      id: "turn",
      index: "9",
      title: "Kurvenflug und Lastvielfaches",
      chapter: "Kapitel 9",
      pages: "78-81",
      sim: "turn",
      summary:
        "Dieses Modul zeigt Kraftvektoren in der Kurve, Lastvielfaches n = 1/cos(beta), Stall-Speed-Zunahme, Kurvenradius und Rate.",
      tags: ["Schraeglage", "Lastvielfaches", "Vs(n)", "Kurvenradius", "Va"],
      related: ["lift", "controls", "abnormal"],
      concepts: [
        {
          term: "Resultierender Auftrieb",
          body:
            "In der koordinierten Horizontalkurve muss der Auftrieb groesser als das Gewicht sein, weil nur seine vertikale Komponente das Gewicht traegt."
        },
        {
          term: "Lastvielfaches",
          body:
            "In koordinierter Horizontalkurve haengt n nur von der Schraeglage ab, nicht von Geschwindigkeit oder Radius."
        },
        {
          term: "Stall-Speed in der Kurve",
          body:
            "Die Ueberziehgeschwindigkeit steigt mit der Wurzel des Lastvielfachen."
        },
        {
          term: "Radius und Geschwindigkeit",
          body:
            "Bei gleicher Schraeglage waechst der Kurvenradius mit v^2. Schneller Flug braucht viel mehr Raum."
        }
      ],
      formulas: [
        { name: "Lastvielfaches", body: "n = 1 / cos(beta)" },
        { name: "Stall-Speed", body: "Vs_beta = Vs0 * sqrt(n)" },
        { name: "Kurvenradius", body: "r = v^2 / (g * tan(beta))" }
      ],
      sources: [
        {
          title: "Kraefte in der Horizontalkurve",
          pages: "S. 78",
          body: "Auftrieb, Zentrifugalkraft, scheinbares Gewicht und n = 1/cos(beta)."
        },
        {
          title: "n und Vs in der Kurve",
          pages: "S. 79",
          body: "45 Grad etwa 1.41 g; 60 Grad etwa 2 g; Vs steigt entsprechend."
        },
        {
          title: "Va und Vne",
          pages: "S. 80",
          body: "Manoevergeschwindigkeit, Festigkeit und mechanische Grenzen."
        }
      ],
      missions: [
        {
          title: "45 Grad merken",
          prompt: "Setze 45 Grad. n ist ca. 1.41, Vs steigt um ca. 19%.",
          values: { bank: 45, speed: 90, stallClean: 48, mass: 850 }
        },
        {
          title: "60 Grad respektieren",
          prompt: "Setze 60 Grad. n ist 2, Vs steigt um 41%.",
          values: { bank: 60, speed: 92, stallClean: 48, mass: 850 }
        },
        {
          title: "Radiusfalle",
          prompt: "Halte 30 Grad und verdopple fast die Geschwindigkeit. Der Radius waechst massiv.",
          values: { bank: 30, speed: 130, stallClean: 48, mass: 850 }
        }
      ]
    },
    {
      id: "abnormal",
      index: "10",
      title: "Ueberziehen, Trudeln und Seitengleitflug",
      chapter: "Kapitel 10",
      pages: "83-90",
      sim: "abnormal",
      summary:
        "Das Grenzzustandsmodul verbindet alpha_krit, Ablosung, Lastvielfaches, Rudereinsatz, Trudelbeginn, Recovery und Slip-Logik.",
      tags: ["Stall", "alpha_krit", "Trudeln", "Slip", "Recovery"],
      related: ["lift", "turn", "controls", "flaps"],
      concepts: [
        {
          term: "Stall ist alpha-abhaengig",
          body:
            "Ueberziehen tritt ein, wenn alpha_krit erreicht oder ueberschritten wird. Geschwindigkeit und Fluglage sind nur indirekte Hinweise."
        },
        {
          term: "Stall-Speed gilt fuer Bedingungen",
          body:
            "Vs wird meist fuer Horizontalflug angegeben. Lastvielfaches, Gewicht, Klappen und Vereisung verschieben die Grenze."
        },
        {
          term: "Trudeln",
          body:
            "Ausgangszustand ist extremer Langsamflug nahe alpha_krit. Asymmetrische Ablosung plus Giermoment kann zur Autorotation fuehren."
        },
        {
          term: "Seitengleitflug",
          body:
            "Gegensinnige Quer- und Seitenruderausschlaege erzeugen Schiebeflug. ca sinkt, cw steigt, Fahrtmesser kann unzuverlaessig werden."
        }
      ],
      formulas: [
        { name: "Stallbedingung", body: "alpha >= alpha_krit" },
        { name: "Stall-Speed mit n", body: "Vs_n = Vs0 * sqrt(n)" },
        { name: "Slip-Effekt", body: "ca runter, cw rauf, Gleitzahl schlechter" }
      ],
      sources: [
        {
          title: "Ueberziehen",
          pages: "S. 83-85",
          body: "alpha_krit, ca_max, Faktoren und Abkippverhalten."
        },
        {
          title: "Trudeln",
          pages: "S. 87",
          body: "Steiltrudeln, Flachtrudeln und grundsaetzliche Beendigung."
        },
        {
          title: "Seitengleitflug",
          pages: "S. 88-89",
          body: "Schiebeflug, Schiebewinkel, unzuverlaessige Fahrtanzeige und Fahrwerksbelastung."
        }
      ],
      missions: [
        {
          title: "Sauberer Stall",
          prompt: "Erhoehe alpha bis ueber alpha_krit, aber halte Rudder neutral. Die Ablosung dominiert.",
          values: { alpha: 17, rudder: 0, aileron: 0, flaps: 0, bank: 0, power: 25 }
        },
        {
          title: "Trudelfalle",
          prompt: "Stallnaehe plus starkes Seitenruder erzeugt asymmetrische Ablosung und Autorotation.",
          values: { alpha: 16, rudder: 70, aileron: 15, flaps: 0, bank: 20, power: 15 }
        },
        {
          title: "Slip fuer Zielanflug",
          prompt: "Gegensinnige Ruder verschlechtern die Gleitzahl. Achte auf Fahrtmesser und Fahrwerkslast.",
          values: { alpha: 9, rudder: 55, aileron: -45, flaps: 15, bank: 12, power: 10 }
        }
      ]
    }
  ],
  questions: [
    {
      unit: "fundamentals",
      q: "Was passiert in einem enger werdenden Stroemungskanal bei gleicher Volumenstroemung?",
      options: ["Geschwindigkeit steigt, statischer Druck sinkt", "Geschwindigkeit sinkt, statischer Druck steigt", "Staudruck bleibt null", "Gesamtdruck muss kleiner werden"],
      answer: 0,
      explain: "Kontinuitaet erhoeht v in der Engstelle; Bernoulli verknuepft das mit niedrigerem statischem Druck.",
      source: "S. 7-8"
    },
    {
      unit: "fundamentals",
      q: "Welche Druckdifferenz nutzt der Fahrtmesser im Grundprinzip?",
      options: ["Gesamtdruck minus statischer Druck", "Statischer Druck minus Dampfdruck", "Kabinenluftdruck minus Aussendruck", "Druck oben minus Druck unten am Fluegel"],
      answer: 0,
      explain: "Das Pitot-Statik-System liefert q = p_ges - p_stat.",
      source: "S. 10"
    },
    {
      unit: "fundamentals",
      q: "Wenn die Geschwindigkeit verdoppelt wird, wie veraendert sich der Staudruck naeherungsweise?",
      options: ["Er vervierfacht sich", "Er verdoppelt sich", "Er halbiert sich", "Er bleibt konstant"],
      answer: 0,
      explain: "q = 0.5 * rho * v^2. Der Geschwindigkeitsterm steht quadratisch.",
      source: "S. 8"
    },
    {
      unit: "fundamentals",
      q: "Warum ist TAS in groesserer Hoehe bei gleicher IAS groesser?",
      options: ["Die Luftdichte ist kleiner", "Der Pitotdruck ist immer groesser", "Die Erdanziehung sinkt auf null", "Der Fluegel erzeugt keinen Widerstand"],
      answer: 0,
      explain: "Fuer denselben Staudruck braucht du in duennerer Luft mehr wahre Geschwindigkeit.",
      source: "S. 10"
    },
    {
      unit: "fundamentals",
      q: "Welche Aussage passt zu Bernoulli in der PPL-Vereinfachung?",
      options: ["p_stat + q bleibt in reibungsarmer Stroemung konstant", "p_stat und q muessen beide gleichzeitig steigen", "q ist unabhaengig von v", "Gesamtdruck ist immer null"],
      answer: 0,
      explain: "Das Lehrskript fasst Bernoulli als statischer Druck plus Staudruck gleich Gesamtdruck.",
      source: "S. 8"
    },
    {
      unit: "profile",
      q: "Zwischen welchen Linien wird der Anstellwinkel alpha definiert?",
      options: ["Profilsehne und Anstroemrichtung", "Flugzeuglaengsachse und Horizont", "Spannweite und Querachse", "Seitenleitwerk und Hochachse"],
      answer: 0,
      explain: "alpha bezieht sich auf die Profilsehne, nicht einfach auf die Lage des Flugzeugrumpfs.",
      source: "S. 26"
    },
    {
      unit: "profile",
      q: "Was beschreibt die Profiltiefe?",
      options: ["Abstand von Vorderkante zu Hinterkante", "Laenge des Seitenruders", "Abstand zwischen Fahrwerk und Schwerpunkt", "Hoehe des Tragfluegels ueber dem Boden"],
      answer: 0,
      explain: "Die Profiltiefe ist die Bezugsgroesse fuer viele relative Profilangaben.",
      source: "S. 17"
    },
    {
      unit: "profile",
      q: "Was bewirkt eine hohe Streckung grundsaetzlich?",
      options: ["Sie reduziert den induzierten Widerstand", "Sie eliminiert den Formwiderstand", "Sie macht Stall unmoeglich", "Sie macht Bernoulli ungueltig"],
      answer: 0,
      explain: "Grosse Spannweite verteilt die Luftablenkung und reduziert Randwirbelverluste.",
      source: "S. 19-22, 38-39"
    },
    {
      unit: "profile",
      q: "Bei einem symmetrischen Profil fallen welche Linien im Grundfall zusammen?",
      options: ["Profilsehne und Skelettlinie", "Hochachse und Laengsachse", "Staudrucklinie und Gesamtdrucklinie", "Vorderkante und Hinterkante"],
      answer: 0,
      explain: "Ohne Woelbung liegt die Mittellinie auf der Profilsehne.",
      source: "S. 17"
    },
    {
      unit: "profile",
      q: "Welche Profilgroesse verschiebt die ca-Kurve typischerweise nach oben?",
      options: ["Mehr Woelbung", "Weniger Fluegelflaeche", "Mehr Fahrwerkswiderstand", "Geringere Spannweite"],
      answer: 0,
      explain: "Gewoelbte Profile liefern bei gleichem alpha meist mehr Auftrieb als symmetrische.",
      source: "S. 47"
    },
    {
      unit: "lift",
      q: "Welche Groessen stehen direkt in der Auftriebsformel A = ca * F * q?",
      options: ["Auftriebsbeiwert, Flaeche, Staudruck", "Masse, Schraeglage, Radius", "TAS, IAS, VNE", "Reibung, Form, Interferenz"],
      answer: 0,
      explain: "Die Formel koppelt Profil/Stellung, Flaeche und dynamischen Druck.",
      source: "S. 28"
    },
    {
      unit: "lift",
      q: "Was muss im Horizontalflug im stationaeren Fall gelten?",
      options: ["Auftrieb gleich Gewicht", "Widerstand gleich Gewicht", "Staudruck gleich null", "ca gleich cw"],
      answer: 0,
      explain: "Ohne vertikale Beschleunigung traegt der Auftrieb das Gewicht.",
      source: "S. 28-29"
    },
    {
      unit: "lift",
      q: "Was passiert nach Ueberschreiten von ca_max?",
      options: ["ca nimmt trotz groesserem alpha ab", "ca steigt unbegrenzt", "cw wird exakt null", "Die Stroemung wird inkompressibel"],
      answer: 0,
      explain: "Jenseits alpha_krit reisst die Stroemung zunehmend ab.",
      source: "S. 29, 83"
    },
    {
      unit: "lift",
      q: "Welche Aenderung senkt die rechnerische Ueberziehgeschwindigkeit?",
      options: ["Hoeherer ca_max", "Hoehere Masse", "Kleinere Flaeche", "Groesseres Lastvielfaches"],
      answer: 0,
      explain: "Vs ist umgekehrt proportional zur Wurzel aus ca_max.",
      source: "S. 60, 84"
    },
    {
      unit: "lift",
      q: "Warum muss beim Langsamerwerden der Auftriebsbeiwert steigen, wenn Gewicht und Flaeche gleich bleiben?",
      options: ["q sinkt mit v^2", "rho steigt automatisch unendlich", "cw wird negativ", "Die Profilsehne wird laenger"],
      answer: 0,
      explain: "Bei kleinerem Staudruck muss ca groesser werden, um A = G zu halten.",
      source: "S. 28-29"
    },
    {
      unit: "drag",
      q: "Welche Anteile gehoeren zum schaedlichen Widerstand?",
      options: ["Reibungs-, Form- und Interferenzwiderstand", "Nur induzierter Widerstand", "Nur Auftriebskraft", "Nur Zentrifugalkraft"],
      answer: 0,
      explain: "Das Skript trennt schaedliche Widerstaende vom durch Auftrieb verursachten induzierten Widerstand.",
      source: "S. 36"
    },
    {
      unit: "drag",
      q: "Wann ist der induzierte Widerstand besonders gross?",
      options: ["Bei hoher ca-Anforderung und geringer Geschwindigkeit", "Bei maximaler VNE im Sturzflug", "Wenn kein Auftrieb erzeugt wird", "Wenn die Flaeche unendlich gross ist"],
      answer: 0,
      explain: "Langsamer Flug erfordert hohes ca; der induzierte Anteil steigt mit ca^2.",
      source: "S. 38-39"
    },
    {
      unit: "drag",
      q: "Was verursacht Formwiderstand besonders stark?",
      options: ["Ablosung und Wirbel hinter dem Koerper", "Gleichmaessige reibungsfreie Stromlinien", "Ein exakt symmetrischer Gesamtdruck", "Dichte gleich null"],
      answer: 0,
      explain: "Ablosung erzeugt Druckunterschiede in Stroemungsrichtung und damit Widerstand.",
      source: "S. 36"
    },
    {
      unit: "drag",
      q: "Was passiert mit dem schaedlichen Widerstand bei stark steigender Geschwindigkeit?",
      options: ["Er steigt deutlich mit dem Staudruck", "Er wird immer kleiner", "Er ist unabhaengig von q", "Er ersetzt den Auftrieb"],
      answer: 0,
      explain: "W = cw * F * q; bei gleicher Konfiguration waechst q mit v^2.",
      source: "S. 34"
    },
    {
      unit: "drag",
      q: "Wie wirkt groessere Streckung auf den induzierten Widerstand?",
      options: ["Sie reduziert ihn", "Sie erhoeht ihn immer", "Sie aendert nur den Fahrtmesser", "Sie macht die Grenzschicht laminar"],
      answer: 0,
      explain: "Groessere Streckung senkt die Abwind- und Randwirbelverluste.",
      source: "S. 38-39"
    },
    {
      unit: "polar",
      q: "Was beschreibt die beste Gleitzahl in der Polare?",
      options: ["Das maximale Verhaeltnis ca/cw", "Die hoechste Motordrehzahl", "Den kleinsten Anstellwinkel ueberhaupt", "Die groesste Klappenstellung"],
      answer: 0,
      explain: "In der Gesamtpolare ist die beste Gleitzahl der Tangentenpunkt vom Ursprung.",
      source: "S. 50"
    },
    {
      unit: "polar",
      q: "Welche Darstellung wird auch Lilienthal-Polare genannt?",
      options: ["ca ueber cw", "q ueber Hoehe", "Masse ueber Zeit", "IAS ueber TAS"],
      answer: 0,
      explain: "Die Polare traegt Auftriebsbeiwert gegen Widerstandsbeiwert auf.",
      source: "S. 45"
    },
    {
      unit: "polar",
      q: "Wie verschiebt groesseres Gewicht die Geschwindigkeitspolare grundsaetzlich?",
      options: ["Zu groesseren Geschwindigkeiten und groesserem Sinken", "Zu null Geschwindigkeit", "Nur nach links oben ohne Sinken", "Gar nicht"],
      answer: 0,
      explain: "Mehr Gewicht erfordert bei gleichem ca mehr Staudruck; die Polare liegt schneller und sinkt staerker.",
      source: "S. 54"
    },
    {
      unit: "polar",
      q: "Welcher Punkt ist neben bester Gleitzahl fuer Segel- und Motorflugtraining wichtig?",
      options: ["Geringstes Sinken", "Groesster Kabinendruck", "Kleinster Gesamtdruck", "Hoechste VNE"],
      answer: 0,
      explain: "Die Geschwindigkeitspolare zeigt sowohl beste Gleitzahl als auch geringstes Sinken.",
      source: "S. 54"
    },
    {
      unit: "polar",
      q: "Was begrenzt den Steigflug bei unveraenderter Geschwindigkeit?",
      options: ["Zusaetzlicher Schubbedarf gegen Gewichtskomponente und Widerstand", "Nur der Seitenwind", "Nur die Farbe der Klappen", "Der fehlende statische Druck im Cockpit"],
      answer: 0,
      explain: "Im Steigflug muss zusaetzlich zur Widerstandskraft die Hangabtriebskomponente des Gewichts ueberwunden werden.",
      source: "S. 55"
    },
    {
      unit: "flaps",
      q: "Was ist eine Hauptaufgabe von Start- und Landhilfen?",
      options: ["Mindestfluggeschwindigkeit senken", "VNE erhoehen", "Staudruck auf null setzen", "Kurvenradius eliminieren"],
      answer: 0,
      explain: "Klappen erhoehen ca_max und teils Flaeche; dadurch sinkt Vs.",
      source: "S. 60"
    },
    {
      unit: "flaps",
      q: "Warum nutzt man beim Start meist nur kleine bis mittlere Klappenstellungen?",
      options: ["Zu viel Widerstand verschlechtert Steigwinkel/Steigrate", "Weil ca_max dann immer null ist", "Weil VFE dann verschwindet", "Weil Klappen die Flaeche immer verkleinern"],
      answer: 0,
      explain: "Der Widerstand steigt bei grossen Stellungen oft staerker als der weitere Auftriebsgewinn nuetzt.",
      source: "S. 63"
    },
    {
      unit: "flaps",
      q: "Was bewirken Stoerklappen nach dem Skript?",
      options: ["ca kleiner, cw groesser, Gleitwinkel schlechter", "ca groesser, cw kleiner, beste Gleitzahl besser", "nur TAS-Korrektur", "nur Giermoment ohne Widerstand"],
      answer: 0,
      explain: "Stoerklappen werden als Landehilfe zur Erleichterung der Ziellandung beschrieben.",
      source: "S. 63"
    },
    {
      unit: "flaps",
      q: "Was kann beim Ausfahren von Klappen auftreten?",
      options: ["Ballooning oder Durchsacken, je nach Flugzustand", "Sofortiger Wegfall der Schwerkraft", "VNE wird automatisch kleiner als null", "Der Fahrtmesser misst nur noch Temperatur"],
      answer: 0,
      explain: "Das Skript beschreibt Momentaneffekte und Lastigkeitsaenderung; Nachtrimmen ist erforderlich.",
      source: "S. 64"
    },
    {
      unit: "flaps",
      q: "Welche Grenze muss im Flug bei ausgefahrenen Klappen beachtet werden?",
      options: ["VFE bzw. weisser Bereich", "Nur VNE", "Nur Mindesthoehe 10.000 ft", "Nur Kurvenradius"],
      answer: 0,
      explain: "Klappenmechanismus und Tragfluegel koennen strukturell ueberlastet werden.",
      source: "S. 64"
    },
    {
      unit: "controls",
      q: "Welches Ruder wirkt primaer um die Laengsachse?",
      options: ["Querruder", "Seitenruder", "Hoehenruder", "Landeklappe"],
      answer: 0,
      explain: "Rollen um die Laengsachse wird primaer mit den Querrudern erzeugt.",
      source: "S. 68"
    },
    {
      unit: "controls",
      q: "Welches Ruder bewirkt primaer Gieren?",
      options: ["Seitenruder", "Hoehenruder", "Querruder", "Stoerklappe"],
      answer: 0,
      explain: "Gieren um die Hochachse wird mit dem Seitenruder bewirkt.",
      source: "S. 68"
    },
    {
      unit: "controls",
      q: "Was ist negatives Wendemoment?",
      options: ["Giermoment entgegen der eingeleiteten Rollrichtung", "Nicken bei Klappenfahrt", "Staudruckfehler im Pitot", "Auftrieb ohne Widerstand"],
      answer: 0,
      explain: "Die nach unten gehende Querruderklappe erzeugt mehr Widerstand; das Flugzeug giert zunaechst entgegen der Rollrichtung.",
      source: "S. 73"
    },
    {
      unit: "controls",
      q: "Welche technische Massnahme reduziert negatives Wendemoment?",
      options: ["Differentialquerruder oder Frise-Aileron", "Mehr Kabinenheizung", "Kleinere Anzeige im Fahrtmesser", "Ruder blockieren"],
      answer: 0,
      explain: "Das Skript nennt Differentialquerruder und Wirbelkante/Frise-Aileron.",
      source: "S. 73-74"
    },
    {
      unit: "controls",
      q: "Wozu dient Trimmung?",
      options: ["Dauersteuerkraefte reduzieren", "Staudruck messen", "ca_max immer erhoehen", "Trudeln erzwingen"],
      answer: 0,
      explain: "Trimmen verlegt Hilfsruder oder Einstellwinkel, damit der Pilot nicht dauernd Kraft halten muss.",
      source: "S. 71"
    },
    {
      unit: "turn",
      q: "Wovon haengt das Lastvielfache in koordinierter Horizontalkurve primaer ab?",
      options: ["Schraeglage", "Farbe des Flugzeugs", "TAS allein", "Kurvenradius allein"],
      answer: 0,
      explain: "n = 1/cos(beta). Geschwindigkeit und Radius sind fuer n nicht direkt massgebend.",
      source: "S. 78"
    },
    {
      unit: "turn",
      q: "Welches Lastvielfache liegt bei 60 Grad Schraeglage naeherungsweise an?",
      options: ["2 g", "1 g", "4.4 g", "0 g"],
      answer: 0,
      explain: "cos 60 Grad = 0.5, also n = 1/0.5 = 2.",
      source: "S. 79"
    },
    {
      unit: "turn",
      q: "Wie veraendert sich Vs bei erhoehtem Lastvielfachen?",
      options: ["Sie steigt mit sqrt(n)", "Sie sinkt linear mit n", "Sie bleibt immer gleich", "Sie wird nur von VNE bestimmt"],
      answer: 0,
      explain: "Mehr scheinbares Gewicht erfordert mehr Auftrieb; Vs_n = Vs0 * sqrt(n).",
      source: "S. 79, 84"
    },
    {
      unit: "turn",
      q: "Was passiert mit dem Kurvenradius bei gleicher Schraeglage, wenn die Geschwindigkeit deutlich steigt?",
      options: ["Er waechst stark mit v^2", "Er wird null", "Er bleibt exakt gleich", "Er haengt nur von Masse ab"],
      answer: 0,
      explain: "r = v^2/(g*tan beta); Geschwindigkeit wirkt quadratisch.",
      source: "S. 79"
    },
    {
      unit: "turn",
      q: "Warum wird in der Kurve Hoehenruder gezogen?",
      options: ["Um den groesseren Auftrieb fuer das Lastvielfache zu erzeugen", "Um den Staudruck auf null zu setzen", "Um Schraeglage ohne Auftrieb zu halten", "Um VNE zu senken"],
      answer: 0,
      explain: "In der Kurve muss A groesser als G sein; der Pilot erhoeht ca ueber alpha.",
      source: "S. 78"
    },
    {
      unit: "abnormal",
      q: "Wovon haengt der Stall grundsaetzlich direkt ab?",
      options: ["Vom Erreichen des kritischen Anstellwinkels", "Von einer festen IAS in jeder Lage", "Von der Farbe der Fluegelspitze", "Nur vom Seitenwind"],
      answer: 0,
      explain: "Das Skript betont: Ueberziehen tritt bei alpha_krit ein, egal mit welcher Geschwindigkeit und Lage.",
      source: "S. 83"
    },
    {
      unit: "abnormal",
      q: "Welche Situation beguenstigt Trudeln?",
      options: ["Extremer Langsamflug nahe alpha_krit mit asymmetrischer Ablosung/Giermoment", "Sehr schneller Geradeausflug mit neutralen Rudern", "Reiner Reiseflug weit unter ca", "Fahrtmesserfehler ohne alpha"],
      answer: 0,
      explain: "Trudeln entsteht aus Stallnaehe und asymmetrischer Ablosung mit Autorotation.",
      source: "S. 87"
    },
    {
      unit: "abnormal",
      q: "Welche Ruderstellung fuehrt einen Seitengleitflug herbei?",
      options: ["Gegensinnige Quer- und Seitenruder", "Nur Hoehenruder neutral", "Alle Ruder neutral", "Nur Klappen ausfahren"],
      answer: 0,
      explain: "Slip: z. B. Querruder links und Seitenruder rechts.",
      source: "S. 88"
    },
    {
      unit: "abnormal",
      q: "Warum kann die Fahrtmesseranzeige im Schiebeflug unzuverlaessig sein?",
      options: ["Das Pitot-Rohr wird schraeg angeblasen und statische Druecke koennen verfalscht sein", "Die Luftdichte wird unendlich", "Der Fahrtmesser misst alpha direkt", "q wird immer exakt null"],
      answer: 0,
      explain: "Seitliche Anstroemung kann Pitot- und Statikabnahme verfaelschen.",
      source: "S. 88"
    },
    {
      unit: "abnormal",
      q: "Was ist bei grundlegender Trudelbeendigung im Skript genannt?",
      options: ["Seitenruder entgegen der Trudelrichtung, Hoehenruder nachlassen/neutral, Querruder neutral", "Mehr Querruder in Trudelrichtung", "Klappen sofort voll ausfahren", "Nur Gas voll stehen lassen"],
      answer: 0,
      explain: "Konkrete Flughandbuchangaben haben Vorrang; das Skript nennt diese Grundlogik.",
      source: "S. 87"
    },
    {
      unit: "fundamentals",
      q: "Welche Annahme wird im PPL-Bereich bis etwa 250 kt oft getroffen?",
      options: ["Kompressibilitaet kann vernachlaessigt werden", "Luft hat keine Dichte", "Staudruck existiert nicht", "Flaeche hat keinen Einfluss"],
      answer: 0,
      explain: "Das Skript nennt Druckaenderungen bis ca. 250 kt als klein genug fuer diese Vereinfachung.",
      source: "S. 7"
    },
    {
      unit: "lift",
      q: "Was bedeutet Fluechenbelastung?",
      options: ["Gewicht bzw. Masse pro Fluegelflaeche", "Staudruck pro Geschwindigkeit", "Seitenruder pro Hoehe", "VNE pro Kurvenradius"],
      answer: 0,
      explain: "Im Skript wird Gewicht pro Flaeche als Fluechenbelastung eingefuehrt.",
      source: "S. 29"
    },
    {
      unit: "drag",
      q: "Warum hat ein reibungsfreier, idealer Zylinder in der Skizze keinen Widerstand?",
      options: ["Druckverteilung vor und hinter dem Koerper ist symmetrisch", "Er erzeugt unendlich Auftrieb", "Er fliegt im Vakuum", "Seine Flaeche ist null"],
      answer: 0,
      explain: "Erst reale Viskositaet, Grenzschicht und Ablosung erzeugen den Formwiderstand.",
      source: "S. 36"
    },
    {
      unit: "flaps",
      q: "Warum kann Einfahren der Klappen in geringer Hoehe kritisch sein?",
      options: ["Auftrieb nimmt ab und es kann zum Durchsacken kommen", "Widerstand wird unendlich", "VFE wird groesser als VNE", "IAS wird automatisch null"],
      answer: 0,
      explain: "Das Skript warnt vor Einfahren in geringer Hoehe; ausreichend Fahrt und Hoehe sind noetig.",
      source: "S. 63-64"
    },
    {
      unit: "controls",
      q: "Welche Sekundaerwirkung hat Seitenruder laut Skript?",
      options: ["Neben Gieren entsteht ein Rollmoment in die gewuenschte Drehrichtung", "Es erzeugt nur Nicken", "Es hebt die Schwerkraft auf", "Es blockiert Querruder"],
      answer: 0,
      explain: "Beim Gieren hat der Aussenfluegel mehr Geschwindigkeit und mehr Auftrieb.",
      source: "S. 73"
    },
    {
      unit: "turn",
      q: "Warum ist eine koordinierte Kurve mit 90 Grad Schraeglage im Modell unmoeglich?",
      options: ["cos(90 Grad) = 0, n wuerde unendlich", "tan(90 Grad) ist 1", "Der Fahrtmesser misst keine IAS", "Die Erde dreht sich nicht mehr"],
      answer: 0,
      explain: "n = 1/cos(beta). Bei 90 Grad gibt es keine vertikale Auftriebskomponente.",
      source: "S. 78"
    },
    {
      unit: "polar",
      q: "Was bedeutet Gleitzahl 1:20?",
      options: ["1 m Hoehenverlust fuer 20 m Strecke bei Windstille", "20 m Hoehenverlust fuer 1 m Strecke", "20 Grad Schraeglage", "20 kt IAS bei 1 g"],
      answer: 0,
      explain: "Das Skript gibt genau diese Lesart: 100 m Hoehe ergeben 2000 m Strecke bei 1:20.",
      source: "S. 50"
    },
    {
      unit: "abnormal",
      q: "Was ist eine typische Gefahr beim dosierten Seitengleitflug zur Landung?",
      options: ["Seitliche Fahrwerksbelastung beim Aufsetzen", "Auftrieb wird unendlich", "Der Kurvenradius wird negativ", "Die Klappen verschwinden"],
      answer: 0,
      explain: "Das Skript warnt vor seitlicher Belastung und Ueberschlaggefahr beim falschen Geradelegen.",
      source: "S. 89"
    },
    {
      unit: "profile",
      q: "Was ist der Druckpunkt am Profil?",
      options: ["Punkt auf der Profilsehne, an dem man die Druckkraefte zusammengefasst denken kann", "Oeffnung des Pitot-Rohrs", "Schnittpunkt von Hoch- und Querachse", "Fahrtmesser-Skala"],
      answer: 0,
      explain: "Beim Druckpunkt wird das Nickmoment des Profils im Skript als null beschrieben.",
      source: "S. 44"
    },
    {
      unit: "polar",
      q: "Was passiert bei Ziehen/Druecken nahe bester Gleitzahl ohne Leistungszufuhr letztlich?",
      options: ["Vor allem die Geschwindigkeit aendert sich; der beste Gleitwinkel wird nicht einfach besser", "Gleitzahl wird unendlich", "Sinken verschwindet", "Dichte wird groesser"],
      answer: 0,
      explain: "Das Skript betont, dass nahe bester Gleitzahl Leistung/Schub noetig ist, um den Sinkwinkel zu verbessern.",
      source: "S. 54"
    },
    {
      unit: "abnormal",
      q: "Warum kann Stall auch bei hoher Geschwindigkeit auftreten?",
      options: ["Bei erhoehtem Lastvielfachen oder abruptem Abfangen kann alpha_krit erreicht werden", "Stall ist nur ein Fahrtmesserfehler", "Hohe Geschwindigkeit entfernt alpha", "Weil q immer null wird"],
      answer: 0,
      explain: "Accelerated stall: hohes n erfordert mehr Auftrieb und kann alpha_krit schnell erreichen.",
      source: "S. 85"
    },
    {
      unit: "drag",
      q: "Was ist eine einfache Aussage zum induzierten Widerstand aus dem Skript?",
      options: ["Je groesser die pro Sekunde nach unten abgelenkte Luftmasse, desto kleiner muss sie abgelenkt werden und desto kleiner ist Wi", "Mehr Luftmasse bedeutet immer mehr Wi", "Induzierter Widerstand existiert nur ohne Auftrieb", "Wi ist unabhaengig von Spannweite"],
      answer: 0,
      explain: "Die graue Merkaussage auf S. 39 verknuepft Luftmasse, Ablenkung und Wi.",
      source: "S. 39"
    },
    {
      unit: "flaps",
      q: "Was ist ein Vorteil einer Fowler-Klappe?",
      options: ["Sie vergroessert neben der Woelbung auch die Fluegelflaeche", "Sie reduziert immer den Widerstand auf null", "Sie ersetzt das Hoehenruder", "Sie verhindert jedes Ueberziehen"],
      answer: 0,
      explain: "Das Skript beschreibt die Fowler-Klappe als nach hinten und unten ausfahrend.",
      source: "S. 61"
    },
    {
      unit: "controls",
      q: "Wie skaliert eine aerodynamische Ruderwirkung grob?",
      options: ["Mit Staudruck, Ruderausschlag und Hebelarm", "Nur mit Uhrzeit", "Nur mit Seitenwind", "Gar nicht mit Geschwindigkeit"],
      answer: 0,
      explain: "Hoehere Fahrt erzeugt groesseren q und damit staerkere Ruder- und Steuerkraefte.",
      source: "S. 68-71"
    },
    {
      unit: "turn",
      q: "Welche Normalflugzeug-Grenze fuer positives Lastvielfaches nennt das Skript?",
      options: ["n = 3.8 fuer Normalflugzeuge unter 1870 kg", "n = 1.0 fuer alle Flugzeuge", "n = 9.0 fuer Normalflugzeuge", "n = 0.5 fuer Kunstflugzeuge"],
      answer: 0,
      explain: "Die Seite nennt 3.8, 4.4 und 6.0 fuer verschiedene Kategorien.",
      source: "S. 79"
    },
    {
      unit: "fundamentals",
      q: "Welche Grenzschicht hat im Skript groessere Dicke und groessere Oberflaechenreibung?",
      options: ["Turbulente Grenzschicht", "Laminare Grenzschicht", "Vakuumgrenzschicht", "Statische Druckschicht"],
      answer: 0,
      explain: "Die turbulente Grenzschicht ist dicker und hat groesseren Geschwindigkeitsanstieg in Wandnaehe.",
      source: "S. 11"
    },
    {
      unit: "profile",
      q: "Was passiert mit dem Staupunkt bei zunehmendem Anstellwinkel am Profil?",
      options: ["Er wandert mehr zur Unterseite", "Er bleibt immer exakt an der Hinterkante", "Er verschwindet", "Er wird zum Fahrtmesser"],
      answer: 0,
      explain: "Die Seite zu wichtigen Stroemungspunkten beschreibt diese Wanderung.",
      source: "S. 44"
    },
    {
      unit: "lift",
      q: "Welche Groesse im Auftriebsmodell wird durch Klappen direkt erhoeht?",
      options: ["ca_max", "Erdbeschleunigung", "VNE", "Flughafenhoehe"],
      answer: 0,
      explain: "Klappen erhoehen ca_max und damit die Auftriebsreserve bei geringer Geschwindigkeit.",
      source: "S. 60-61"
    },
    {
      unit: "polar",
      q: "Warum verschlechtert grosse Klappenstellung beim Start oft die Steigleistung?",
      options: ["Der Widerstand nimmt stark zu und die Gleitzahl wird schlechter", "Der Auftrieb verschwindet", "Die Masse wird null", "Die Fluegelflaeche wird immer kleiner"],
      answer: 0,
      explain: "Start braucht Beschleunigung und Steigreserve; zu viel cw ist unguenstig.",
      source: "S. 60, 63"
    },
    {
      unit: "abnormal",
      q: "Was machen Querruder nahe Stall laut Skript problematisch?",
      options: ["Sie koennen den wirksamen Anstellwinkel einer Flaeche vergroessern und Ablosung verstaerken", "Sie messen IAS direkt", "Sie erzeugen nie Rollmoment", "Sie entfernen das Seitenruder"],
      answer: 0,
      explain: "Beim Abkippen kann Querrudereinsatz die Lage verschlimmern; das Skript beschreibt umgekehrte Wirkung einer Flaeche.",
      source: "S. 85"
    }
  ]
};
