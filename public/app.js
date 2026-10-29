"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // lib/oob.js
  var require_oob = __commonJS({
    "lib/oob.js"(exports, module) {
      "use strict";
      function getOobBehaviors2(mapping = {}) {
        return {
          min: normalizeOobToken2(mapping.outOfBoundsBehaviorMin),
          max: normalizeOobToken2(mapping.outOfBoundsBehaviorMax)
        };
      }
      function normalizeOobToken2(value) {
        if (value == null) return "clamp";
        const s = String(value).trim().toLowerCase();
        if (s.includes("stop") || s.includes("silent") || s.includes("mute")) return "stop";
        if (s.includes("wrap")) return "wrap";
        if (s.includes("ignore") || s.includes("skip")) return "ignore";
        return "clamp";
      }
      module.exports = {
        getOobBehaviors: getOobBehaviors2,
        normalizeOobToken: normalizeOobToken2
      };
    }
  });

  // lib/transform.js
  var require_transform = __commonJS({
    "lib/transform.js"(exports, module) {
      "use strict";
      function normalizeTransformation2(t) {
        if (t == null || t === "") return "none";
        const s = String(t).toLowerCase().replace(/[_\s-]/g, "");
        if (s.includes("abs")) return "absolute";
        if (s.includes("wrap")) return "wrap360";
        return "none";
      }
      function applyTransformation2(preferredUnitValue, transformation) {
        let val = Number(preferredUnitValue);
        if (!Number.isFinite(val)) return NaN;
        const t = normalizeTransformation2(transformation);
        if (t === "absolute") return Math.abs(val);
        if (t === "wrap360") {
          val = val % 360;
          if (val < 0) val += 360;
          return val;
        }
        return val;
      }
      module.exports = {
        normalizeTransformation: normalizeTransformation2,
        applyTransformation: applyTransformation2
      };
    }
  });

  // lib/units.js
  var require_units = __commonJS({
    "lib/units.js"(exports, module) {
      "use strict";
      function quantityFromPreferredUnit(prefUnit) {
        const u = normalizeUnit(prefUnit);
        if (u === "m/s" || u === "knots" || u === "mph") return "speed";
        if (u === "m" || u === "feet" || u === "NM") return "length";
        if (u === "K" || u === "\xB0C" || u === "\xB0F") return "temperature";
        if (u === "rad" || u === "deg") return "angle";
        return "raw";
      }
      function quantityFromPath(path) {
        const p = String(path || "").toLowerCase();
        if (!p) return "raw";
        if (p.includes("speed") || p.includes("wind.speed") || p.includes("sow") || p.includes("sog") || p.includes("stw") || p.includes("velocity")) return "speed";
        if (p.includes("heading") || p.includes("course") || p.includes("bearing") || p.includes("angle") || p.includes("direction") || p.includes("latitude") === false && p.includes("wind.angle")) return "angle";
        if (p.includes("wind.angle") || p.includes("rudder") || p.includes("awa") || p.includes("twa")) return "angle";
        if (p.includes("depth") || p.includes("altitude") || p.includes("height") || p.includes("length") || p.includes("distance")) return "length";
        if (p.includes("temperature") || p.includes("temp")) return "temperature";
        return "raw";
      }
      function siUnitForQuantity(q) {
        switch (q) {
          case "speed":
            return "m/s";
          case "length":
            return "m";
          case "temperature":
            return "K";
          case "angle":
            return "rad";
          default:
            return null;
        }
      }
      function normalizeUnit(u) {
        if (u == null) return "";
        let s = String(u).trim().toLowerCase();
        s = s.replace("\xB0", "");
        s = s.replace("degrees", "deg").replace("degree", "deg");
        s = s.replace("celsius", "c").replace("fahrenheit", "f");
        s = s.replace("kelvin", "k");
        s = s.replace("meters/sec", "m/s").replace("meter/sec", "m/s").replace("mps", "m/s");
        s = s.replace("meter", "m").replace("metres", "m").replace("metre", "m");
        s = s.replace("foot", "ft").replace("feet", "ft");
        s = s.replace("nautical miles", "nm").replace("nautical mile", "nm");
        s = s.replace("knot", "kn").replace("knots", "kn");
        s = s.replace("mile/h", "mph").replace("miles/h", "mph").replace("miles per hour", "mph");
        if (s === "ms" || s === "m/s") return "m/s";
        if (s === "kn" || s === "kt" || s === "kts") return "knots";
        if (s === "mph") return "mph";
        if (s === "m") return "m";
        if (s === "ft") return "feet";
        if (s === "nm") return "NM";
        if (s === "c") return "\xB0C";
        if (s === "f") return "\xB0F";
        if (s === "k") return "K";
        if (s === "deg" || s === "rad" || s === "radian" || s === "radians") {
          return s.startsWith("rad") ? "rad" : "deg";
        }
        return String(u).trim();
      }
      function formatValueWithUnit2(value, unit) {
        const num = typeof value === "number" ? value : Number(value);
        const text = Number.isFinite(num) ? (Math.round(num * 1e3) / 1e3).toString() : String(value);
        return unit ? `${text} ${unit}` : text;
      }
      function convertSiToPreferred2(siValue, mapping, pathForFallback) {
        const rawNum = Number(siValue);
        if (!Number.isFinite(rawNum)) return { value: NaN, unit: "", quantity: "raw" };
        let pref = getMappingUnit2(mapping);
        let quantity = quantityFromPreferredUnit(pref);
        if (quantity === "raw") {
          quantity = quantityFromPath(pathForFallback || mapping && mapping.path);
          if (quantity === "speed") pref = "knots";
          else if (quantity === "angle") pref = "deg";
          else if (quantity === "length") pref = "m";
          else if (quantity === "temperature") pref = "\xB0C";
          else pref = "";
        }
        const si = siUnitForQuantity(quantity);
        if (!si || !pref) return { value: rawNum, unit: pref || "", quantity };
        let v = rawNum;
        if (quantity === "speed") {
          if (pref === "knots") v = rawNum * 1.9438444924406;
          else if (pref === "mph") v = rawNum * 2.2369362920544;
        } else if (quantity === "length") {
          if (pref === "feet") v = rawNum * 3.2808398950131;
          else if (pref === "NM") v = rawNum / 1852;
        } else if (quantity === "temperature") {
          if (pref === "\xB0C") v = rawNum - 273.15;
          else if (pref === "\xB0F") v = (rawNum - 273.15) * 9 / 5 + 32;
        } else if (quantity === "angle") {
          if (pref === "deg") v = rawNum * 180 / Math.PI;
        }
        return { value: v, unit: pref, quantity };
      }
      function isDegreesUnit2(unit) {
        return normalizeUnit(unit) === "deg";
      }
      function getMappingUnit2(mapping) {
        if (!mapping) return "";
        return normalizeUnit(mapping.unit || mapping.units || mapping.dataUnit || mapping.dataUnits || "");
      }
      module.exports = {
        quantityFromPreferredUnit,
        normalizeUnit,
        formatValueWithUnit: formatValueWithUnit2,
        convertSiToPreferred: convertSiToPreferred2,
        isDegreesUnit: isDegreesUnit2,
        getMappingUnit: getMappingUnit2
      };
    }
  });

  // lib/scale.js
  var require_scale = __commonJS({
    "lib/scale.js"(exports, module) {
      "use strict";
      var pentatonicScale = [
        130.81,
        // C3
        146.83,
        // D3
        164.81,
        // E3
        196,
        // G3
        220,
        // A3
        261.63,
        // C4
        293.66,
        // D4
        329.63,
        // E4
        392,
        // G4
        440,
        // A4
        523.25,
        // C5
        587.33,
        // D5
        659.25,
        // E5
        783.99,
        // G5
        880,
        // A5
        1046.5,
        // C6
        1174.66,
        // D6
        1318.51,
        // E6
        1567.98,
        // G6
        1760,
        // A6
        2093,
        // C7
        2349.32,
        // D7
        2637.02,
        // E7
        3135.96,
        // G7
        3520,
        // A7
        4186.01,
        // C8
        4698.63,
        // D8
        5274.04,
        // E8
        6271.93,
        // G8
        7040,
        // A8
        8372.02
        // C9
      ];
      function quantizeToNote2(rawFrequency) {
        return pentatonicScale.reduce((prev, curr) => {
          return Math.abs(curr - rawFrequency) < Math.abs(prev - rawFrequency) ? curr : prev;
        });
      }
      module.exports = {
        pentatonicScale,
        quantizeToNote: quantizeToNote2
      };
    }
  });

  // lib/mapping.js
  var require_mapping = __commonJS({
    "lib/mapping.js"(exports, module) {
      "use strict";
      var minPulseDuty = 10;
      var maxPulseDuty = 90;
      var { getOobBehaviors: getOobBehaviors2, normalizeOobToken: normalizeOobToken2 } = require_oob();
      var { applyTransformation: applyTransformation2, normalizeTransformation: normalizeTransformation2 } = require_transform();
      function calculateMapping2(preferredValue, config, type) {
        const fallback = type === "hz" ? 0 : minPulseDuty;
        if (!config) return { value: fallback, stop: true, side: null };
        let v = applyTransformation2(preferredValue, config.transformation);
        if (!Number.isFinite(v)) return { value: fallback, stop: true, side: null };
        const dataMin = Number(config.dataMin);
        const dataMax = Number(config.dataMax);
        const hasMin = Number.isFinite(dataMin);
        const hasMax = Number.isFinite(dataMax);
        const oob = getOobBehaviors2(config);
        let side = "in";
        if (hasMin && v < dataMin) {
          side = "min";
          if (oob.min === "stop") return { value: fallback, stop: true, side };
          if (oob.min === "ignore") return { value: fallback, stop: false, side };
          if (oob.min === "wrap" && hasMin && hasMax && dataMax > dataMin) {
            const span = dataMax - dataMin;
            v = ((v - dataMin) % span + span) % span + dataMin;
            side = "in";
          } else {
            v = dataMin;
          }
        }
        if (hasMax && v > dataMax) {
          side = "max";
          if (oob.max === "stop") return { value: fallback, stop: true, side };
          if (oob.max === "ignore") return { value: fallback, stop: false, side };
          if (oob.max === "wrap" && hasMin && hasMax && dataMax > dataMin) {
            const span = dataMax - dataMin;
            v = ((v - dataMin) % span + span) % span + dataMin;
            side = "in";
          } else {
            v = dataMax;
          }
        }
        const outMin = type === "hz" ? Number(config.hzMin) : Number(config.minPulseDuty);
        const outMax = type === "hz" ? Number(config.hzMax) : Number(config.maxPulseDuty);
        const safeOutMin = Number.isFinite(outMin) ? outMin : type === "hz" ? 440 : minPulseDuty;
        const safeOutMax = Number.isFinite(outMax) ? outMax : type === "hz" ? 880 : maxPulseDuty;
        if (!hasMin || !hasMax || dataMax === dataMin) return { value: safeOutMin, stop: false, side };
        const ratio = (v - dataMin) / (dataMax - dataMin);
        const mapped = safeOutMin + ratio * (safeOutMax - safeOutMin);
        return { value: mapped, stop: false, side };
      }
      module.exports = {
        calculateMapping: calculateMapping2
      };
    }
  });

  // lib/history.js
  var require_history = __commonJS({
    "lib/history.js"(exports, module) {
      "use strict";
      var { getOobBehaviors: getOobBehaviors2, normalizeOobToken: normalizeOobToken2 } = require_oob();
      var { normalizeTransformation: normalizeTransformation2 } = require_transform();
      var { quantityFromPreferredUnit, getMappingUnit: getMappingUnit2, isDegreesUnit: isDegreesUnit2 } = require_units();
      function trimHistoryArray2(arr) {
        const MAX_HISTORY_MS = 60 * 60 * 1e3;
        const now = Date.now();
        while (arr.length > 0 && now - arr[0].t > MAX_HISTORY_MS) {
          arr.shift();
        }
      }
      function computeYAxisRange2(mapping, historyArr) {
        const t = normalizeTransformation2(mapping && mapping.transformation);
        const unit = getMappingUnit2(mapping);
        const degrees = isDegreesUnit2(unit) || quantityFromPreferredUnit(unit) === "angle";
        let yMin;
        let yMax;
        if (t === "wrap360") {
          yMin = 0;
          yMax = 360;
        } else if (t === "absolute") {
          yMin = degrees ? -180 : 0;
          yMax = 180;
        } else {
          yMin = 0;
          yMax = mapping && typeof mapping.dataMax === "number" ? mapping.dataMax : 1;
        }
        let maxStored = -Infinity;
        let minStored = Infinity;
        for (let i = 0; i < historyArr.length; i++) {
          const v = historyArr[i].v;
          if (!Number.isFinite(v)) continue;
          if (v > maxStored) maxStored = v;
          if (v < minStored) minStored = v;
        }
        if (Number.isFinite(maxStored)) {
          const roundedUp = Math.ceil(maxStored);
          if (roundedUp > yMax) yMax = roundedUp;
        }
        if (t === "absolute" && degrees && Number.isFinite(minStored) && minStored < yMin) yMin = Math.floor(minStored);
        if (t === "none" && Number.isFinite(minStored) && minStored < yMin) {
          if (minStored < 0) yMin = Math.floor(minStored);
        }
        if (!(yMax > yMin)) yMax = yMin + 1;
        return { yMin, yMax };
      }
      module.exports = {
        trimHistoryArray: trimHistoryArray2,
        computeYAxisRange: computeYAxisRange2
      };
    }
  });

  // lib/index.js
  var require_lib = __commonJS({
    "lib/index.js"(exports, module) {
      "use strict";
      module.exports = {
        ...require_oob(),
        ...require_transform(),
        ...require_units(),
        ...require_scale(),
        ...require_mapping(),
        ...require_history()
      };
    }
  });

  // public/app-src.js
  var {
    normalizeOobToken,
    getOobBehaviors,
    normalizeTransformation,
    applyTransformation,
    convertSiToPreferred,
    getMappingUnit,
    formatValueWithUnit,
    isDegreesUnit,
    quantizeToNote,
    calculateMapping,
    trimHistoryArray,
    computeYAxisRange
  } = require_lib();
  var audioCtx;
  var oscillator;
  var gainNode;
  var isAudioEnabled = false;
  var ws;
  var currentFreq = 440;
  var currentDutyCycle = 50;
  var nextNoteTime = 0;
  var freqOutOfBoundsStop = false;
  var dutyCycleOutOfBoundsStop = false;
  var configs = [];
  var activeConfig = null;
  var allFreqHistories = {};
  var allDutyCycleHistories = {};
  var freqHistory = [];
  var dutyCycleHistory = [];
  var historyDurationMs = 10 * 60 * 1e3;
  var debugMode = false;
  var volumeSlider = document.getElementById("volumeSlider");
  var volumeDisplay = document.getElementById("volumeDisplay");
  var currentVolume = 0.25;
  var dayModeBtn = document.getElementById("dayModeBtn");
  var autoModeBtn = document.getElementById("autoModeBtn");
  var nightModeBtn = document.getElementById("nightModeBtn");
  var startMonitoringBtn = document.getElementById("startMonitoringBtn");
  var stopMonitoringBtn = document.getElementById("stopMonitoringBtn");
  var enableAudioBtn = document.getElementById("enableAudioBtn");
  var stopAudioBtn = document.getElementById("stopAudioBtn");
  var statusText = document.getElementById("status");
  var configSelector = document.getElementById("configSelector");
  var historySelect = document.getElementById("historySelect");
  var freqCanvas = document.getElementById("freqHistogramCanvas");
  var dutyCycleCanvas = document.getElementById("dutyCycleHistogramCanvas");
  var freqCtx = freqCanvas.getContext("2d");
  var dutyCycleCtx = dutyCycleCanvas.getContext("2d");
  var displayFreqPath = document.getElementById("display-freq-path");
  var displayFreqVal = document.getElementById("display-freq-val");
  var displayDutyCyclePath = document.getElementById("display-dutycycle-path");
  var displayDutyCycleVal = document.getElementById("display-dutycycle-val");
  var workerCode = `
  let timerID = null;
  self.onmessage = function(e) {
    if (e.data === 'start') {
      // Tick every 25ms to wake up the main thread
      timerID = setInterval(() => self.postMessage('tick'), 25);
    } else if (e.data === 'stop') {
      clearInterval(timerID);
    }
  };
`;
  var blob = new Blob([workerCode], { type: "application/javascript" });
  var timerWorker = new Worker(URL.createObjectURL(blob));
  timerWorker.onmessage = function() {
    scheduleAudioDuty();
  };
  fetch("/plugins/signalk-sonic-helm/settings").then((res) => res.json()).then((data) => {
    configs = data.configuration && data.configuration.audioModes || data.audioModes || [];
    configSelector.innerHTML = "";
    configs.forEach((config, index) => {
      allFreqHistories[index] = [];
      allDutyCycleHistories[index] = [];
      const option = document.createElement("option");
      option.value = index;
      option.textContent = config.modeName || config.name || `Configuration ${index + 1}`;
      configSelector.appendChild(option);
    });
    configSelector.disabled = false;
    if (configs.length > 0) {
      freqHistory = allFreqHistories[0];
      dutyCycleHistory = allDutyCycleHistories[0];
      activeConfig = configs[0];
      updateMonitoringUI();
      drawAllHistograms();
    }
  }).catch((e) => {
    console.warn("Could not load config, using defaults.", e);
    configSelector.innerHTML = "<option>Error loading configs</option>";
  });
  configSelector.addEventListener("change", (e) => {
    const selectedIdx = e.target.value;
    activeConfig = configs[selectedIdx];
    freqHistory = allFreqHistories[selectedIdx];
    dutyCycleHistory = allDutyCycleHistories[selectedIdx];
    freqOutOfBoundsStop = false;
    dutyCycleOutOfBoundsStop = false;
    updateMonitoringUI();
    drawAllHistograms();
    if (ws && ws.readyState === WebSocket.OPEN) {
      statusText.innerText = "Status: Connected & Subscribed. (Config switched)";
    }
  });
  historySelect.addEventListener("change", (e) => {
    const minutes = parseInt(e.target.value, 10);
    historyDurationMs = minutes * 60 * 1e3;
    trimHistories();
    drawAllHistograms();
  });
  function setActiveButton(selectedButton) {
    dayModeBtn.classList.remove("active-mode");
    nightModeBtn.classList.remove("active-mode");
    autoModeBtn.classList.remove("active-mode");
    selectedButton.classList.add("active-mode");
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isSystemDark) {
      autoModeBtn.innerText = "Auto (Night)";
    } else {
      autoModeBtn.innerText = "Auto (Day)";
    }
  }
  dayModeBtn.addEventListener("click", () => {
    document.documentElement.setAttribute("data-theme", "day");
    setActiveButton(dayModeBtn);
    drawAllHistograms();
  });
  nightModeBtn.addEventListener("click", () => {
    document.documentElement.setAttribute("data-theme", "night");
    setActiveButton(nightModeBtn);
    drawAllHistograms();
  });
  autoModeBtn.addEventListener("click", () => {
    document.documentElement.removeAttribute("data-theme");
    setActiveButton(autoModeBtn);
    drawAllHistograms();
  });
  startMonitoringBtn.addEventListener("click", () => {
    statusText.innerText = "Status: Connecting...";
    connectSignalK();
    startMonitoringBtn.style.display = "none";
    stopMonitoringBtn.style.display = "inline-block";
    enableAudioBtn.style.display = "inline-block";
    stopAudioBtn.style.display = "none";
    statusText.innerText = "Status: Connected. Waiting for Audio Enable.";
  });
  stopMonitoringBtn.addEventListener("click", () => {
    if (ws) ws.close();
    if (stopAudioBtn.style.display !== "none") stopAudioBtn.click();
    enableAudioBtn.style.display = "none";
    startMonitoringBtn.style.display = "inline-block";
    stopMonitoringBtn.style.display = "none";
  });
  enableAudioBtn.addEventListener("click", async () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      gainNode.gain.value = 0;
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      isAudioEnabled = true;
      nextNoteTime = audioCtx.currentTime + 0.1;
      timerWorker.postMessage("start");
    }
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
    try {
      if ("wakeLock" in navigator) await navigator.wakeLock.request("screen");
    } catch (err) {
      console.error(`Wake Lock error: ${err.message}`);
    }
    enableAudioBtn.style.display = "none";
    stopAudioBtn.style.display = "inline-block";
    statusText.innerText = "Status: Active & Playing";
  });
  stopAudioBtn.addEventListener("click", () => {
    if (audioCtx) audioCtx.suspend();
    stopAudioBtn.style.display = "none";
    enableAudioBtn.style.display = "inline-block";
    statusText.innerText = "Status: Audio Paused";
  });
  if (volumeSlider) {
    const initialVal = parseInt(volumeSlider.value, 10);
    currentVolume = Math.pow(initialVal / 100, 2);
    if (volumeDisplay) {
      volumeDisplay.textContent = `${initialVal}%`;
    }
    volumeSlider.addEventListener("input", function(event) {
      const sliderValue = parseInt(event.target.value, 10);
      currentVolume = Math.pow(sliderValue / 100, 2);
      if (volumeDisplay) {
        volumeDisplay.textContent = `${sliderValue}%`;
      }
    });
  }
  function getAllConfigPaths() {
    const pathSet = /* @__PURE__ */ new Set();
    configs.forEach((cfg) => {
      if (cfg.frequencyMapping && cfg.frequencyMapping.path) pathSet.add(cfg.frequencyMapping.path);
      if (cfg.dutyCycleMapping && cfg.dutyCycleMapping.path) pathSet.add(cfg.dutyCycleMapping.path);
    });
    return Array.from(pathSet);
  }
  function connectSignalK() {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/signalk/v1/stream?subscribe=none`;
    let rawFreqInput;
    let rawDutyInput;
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      const paths = getAllConfigPaths();
      const subRequest = {
        context: "vessels.self",
        subscribe: paths.map((path) => ({ path, period: 1e3 }))
      };
      ws.send(JSON.stringify(subRequest));
      statusText.innerText = "Status: Connected & Subscribed (all config paths).";
    };
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.updates) {
        msg.updates.forEach((update) => {
          const ts = update.timestamp ? Date.parse(update.timestamp) : Date.now();
          update.values.forEach((value) => {
            if (value.value === void 0 || value.value === null) return;
            const siRaw = Number(value.value);
            if (!Number.isFinite(siRaw)) return;
            if (Array.isArray(configs)) {
              configs.forEach((configItem, index) => {
                const freqPath = configItem.frequencyMapping ? configItem.frequencyMapping.path : null;
                const dutyCyclePath = configItem.dutyCycleMapping ? configItem.dutyCycleMapping.path : null;
                const isActiveConfig = configItem === activeConfig;
                if (value.path === freqPath && configItem.frequencyMapping) {
                  const conv = convertSiToPreferred(siRaw, configItem.frequencyMapping, value.path);
                  pushHistory(allFreqHistories[index], ts, conv.value);
                  if (isActiveConfig) {
                    const result = calculateMapping(conv.value, configItem.frequencyMapping, "hz");
                    rawFreqInput = conv.value;
                    freqOutOfBoundsStop = !!result.stop;
                    currentFreq = result.stop ? 0 : result.value;
                    displayFreqVal.textContent = `${formatValueWithUnit(conv.value.toFixed(1), conv.unit)} (${quantizeToNote(currentFreq)} Hz)`;
                    const freqTitle = configItem.frequencyMapping.title || (configItem.modeName ? `${configItem.modeName} \u2014 Frequency` : "Frequency");
                    drawHistogram(freqCtx, freqCanvas, freqHistory, freqTitle, `${freqPath}${conv.unit ? " (" + conv.unit + ")" : ""}`, configItem.frequencyMapping);
                  }
                }
                if (value.path === dutyCyclePath && configItem.dutyCycleMapping) {
                  const conv = convertSiToPreferred(siRaw, configItem.dutyCycleMapping, value.path);
                  pushHistory(allDutyCycleHistories[index], ts, conv.value);
                  if (isActiveConfig) {
                    const result = calculateMapping(conv.value, configItem.dutyCycleMapping, "duty");
                    rawDutyInput = conv.value;
                    dutyCycleOutOfBoundsStop = !!result.stop;
                    currentDutyCycle = result.stop ? 0 : result.value;
                    displayDutyCycleVal.textContent = `${formatValueWithUnit(conv.value.toFixed(1), conv.unit)} (${currentDutyCycle.toFixed(0)} %)`;
                    const dutyTitle = configItem.dutyCycleMapping.title || (configItem.modeName ? `${configItem.modeName} \u2014 Duty Cycle` : "Duty Cycle");
                    drawHistogram(dutyCycleCtx, dutyCycleCanvas, dutyCycleHistory, dutyTitle, `${dutyCyclePath}${conv.unit ? " (" + conv.unit + ")" : ""}`, configItem.dutyCycleMapping);
                  }
                }
              });
            }
          });
        });
        if (debugMode) {
          console.log(`State: vol=${Math.round(currentVolume)}, freq=${quantizeToNote(currentFreq)} Hz  (Raw Input: ${Math.round(rawFreqInput)}), DutyCycle=${Math.round(currentDutyCycle)} %  (Raw Input: ${Math.round(rawDutyInput)})`);
        }
      }
    };
    ws.onclose = () => {
      statusText.innerText = "Status: Connection Closed.";
    };
  }
  function audioShouldBeSilent() {
    return freqOutOfBoundsStop || dutyCycleOutOfBoundsStop || !Number.isFinite(currentFreq) || currentFreq <= 0;
  }
  function scheduleAudioDuty() {
    if (!isAudioEnabled || !audioCtx) return;
    if (audioShouldBeSilent()) {
      nextNoteTime = Math.max(nextNoteTime, audioCtx.currentTime + 0.1);
      return;
    }
    const fullCycleMs = activeConfig && activeConfig.dutyCycleMapping && Number(activeConfig.dutyCycleMapping.fullCycleTime) || 1e3;
    const periodSec = fullCycleMs / 1e3;
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
      playPulseDuty(nextNoteTime, fullCycleMs);
      nextNoteTime += periodSec;
    }
  }
  function playPulseDuty(startTime) {
    const fullCycleMs = activeConfig && activeConfig.dutyCycleMapping && Number(activeConfig.dutyCycleMapping.fullCycleTime) || 1e3;
    const safeDutyCycle = Math.max(0, Math.min(1, currentDutyCycle / 100));
    const currentOnTimeSec = fullCycleMs / 1e3 * safeDutyCycle;
    const now = startTime;
    const oscillator2 = audioCtx.createOscillator();
    const gainNode2 = audioCtx.createGain();
    const musicalFreq = quantizeToNote(currentFreq);
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioCtx.destination);
    oscillator2.type = "sine";
    oscillator2.frequency.value = musicalFreq;
    gainNode2.gain.setValueAtTime(0, now);
    const rampTime = Math.min(0.03, currentOnTimeSec / 2);
    gainNode2.gain.linearRampToValueAtTime(currentVolume, now + rampTime);
    gainNode2.gain.setValueAtTime(currentVolume, now + currentOnTimeSec - rampTime);
    gainNode2.gain.linearRampToValueAtTime(0, now + currentOnTimeSec);
    oscillator2.start(now);
    oscillator2.stop(now + currentOnTimeSec);
  }
  function pushHistory(historyArr, t, v) {
    if (!Number.isFinite(v)) return;
    historyArr.push({ t, v });
    trimHistoryArray(historyArr);
  }
  function trimHistories() {
    Object.values(allFreqHistories).forEach(trimHistoryArray);
    Object.values(allDutyCycleHistories).forEach(trimHistoryArray);
  }
  function updateAutoButtonText() {
    if (autoModeBtn.classList.contains("active-mode")) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      autoModeBtn.innerText = isDark ? "Auto (Night)" : "Auto (Day)";
    }
  }
  function drawAllHistograms() {
    const displayCutoff = Date.now() - historyDurationMs;
    const displayFreqHistory = freqHistory.filter((pt) => pt.t >= displayCutoff);
    const displayDutyHistory = dutyCycleHistory.filter((pt) => pt.t >= displayCutoff);
    if (!activeConfig) {
      drawHistogram(freqCtx, freqCanvas, freqHistory, "Frequency", "Value", null);
      drawHistogram(dutyCycleCtx, dutyCycleCanvas, dutyCycleHistory, "Duty Cycle", "Value", null);
      return;
    }
    const freqPath = activeConfig.frequencyMapping ? activeConfig.frequencyMapping.path : "Frequency Value";
    const dutyCyclePath = activeConfig.dutyCycleMapping ? activeConfig.dutyCycleMapping.path : "Duty Cycle Value";
    const freqUnit = getMappingUnit(activeConfig.frequencyMapping);
    const dutyCycleUnit = getMappingUnit(activeConfig.dutyCycleMapping);
    const freqTitle = activeConfig.frequencyMapping?.title || (activeConfig.modeName ? `${activeConfig.modeName} \u2014 Frequency` : "Frequency");
    const dutyTitle = activeConfig.dutyCycleMapping?.title || (activeConfig.modeName ? `${activeConfig.modeName} \u2014 Duty Cycle` : "Duty Cycle");
    drawHistogram(freqCtx, freqCanvas, displayFreqHistory, freqTitle, `${freqPath}${freqUnit ? " (" + freqUnit + ")" : ""}`, activeConfig.frequencyMapping);
    drawHistogram(dutyCycleCtx, dutyCycleCanvas, displayDutyHistory, dutyTitle, `${dutyCyclePath}${dutyCycleUnit ? " (" + dutyCycleUnit + ")" : ""}`, activeConfig.dutyCycleMapping);
  }
  function drawHistogram(ctx, canvas, historyArr, title, yLabel, mapping) {
    if (!ctx) return;
    if (!canvas.dataset.hasThemeListener) {
      canvas.dataset.hasThemeListener = "true";
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        drawHistogram(ctx, canvas, historyArr, title, yLabel, mapping);
        updateAutoButtonText();
        if (autoModeBtn.classList.contains("active-mode")) {
          drawAllHistograms();
        }
      });
    }
    const computedStyles = getComputedStyle(document.documentElement);
    const colors = {
      bg: computedStyles.getPropertyValue("--chart-bg").trim() || "#ffffff",
      textMain: computedStyles.getPropertyValue("--chart-text-main").trim() || "#111111",
      textMuted: computedStyles.getPropertyValue("--chart-text-muted").trim() || "#333333",
      gridLight: computedStyles.getPropertyValue("--chart-grid-light").trim() || "#eeeeee",
      gridDark: computedStyles.getPropertyValue("--chart-grid-dark").trim() || "#cccccc",
      lineData: computedStyles.getPropertyValue("--chart-line-data").trim() || "#00aa00"
    };
    const W = canvas.width, H = canvas.height;
    const padL = 54, padR = 16, padT = 36, padB = 42;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = colors.textMain;
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(title || "Histogram", W / 2, 8);
    ctx.save();
    ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colors.textMuted;
    ctx.fillText(yLabel || "Value", 0, 0);
    ctx.restore();
    const histText = historySelect && historySelect.selectedOptions[0] ? historySelect.selectedOptions[0].text : "History";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = colors.textMuted;
    ctx.fillText(`Time (${histText})`, padL + plotW / 2, H - 4);
    ctx.strokeStyle = colors.gridDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(padL, padT, plotW, plotH);
    if (!historyArr.length) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Waiting for data\u2026", padL + plotW / 2, padT + plotH / 2);
      return;
    }
    const tEnd = Date.now(), tStart = tEnd - historyDurationMs;
    const { yMin, yMax } = computeYAxisRange(mapping, historyArr);
    const yRange = yMax - yMin || 1;
    function xForTime(t) {
      return padL + (t - tStart) / historyDurationMs * plotW;
    }
    function yForValue(v) {
      return padT + plotH - (v - yMin) / yRange * plotH;
    }
    ctx.strokeStyle = colors.gridLight;
    ctx.fillStyle = colors.textMuted;
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      const v = yMin + yRange * i / 4;
      const y = yForValue(v);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText((Math.round(v * 100) / 100).toString(), padL - 6, y);
    }
    if (yMin < 0 && yMax > 0) {
      const y0 = yForValue(0);
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padL, y0);
      ctx.lineTo(padL + plotW, y0);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = colors.textMuted;
    ctx.strokeStyle = colors.gridLight;
    for (let i = 0; i <= 4; i++) {
      const t = tStart + historyDurationMs * i / 4;
      const x = xForTime(t);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      const minutesAgo = Math.round((tEnd - t) / 6e4);
      ctx.fillText(i === 4 ? "now" : `-${minutesAgo}m`, x, padT + plotH + 6);
    }
    ctx.strokeStyle = colors.lineData;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < historyArr.length; i++) {
      const pt = historyArr[i];
      if (pt.t < tStart || pt.t > tEnd) continue;
      const x = xForTime(pt.t), y = yForValue(pt.v);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        const timeGap = historyArr[i].t - historyArr[i - 1].t;
        if (timeGap > 2e3) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
    ctx.stroke();
  }
  function updateMonitoringUI() {
    if (activeConfig) {
      displayFreqPath.textContent = activeConfig.frequencyMapping ? activeConfig.frequencyMapping.path : "Not set";
      displayDutyCyclePath.textContent = activeConfig.dutyCycleMapping ? activeConfig.dutyCycleMapping.path : "Not set";
      displayFreqVal.textContent = "--";
      displayDutyCycleVal.textContent = "--";
    }
  }
})();
