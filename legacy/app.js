(function () {
  "use strict";

  var content = window.PPL_CONTENT;
  var storageKey = "ppl-aero-sim-progress-v1";
  var state = {
    unitId: "fundamentals",
    controls: {},
    quiz: {},
    progress: loadProgress(),
    search: "",
    exam: null,
    missionFeedback: ""
  };

  var defaults = {
    fundamentals: { speed: 45, throat: 65, altitude: 0 },
    profile: { thickness: 12, camber: 2, alpha: 4, roughness: 15, sweep: 0 },
    lift: { speed: 62, alpha: 6, wingArea: 16, mass: 850, flap: 0, altitude: 0 },
    drag: { speed: 78, mass: 850, area: 16, aspect: 8, config: "clean", altitude: 0 },
    polar: { weight: 850, densityAlt: 0, config: "clean", power: 0, speed: 76 },
    flaps: { flapType: "clean", flapAngle: 0, speed: 62, phase: "landing", spoiler: 0 },
    controls: { aileron: 0, elevator: 0, rudder: 0, trim: 0, speed: 75 },
    turn: { bank: 30, speed: 90, stallClean: 48, mass: 850 },
    abnormal: { alpha: 8, rudder: 0, aileron: 0, flaps: 0, bank: 0, power: 20 }
  };

  var controlDefs = {
    fundamentals: [
      { key: "speed", label: "Geschwindigkeit", min: 20, max: 120, step: 1, unit: "m/s" },
      { key: "throat", label: "Kanalquerschnitt Engstelle", min: 35, max: 100, step: 1, unit: "%" },
      { key: "altitude", label: "Hoehe", min: 0, max: 12000, step: 500, unit: "ft" }
    ],
    profile: [
      { key: "thickness", label: "Relative Dicke", min: 5, max: 20, step: 1, unit: "%" },
      { key: "camber", label: "Woelbung", min: 0, max: 7, step: 0.5, unit: "%" },
      { key: "alpha", label: "Anstellwinkel alpha", min: -4, max: 18, step: 0.5, unit: "deg" },
      { key: "roughness", label: "Oberflaechenrauheit", min: 0, max: 80, step: 1, unit: "%" },
      { key: "sweep", label: "Pfeilung", min: 0, max: 25, step: 1, unit: "deg" }
    ],
    lift: [
      { key: "speed", label: "Geschwindigkeit", min: 35, max: 130, step: 1, unit: "kt" },
      { key: "alpha", label: "Anstellwinkel alpha", min: -2, max: 20, step: 0.5, unit: "deg" },
      { key: "wingArea", label: "Fluegelflaeche", min: 10, max: 24, step: 0.5, unit: "m2" },
      { key: "mass", label: "Masse", min: 550, max: 1200, step: 10, unit: "kg" },
      { key: "flap", label: "Klappenstellung", min: 0, max: 40, step: 1, unit: "deg" },
      { key: "altitude", label: "Dichtehoehe", min: 0, max: 10000, step: 500, unit: "ft" }
    ],
    drag: [
      { key: "speed", label: "Geschwindigkeit", min: 38, max: 140, step: 1, unit: "kt" },
      { key: "mass", label: "Masse", min: 550, max: 1200, step: 10, unit: "kg" },
      { key: "area", label: "Fluegelflaeche", min: 10, max: 24, step: 0.5, unit: "m2" },
      { key: "aspect", label: "Streckung", min: 4, max: 16, step: 0.5, unit: "" },
      {
        key: "config",
        label: "Konfiguration",
        type: "select",
        options: [
          { value: "clean", label: "Sauber" },
          { value: "rough", label: "Rau / verschmutzt" },
          { value: "flaps", label: "Klappen" },
          { value: "gear", label: "Fahrwerk" },
          { value: "flapsGear", label: "Klappen + Fahrwerk" }
        ]
      },
      { key: "altitude", label: "Dichtehoehe", min: 0, max: 10000, step: 500, unit: "ft" }
    ],
    polar: [
      { key: "weight", label: "Masse", min: 550, max: 1200, step: 10, unit: "kg" },
      { key: "densityAlt", label: "Dichtehoehe", min: 0, max: 10000, step: 500, unit: "ft" },
      {
        key: "config",
        label: "Konfiguration",
        type: "select",
        options: [
          { value: "clean", label: "Sauber" },
          { value: "flaps", label: "Klappen" },
          { value: "spoilers", label: "Stoerklappen" }
        ]
      },
      { key: "power", label: "Verfuegbare Leistung", min: 0, max: 100, step: 1, unit: "%" },
      { key: "speed", label: "Geschwindigkeit", min: 42, max: 130, step: 1, unit: "kt" }
    ],
    flaps: [
      {
        key: "flapType",
        label: "Klappentyp",
        type: "select",
        options: [
          { value: "clean", label: "Clean" },
          { value: "plain", label: "Woelb-/Normalklappe" },
          { value: "split", label: "Spreizklappe" },
          { value: "slotted", label: "Spaltklappe" },
          { value: "double", label: "Doppelspaltklappe" },
          { value: "fowler", label: "Fowler-Klappe" }
        ]
      },
      { key: "flapAngle", label: "Klappenwinkel", min: 0, max: 45, step: 1, unit: "deg" },
      { key: "speed", label: "Geschwindigkeit", min: 38, max: 95, step: 1, unit: "kt" },
      {
        key: "phase",
        label: "Flugphase",
        type: "select",
        options: [
          { value: "start", label: "Start" },
          { value: "landing", label: "Landung" },
          { value: "goaround", label: "Durchstarten" }
        ]
      },
      { key: "spoiler", label: "Stoerklappen", min: 0, max: 100, step: 1, unit: "%" }
    ],
    controls: [
      { key: "aileron", label: "Querruder", min: -60, max: 60, step: 1, unit: "%" },
      { key: "elevator", label: "Hoehenruder", min: -45, max: 45, step: 1, unit: "%" },
      { key: "rudder", label: "Seitenruder", min: -60, max: 60, step: 1, unit: "%" },
      { key: "trim", label: "Trimmung", min: -35, max: 35, step: 1, unit: "%" },
      { key: "speed", label: "Geschwindigkeit", min: 45, max: 140, step: 1, unit: "kt" }
    ],
    turn: [
      { key: "bank", label: "Schraeglage beta", min: 0, max: 80, step: 1, unit: "deg" },
      { key: "speed", label: "TAS", min: 45, max: 150, step: 1, unit: "kt" },
      { key: "stallClean", label: "Vs0 sauber", min: 35, max: 65, step: 1, unit: "kt" },
      { key: "mass", label: "Masse", min: 550, max: 1200, step: 10, unit: "kg" }
    ],
    abnormal: [
      { key: "alpha", label: "Anstellwinkel alpha", min: -2, max: 24, step: 0.5, unit: "deg" },
      { key: "rudder", label: "Seitenruder", min: -80, max: 80, step: 1, unit: "%" },
      { key: "aileron", label: "Querruder", min: -70, max: 70, step: 1, unit: "%" },
      { key: "flaps", label: "Klappen", min: 0, max: 40, step: 1, unit: "deg" },
      { key: "bank", label: "Schraeglage", min: -60, max: 60, step: 1, unit: "deg" },
      { key: "power", label: "Leistung", min: 0, max: 100, step: 1, unit: "%" }
    ]
  };

  var animId = null;
  var lastUnitRendered = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    content.units.forEach(function (unit) {
      state.controls[unit.id] = Object.assign({}, defaults[unit.id]);
      ensureUnitProgress(unit.id);
    });
    renderAll();
    bindGlobalEvents();
  }

  function bindGlobalEvents() {
    document.getElementById("searchInput").addEventListener("input", function (event) {
      state.search = event.target.value.trim().toLowerCase();
      renderNav();
    });

    document.getElementById("examButton").addEventListener("click", startExam);
    document.getElementById("atlasButton").addEventListener("click", showAtlas);
    document.getElementById("resetProgress").addEventListener("click", function () {
      if (window.confirm("Fortschritt wirklich loeschen?")) {
        state.progress = { units: {}, answered: 0, correct: 0 };
        content.units.forEach(function (unit) {
          ensureUnitProgress(unit.id);
        });
        saveProgress();
        renderAll();
      }
    });

    window.addEventListener("resize", function () {
      drawActive(performance.now());
    });

    document.body.addEventListener("click", handleBodyClick);
  }

  function handleBodyClick(event) {
    var target = event.target.closest("[data-action], [data-unit]");
    if (!target) return;
    var action = target.getAttribute("data-action");
    var unitId = target.getAttribute("data-unit");

    if (unitId && !action) {
      state.unitId = unitId;
      state.missionFeedback = "";
      renderAll();
      return;
    }

    if (action === "mission-load") {
      var missionIndex = Number(target.getAttribute("data-mission"));
      loadMission(missionIndex);
    } else if (action === "mission-solution") {
      var unit = getUnit(state.unitId);
      var mission = unit.missions[Number(target.getAttribute("data-mission"))];
      state.missionFeedback = mission.prompt;
      renderMissionFeedback();
    } else if (action === "quiz-select") {
      setQuizSelection(Number(target.getAttribute("data-option")));
    } else if (action === "quiz-check") {
      checkQuizAnswer();
    } else if (action === "quiz-next") {
      nextQuizQuestion();
    } else if (action === "modal-close") {
      closeModal();
    } else if (action === "atlas-open-unit") {
      state.unitId = target.getAttribute("data-target-unit");
      closeModal();
      renderAll();
    } else if (action === "exam-select") {
      selectExamOption(Number(target.getAttribute("data-option")));
    } else if (action === "exam-check") {
      checkExamAnswer();
    } else if (action === "exam-next") {
      nextExamQuestion();
    } else if (action === "exam-restart") {
      startExam();
    }
  }

  function renderAll() {
    renderNav();
    renderUnit();
    renderOverallMastery();
  }

  function renderNav() {
    var nav = document.getElementById("unitNav");
    var query = state.search;
    var units = content.units.filter(function (unit) {
      if (!query) return true;
      var haystack = [unit.title, unit.chapter, unit.pages].concat(unit.tags).join(" ").toLowerCase();
      return haystack.indexOf(query) !== -1;
    });

    nav.innerHTML = units
      .map(function (unit) {
        var score = masteryForUnit(unit.id);
        return (
          '<button class="nav-button ' +
          (unit.id === state.unitId ? "active" : "") +
          '" type="button" data-unit="' +
          escapeHtml(unit.id) +
          '">' +
          '<span class="nav-index">' +
          escapeHtml(unit.index) +
          "</span>" +
          '<span class="nav-text"><strong>' +
          escapeHtml(unit.title) +
          "</strong><span>PDF S. " +
          escapeHtml(unit.pages) +
          " | " +
          escapeHtml(unit.tags.slice(0, 2).join(" / ")) +
          "</span></span>" +
          '<span class="nav-score">' +
          score +
          "%</span>" +
          "</button>"
        );
      })
      .join("");
  }

  function renderOverallMastery() {
    var sum = content.units.reduce(function (acc, unit) {
      return acc + masteryForUnit(unit.id);
    }, 0);
    var overall = Math.round(sum / content.units.length);
    document.getElementById("overallMastery").textContent = overall + "%";
  }

  function renderUnit() {
    var unit = getUnit(state.unitId);
    var view = document.getElementById("unitView");
    var score = masteryForUnit(unit.id);
    document.getElementById("appTitle").textContent = unit.title;

    view.innerHTML =
      '<div class="unit-header">' +
      '<article class="intro-panel">' +
      '<div class="intro-top"><span class="chapter-pill">' +
      escapeHtml(unit.chapter) +
      '</span><span>PDF-Seiten ' +
      escapeHtml(unit.pages) +
      '</span><a class="source-chip" href="' +
      escapeHtml(conceptPaperPath(unit.id)) +
      '" target="_blank" rel="noopener">Konzeptpaper</a></div>' +
      "<h2>" +
      escapeHtml(unit.title) +
      "</h2>" +
      "<p>" +
      escapeHtml(unit.summary) +
      "</p>" +
      '<div class="tag-row">' +
      unit.tags
        .map(function (tag) {
          return '<span class="tag">' + escapeHtml(tag) + "</span>";
        })
        .join("") +
      "</div>" +
      "</article>" +
      '<aside class="mastery-panel">' +
      '<div><span class="eyebrow">Einheit-Mastery</span><div class="big-score">' +
      score +
      "%</div></div>" +
      '<div class="meter"><span style="width:' +
      score +
      '%"></span></div>' +
      "<small>20% kommen vom aktiven Arbeiten am Simulator, 80% aus beantworteten Fragen dieser Einheit.</small>" +
      "</aside>" +
      "</div>" +
      '<div class="workspace-grid">' +
      '<section class="sim-panel">' +
      '<div class="canvas-wrap"><canvas id="simCanvas" aria-label="Aerodynamische Simulation"></canvas></div>' +
      '<div id="metricStrip" class="status-strip"></div>' +
      "</section>" +
      '<aside class="stack">' +
      renderControls(unit) +
      renderInsightPanel(unit) +
      renderMissionPanel(unit) +
      '<section id="quizPanel" class="quiz-panel">' +
      renderQuizPanel(unit) +
      "</section>" +
      renderKnowledgePanel(unit) +
      renderFormulaPanel(unit) +
      renderSourcePanel(unit) +
      "</aside>" +
      "</div>";

    bindControlEvents();
    renderMetrics();
    renderMissionFeedback();
    startAnimationLoop();
    lastUnitRendered = unit.id;
  }

  function renderControls(unit) {
    var controls = getControls(unit.id);
    var defs = controlDefs[unit.id];
    return (
      '<section class="control-panel">' +
      "<h3>Simulator-Steuerung</h3>" +
      '<div class="control-grid">' +
      defs
        .map(function (def) {
          var value = controls[def.key];
          if (def.type === "select") {
            return (
              '<label class="control"><span class="control-header"><strong>' +
              escapeHtml(def.label) +
              "</strong></span>" +
              '<select data-control="' +
              escapeHtml(def.key) +
              '">' +
              def.options
                .map(function (option) {
                  return (
                    '<option value="' +
                    escapeHtml(option.value) +
                    '" ' +
                    (String(value) === String(option.value) ? "selected" : "") +
                    ">" +
                    escapeHtml(option.label) +
                    "</option>"
                  );
                })
                .join("") +
              "</select></label>"
            );
          }
          return (
            '<label class="control">' +
            '<span class="control-header"><strong>' +
            escapeHtml(def.label) +
            '</strong><span id="readout-' +
            escapeHtml(def.key) +
            '">' +
            escapeHtml(formatControlValue(value, def)) +
            "</span></span>" +
            '<input type="range" data-control="' +
            escapeHtml(def.key) +
            '" min="' +
            def.min +
            '" max="' +
            def.max +
            '" step="' +
            def.step +
            '" value="' +
            value +
            '">' +
            "</label>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function bindControlEvents() {
    document.querySelectorAll("[data-control]").forEach(function (el) {
      var eventName = el.tagName.toLowerCase() === "select" ? "change" : "input";
      el.addEventListener(eventName, function (event) {
        var key = event.target.getAttribute("data-control");
        var unit = getUnit(state.unitId);
        var def = controlDefs[unit.id].find(function (item) {
          return item.key === key;
        });
        var value = def.type === "select" ? event.target.value : Number(event.target.value);
        getControls(unit.id)[key] = value;
        var readout = document.getElementById("readout-" + key);
        if (readout) readout.textContent = formatControlValue(value, def);
        ensureUnitProgress(unit.id).touched = true;
        saveProgress();
        renderMetrics();
        renderInsightOnly();
        renderOverallMastery();
        renderNav();
        drawActive(performance.now());
      });
    });
  }

  function renderInsightPanel(unit) {
    var insight = getInsight(unit.id, getControls(unit.id));
    return (
      '<section id="insightPanel" class="knowledge-panel">' +
      "<h3>Was gerade passiert</h3>" +
      "<p>" +
      escapeHtml(insight.body) +
      "</p>" +
      '<ul class="concept-list"><li><strong>Pruefungsanker</strong><span>' +
      escapeHtml(insight.exam) +
      "</span></li></ul>" +
      "</section>"
    );
  }

  function renderInsightOnly() {
    var panel = document.getElementById("insightPanel");
    if (!panel) return;
    var unit = getUnit(state.unitId);
    var insight = getInsight(unit.id, getControls(unit.id));
    panel.innerHTML =
      "<h3>Was gerade passiert</h3><p>" +
      escapeHtml(insight.body) +
      '</p><ul class="concept-list"><li><strong>Pruefungsanker</strong><span>' +
      escapeHtml(insight.exam) +
      "</span></li></ul>";
  }

  function renderMissionPanel(unit) {
    return (
      '<section class="mission-panel">' +
      "<h3>Simulationsmissionen</h3>" +
      '<ul class="mission-list">' +
      unit.missions
        .map(function (mission, index) {
          return (
            '<li class="mission">' +
            "<strong>" +
            escapeHtml(mission.title) +
            "</strong>" +
            "<p>" +
            escapeHtml(mission.prompt) +
            "</p>" +
            '<div class="mission-actions">' +
            '<button class="small-button" type="button" data-action="mission-load" data-mission="' +
            index +
            '">In Simulator laden</button>' +
            '<button class="small-button" type="button" data-action="mission-solution" data-mission="' +
            index +
            '">Merksatz</button>' +
            "</div></li>"
          );
        })
        .join("") +
      "</ul>" +
      '<div id="missionFeedback" class="feedback"></div>' +
      "</section>"
    );
  }

  function renderMissionFeedback() {
    var feedback = document.getElementById("missionFeedback");
    if (!feedback) return;
    feedback.textContent = state.missionFeedback || "Waehle eine Mission oder veraendere die Regler frei.";
  }

  function loadMission(index) {
    var unit = getUnit(state.unitId);
    var mission = unit.missions[index];
    state.controls[unit.id] = Object.assign({}, getControls(unit.id), mission.values);
    state.missionFeedback = mission.prompt;
    ensureUnitProgress(unit.id).touched = true;
    saveProgress();
    renderAll();
  }

  function renderKnowledgePanel(unit) {
    return (
      '<section class="knowledge-panel">' +
      "<h3>Stoffanker</h3>" +
      '<ul class="concept-list">' +
      unit.concepts
        .map(function (concept) {
          return (
            "<li><strong>" +
            escapeHtml(concept.term) +
            "</strong><span>" +
            escapeHtml(concept.body) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>" +
      "</section>"
    );
  }

  function renderFormulaPanel(unit) {
    return (
      '<section class="formula-panel">' +
      "<h3>Formeln im Simulator</h3>" +
      '<ul class="formula-list">' +
      unit.formulas
        .map(function (formula) {
          return (
            "<li><strong>" +
            escapeHtml(formula.name) +
            "</strong><span>" +
            escapeHtml(formula.body) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>" +
      "</section>"
    );
  }

  function renderSourcePanel(unit) {
    return (
      '<section class="source-panel">' +
      "<h3>PDF-Verknuepfung</h3>" +
      '<ul class="source-list">' +
      unit.sources
        .map(function (source) {
          return (
            "<li><strong>" +
            escapeHtml(source.title) +
            ' <span class="source-chip">' +
            escapeHtml(source.pages) +
            "</span></strong><span>" +
            escapeHtml(source.body) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>" +
      "</section>"
    );
  }

  function renderQuizPanel(unit) {
    var q = currentQuizQuestion(unit.id);
    var quiz = getQuizState(unit.id);
    var progress = ensureUnitProgress(unit.id);
    var selected = quiz.selected;
    var checked = quiz.checked;
    var localQuestions = questionsForUnit(unit.id);

    return (
      '<div class="quiz-meta"><span>Quick Check ' +
      (quiz.position + 1) +
      " / " +
      localQuestions.length +
      '</span><span>Score ' +
      progress.correct +
      " / " +
      progress.answered +
      "</span></div>" +
      "<h3>" +
      escapeHtml(q.q) +
      "</h3>" +
      '<div class="option-list">' +
      q.options
        .map(function (option, index) {
          var cls = "";
          if (selected === index) cls += " selected";
          if (checked && index === q.answer) cls += " correct";
          if (checked && selected === index && index !== q.answer) cls += " wrong";
          return (
            '<button class="option-button' +
            cls +
            '" type="button" data-action="quiz-select" data-option="' +
            index +
            '">' +
            escapeHtml(option) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div id="quizFeedback" class="feedback ' +
      (checked ? (selected === q.answer ? "good" : "bad") : "") +
      '">' +
      (checked
        ? escapeHtml((selected === q.answer ? "Richtig. " : "Noch nicht. ") + q.explain + " Quelle: " + q.source)
        : "Waehle eine Antwort. Danach erklaert dir die App den aerodynamischen Zusammenhang.") +
      "</div>" +
      '<div class="quiz-actions">' +
      '<button class="primary-button" type="button" data-action="quiz-check">Pruefen</button>' +
      '<button class="secondary-button" type="button" data-action="quiz-next">Naechste Frage</button>' +
      "</div>"
    );
  }

  function setQuizSelection(index) {
    var quiz = getQuizState(state.unitId);
    quiz.selected = index;
    renderQuizOnly();
  }

  function checkQuizAnswer() {
    var unitId = state.unitId;
    var quiz = getQuizState(unitId);
    if (quiz.selected === null || quiz.selected === undefined || quiz.checked) {
      renderQuizOnly();
      return;
    }
    var q = currentQuizQuestion(unitId);
    quiz.checked = true;
    recordAnswer(unitId, quiz.selected === q.answer);
    renderQuizOnly();
    renderNav();
    renderOverallMastery();
    renderUnitMasteryOnly();
  }

  function nextQuizQuestion() {
    var quiz = getQuizState(state.unitId);
    var count = questionsForUnit(state.unitId).length;
    quiz.position = (quiz.position + 1) % count;
    quiz.selected = null;
    quiz.checked = false;
    renderQuizOnly();
  }

  function renderQuizOnly() {
    var panel = document.getElementById("quizPanel");
    if (!panel) return;
    panel.innerHTML = renderQuizPanel(getUnit(state.unitId));
  }

  function renderUnitMasteryOnly() {
    var score = masteryForUnit(state.unitId);
    var big = document.querySelector(".big-score");
    var bar = document.querySelector(".mastery-panel .meter span");
    if (big) big.textContent = score + "%";
    if (bar) bar.style.width = score + "%";
  }

  function currentQuizQuestion(unitId) {
    var quiz = getQuizState(unitId);
    var questions = questionsForUnit(unitId);
    return questions[(quiz.offset + quiz.position) % questions.length];
  }

  function getQuizState(unitId) {
    if (!state.quiz[unitId]) {
      var length = questionsForUnit(unitId).length;
      state.quiz[unitId] = {
        offset: Math.floor(Math.random() * Math.max(1, length)),
        position: 0,
        selected: null,
        checked: false
      };
    }
    return state.quiz[unitId];
  }

  function questionsForUnit(unitId) {
    return content.questions.filter(function (q) {
      return q.unit === unitId;
    });
  }

  function renderMetrics() {
    var unit = getUnit(state.unitId);
    var metrics = computeMetrics(unit.id, getControls(unit.id));
    var strip = document.getElementById("metricStrip");
    if (!strip) return;
    strip.innerHTML = metrics
      .map(function (metric) {
        return (
          '<div class="metric"><span>' +
          escapeHtml(metric.label) +
          "</span><strong>" +
          escapeHtml(metric.value) +
          "</strong></div>"
        );
      })
      .join("");
  }

  function computeMetrics(unitId, c) {
    if (unitId === "fundamentals") {
      var rhoF = rhoFromAltFt(c.altitude);
      var v1 = c.speed;
      var v2 = v1 / (c.throat / 100);
      var q1 = 0.5 * rhoF * v1 * v1;
      var q2 = 0.5 * rhoF * v2 * v2;
      var tasKt = msToKt(v1);
      var iasKt = msToKt(Math.sqrt((2 * q1) / 1.225));
      return [
        { label: "q Eingang", value: round(q1, 0) + " Pa" },
        { label: "v Engstelle", value: round(v2, 1) + " m/s" },
        { label: "Druckabfall", value: round(q2 - q1, 0) + " Pa" },
        { label: "IAS / TAS", value: round(iasKt, 0) + " / " + round(tasKt, 0) + " kt" }
      ];
    }

    if (unitId === "profile") {
      var clProfile = clFromAlpha(c.alpha, c.camber, 0, c.roughness);
      var crit = alphaCrit(0, c.roughness);
      var cp = clamp(32 - c.alpha * 0.7 - c.camber * 1.4, 18, 42);
      return [
        { label: "ca Modell", value: round(clProfile.cl, 2) },
        { label: "alpha_krit", value: round(crit, 1) + " deg" },
        { label: "Druckpunkt", value: round(cp, 0) + "% t" },
        { label: "Ablosung", value: separationLabel(c.alpha, crit) }
      ];
    }

    if (unitId === "lift") {
      var lm = liftModel(c);
      return [
        { label: "Auftrieb", value: round(lm.lift / 1000, 1) + " kN" },
        { label: "Gewicht", value: round(lm.weight / 1000, 1) + " kN" },
        { label: "ca / ca_max", value: round(lm.cl, 2) + " / " + round(lm.clMax, 2) },
        { label: "Vs aktuell", value: round(lm.vs, 0) + " kt" }
      ];
    }

    if (unitId === "drag") {
      var dm = dragModel(c, c.speed);
      return [
        { label: "Gesamtwiderstand", value: round(dm.total / 1000, 2) + " kN" },
        { label: "Schaedlich", value: round(dm.parasite / 1000, 2) + " kN" },
        { label: "Induziert", value: round(dm.induced / 1000, 2) + " kN" },
        { label: "Dominant", value: dm.induced > dm.parasite ? "induziert" : "schaedlich" }
      ];
    }

    if (unitId === "polar") {
      var pm = polarModel(c);
      return [
        { label: "Gleitzahl jetzt", value: "1:" + round(pm.glide, 1) },
        { label: "Bestes Gleiten", value: round(pm.bestGlideSpeed, 0) + " kt" },
        { label: "Geringstes Sinken", value: round(pm.minSinkSpeed, 0) + " kt" },
        { label: "Steigrate", value: round(pm.climbRate, 1) + " m/s" }
      ];
    }

    if (unitId === "flaps") {
      var fm = flapModel(c);
      return [
        { label: "ca_max", value: round(fm.clMax, 2) },
        { label: "Vs relativ", value: round(fm.vsRelative * 100, 0) + "%" },
        { label: "cw-Zuschlag", value: "+" + round(fm.dragAdd, 3) },
        { label: "Hinweis", value: fm.warning }
      ];
    }

    if (unitId === "controls") {
      var cm = controlsModel(c);
      return [
        { label: "Rollmoment", value: signed(round(cm.roll, 1)) },
        { label: "Nickmoment", value: signed(round(cm.pitch, 1)) },
        { label: "Giermoment", value: signed(round(cm.yaw, 1)) },
        { label: "Ruderdruck", value: cm.forceLabel }
      ];
    }

    if (unitId === "turn") {
      var tm = turnModel(c);
      return [
        { label: "Lastvielfaches", value: round(tm.n, 2) + " g" },
        { label: "Vs in Kurve", value: round(tm.vsTurn, 0) + " kt" },
        { label: "Radius", value: round(tm.radius, 0) + " m" },
        { label: "Kurvenrate", value: round(tm.rate, 1) + " deg/s" }
      ];
    }

    var am = abnormalModel(c);
    return [
      { label: "Zustand", value: am.state },
      { label: "alpha / krit", value: round(c.alpha, 1) + " / " + round(am.crit, 1) + " deg" },
      { label: "Slip/Schieben", value: round(am.slip, 0) + "%" },
      { label: "Recovery-Fokus", value: am.recovery }
    ];
  }

  function getInsight(unitId, c) {
    if (unitId === "fundamentals") {
      var rho = rhoFromAltFt(c.altitude);
      var v2 = c.speed / (c.throat / 100);
      var ratio = Math.pow(v2 / c.speed, 2);
      return {
        body:
          "Die Engstelle beschleunigt die Luft auf " +
          round(v2, 1) +
          " m/s. Weil q mit v^2 waechst, ist der Staudruck dort etwa " +
          round(ratio, 1) +
          "-mal so gross wie vor der Engstelle. In " +
          c.altitude +
          " ft ist rho nur noch " +
          round(rho, 2) +
          " kg/m3, daher liegen IAS und TAS auseinander.",
        exam: "Verdoppelte Geschwindigkeit bedeutet vierfachen Staudruck; der Fahrtmesser misst q, nicht direkt TAS."
      };
    }

    if (unitId === "profile") {
      var crit = alphaCrit(0, c.roughness);
      return {
        body:
          "Das 3D-Profil zeigt alpha gegen die Profilsehne. Woelbung hebt die ca-Kurve, Rauheit senkt die kritische Reserve. Bei alpha " +
          c.alpha +
          " deg liegt der kritische Bereich bei etwa " +
          round(crit, 1) +
          " deg.",
        exam: "Alpha ist der Winkel zwischen Profilsehne und Anstroemrichtung, nicht einfach die Nase gegen den Horizont."
      };
    }

    if (unitId === "lift") {
      var lm = liftModel(c);
      var sign = lm.reserve >= 0 ? "mehr" : "weniger";
      return {
        body:
          "Der Fluegel erzeugt aktuell " +
          round(lm.lift / 1000, 1) +
          " kN Auftrieb und traegt damit " +
          sign +
          " als das Gewicht. Die Stallgrenze liegt bei etwa " +
          round(lm.vs, 0) +
          " kt, weil Gewicht, Dichte, Flaeche und ca_max zusammenwirken.",
        exam: "Ueberziehen ist alpha-abhaengig; Vs ist nur die Geschwindigkeit, bei der diese Grenze unter bestimmten Bedingungen erreicht wird."
      };
    }

    if (unitId === "drag") {
      var dm = dragModel(c, c.speed);
      var dominant = dm.induced > dm.parasite ? "induziert" : "schaedlich";
      return {
        body:
          "Bei " +
          c.speed +
          " kt dominiert der " +
          dominant +
          "e Widerstand. Die 3D-Randwirbel zeigen den induzierten Anteil, die Kurven zeigen, wo das Widerstandsminimum liegt.",
        exam: "Langsamflug ist nicht automatisch sparsam: hoher ca-Bedarf kann den induzierten Widerstand stark erhoehen."
      };
    }

    if (unitId === "polar") {
      var pm = polarModel(c);
      return {
        body:
          "Die aktuelle Gleitzahl ist etwa 1:" +
          round(pm.glide, 1) +
          ". Bestes Gleiten liegt bei " +
          round(pm.bestGlideSpeed, 0) +
          " kt, geringstes Sinken bei " +
          round(pm.minSinkSpeed, 0) +
          " kt. Leistung veraendert die Flugbahn, nicht die aerodynamische Polare selbst.",
        exam: "Beste Gleitzahl und geringstes Sinken sind unterschiedliche Punkte der Geschwindigkeitspolare."
      };
    }

    if (unitId === "flaps") {
      var fm = flapModel(c);
      return {
        body:
          "Die Klappenstellung erzeugt ca_max " +
          round(fm.clMax, 2) +
          " und senkt Vs relativ auf " +
          round(fm.vsRelative * 100, 0) +
          "%. Gleichzeitig steigt der Widerstand, wodurch der Gleitwinkel steiler wird.",
        exam: "Beim Start sind grosse Klappenstellungen oft unguenstig, bei der Landung kann der steilere Anflug erwuenscht sein."
      };
    }

    if (unitId === "controls") {
      var cm = controlsModel(c);
      return {
        body:
          "Die 3D-Achsen zeigen Roll, Nick und Gier. Bei " +
          c.speed +
          " kt skaliert die Ruderwirkung mit q; negatives Wendemoment aus dem Querruder liegt modellhaft bei " +
          signed(round(cm.adverseYaw, 1)) +
          ".",
        exam: "Querruder erzeugt primaer Rollen, aber ueber Widerstand auch ein Giermoment entgegen der gewuenschten Kurve."
      };
    }

    if (unitId === "turn") {
      var tm = turnModel(c);
      return {
        body:
          "Bei " +
          c.bank +
          " deg Schraeglage traegt der Fluegel " +
          round(tm.n, 2) +
          " g. Dadurch steigt Vs auf " +
          round(tm.vsTurn, 0) +
          " kt. Der Radius liegt wegen v^2 bei etwa " +
          round(tm.radius, 0) +
          " m.",
        exam: "n haengt in koordinierter Horizontalkurve von beta ab; Radius und Rate haengen stark von TAS ab."
      };
    }

    var am = abnormalModel(c);
    return {
      body:
        "Der Zustand ist: " +
        am.state +
        ". alpha liegt bei " +
        c.alpha +
        " deg, alpha_krit bei etwa " +
        round(am.crit, 1) +
        " deg. Slip/Schieben liegt bei " +
        round(am.slip, 0) +
        "%.",
      exam: "Stall = alpha_krit; Trudeln = Stallnaehe plus asymmetrische Ablosung/Gier; Slip = absichtlich unkoordiniert."
    };
  }

  function startAnimationLoop() {
    if (animId) cancelAnimationFrame(animId);
    function tick(time) {
      drawActive(time);
      animId = requestAnimationFrame(tick);
    }
    animId = requestAnimationFrame(tick);
  }

  function drawActive(time) {
    var canvas = document.getElementById("simCanvas");
    if (!canvas) return;
    var ctxInfo = setupCanvas(canvas);
    var ctx = ctxInfo.ctx;
    var w = ctxInfo.w;
    var h = ctxInfo.h;
    var unit = getUnit(state.unitId);
    var c = getControls(unit.id);

    drawBackground(ctx, w, h);
    if (unit.sim === "wind") drawWind(ctx, w, h, c, time);
    if (unit.sim === "profile") drawProfileSim(ctx, w, h, c, time);
    if (unit.sim === "lift") drawLiftSim(ctx, w, h, c, time);
    if (unit.sim === "drag") drawDragSim(ctx, w, h, c, time);
    if (unit.sim === "polar") drawPolarSim(ctx, w, h, c, time);
    if (unit.sim === "flaps") drawFlapsSim(ctx, w, h, c, time);
    if (unit.sim === "controls") drawControlsSim(ctx, w, h, c, time);
    if (unit.sim === "turn") drawTurnSim(ctx, w, h, c, time);
    if (unit.sim === "abnormal") drawAbnormalSim(ctx, w, h, c, time);
  }

  function setupCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var width = Math.max(320, rect.width);
    var height = Math.max(320, rect.height);
    var targetW = Math.floor(width * dpr);
    var targetH = Math.floor(height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: width, h: height };
  }

  function drawBackground(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#edf2f2";
    ctx.lineWidth = 1;
    for (var x = 0; x < w; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (var y = 0; y < h; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawWind(ctx, w, h, c, time) {
    var mid = h * 0.46;
    var leftH = h * 0.27;
    var throatH = leftH * (c.throat / 100);
    var x1 = w * 0.18;
    var x2 = w * 0.5;
    var x3 = w * 0.82;
    var top = function (x) {
      var t = smoothstep(x1, x2, x) - smoothstep(x2, x3, x);
      return mid - leftH / 2 + (leftH - throatH) * 0.5 * t;
    };
    var bot = function (x) {
      var t = smoothstep(x1, x2, x) - smoothstep(x2, x3, x);
      return mid + leftH / 2 - (leftH - throatH) * 0.5 * t;
    };

    ctx.fillStyle = "#f6f8f8";
    ctx.strokeStyle = "#526163";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, top(x1));
    for (var x = x1; x <= x3; x += 12) ctx.lineTo(x, top(x));
    ctx.lineTo(x3, bot(x3));
    for (x = x3; x >= x1; x -= 12) ctx.lineTo(x, bot(x));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (var i = 0; i < 9; i++) {
      var frac = (i + 1) / 10;
      ctx.strokeStyle = "rgba(23,108,114,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (x = x1 + 8; x <= x3 - 8; x += 10) {
        var y = top(x) + (bot(x) - top(x)) * frac;
        if (x === x1 + 8) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    var offset = ((time / 18) * (c.speed / 45)) % 90;
    for (i = 0; i < 10; i++) {
      x = x1 + ((i * 90 + offset) % (x3 - x1));
      frac = 0.2 + (i % 5) * 0.15;
      var y = top(x) + (bot(x) - top(x)) * frac;
      drawArrow(ctx, x - 22, y, x + 22, y, "#f07a24", 2, "");
    }

    var rho = rhoFromAltFt(c.altitude);
    var v2 = c.speed / (c.throat / 100);
    var q1 = 0.5 * rho * c.speed * c.speed;
    var q2 = 0.5 * rho * v2 * v2;
    drawGauge(ctx, w * 0.21, h * 0.78, "q Eingang", q1, 0, 5200, "Pa");
    drawGauge(ctx, w * 0.51, h * 0.78, "q Engstelle", q2, 0, 12000, "Pa");
    drawGauge(ctx, w * 0.79, h * 0.78, "rho", rho, 0.3, 1.25, "kg/m3");

    drawArrow(ctx, w * 0.52, h * 0.22, w * 0.52, h * 0.32, "#176c72", 3, "p_stat sinkt");
    drawLabel(ctx, "Kontinuitaet: A1*v1 = A2*v2", w * 0.08, h * 0.12, "#152021", 16);
    drawLabel(ctx, "Bernoulli: p_stat + q = p_ges", w * 0.08, h * 0.17, "#647174", 14);
  }

  function drawProfileSim(ctx, w, h, c, time) {
    var cx = w * 0.56;
    var cy = h * 0.45;
    var chord = Math.min(w * 0.5, 430);
    drawStreamlinesAroundAirfoil(ctx, w, h, cx, cy, chord, c.alpha, c.roughness, time);
    var cam = camera3D(cx, cy, Math.min(w, h) * 0.9, -30, -18, 0);
    drawWing3D(ctx, cam, {
      span: 3.25,
      rootChord: 1.05 + c.thickness * 0.006,
      tipChord: 0.7,
      alpha: c.alpha,
      camber: c.camber,
      sweep: c.sweep,
      dihedral: 4,
      showChord: true,
      fill: c.alpha > alphaCrit(0, c.roughness) - 2 ? "#efd7d2" : "#d7ddde"
    });
    var cp = clamp(32 - c.alpha * 0.7 - c.camber * 1.4, 18, 42);
    var cp3 = project3D(wingPoint3D(-0.55, -0.45 + cp / 100, c.alpha, 4, c.camber, c.sweep, 3.25), cam);
    ctx.fillStyle = "#f07a24";
    ctx.beginPath();
    ctx.arc(cp3.x, cp3.y, 5, 0, Math.PI * 2);
    ctx.fill();
    drawLabel(ctx, "Druckpunkt " + round(cp, 0) + "%", cp3.x + 10, cp3.y - 12, "#152021", 12);

    var crit = alphaCrit(0, c.roughness);
    if (c.alpha > crit - 3) {
      drawSeparation(ctx, cx + chord * 0.05, cy - chord * 0.16, chord * 0.35, c.alpha - crit + 3, time);
      drawLabel(ctx, "Ablosung wandert nach vorn", w * 0.55, h * 0.18, "#b42318", 14);
    }

    drawLabel(ctx, "3D-Fluegelabschnitt: Profilsehne, Druckpunkt, Ablosung", w * 0.08, h * 0.12, "#152021", 16);
    drawLabel(ctx, "Dicke " + c.thickness + "% | Woelbung " + c.camber + "% | Pfeilung " + c.sweep + " deg", w * 0.08, h * 0.18, "#647174", 13);
    drawMiniAirfoilLegend(ctx, w * 0.08, h * 0.72, c);
  }

  function drawLiftSim(ctx, w, h, c, time) {
    var lm = liftModel(c);
    var cx = w * 0.52;
    var cy = h * 0.5;
    var chord = Math.min(w * 0.48, 430);
    drawStreamlinesAroundAirfoil(ctx, w, h, cx, cy, chord, c.alpha, c.flap, time);
    var cam = camera3D(cx, cy, Math.min(w, h) * 0.92, -32, -17, 0);
    drawWing3D(ctx, cam, {
      span: 3.15,
      rootChord: 1.02,
      tipChord: 0.7,
      alpha: c.alpha,
      camber: 2.4,
      dihedral: 4,
      flapAngle: c.flap,
      flapType: c.flap > 25 ? "slotted" : "plain",
      fill: lm.stall ? "#efd7d2" : "#d9e1e2",
      vortices: true,
      vortexStrength: clamp(lm.cl / 1.5, 0.4, 1.4)
    });
    var liftScale = clamp(lm.lift / lm.weight, 0.2, 1.8);
    drawArrow3D(ctx, cam, { x: 0, y: 0.12, z: 0 }, { x: 0, y: 0.12 + liftScale, z: 0 }, lm.stall ? "#b42318" : "#16845b", 4, "A");
    drawArrow3D(ctx, cam, { x: 0.32, y: 0.1, z: 0 }, { x: 0.32, y: -0.9, z: 0 }, "#152021", 3, "G");
    drawArrow(ctx, cx - chord * 0.55, cy + chord * 0.2, cx - chord * 0.36, cy + chord * 0.2, "#f07a24", 3, "v");

    drawLiftCurve(ctx, w * 0.08, h * 0.12, w * 0.3, h * 0.3, c.alpha, lm);
    drawLabel(ctx, lm.stall ? "STALL: alpha_krit erreicht" : "Auftriebreserve " + round(lm.reserve * 100, 0) + "%", w * 0.08, h * 0.48, lm.stall ? "#b42318" : "#16845b", 16);
    drawLabel(ctx, "A = ca * F * q", w * 0.08, h * 0.55, "#152021", 18);
    drawLabel(ctx, "q = 0.5 * rho * v^2", w * 0.08, h * 0.61, "#647174", 14);
  }

  function drawDragSim(ctx, w, h, c, time) {
    var left = w * 0.08;
    var top = h * 0.1;
    var pw = w * 0.55;
    var ph = h * 0.62;
    var speeds = [];
    for (var v = 40; v <= 140; v += 2) speeds.push(v);
    var values = speeds.map(function (s) {
      return dragModel(c, s);
    });
    var maxD = Math.max.apply(
      null,
      values.map(function (m) {
        return m.total;
      })
    );
    drawPlotFrame(ctx, left, top, pw, ph, "Geschwindigkeit", "Widerstand");
    drawCurve(
      ctx,
      speeds,
      values.map(function (m) {
        return m.parasite;
      }),
      left,
      top,
      pw,
      ph,
      40,
      140,
      0,
      maxD,
      "#176c72",
      2
    );
    drawCurve(
      ctx,
      speeds,
      values.map(function (m) {
        return m.induced;
      }),
      left,
      top,
      pw,
      ph,
      40,
      140,
      0,
      maxD,
      "#f07a24",
      2
    );
    drawCurve(
      ctx,
      speeds,
      values.map(function (m) {
        return m.total;
      }),
      left,
      top,
      pw,
      ph,
      40,
      140,
      0,
      maxD,
      "#152021",
      3
    );
    var dm = dragModel(c, c.speed);
    var dot = plotPoint(c.speed, dm.total, left, top, pw, ph, 40, 140, 0, maxD);
    drawDot(ctx, dot.x, dot.y, "#b42318", 5);
    drawLabel(ctx, "schaedlich", left + pw - 110, top + 28, "#176c72", 12);
    drawLabel(ctx, "induziert", left + pw - 110, top + 48, "#f07a24", 12);
    drawLabel(ctx, "gesamt", left + pw - 110, top + 68, "#152021", 12);

    var cx = w * 0.78;
    var cy = h * 0.42;
    var wake = clamp((dm.parasite + dm.induced) / maxD, 0.1, 1);
    var dragCam = camera3D(cx, cy, Math.min(w, h) * 0.72, -38, -22, 0);
    drawWing3D(ctx, dragCam, {
      span: 2.85,
      rootChord: 0.95,
      tipChord: 0.62,
      alpha: clamp(dm.cl * 5, 2, 14),
      camber: 1.8,
      dihedral: 4,
      fill: "#d7ddde",
      vortices: true,
      vortexStrength: clamp(dm.induced / Math.max(1, dm.parasite), 0.4, 2.2)
    });
    drawArrow3D(ctx, dragCam, { x: -1.6, y: 0.06, z: 0 }, { x: -2.35 - wake * 0.4, y: 0.06, z: 0 }, "#f07a24", 3, "W");
    drawArrow3D(ctx, dragCam, { x: 0, y: 0.04, z: 0 }, { x: 0, y: 0.52 + dm.cl * 0.18, z: 0 }, "#16845b", 2, "A");
    drawLabel(ctx, "W = cw * F * q", w * 0.68, h * 0.75, "#152021", 18);
    drawLabel(ctx, "Langsam: induziert | Schnell: schaedlich", w * 0.68, h * 0.81, "#647174", 13);
  }

  function drawPolarSim(ctx, w, h, c, time) {
    var pm = polarModel(c);
    var left = w * 0.07;
    var top = h * 0.1;
    var pw = w * 0.38;
    var ph = h * 0.36;
    drawPlotFrame(ctx, left, top, pw, ph, "cw", "ca");

    var points = [];
    for (var a = -2; a <= 16; a += 0.5) {
      var cl = Math.max(0.05, 0.1 * (a + 2));
      var cd = pm.cd0 + pm.k * cl * cl;
      points.push({ x: cd, y: cl });
    }
    drawParamCurve(ctx, points, left, top, pw, ph, 0, 0.16, 0, 1.8, "#152021", 3);
    var best = points.reduce(function (bestPoint, point) {
      var ratio = point.y / point.x;
      return ratio > bestPoint.ratio ? { point: point, ratio: ratio } : bestPoint;
    }, { point: points[0], ratio: 0 });
    drawLineInPlot(ctx, 0, 0, best.point.x, best.point.y, left, top, pw, ph, 0, 0.16, 0, 1.8, "#f07a24", 2);
    var polarDot = plotPoint(pm.cd, pm.cl, left, top, pw, ph, 0, 0.16, 0, 1.8);
    drawDot(ctx, polarDot.x, polarDot.y, "#176c72", 5);
    drawLabel(ctx, "Beste Gleitzahl: Tangente", left + 10, top + ph + 30, "#f07a24", 12);

    var left2 = w * 0.55;
    var top2 = h * 0.1;
    var pw2 = w * 0.38;
    var ph2 = h * 0.36;
    drawPlotFrame(ctx, left2, top2, pw2, ph2, "v", "Sinkrate");
    var speeds = [];
    var sinks = [];
    for (var v = 42; v <= 130; v += 2) {
      speeds.push(v);
      sinks.push(sinkRateFor(c, v));
    }
    var maxSink = Math.max.apply(null, sinks.concat([5]));
    drawCurve(ctx, speeds, sinks, left2, top2, pw2, ph2, 42, 130, 0, maxSink, "#152021", 3, true);
    var sinkDot = plotPoint(c.speed, pm.sink, left2, top2, pw2, ph2, 42, 130, 0, maxSink);
    drawDot(ctx, sinkDot.x, sinkDot.y, "#176c72", 5);
    drawLabel(ctx, "Geschwindigkeitspolare", left2 + 10, top2 + ph2 + 30, "#647174", 12);

    var cx = w * 0.48;
    var cy = h * 0.72;
    drawGlidePath(ctx, cx, cy, pm.glide, pm.climbRate, c.power);
    drawLabel(ctx, "E = ca / cw = Strecke / Hoehe", w * 0.07, h * 0.86, "#152021", 17);
  }

  function drawFlapsSim(ctx, w, h, c, time) {
    var fm = flapModel(c);
    var cx = w * 0.42;
    var cy = h * 0.38;
    var chord = Math.min(w * 0.52, 450);
    drawStreamlinesAroundAirfoil(ctx, w, h, cx, cy, chord, 5 + c.flapAngle / 8, c.flapAngle, time);
    var flapCam = camera3D(cx, cy, Math.min(w, h) * 0.88, -32, -18, 0);
    drawWing3D(ctx, flapCam, {
      span: 3.0,
      rootChord: 1.04,
      tipChord: 0.72,
      alpha: 4 + c.flapAngle / 12,
      camber: 2.2 + c.flapAngle / 12,
      dihedral: 4,
      flapAngle: c.flapAngle,
      flapType: c.flapType,
      spoiler: c.spoiler,
      fill: "#d7ddde",
      vortices: c.spoiler > 25 || c.flapAngle > 18,
      vortexStrength: 1 + c.flapAngle / 45 + c.spoiler / 100
    });

    drawRunwayApproach(ctx, w * 0.68, h * 0.73, fm.glideAngle, c.phase);
    drawGauge(ctx, w * 0.12, h * 0.77, "Vs relativ", fm.vsRelative * 100, 55, 105, "%");
    drawGauge(ctx, w * 0.36, h * 0.77, "cw add", fm.dragAdd, 0, 0.18, "");
    drawGauge(ctx, w * 0.6, h * 0.77, "ca_max", fm.clMax, 1.2, 2.9, "");
    drawLabel(ctx, "Klappen: ca_max hoch, Vs runter, Widerstand hoch", w * 0.08, h * 0.12, "#152021", 16);
    drawLabel(ctx, fm.warning, w * 0.08, h * 0.18, fm.warning.indexOf("Warn") >= 0 ? "#b42318" : "#647174", 13);
  }

  function drawControlsSim(ctx, w, h, c, time) {
    var cm = controlsModel(c);
    var cx = w * 0.5;
    var cy = h * 0.46;
    var scale = Math.min(w, h) * 0.28;
    var controlCam = camera3D(cx, cy, Math.min(w, h) * 0.9, -38, -24, 0);
    drawAircraft3D(ctx, controlCam, {
      bank: clamp(cm.roll * 0.6, -30, 30),
      pitch: clamp(cm.pitch * 0.35, -18, 18),
      yaw: clamp(cm.yaw * 0.45, -26, 26),
      axes: true,
      surfaces: { aileron: c.aileron, elevator: c.elevator + c.trim * 0.5, rudder: c.rudder }
    });
    drawArrow(ctx, cx - scale * 0.55, cy - scale * 0.36, cx - scale * 0.55, cy - scale * 0.36 - cm.roll * 4, "#176c72", 3, "Roll");
    drawArrow(ctx, cx + scale * 0.55, cy, cx + scale * 0.55 + cm.yaw * 3.2, cy, "#f07a24", 3, "Gier");
    drawArrow(ctx, cx, cy + scale * 0.68, cx, cy + scale * 0.68 - cm.pitch * 3.6, "#152021", 3, "Nick");
    drawLabel(ctx, "Primaerwirkung: Quer = Roll, Seite = Gier, Hoehe = Nick", w * 0.08, h * 0.12, "#152021", 16);
    drawLabel(ctx, "Sekundaer: Seitenruder rollt mit, Querruder erzeugt negatives Wendemoment", w * 0.08, h * 0.18, "#647174", 13);

    drawAxisPanel(ctx, w * 0.08, h * 0.67, cm);
    drawControlSurfacePanel(ctx, Math.min(w * 0.64, w - 252), h * 0.66, c);
  }

  function drawTurnSim(ctx, w, h, c, time) {
    var tm = turnModel(c);
    var cx = w * 0.34;
    var cy = h * 0.42;
    var bankRad = degToRad(c.bank);
    var turnCam = camera3D(cx, cy, Math.min(w, h) * 0.9, -36, -18, 0);
    drawAircraft3D(ctx, turnCam, { bank: c.bank, pitch: 0, yaw: 0, surfaces: { aileron: c.bank / 2, elevator: c.bank / 3, rudder: 0 } });
    drawArrow3D(ctx, turnCam, { x: 0, y: 0.05, z: 0 }, { x: Math.sin(bankRad) * 1.2, y: Math.cos(bankRad) * 1.2, z: 0 }, "#16845b", 4, "A");
    drawArrow3D(ctx, turnCam, { x: 0.2, y: 0.05, z: 0 }, { x: 0.2, y: -0.95, z: 0 }, "#152021", 3, "G");
    drawArrow3D(ctx, turnCam, { x: 0, y: 0.05, z: 0 }, { x: Math.sin(bankRad) * 1.0, y: 0.05, z: 0 }, "#f07a24", 3, "Z");

    var left = w * 0.56;
    var top = h * 0.12;
    var pw = w * 0.34;
    var ph = h * 0.32;
    drawPlotFrame(ctx, left, top, pw, ph, "beta", "n");
    var xs = [];
    var ys = [];
    for (var b = 0; b <= 80; b += 1) {
      xs.push(b);
      ys.push(1 / Math.cos(degToRad(b)));
    }
    drawCurve(ctx, xs, ys, left, top, pw, ph, 0, 80, 1, 6, "#152021", 3);
    var dot = plotPoint(c.bank, tm.n, left, top, pw, ph, 0, 80, 1, 6);
    drawDot(ctx, dot.x, dot.y, "#f07a24", 5);

    drawTurnCircle(ctx, w * 0.7, h * 0.73, tm.radius, c.speed, c.bank);
    drawLabel(ctx, "n = 1 / cos(beta)", w * 0.08, h * 0.76, "#152021", 20);
    drawLabel(ctx, "Vs_beta = Vs0 * sqrt(n). Radius = v^2 / (g * tan beta).", w * 0.08, h * 0.83, "#647174", 13);
  }

  function drawAbnormalSim(ctx, w, h, c, time) {
    var am = abnormalModel(c);
    var left = w * 0.07;
    var top = h * 0.1;
    var pw = w * 0.4;
    var ph = h * 0.35;
    drawLiftCurve(ctx, left, top, pw, ph, c.alpha, {
      alphaCrit: am.crit,
      clMax: am.clMax,
      cl: am.cl,
      stall: am.state.indexOf("Stall") >= 0 || am.state.indexOf("Trudeln") >= 0
    });

    var cx = w * 0.66;
    var cy = h * 0.38;
    var chord = Math.min(w * 0.36, 330);
    drawStreamlinesAroundAirfoil(ctx, w, h, cx, cy, chord, c.alpha, c.flaps + Math.abs(c.rudder) / 3, time);
    var abnormalCam = camera3D(cx, cy, Math.min(w, h) * 0.7, -36 + c.rudder * 0.08, -20, 0);
    drawWing3D(ctx, abnormalCam, {
      span: 2.7,
      rootChord: 0.95,
      tipChord: 0.62,
      alpha: c.alpha,
      camber: 2,
      flapAngle: c.flaps,
      flapType: c.flaps > 20 ? "slotted" : "plain",
      fill: am.state.indexOf("Stall") >= 0 || am.state.indexOf("Trudeln") >= 0 ? "#efd7d2" : "#d7ddde",
      vortices: am.state.indexOf("Trudeln") >= 0 || am.slip > 45,
      vortexStrength: am.state.indexOf("Trudeln") >= 0 ? 2.2 : 1.1
    });
    if (am.state.indexOf("Stall") >= 0 || am.state.indexOf("Trudeln") >= 0) {
      drawSeparation(ctx, cx, cy - chord * 0.05, chord * 0.55, 8, time);
    }

    if (am.state.indexOf("Trudeln") >= 0) {
      drawSpin(ctx, w * 0.72, h * 0.72, Math.sign(c.rudder || 1), time);
    } else if (am.slip > 35) {
      drawSlipPlane3D(ctx, w * 0.72, h * 0.72, c.aileron, c.rudder);
    } else {
      var acCam = camera3D(w * 0.72, h * 0.72, Math.min(w, h) * 0.56, -38, -24, 0);
      drawAircraft3D(ctx, acCam, { bank: c.bank, pitch: c.alpha * 0.3, yaw: c.rudder * 0.18, surfaces: { aileron: c.aileron, elevator: c.alpha, rudder: c.rudder } });
    }

    drawLabel(ctx, am.state, w * 0.08, h * 0.58, am.state.indexOf("Normal") >= 0 ? "#16845b" : "#b42318", 20);
    drawLabel(ctx, "Stall ist alpha-abhaengig, nicht lage- oder IAS-abhaengig.", w * 0.08, h * 0.66, "#152021", 15);
    drawLabel(ctx, "Trudeln-Recovery: Gegenruder, alpha reduzieren, Quer neutral.", w * 0.08, h * 0.73, "#647174", 12);
    drawLabel(ctx, "Slip: cw hoch, Fahrtanzeige kritisch, Fahrwerkslast beachten.", w * 0.08, h * 0.79, "#647174", 12);
  }

  function liftModel(c) {
    var rho = rhoFromAltFt(c.altitude);
    var v = ktToMs(c.speed);
    var q = 0.5 * rho * v * v;
    var clData = clFromAlpha(c.alpha, 2.5, c.flap, 0);
    var cl = clData.cl;
    var clMax = clData.clMax;
    var lift = cl * c.wingArea * q;
    var weight = c.mass * 9.81;
    var vs = msToKt(Math.sqrt((2 * weight) / (rho * c.wingArea * clMax)));
    return {
      rho: rho,
      q: q,
      cl: cl,
      clMax: clMax,
      alphaCrit: clData.alphaCrit,
      lift: lift,
      weight: weight,
      reserve: lift / weight - 1,
      vs: vs,
      stall: c.alpha >= clData.alphaCrit || c.speed < vs * 0.98
    };
  }

  function clFromAlpha(alpha, camber, flap, roughness) {
    var clMax = 1.38 + camber * 0.045 + flap * 0.025 - roughness * 0.004;
    clMax = clamp(clMax, 0.9, 2.75);
    var crit = alphaCrit(flap, roughness);
    var zero = -2 - camber * 0.35 - flap * 0.08;
    var linear = 0.095 * (alpha - zero);
    var cl = linear;
    if (alpha > crit) {
      cl = clMax - Math.pow(alpha - crit, 1.2) * 0.085;
    } else {
      cl = Math.min(linear, clMax - Math.pow(Math.max(0, alpha - crit + 3), 2) * 0.01);
    }
    return {
      cl: clamp(cl, -0.6, clMax),
      clMax: clMax,
      alphaCrit: crit
    };
  }

  function alphaCrit(flap, roughness) {
    return clamp(15.5 - flap * 0.055 - roughness * 0.035, 9.5, 16.5);
  }

  function dragModel(c, speedKt) {
    var rho = rhoFromAltFt(c.altitude);
    var v = ktToMs(speedKt);
    var q = 0.5 * rho * v * v;
    var weight = c.mass * 9.81;
    var area = c.area;
    var cl = weight / Math.max(1, q * area);
    var config = dragConfig(c.config);
    var cd0 = config.cd0;
    var e = 0.78;
    var k = 1 / (Math.PI * c.aspect * e);
    var cdInd = k * cl * cl;
    var parasite = q * area * cd0;
    var induced = q * area * cdInd;
    return {
      cl: cl,
      cd0: cd0,
      cdInd: cdInd,
      parasite: parasite,
      induced: induced,
      total: parasite + induced,
      k: k
    };
  }

  function dragConfig(config) {
    var table = {
      clean: { cd0: 0.028 },
      rough: { cd0: 0.038 },
      flaps: { cd0: 0.058 },
      gear: { cd0: 0.068 },
      flapsGear: { cd0: 0.095 }
    };
    return table[config] || table.clean;
  }

  function polarModel(c) {
    var config = c.config === "flaps" ? { cd0: 0.055, k: 0.058, clMax: 2.15 } : c.config === "spoilers" ? { cd0: 0.09, k: 0.06, clMax: 1.25 } : { cd0: 0.03, k: 0.047, clMax: 1.45 };
    var rho = rhoFromAltFt(c.densityAlt);
    var v = ktToMs(c.speed);
    var q = 0.5 * rho * v * v;
    var area = 16;
    var weight = c.weight * 9.81;
    var cl = weight / Math.max(1, q * area);
    var cd = config.cd0 + config.k * cl * cl;
    var glide = cl / cd;
    var sink = sinkRateFor(c, c.speed);
    var bestCl = Math.sqrt(config.cd0 / config.k);
    var bestGlideSpeed = msToKt(Math.sqrt((2 * weight) / (rho * area * bestCl)));
    var minSinkCl = Math.sqrt((3 * config.cd0) / config.k);
    var minSinkSpeed = msToKt(Math.sqrt((2 * weight) / (rho * area * minSinkCl)));
    var drag = q * area * cd;
    var powerNeed = drag * v;
    var powerAvail = c.power * 1300;
    var climbRate = (powerAvail - powerNeed) / weight;
    return {
      rho: rho,
      cl: clamp(cl, 0.05, 2.5),
      cd: cd,
      cd0: config.cd0,
      k: config.k,
      glide: glide,
      sink: sink,
      bestGlideSpeed: bestGlideSpeed,
      minSinkSpeed: minSinkSpeed,
      climbRate: clamp(climbRate, -6, 6)
    };
  }

  function sinkRateFor(c, speedKt) {
    var config = c.config === "flaps" ? { cd0: 0.055, k: 0.058 } : c.config === "spoilers" ? { cd0: 0.09, k: 0.06 } : { cd0: 0.03, k: 0.047 };
    var rho = rhoFromAltFt(c.densityAlt);
    var v = ktToMs(speedKt);
    var q = 0.5 * rho * v * v;
    var area = 16;
    var weight = c.weight * 9.81;
    var cl = weight / Math.max(1, q * area);
    var cd = config.cd0 + config.k * cl * cl;
    return clamp(v * cd / Math.max(0.1, cl), 0, 8);
  }

  function flapModel(c) {
    var base = {
      clean: { max: 1.45, drag: 0.0, area: 1.0 },
      plain: { max: 2.25, drag: 0.055, area: 1.0 },
      split: { max: 2.4, drag: 0.085, area: 1.0 },
      slotted: { max: 2.6, drag: 0.065, area: 1.0 },
      double: { max: 2.8, drag: 0.078, area: 1.0 },
      fowler: { max: 2.8, drag: 0.062, area: 1.12 }
    }[c.flapType];
    var factor = c.flapType === "clean" ? 0 : clamp(c.flapAngle / 40, 0, 1.15);
    var clMax = 1.45 + (base.max - 1.45) * factor;
    var areaFactor = 1 + (base.area - 1) * factor;
    var dragAdd = base.drag * factor + c.spoiler * 0.0012;
    var vsRelative = Math.sqrt(1.45 / (clMax * areaFactor));
    if (c.spoiler > 0) {
      clMax -= c.spoiler * 0.004;
      vsRelative = Math.sqrt(1.45 / Math.max(0.8, clMax * areaFactor));
    }
    var warning = "Landung: groesserer Widerstand ist hilfreich.";
    if (c.phase === "start" && (c.flapAngle > 20 || c.spoiler > 0)) warning = "Warnung: Startleistung/Steigwinkel verschlechtert.";
    if (c.phase === "goaround" && c.flapAngle > 25) warning = "Durchstarten: Leistung, beschleunigen, Klappen stufenweise.";
    if (c.speed > 85 && c.flapAngle > 20) warning = "Warnung: VFE/weißer Bereich beachten.";
    var glideAngle = clamp(7 + dragAdd * 95 + c.spoiler * 0.08 - (clMax - 1.45) * 2.2, 5, 26);
    return { clMax: clMax, dragAdd: dragAdd, vsRelative: vsRelative, warning: warning, glideAngle: glideAngle };
  }

  function controlsModel(c) {
    var qFactor = Math.pow(c.speed / 75, 2);
    var roll = c.aileron * 0.18 * qFactor + c.rudder * 0.04 * qFactor;
    var adverseYaw = -c.aileron * 0.1 * qFactor;
    var yaw = c.rudder * 0.16 * qFactor + adverseYaw;
    var pitch = (c.elevator + c.trim * 0.55) * 0.18 * qFactor;
    var force = Math.abs(c.aileron) + Math.abs(c.elevator) + Math.abs(c.rudder);
    var forceLabel = force * qFactor > 120 ? "hoch" : force * qFactor > 55 ? "mittel" : "gering";
    return { roll: roll, yaw: yaw, pitch: pitch, adverseYaw: adverseYaw, forceLabel: forceLabel };
  }

  function turnModel(c) {
    var beta = Math.min(89, c.bank);
    var n = beta === 0 ? 1 : 1 / Math.cos(degToRad(beta));
    var vsTurn = c.stallClean * Math.sqrt(n);
    var v = ktToMs(c.speed);
    var radius = beta < 1 ? Infinity : (v * v) / (9.81 * Math.tan(degToRad(beta)));
    var rate = beta < 1 ? 0 : radToDeg(v / radius);
    return {
      n: n,
      vsTurn: vsTurn,
      radius: Number.isFinite(radius) ? radius : 99999,
      rate: rate
    };
  }

  function abnormalModel(c) {
    var crit = alphaCrit(c.flaps, 0);
    var clData = clFromAlpha(c.alpha, 2.2, c.flaps, 0);
    var slip = Math.min(100, Math.abs(c.rudder) * 0.75 + Math.max(0, -Math.sign(c.rudder || 1) * c.aileron) * 0.45);
    var stalled = c.alpha >= crit;
    var spinning = stalled && Math.abs(c.rudder) > 45;
    var stateLabel = "Normaler Bereich";
    if (slip > 50 && !stalled) stateLabel = "Seitengleitflug / Schiebeflug";
    if (stalled) stateLabel = "Stall: alpha_krit erreicht";
    if (spinning) stateLabel = "Trudeln wahrscheinlich";
    var recovery = "alpha reduzieren";
    if (spinning) recovery = "Ruder neutralisieren";
    if (slip > 50 && !stalled) recovery = "koordiniert ausleiten";
    return { state: stateLabel, crit: crit, cl: clData.cl, clMax: clData.clMax, slip: slip, recovery: recovery };
  }

  function camera3D(cx, cy, scale, yaw, pitch, roll) {
    return {
      cx: cx,
      cy: cy,
      scale: scale,
      yaw: degToRad(yaw || 0),
      pitch: degToRad(pitch || 0),
      roll: degToRad(roll || 0),
      distance: 4.6
    };
  }

  function rotate3D(p, cam) {
    var x = p.x;
    var y = p.y;
    var z = p.z;
    var cr = Math.cos(cam.roll);
    var sr = Math.sin(cam.roll);
    var xR = x * cr - y * sr;
    var yR = x * sr + y * cr;
    x = xR;
    y = yR;
    var cp = Math.cos(cam.pitch);
    var sp = Math.sin(cam.pitch);
    var yP = y * cp - z * sp;
    var zP = y * sp + z * cp;
    y = yP;
    z = zP;
    var cy = Math.cos(cam.yaw);
    var sy = Math.sin(cam.yaw);
    var xY = x * cy + z * sy;
    var zY = -x * sy + z * cy;
    return { x: xY, y: y, z: zY };
  }

  function project3D(p, cam) {
    var r = rotate3D(p, cam);
    var f = cam.scale / (cam.distance + r.z);
    return {
      x: cam.cx + r.x * f,
      y: cam.cy - r.y * f,
      z: r.z,
      f: f
    };
  }

  function drawPoly3D(ctx, cam, points, fill, stroke, alpha) {
    var projected = points.map(function (p) {
      return project3D(p, cam);
    });
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.beginPath();
    projected.forEach(function (p, index) {
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke || "rgba(21,32,33,0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawLine3D(ctx, cam, points, color, width, dash) {
    var projected = points.map(function (p) {
      return project3D(p, cam);
    });
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1.5;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    projected.forEach(function (p, index) {
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow3D(ctx, cam, from, to, color, width, label) {
    var a = project3D(from, cam);
    var b = project3D(to, cam);
    drawArrow(ctx, a.x, a.y, b.x, b.y, color, width || 2, "");
    if (label) drawLabel(ctx, label, b.x + 7, b.y - 7, color, 12);
  }

  function rotatePointX(p, deg) {
    var a = degToRad(deg);
    var y = p.y * Math.cos(a) - p.z * Math.sin(a);
    var z = p.y * Math.sin(a) + p.z * Math.cos(a);
    return { x: p.x, y: y, z: z };
  }

  function wingPoint3D(x, z, alphaDeg, dihedralDeg, camber, sweepDeg, span) {
    var sweep = Math.tan(degToRad(sweepDeg || 0)) * Math.abs(x) * 0.2;
    var y = Math.abs(x) * Math.tan(degToRad(dihedralDeg || 0));
    y += (camber || 0) * Math.sin((z + 0.5) * Math.PI) * 0.04;
    return rotatePointX({ x: x, y: y, z: z + sweep }, alphaDeg || 0);
  }

  function drawWing3D(ctx, cam, opts) {
    opts = opts || {};
    var span = opts.span || 2.8;
    var rootChord = opts.rootChord || 1.05;
    var tipChord = opts.tipChord || 0.66;
    var alpha = opts.alpha || 0;
    var dihedral = opts.dihedral || 4;
    var camber = opts.camber || 1.5;
    var sweep = opts.sweep || 0;
    var fill = opts.fill || "#d7ddde";
    var accent = opts.accent || "#f07a24";
    var rows = 8;
    var surfaces = [];

    function chordAt(x) {
      var tipFactor = Math.abs(x) / (span / 2);
      return rootChord + (tipChord - rootChord) * tipFactor;
    }
    function p(x, zNorm) {
      var chord = chordAt(x);
      return wingPoint3D(x, zNorm * chord, alpha, dihedral, camber, sweep, span);
    }

    for (var i = 0; i < rows; i++) {
      var x0 = -span / 2 + (span * i) / rows;
      var x1 = -span / 2 + (span * (i + 1)) / rows;
      surfaces.push({
        points: [p(x0, -0.45), p(x1, -0.45), p(x1, 0.48), p(x0, 0.48)],
        fill: fill
      });
    }

    surfaces
      .map(function (s) {
        s.depth =
          s.points.reduce(function (sum, point) {
            return sum + rotate3D(point, cam).z;
          }, 0) / s.points.length;
        return s;
      })
      .sort(function (a, b) {
        return b.depth - a.depth;
      })
      .forEach(function (s) {
        drawPoly3D(ctx, cam, s.points, s.fill, "#526163", 0.96);
      });

    for (i = 0; i <= rows; i++) {
      var gx = -span / 2 + (span * i) / rows;
      drawLine3D(ctx, cam, [p(gx, -0.45), p(gx, 0.48)], "rgba(82,97,99,0.42)", 1);
    }
    for (var j = 0; j <= 4; j++) {
      var gz = -0.45 + (0.93 * j) / 4;
      var line = [];
      for (i = 0; i <= rows; i++) {
        line.push(p(-span / 2 + (span * i) / rows, gz));
      }
      drawLine3D(ctx, cam, line, "rgba(82,97,99,0.28)", 1);
    }

    if (opts.flapAngle && opts.flapAngle > 0) {
      drawFlap3D(ctx, cam, {
        span: span * 0.82,
        rootChord: rootChord,
        tipChord: tipChord,
        alpha: alpha,
        dihedral: dihedral,
        camber: camber,
        sweep: sweep,
        angle: opts.flapAngle,
        type: opts.flapType,
        color: accent
      });
    }

    if (opts.spoiler && opts.spoiler > 0) {
      var sHeight = 0.18 + opts.spoiler * 0.004;
      drawPoly3D(
        ctx,
        cam,
        [
          p(-0.18, -0.05),
          p(0.18, -0.05),
          { x: p(0.18, -0.05).x, y: p(0.18, -0.05).y + sHeight, z: p(0.18, -0.05).z },
          { x: p(-0.18, -0.05).x, y: p(-0.18, -0.05).y + sHeight, z: p(-0.18, -0.05).z }
        ],
        accent,
        "#9a4d15",
        0.95
      );
    }

    if (opts.vortices) {
      drawWingtipVortices3D(ctx, cam, span, alpha, dihedral, sweep, opts.vortexStrength || 1);
    }

    if (opts.showChord) {
      drawLine3D(ctx, cam, [p(-span * 0.42, -0.48), p(-span * 0.42, 0.5)], "#176c72", 2, [6, 4]);
      var labelPoint = project3D(p(-span * 0.42, 0.55), cam);
      drawLabel(ctx, "Profilsehne", labelPoint.x + 4, labelPoint.y, "#176c72", 12);
    }
  }

  function drawFlap3D(ctx, cam, opts) {
    var span = opts.span;
    var angle = opts.angle;
    var x0 = -span / 2;
    var x1 = span / 2;
    function base(x, z) {
      var chord = opts.rootChord + (opts.tipChord - opts.rootChord) * (Math.abs(x) / (span / 2));
      return wingPoint3D(x, z * chord, opts.alpha, opts.dihedral, opts.camber, opts.sweep, span);
    }
    var hingeL = base(x0, 0.32);
    var hingeR = base(x1, 0.32);
    var aftL = rotatePointX({ x: hingeL.x, y: hingeL.y, z: hingeL.z + 0.28 }, angle);
    var aftR = rotatePointX({ x: hingeR.x, y: hingeR.y, z: hingeR.z + 0.28 }, angle);
    if (opts.type === "fowler") {
      aftL.z += 0.18;
      aftR.z += 0.18;
      hingeL.z += 0.08;
      hingeR.z += 0.08;
    }
    drawPoly3D(ctx, cam, [hingeL, hingeR, aftR, aftL], opts.color, "#9a4d15", 0.97);
  }

  function drawWingtipVortices3D(ctx, cam, span, alpha, dihedral, sweep, strength) {
    [-1, 1].forEach(function (side) {
      var pts = [];
      for (var i = 0; i < 48; i++) {
        var t = i / 8;
        var r = 0.09 + strength * 0.025;
        var p = wingPoint3D(side * span * 0.52, 0.45 - t * 0.13, alpha, dihedral, 1, sweep, span);
        pts.push({
          x: p.x + Math.cos(t * 2.2) * r * side,
          y: p.y + Math.sin(t * 2.2) * r,
          z: p.z - t * 0.08
        });
      }
      drawLine3D(ctx, cam, pts, "rgba(240,122,36,0.72)", 2);
    });
  }

  function drawAircraft3D(ctx, cam, opts) {
    opts = opts || {};
    var bank = opts.bank || 0;
    var pitch = opts.pitch || 0;
    var yaw = opts.yaw || 0;
    function tr(p) {
      var r = rotatePointX(p, pitch);
      var b = degToRad(bank);
      var xB = r.x * Math.cos(b) - r.y * Math.sin(b);
      var yB = r.x * Math.sin(b) + r.y * Math.cos(b);
      r = { x: xB, y: yB, z: r.z };
      var a = degToRad(yaw);
      return { x: r.x * Math.cos(a) + r.z * Math.sin(a), y: r.y, z: -r.x * Math.sin(a) + r.z * Math.cos(a) };
    }
    function poly(points, fill, stroke) {
      drawPoly3D(
        ctx,
        cam,
        points.map(tr),
        fill,
        stroke || "#526163",
        0.97
      );
    }
    poly(
      [
        { x: -1.4, y: 0, z: 0.05 },
        { x: 1.4, y: 0, z: 0.05 },
        { x: 1.1, y: 0, z: 0.34 },
        { x: -1.1, y: 0, z: 0.34 }
      ],
      "#d7ddde"
    );
    poly(
      [
        { x: -1.4, y: 0, z: -0.05 },
        { x: 1.4, y: 0, z: -0.05 },
        { x: 1.1, y: 0, z: -0.34 },
        { x: -1.1, y: 0, z: -0.34 }
      ],
      "#cfd8d9"
    );
    poly(
      [
        { x: -0.16, y: 0.12, z: -1.15 },
        { x: 0.16, y: 0.12, z: -1.15 },
        { x: 0.26, y: 0.04, z: 1.1 },
        { x: -0.26, y: 0.04, z: 1.1 }
      ],
      "#e4e9e9"
    );
    poly(
      [
        { x: -0.16, y: 0.12, z: -1.15 },
        { x: 0.16, y: 0.12, z: -1.15 },
        { x: 0.07, y: 0.28, z: -1.3 },
        { x: -0.07, y: 0.28, z: -1.3 }
      ],
      "#f0f3f3"
    );
    poly(
      [
        { x: -0.55, y: 0.02, z: 1.0 },
        { x: 0.55, y: 0.02, z: 1.0 },
        { x: 0.38, y: 0.02, z: 1.3 },
        { x: -0.38, y: 0.02, z: 1.3 }
      ],
      "#d7ddde"
    );
    poly(
      [
        { x: 0, y: 0.02, z: 0.96 },
        { x: 0, y: 0.72, z: 1.14 },
        { x: 0, y: 0.03, z: 1.36 }
      ],
      "#d7ddde"
    );
    var surfaces = opts.surfaces || {};
    drawControlPatch3D(ctx, cam, tr, "aileron", surfaces.aileron || 0, "#f07a24");
    drawControlPatch3D(ctx, cam, tr, "elevator", surfaces.elevator || 0, "#f07a24");
    drawControlPatch3D(ctx, cam, tr, "rudder", surfaces.rudder || 0, "#f07a24");
    if (opts.axes) drawAircraftAxes3D(ctx, cam, tr);
  }

  function drawControlPatch3D(ctx, cam, tr, type, value, color) {
    var lift = clamp(value / 80, -0.22, 0.22);
    var points;
    if (type === "aileron") {
      points = [
        { x: 0.82, y: lift, z: 0.22 },
        { x: 1.28, y: lift, z: 0.22 },
        { x: 1.15, y: lift, z: 0.34 },
        { x: 0.76, y: lift, z: 0.34 }
      ];
      drawPoly3D(ctx, cam, points.map(tr), color, "#9a4d15", 0.96);
      points = points.map(function (p) {
        return { x: -p.x, y: -lift, z: p.z };
      });
    } else if (type === "elevator") {
      points = [
        { x: -0.43, y: lift, z: 1.2 },
        { x: 0.43, y: lift, z: 1.2 },
        { x: 0.34, y: lift, z: 1.34 },
        { x: -0.34, y: lift, z: 1.34 }
      ];
    } else {
      points = [
        { x: 0, y: 0.26 + lift, z: 1.12 },
        { x: 0, y: 0.64 + lift, z: 1.18 },
        { x: 0, y: 0.12 + lift, z: 1.31 }
      ];
    }
    drawPoly3D(ctx, cam, points.map(tr), color, "#9a4d15", 0.96);
  }

  function drawAircraftAxes3D(ctx, cam, tr) {
    drawArrow3D(ctx, cam, tr({ x: 0, y: 0, z: 0 }), tr({ x: 1.65, y: 0, z: 0 }), "#176c72", 2.5, "Rollachse");
    drawArrow3D(ctx, cam, tr({ x: 0, y: 0, z: 0 }), tr({ x: 0, y: 1.15, z: 0 }), "#f07a24", 2.5, "Gierachse");
    drawArrow3D(ctx, cam, tr({ x: 0, y: 0, z: 0 }), tr({ x: 0, y: 0, z: -1.3 }), "#152021", 2.5, "Nickachse");
  }

  function drawAirfoil(ctx, cx, cy, chord, thicknessPct, camberPct, alphaDeg, opts) {
    opts = opts || {};
    var ptsTop = [];
    var ptsBot = [];
    var t = thicknessPct / 100;
    var m = camberPct / 100;
    for (var i = 0; i <= 60; i++) {
      var x = i / 60;
      var yt = 5 * t * (0.2969 * Math.sqrt(Math.max(0, x)) - 0.126 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1015 * x * x * x * x);
      var yc = m * Math.sin(Math.PI * x);
      ptsTop.push(transformAirfoilPoint(cx, cy, chord, x, yc + yt, alphaDeg));
      ptsBot.unshift(transformAirfoilPoint(cx, cy, chord, x, yc - yt, alphaDeg));
    }
    ctx.beginPath();
    ptsTop.concat(ptsBot).forEach(function (p, index) {
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = opts.fill || "#d7ddde";
    ctx.strokeStyle = opts.stroke || "#263638";
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    if (opts.flapAngle && opts.flapAngle > 0) {
      drawFlap(ctx, cx, cy, chord, alphaDeg, opts.flapAngle, opts.flapType);
    }
  }

  function transformAirfoilPoint(cx, cy, chord, x, y, alphaDeg) {
    var px = (x - 0.5) * chord;
    var py = -y * chord;
    var a = degToRad(alphaDeg);
    return {
      x: cx + px * Math.cos(a) - py * Math.sin(a),
      y: cy + px * Math.sin(a) + py * Math.cos(a)
    };
  }

  function drawFlap(ctx, cx, cy, chord, alphaDeg, flapAngle, flapType) {
    var hinge = transformAirfoilPoint(cx, cy, chord, 0.75, -0.01, alphaDeg);
    var len = chord * (flapType === "fowler" ? 0.28 : 0.2);
    var deploy = degToRad(alphaDeg + flapAngle);
    var offset = flapType === "fowler" ? chord * 0.07 : 0;
    var x1 = hinge.x + Math.cos(deploy) * offset;
    var y1 = hinge.y + Math.sin(deploy) * offset;
    var x2 = x1 + Math.cos(deploy) * len;
    var y2 = y1 + Math.sin(deploy) * len;
    ctx.strokeStyle = "#f07a24";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  function drawStreamlinesAroundAirfoil(ctx, w, h, cx, cy, chord, alpha, intensity, time) {
    var amp = clamp((alpha + intensity / 8) * 1.6, -10, 46);
    var phase = (time / 550) % 1;
    for (var i = -4; i <= 4; i++) {
      var yBase = cy + i * 28;
      ctx.strokeStyle = "rgba(23,108,114,0.28)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (var x = w * 0.04; x <= w * 0.96; x += 10) {
        var local = Math.exp(-Math.pow((x - cx) / (chord * 0.55), 2));
        var y = yBase - amp * local * (i <= 0 ? 0.9 : 0.45) + Math.sin(x * 0.02 + phase * Math.PI * 2 + i) * 1.6;
        if (x === w * 0.04) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (i = 0; i < 5; i++) {
      var px = w * 0.08 + ((time / 22 + i * 150) % (w * 0.84));
      drawArrow(ctx, px, cy + (i - 2) * 34, px + 34, cy + (i - 2) * 34, "#f07a24", 1.5, "");
    }
  }

  function drawLiftCurve(ctx, x, y, w, h, alpha, model) {
    drawPlotFrame(ctx, x, y, w, h, "alpha", "ca");
    var xs = [];
    var ys = [];
    for (var a = -5; a <= 20; a += 0.5) {
      var val = clFromAlpha(a, 2.5, 0, 0);
      xs.push(a);
      ys.push(val.cl);
    }
    drawCurve(ctx, xs, ys, x, y, w, h, -5, 20, -0.5, 1.8, "#152021", 2);
    var dot = plotPoint(alpha, model.cl, x, y, w, h, -5, 20, -0.5, 1.8);
    drawDot(ctx, dot.x, dot.y, model.stall ? "#b42318" : "#176c72", 5);
    var critX = plotPoint(model.alphaCrit || 15, -0.5, x, y, w, h, -5, 20, -0.5, 1.8).x;
    ctx.strokeStyle = "#f07a24";
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(critX, y);
    ctx.lineTo(critX, y + h);
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(ctx, "alpha_krit", critX + 4, y + 15, "#f07a24", 11);
  }

  function drawMiniAirfoilLegend(ctx, x, y, c) {
    ctx.fillStyle = "#fcfdfd";
    ctx.strokeStyle = "#dfe6e6";
    ctx.fillRect(x, y, 250, 92);
    ctx.strokeRect(x, y, 250, 92);
    drawLabel(ctx, "Geometrie", x + 12, y + 22, "#152021", 13);
    drawLabel(ctx, "Profiltiefe = Vorderkante bis Hinterkante", x + 12, y + 45, "#647174", 12);
    drawLabel(ctx, "Woelbung veraendert ca(alpha)", x + 12, y + 66, "#647174", 12);
  }

  function drawGauge(ctx, x, y, label, value, min, max, unit) {
    var width = 150;
    var height = 78;
    ctx.fillStyle = "#fcfdfd";
    ctx.strokeStyle = "#dfe6e6";
    ctx.fillRect(x - width / 2, y - height / 2, width, height);
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
    drawLabel(ctx, label, x - width / 2 + 12, y - 16, "#647174", 11);
    drawLabel(ctx, round(value, value < 10 ? 2 : 0) + (unit ? " " + unit : ""), x - width / 2 + 12, y + 10, "#152021", 18);
    var pct = clamp((value - min) / (max - min), 0, 1);
    ctx.fillStyle = "#edf2f2";
    ctx.fillRect(x - width / 2 + 12, y + 24, width - 24, 7);
    ctx.fillStyle = "#f07a24";
    ctx.fillRect(x - width / 2 + 12, y + 24, (width - 24) * pct, 7);
  }

  function drawPlotFrame(ctx, x, y, w, h, xlabel, ylabel) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#dfe6e6";
    ctx.lineWidth = 1;
    for (var i = 0; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (w * i) / 5, y);
      ctx.lineTo(x + (w * i) / 5, y + h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + (h * i) / 5);
      ctx.lineTo(x + w, y + (h * i) / 5);
      ctx.stroke();
    }
    ctx.strokeStyle = "#7f8b8d";
    ctx.strokeRect(x, y, w, h);
    drawLabel(ctx, xlabel, x + w - 52, y + h + 20, "#647174", 11);
    drawLabel(ctx, ylabel, x + 8, y + 15, "#647174", 11);
  }

  function drawCurve(ctx, xs, ys, x, y, w, h, minX, maxX, minY, maxY, color, lineWidth, invertY) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.beginPath();
    xs.forEach(function (px, index) {
      var point = plotPoint(px, ys[index], x, y, w, h, minX, maxX, minY, maxY, invertY);
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }

  function drawParamCurve(ctx, points, x, y, w, h, minX, maxX, minY, maxY, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.beginPath();
    points.forEach(function (point, index) {
      var p = plotPoint(point.x, point.y, x, y, w, h, minX, maxX, minY, maxY);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  }

  function drawLineInPlot(ctx, x1, y1, x2, y2, x, y, w, h, minX, maxX, minY, maxY, color, lineWidth) {
    var p1 = plotPoint(x1, y1, x, y, w, h, minX, maxX, minY, maxY);
    var p2 = plotPoint(x2, y2, x, y, w, h, minX, maxX, minY, maxY);
    drawLine(ctx, p1.x, p1.y, p2.x, p2.y, color, lineWidth);
  }

  function plotPoint(px, py, x, y, w, h, minX, maxX, minY, maxY, invertY) {
    var nx = (px - minX) / (maxX - minX);
    var ny = (py - minY) / (maxY - minY);
    return {
      x: x + clamp(nx, 0, 1) * w,
      y: invertY ? y + clamp(ny, 0, 1) * h : y + h - clamp(ny, 0, 1) * h
    };
  }

  function drawLine(ctx, x1, y1, x2, y2, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawDot(ctx, x, y, color, r) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r || 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawArrow(ctx, x1, y1, x2, y2, color, width, label) {
    var angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width || 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(angle - 0.45) * 12, y2 - Math.sin(angle - 0.45) * 12);
    ctx.lineTo(x2 - Math.cos(angle + 0.45) * 12, y2 - Math.sin(angle + 0.45) * 12);
    ctx.closePath();
    ctx.fill();
    if (label) drawLabel(ctx, label, x2 + 6, y2 - 6, color, 12);
  }

  function drawLabel(ctx, text, x, y, color, size) {
    ctx.fillStyle = color || "#152021";
    ctx.font = "700 " + (size || 12) + "px Inter, system-ui, sans-serif";
    ctx.fillText(text, x, y);
  }

  function drawSeparation(ctx, x, y, length, strength, time) {
    for (var i = 0; i < 8; i++) {
      var px = x + i * (length / 8);
      var py = y + Math.sin(time / 220 + i) * 8;
      ctx.strokeStyle = "rgba(180,35,24,0.35)";
      ctx.beginPath();
      ctx.arc(px, py, 8 + strength, time / 500 + i, time / 500 + i + Math.PI * 1.25);
      ctx.stroke();
    }
  }

  function drawTopPlane(ctx, cx, cy, size, bank, fill, accent, controls) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(degToRad(bank || 0));
    ctx.fillStyle = fill || "#d7ddde";
    ctx.strokeStyle = "#263638";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(size * 0.52, 0);
    ctx.lineTo(size * 0.18, size * 0.08);
    ctx.lineTo(-size * 0.42, size * 0.08);
    ctx.lineTo(-size * 0.5, size * 0.22);
    ctx.lineTo(-size * 0.62, size * 0.22);
    ctx.lineTo(-size * 0.46, 0);
    ctx.lineTo(-size * 0.62, -size * 0.22);
    ctx.lineTo(-size * 0.5, -size * 0.22);
    ctx.lineTo(-size * 0.42, -size * 0.08);
    ctx.lineTo(size * 0.18, -size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accent || "#f07a24";
    if (controls) {
      ctx.fillRect(-size * 0.1, -size * 0.12, size * 0.22, 7 + Math.max(0, controls.aileron) * 0.08);
      ctx.fillRect(-size * 0.1, size * 0.12 - Math.max(0, -controls.aileron) * 0.08, size * 0.22, 7 + Math.max(0, -controls.aileron) * 0.08);
      ctx.fillRect(-size * 0.5, -size * 0.27, size * 0.18, 7);
      ctx.fillRect(-size * 0.5, size * 0.27 - 7, size * 0.18, 7);
      ctx.fillRect(-size * 0.56, -4, size * 0.16, 8);
    } else {
      ctx.fillRect(-size * 0.08, -size * 0.12, size * 0.22, 6);
      ctx.fillRect(-size * 0.08, size * 0.12 - 6, size * 0.22, 6);
    }
    ctx.restore();
  }

  function drawFrontPlane(ctx, cx, cy, size) {
    ctx.fillStyle = "#d7ddde";
    ctx.strokeStyle = "#263638";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - size, cy);
    ctx.lineTo(cx - size * 0.1, cy - size * 0.08);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx + size * 0.1, cy + size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f07a24";
    ctx.fillRect(cx - size * 0.12, cy - size * 0.08, size * 0.24, size * 0.16);
  }

  function drawAxisPanel(ctx, x, y, cm) {
    ctx.fillStyle = "#fcfdfd";
    ctx.strokeStyle = "#dfe6e6";
    ctx.fillRect(x, y, 250, 126);
    ctx.strokeRect(x, y, 250, 126);
    drawLabel(ctx, "Momentenbilanz", x + 12, y + 22, "#152021", 13);
    drawBar(ctx, x + 12, y + 45, 190, cm.roll / 12, "#176c72", "Roll");
    drawBar(ctx, x + 12, y + 75, 190, cm.yaw / 12, "#f07a24", "Gier");
    drawBar(ctx, x + 12, y + 105, 190, cm.pitch / 12, "#152021", "Nick");
  }

  function drawControlSurfacePanel(ctx, x, y, c) {
    ctx.fillStyle = "#fcfdfd";
    ctx.strokeStyle = "#dfe6e6";
    ctx.fillRect(x, y, 230, 126);
    ctx.strokeRect(x, y, 230, 126);
    drawLabel(ctx, "Ruderlogik", x + 12, y + 22, "#152021", 13);
    drawLabel(ctx, "Querruder: " + signed(c.aileron) + "%", x + 12, y + 50, "#647174", 12);
    drawLabel(ctx, "Hoehenruder: " + signed(c.elevator) + "%", x + 12, y + 72, "#647174", 12);
    drawLabel(ctx, "Seitenruder: " + signed(c.rudder) + "%", x + 12, y + 94, "#647174", 12);
  }

  function drawBar(ctx, x, y, w, value, color, label) {
    ctx.fillStyle = "#edf2f2";
    ctx.fillRect(x, y - 8, w, 12);
    ctx.fillStyle = color;
    var mid = x + w / 2;
    ctx.fillRect(mid, y - 8, clamp(value, -1, 1) * (w / 2), 12);
    drawLabel(ctx, label, x + w + 8, y + 1, "#647174", 11);
  }

  function drawRunwayApproach(ctx, x, y, glideAngle, phase) {
    ctx.strokeStyle = "#263638";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 160, y + 40);
    ctx.lineTo(x + 160, y + 40);
    ctx.stroke();
    ctx.strokeStyle = "#f07a24";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 150, y - glideAngle * 9);
    ctx.lineTo(x + 130, y + 34);
    ctx.stroke();
    drawTopPlane(ctx, x - 105, y - glideAngle * 9 + 10, 72, -8, "#d7ddde", "#f07a24");
    drawLabel(ctx, phase === "start" ? "Start: Widerstand klein halten" : "Anflug: steiler Gleitwinkel", x - 150, y + 70, "#647174", 12);
  }

  function drawGlidePath(ctx, x, y, glide, climbRate, power) {
    var angle = clamp(160 / Math.max(5, glide), 4, 22);
    ctx.strokeStyle = "#dfe6e6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 210, y + 65);
    ctx.lineTo(x + 210, y + 65);
    ctx.stroke();
    ctx.strokeStyle = power > 0 ? "#176c72" : "#f07a24";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 190, y - (power > 0 ? climbRate * 18 : angle * 5));
    ctx.lineTo(x + 190, y + 55);
    ctx.stroke();
    drawTopPlane(ctx, x - 120, y - (power > 0 ? climbRate * 18 : angle * 5) + 20, 95, power > 0 ? -8 : 4, "#d7ddde", "#f07a24");
    drawLabel(ctx, power > 0 ? "Leistung verschiebt die Flugbahn" : "Gleiten ohne Leistung", x - 190, y + 92, "#647174", 12);
  }

  function drawTurnCircle(ctx, x, y, radius, speed, bank) {
    var r = clamp(radius / 12, 30, 140);
    ctx.strokeStyle = "#dfe6e6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    var a = degToRad((performance.now() / 35) % 360);
    drawTopPlane(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 60, bank * 0.2 + radToDeg(a), "#d7ddde", "#f07a24");
    drawLabel(ctx, "Radius skaliert mit v^2", x - 100, y + r + 28, "#647174", 12);
  }

  function drawSlipPlane(ctx, x, y, aileron, rudder) {
    drawTopPlane(ctx, x, y, 150, aileron * 0.18, "#d7ddde", "#f07a24");
    drawArrow(ctx, x - 110, y - 90, x - 20, y - 90, "#f07a24", 3, "Flugrichtung");
    drawLine(ctx, x, y - 80, x, y + 80, "#176c72", 2);
    drawLabel(ctx, "Laengsachse != Flugrichtung", x - 120, y + 110, "#647174", 12);
  }

  function drawSlipPlane3D(ctx, x, y, aileron, rudder) {
    var cam = camera3D(x, y, 280, -38, -24, 0);
    drawAircraft3D(ctx, cam, {
      bank: clamp(aileron * 0.22, -28, 28),
      pitch: 2,
      yaw: clamp(rudder * 0.42, -35, 35),
      surfaces: { aileron: aileron, elevator: 4, rudder: rudder }
    });
    drawArrow3D(ctx, cam, { x: -1.7, y: 0.18, z: -0.75 }, { x: -0.55, y: 0.18, z: -0.75 }, "#f07a24", 3, "Flugrichtung");
    drawArrow3D(ctx, cam, { x: -0.15, y: 0.12, z: -1.0 }, { x: -0.15, y: 0.12, z: 0.8 }, "#176c72", 2.5, "Laengsachse");
    drawLabel(ctx, "Slip: Quer- und Seitenruder gegensinnig", x - 135, y + 120, "#647174", 12);
  }

  function drawSpin(ctx, x, y, direction, time) {
    ctx.strokeStyle = "#b42318";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (var t = 0; t < Math.PI * 5; t += 0.12) {
      var r = 7 + t * 6;
      var px = x + Math.cos(t * direction + time / 240) * r;
      var py = y + Math.sin(t * direction + time / 240) * r;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    drawTopPlane(ctx, x, y, 82, (time / 8) * direction, "#efd7d2", "#f07a24");
    drawLabel(ctx, "Autorotation", x - 50, y + 115, "#b42318", 13);
  }

  function showAtlas() {
    var html =
      '<div class="modal-backdrop"><section class="exam-modal atlas-panel">' +
      '<div class="modal-top"><div><p class="eyebrow">PDF-verknuepftes Stoffnetz</p><h2>Alle Einheiten</h2></div>' +
      '<button class="secondary-button" type="button" data-action="modal-close">Schliessen</button></div>' +
      '<div class="atlas-grid">' +
      content.units
        .map(function (unit) {
          return (
            '<article class="atlas-card">' +
            "<h3>" +
            escapeHtml(unit.index + " " + unit.title) +
            "</h3>" +
            "<p>PDF S. " +
            escapeHtml(unit.pages) +
            " | " +
            escapeHtml(unit.tags.join(", ")) +
            "</p>" +
            '<button class="small-button" type="button" data-action="atlas-open-unit" data-target-unit="' +
            escapeHtml(unit.id) +
            '">Oeffnen</button>' +
            "</article>"
          );
        })
        .join("") +
      "</div></section></div>";
    document.getElementById("modalRoot").innerHTML = html;
  }

  function startExam() {
    var pool = shuffle(content.questions.slice()).slice(0, 30);
    state.exam = {
      questions: pool,
      index: 0,
      selected: null,
      checked: false,
      answers: []
    };
    renderExam();
  }

  function renderExam() {
    if (!state.exam) return;
    var exam = state.exam;
    var modalRoot = document.getElementById("modalRoot");
    if (exam.index >= exam.questions.length) {
      modalRoot.innerHTML = renderExamResult();
      return;
    }
    var q = exam.questions[exam.index];
    modalRoot.innerHTML =
      '<div class="modal-backdrop"><section class="exam-modal">' +
      '<div class="modal-top"><div><p class="eyebrow">Pruefungsmodus</p><h2>Frage ' +
      (exam.index + 1) +
      " von " +
      exam.questions.length +
      "</h2></div>" +
      '<button class="secondary-button" type="button" data-action="modal-close">Schliessen</button></div>' +
      '<div class="exam-progress"><div class="meter"><span style="width:' +
      Math.round((exam.index / exam.questions.length) * 100) +
      '%"></span></div></div>' +
      "<h3>" +
      escapeHtml(q.q) +
      "</h3>" +
      '<div class="option-list">' +
      q.options
        .map(function (option, index) {
          var cls = "";
          if (exam.selected === index) cls += " selected";
          if (exam.checked && index === q.answer) cls += " correct";
          if (exam.checked && exam.selected === index && index !== q.answer) cls += " wrong";
          return (
            '<button class="option-button' +
            cls +
            '" type="button" data-action="exam-select" data-option="' +
            index +
            '">' +
            escapeHtml(option) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="feedback ' +
      (exam.checked ? (exam.selected === q.answer ? "good" : "bad") : "") +
      '">' +
      (exam.checked
        ? escapeHtml((exam.selected === q.answer ? "Richtig. " : "Noch nicht. ") + q.explain + " Quelle: " + q.source)
        : "Antwort waehlen, pruefen, dann weiter.") +
      "</div>" +
      '<div class="quiz-actions">' +
      '<button class="primary-button" type="button" data-action="exam-check">Pruefen</button>' +
      '<button class="secondary-button" type="button" data-action="exam-next">Weiter</button>' +
      "</div></section></div>";
  }

  function selectExamOption(index) {
    if (!state.exam || state.exam.checked) return;
    state.exam.selected = index;
    renderExam();
  }

  function checkExamAnswer() {
    var exam = state.exam;
    if (!exam || exam.checked || exam.selected === null || exam.selected === undefined) {
      renderExam();
      return;
    }
    var q = exam.questions[exam.index];
    var correct = exam.selected === q.answer;
    exam.checked = true;
    exam.answers.push({ unit: q.unit, correct: correct });
    recordAnswer(q.unit, correct);
    renderExam();
    renderNav();
    renderOverallMastery();
    renderUnitMasteryOnly();
  }

  function nextExamQuestion() {
    var exam = state.exam;
    if (!exam) return;
    if (!exam.checked) return renderExam();
    exam.index += 1;
    exam.selected = null;
    exam.checked = false;
    renderExam();
  }

  function renderExamResult() {
    var exam = state.exam;
    var correct = exam.answers.filter(function (a) {
      return a.correct;
    }).length;
    var percent = Math.round((correct / exam.questions.length) * 100);
    var byUnit = {};
    exam.answers.forEach(function (a) {
      if (!byUnit[a.unit]) byUnit[a.unit] = { total: 0, correct: 0 };
      byUnit[a.unit].total += 1;
      if (a.correct) byUnit[a.unit].correct += 1;
    });
    var weakest = Object.keys(byUnit)
      .map(function (unitId) {
        return {
          unit: getUnit(unitId),
          score: byUnit[unitId].correct / byUnit[unitId].total
        };
      })
      .sort(function (a, b) {
        return a.score - b.score;
      })
      .slice(0, 3);

    return (
      '<div class="modal-backdrop"><section class="exam-modal">' +
      '<div class="modal-top"><div><p class="eyebrow">Pruefung abgeschlossen</p><h2>' +
      percent +
      "%</h2></div>" +
      '<button class="secondary-button" type="button" data-action="modal-close">Schliessen</button></div>' +
      '<div class="result-grid">' +
      '<div class="result-tile"><span>Richtig</span><strong>' +
      correct +
      " / " +
      exam.questions.length +
      "</strong></div>" +
      '<div class="result-tile"><span>Ziel</span><strong>95%+</strong></div>' +
      '<div class="result-tile"><span>Status</span><strong>' +
      (percent >= 95 ? "bereit" : "weiter trainieren") +
      "</strong></div>" +
      "</div>" +
      '<section class="source-panel" style="margin-top:14px"><h3>Naechste Schwerpunkte</h3><ul class="source-list">' +
      weakest
        .map(function (item) {
          return (
            "<li><strong>" +
            escapeHtml(item.unit.title) +
            " <span class=\"source-chip\">PDF S. " +
            escapeHtml(item.unit.pages) +
            "</span></strong><span>Trefferquote " +
            Math.round(item.score * 100) +
            "%. Oeffne die Einheit und lade die Simulationsmissionen.</span></li>"
          );
        })
        .join("") +
      "</ul></section>" +
      '<div class="quiz-actions" style="margin-top:14px">' +
      '<button class="primary-button" type="button" data-action="exam-restart">Neue Pruefung</button>' +
      '<button class="secondary-button" type="button" data-action="modal-close">Fertig</button>' +
      "</div></section></div>"
    );
  }

  function closeModal() {
    document.getElementById("modalRoot").innerHTML = "";
    state.exam = null;
  }

  function getControls(unitId) {
    if (!state.controls[unitId]) state.controls[unitId] = Object.assign({}, defaults[unitId]);
    return state.controls[unitId];
  }

  function getUnit(unitId) {
    return content.units.find(function (unit) {
      return unit.id === unitId;
    });
  }

  function conceptPaperPath(unitId) {
    var files = {
      fundamentals: "concept-papers/01-grundlagen-kontinuitaet-bernoulli.md",
      profile: "concept-papers/02-profilgeometrie-fluegelform.md",
      lift: "concept-papers/03-auftrieb-ueberziehgeschwindigkeit.md",
      drag: "concept-papers/04-widerstand.md",
      polar: "concept-papers/05-polare-gleiten-steigflug.md",
      flaps: "concept-papers/06-start-landehilfen.md",
      controls: "concept-papers/07-steuerungsanlagen.md",
      turn: "concept-papers/08-kurvenflug-lastvielfaches.md",
      abnormal: "concept-papers/09-ungewoehnliche-flugzustaende.md"
    };
    return files[unitId] || "concept-papers/00-system-architecture.md";
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return { units: {}, answered: 0, correct: 0 };
      var parsed = JSON.parse(raw);
      return parsed && parsed.units ? parsed : { units: {}, answered: 0, correct: 0 };
    } catch (err) {
      return { units: {}, answered: 0, correct: 0 };
    }
  }

  function ensureUnitProgress(unitId) {
    if (!state.progress.units[unitId]) {
      state.progress.units[unitId] = { touched: false, answered: 0, correct: 0 };
    }
    return state.progress.units[unitId];
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(state.progress));
  }

  function recordAnswer(unitId, correct) {
    var unitProgress = ensureUnitProgress(unitId);
    unitProgress.answered += 1;
    if (correct) unitProgress.correct += 1;
    state.progress.answered += 1;
    if (correct) state.progress.correct += 1;
    saveProgress();
  }

  function masteryForUnit(unitId) {
    var p = ensureUnitProgress(unitId);
    var sim = p.touched ? 20 : 0;
    var quiz = p.answered ? Math.round((p.correct / p.answered) * 80) : 0;
    return clamp(Math.round(sim + quiz), 0, 100);
  }

  function formatControlValue(value, def) {
    var n = typeof value === "number" ? round(value, String(def.step).indexOf(".") >= 0 ? 1 : 0) : value;
    return n + (def.unit ? " " + def.unit : "");
  }

  function rhoFromAltFt(altFt) {
    var altM = altFt * 0.3048;
    return 1.225 * Math.exp(-altM / 8500);
  }

  function ktToMs(kt) {
    return kt * 0.514444;
  }

  function msToKt(ms) {
    return ms / 0.514444;
  }

  function degToRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function radToDeg(rad) {
    return (rad * 180) / Math.PI;
  }

  function round(value, decimals) {
    var factor = Math.pow(10, decimals || 0);
    return Math.round(value * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothstep(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function separationLabel(alpha, crit) {
    if (alpha < crit - 5) return "laminar/turbulent anliegend";
    if (alpha < crit) return "beginnende Ablosung";
    return "abgeloest / Stall";
  }

  function signed(value) {
    return value > 0 ? "+" + value : String(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function shuffle(items) {
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }
})();
