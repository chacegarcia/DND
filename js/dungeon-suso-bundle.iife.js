window.LCM_HOST={els:{},foamRows:[],geoRows:[],woolRows:[],stackRows:[],wb:null,currentMode:null,setSelectOptions:function(){},showDebug:function(){},setCurrentMode:function(v){this.currentMode=v;},clearMissing:function(){},markMissing:function(){},setStatus:function(){}};
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // js/lcm/columns.js
  var COL;
  var init_columns = __esm({
    "js/lcm/columns.js"() {
      COL = {
        foam_color: "Color",
        foam_part: "Part",
        foam_partColor: "Part Color",
        foam_thickness: "Thickness",
        foam_firmness: "Firmness",
        geo_wheel: "Wheel",
        geo_padSizes: "Pad Sizes",
        geo_grindDia: "Grinded Loop Dia"
      };
    }
  });

  // js/lcm/form-state.js
  function norm(v) {
    return String(v ?? "").replace(/\u00A0/g, " ").trim();
  }
  function normU(v) {
    return norm(v).toUpperCase();
  }
  function toNum(v) {
    const n = parseFloat(String(v ?? "").trim());
    return Number.isFinite(n) ? n : null;
  }
  function isTruthy(v) {
    const s = normU(v);
    return s === "Y" || s === "YES" || s === "1" || s === "TRUE" || s === "T";
  }
  function susoNormalizeNumericText(s) {
    return String(s || "").replace(/\b(\d+),(\d+)\b/g, "$1.$2");
  }
  function susoSanitizeForBoldEcho(s) {
    return String(s).replace(/\*+/g, "");
  }
  function uniqSorted(rows, colName) {
    const vals = rows.map((r) => norm(r[colName])).filter(Boolean);
    return [...new Set(vals)].sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
  }
  function splitMaybeComma(v) {
    return String(v || "").split(",").map((x) => x.trim()).filter(Boolean);
  }
  function uniq(arr) {
    return [...new Set(arr.filter((v) => norm(v)))];
  }
  function pickMatchingOption(want, options) {
    if (!want || !options || !options.length) return null;
    const wu = normU(want);
    const exact = options.find((o) => normU(o) === wu);
    if (exact) return exact;
    const substr = options.find((o) => wu.includes(normU(o)) || normU(o).includes(wu));
    if (substr) return substr;
    return null;
  }
  var init_form_state = __esm({
    "js/lcm/form-state.js"() {
    }
  });

  // js/lcm/catalog/foam-catalog.js
  function foamRowsByColor(foamRows, color) {
    const c = normU(color);
    return foamRows.filter((r) => normU(r[COL.foam_color]) === c);
  }
  function foamRowsByColorThickness(foamRows, color, thickness) {
    const c = normU(color);
    const t = toNum(thickness);
    if (!c || t === null) return [];
    return foamRows.filter((r) => {
      if (normU(r[COL.foam_color]) !== c) return false;
      const rt = toNum(r[COL.foam_thickness]);
      return rt !== null && Math.abs(rt - t) < 1e-9;
    });
  }
  function geoRowsByWheel(geoRows, wheel) {
    const w = normU(wheel);
    return geoRows.filter((r) => normU(r[COL.geo_wheel]) === w);
  }
  var init_foam_catalog = __esm({
    "js/lcm/catalog/foam-catalog.js"() {
      init_columns();
      init_form_state();
    }
  });

  // js/lcm/catalog/geo-thk.js
  function hnorm(s) {
    return String(s ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
  }
  function buildThkMaps(geoRows) {
    THK_COLS = [];
    THK_MAP = /* @__PURE__ */ new Map();
    if (!geoRows.length) return;
    for (const k of Object.keys(geoRows[0])) {
      if (hnorm(k).startsWith("THK_")) {
        const col = k.trim();
        THK_COLS.push(col);
        const suffix = col.trim().slice(4);
        const n = parseFloat(suffix);
        if (Number.isFinite(n)) THK_MAP.set(n, col);
      }
    }
    THK_COLS.sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
  }
  function thkBucketCol(thkVal) {
    const t = toNum(thkVal);
    if (t === null) return null;
    if (t < 0.875) return THK_MAP.get(0.875) || "THK_0.875";
    if (THK_MAP.has(t)) return THK_MAP.get(t);
    for (const [n, col] of THK_MAP.entries()) {
      if (Math.abs(n - t) < 1e-9) return col;
    }
    return null;
  }
  function wheelsForThickness(geoRows, thkVal) {
    const col = thkBucketCol(thkVal);
    if (!col) return [];
    const wheels = /* @__PURE__ */ new Set();
    for (const r of geoRows) {
      if (isTruthy(r[col])) {
        const w = norm(r[COL.geo_wheel]);
        if (w) wheels.add(w);
      }
    }
    return Array.from(wheels).sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
  }
  function thicknessesForWheel(geoRows, wheelVal) {
    const w = normU(wheelVal);
    if (!geoRows.length || !THK_MAP.size) return [];
    const found = /* @__PURE__ */ new Set();
    for (const r of geoRows) {
      if (normU(r[COL.geo_wheel]) !== w) continue;
      for (const [n, col] of THK_MAP.entries()) {
        if (isTruthy(r[col])) found.add(n);
      }
    }
    return Array.from(found).sort((a, b) => a - b);
  }
  var THK_COLS, THK_MAP;
  var init_geo_thk = __esm({
    "js/lcm/catalog/geo-thk.js"() {
      init_columns();
      init_form_state();
      THK_COLS = [];
      THK_MAP = /* @__PURE__ */ new Map();
    }
  });

  // js/lcm/catalog/foam-infer.js
  function susoExtractRequestedBy(low, raw) {
    let m = raw.match(/\b(?:requested by|requester|set requested by)\s*[:\-]?\s*(.+)$/i);
    if (m) return m[1].trim();
    m = low.match(/\bset\s+requested\s+by\s+(.+)$/);
    if (m) return m[1].trim().replace(/\s+/g, " ");
    return null;
  }
  function susoExtractNumbersForFoam(low) {
    const s = susoNormalizeNumericText(low);
    const nums = [];
    const re = /\b(\d+(?:\.\d+)?)\b/gi;
    let x;
    while ((x = re.exec(s)) !== null) {
      const n = parseFloat(x[1]);
      if (Number.isFinite(n)) nums.push({ value: n, index: x.index });
    }
    return nums;
  }
  function susoInferFoamThicknessAndPad(low, raw, nums, fields) {
    const r = susoNormalizeNumericText(String(raw || "")).toLowerCase();
    const inchPadMatch = /\b(\d+(?:\.\d+)?)\s*(?:inch|inches|in\b|"|')\b/i.exec(r);
    if (inchPadMatch) {
      const v = parseFloat(inchPadMatch[1]);
      if (Number.isFinite(v) && v >= 1) {
        fields._padNum = v;
        return;
      }
    }
    if (!nums.length) return;
    if (nums.length >= 2) {
      const vals = nums.map((n) => n.value).sort((a, b) => a - b);
      const sm = vals[0];
      const lg = vals[vals.length - 1];
      if (sm < 2.25 && lg >= 2) {
        fields._thicknessNum = sm;
        fields._padNum = lg;
        return;
      }
    }
    if (nums.length === 1) {
      const v = nums[0].value;
      if (v >= 2.25 && v <= 48) {
        fields._padNum = v;
        return;
      }
      if (v > 0 && v < 2.25) {
        fields._thicknessNum = v;
        return;
      }
    }
  }
  function susoScrubForFoamColorScan(s) {
    return String(s || "").replace(/\bwhite\s+loop\b/gi, " ").replace(/\bblack\s+loop\b/gi, " ").replace(/\bno\s+loop\b/gi, " ").replace(/\bwith\s+hole\b/gi, " ").replace(/\bno\s+hole\b/gi, " ").replace(/\bno\s+print\b/gi, " ").replace(/\blc\s+print\b/gi, " ").replace(/\bcustomer\s+sample\s+print\b/gi, " ").replace(/\bcurved\b/gi, " ").replace(/\bflat\b/gi, " ").replace(/\bloop\s+backing\b/gi, " ").replace(/\bcanvas\s+backing\b/gi, " ");
  }
  function susoEscapeRe(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function susoCatalogColorPhraseMatchesHay(hay, catalogColor) {
    const hayLow = String(hay || "").toLowerCase();
    const lc = norm(catalogColor).toLowerCase();
    if (!lc || lc.length < 2) return false;
    if (lc.includes("/")) {
      const parts = lc.split("/").map((p) => p.trim()).filter(Boolean);
      if (parts.length < 2) return false;
      const slashFlex = parts.map((p) => susoEscapeRe(p)).join("\\s*\\/\\s*");
      if (new RegExp(slashFlex, "i").test(hayLow)) return true;
      if (parts.length === 2) {
        const [a, b] = parts;
        const s1 = "\\b" + susoEscapeRe(a) + "\\b\\s+\\b" + susoEscapeRe(b) + "\\b";
        const s2 = "\\b" + susoEscapeRe(b) + "\\b\\s+\\b" + susoEscapeRe(a) + "\\b";
        if (new RegExp(s1, "i").test(hayLow) || new RegExp(s2, "i").test(hayLow)) return true;
      } else {
        const spacePat = parts.map((p) => "\\b" + susoEscapeRe(p) + "\\b").join("\\s+");
        if (new RegExp(spacePat, "i").test(hayLow)) return true;
      }
      return false;
    }
    return new RegExp("\\b" + susoEscapeRe(lc) + "\\b", "i").test(hayLow);
  }
  function susoMatchFoamCatalogColor(foamRows, lowScrubbed) {
    if (!foamRows.length || !String(lowScrubbed || "").trim()) return null;
    const colors = uniqSorted(foamRows, COL.foam_color).slice().sort((a, b) => norm(b).length - norm(a).length);
    const hay = String(lowScrubbed);
    for (const c of colors) {
      if (susoCatalogColorPhraseMatchesHay(hay, c)) return c;
    }
    return null;
  }
  function susoInferFoamThicknessWhenUniqueForColorAndWheel(foamRows, fields, thicknessesForWheelFn) {
    if (fields.foamThickness || !fields.foamWheel || !fields.foamColor) return;
    const nums = thicknessesForWheelFn(fields.foamWheel);
    if (!nums.length) return;
    const foamOpts = uniqSorted(foamRowsByColor(foamRows, fields.foamColor), COL.foam_thickness);
    const candidates = foamOpts.filter((t) => {
      const n = toNum(t);
      return n !== null && nums.some((bw) => Math.abs(bw - n) < 1e-9);
    });
    if (candidates.length === 1) fields.foamThickness = candidates[0];
  }
  var init_foam_infer = __esm({
    "js/lcm/catalog/foam-infer.js"() {
      init_columns();
      init_foam_catalog();
      init_form_state();
    }
  });

  // js/lcm/catalog/wool-infer.js
  function susoMatchWoolOdToCatalog(n, ods) {
    if (n == null || !ods || !ods.length) return null;
    const hit = pickMatchingOption(String(n), ods) || ods.find((o) => toNum(o) != null && Math.abs(toNum(o) - Number(n)) < 1e-6);
    return hit || null;
  }
  function susoInferWoolPadSizeFromContext(low, raw, ods) {
    const r = String(raw || "");
    const l = String(low || "");
    if (!ods.length) return null;
    const mInch = /\b(\d+(?:\.\d+)?)\s*(?:inch|inches|in\.?|")\b/i.exec(r);
    if (mInch) {
      const v = parseFloat(mInch[1]);
      if (Number.isFinite(v) && v >= 1 && v <= 64) {
        const hit = susoMatchWoolOdToCatalog(v, ods);
        if (hit) return { value: hit, confidence: "high" };
      }
    }
    const mLabel = /\b(?:final\s*od|final\s+od|pad\s*size|diameter)\s*[:\s]*(\d+(?:\.\d+)?)\b/i.exec(l);
    if (mLabel) {
      const v = parseFloat(mLabel[1]);
      if (Number.isFinite(v) && v >= 1 && v <= 64) {
        const hit = susoMatchWoolOdToCatalog(v, ods);
        if (hit) return { value: hit, confidence: "high" };
      }
    }
    const nums = susoExtractNumbersForFoam(l);
    if (nums.length >= 1) {
      const v = nums[0].value;
      if (v >= 1 && v <= 64) {
        const hit = susoMatchWoolOdToCatalog(v, ods);
        if (hit) return { value: hit, confidence: "low" };
      }
    }
    return null;
  }
  function susoResolveWoolPrintIntentPhrase(low) {
    const l = String(low || "").toLowerCase();
    if (!l.trim()) return null;
    if (/\b(no\s+print|without\s+print|unprinted)\b/i.test(l)) return "No Print";
    if (/\bno\s+logo\b/i.test(l)) return "No Print";
    if (/\blc\s+print\b/i.test(l)) return "LC Print";
    if (/^\s*lc\s*$/i.test(l.trim())) return "LC Print";
    if (/\b(my\s+logo|our\s+logo|their\s+logo|customer\s+logo|custom\s+print|my\s+custom\s+print|my\s+custom\b|customer\s+sample|customer\s+art|supplied\s+art|branded|custom\s+artwork|artwork\s+from\s+customer|their\s+artwork)\b/i.test(
      l
    ))
      return "Customer Sample Print";
    if (/\b(logo|artwork)\b/i.test(l) && !/\bno\s+(print|logo)\b/i.test(l)) return "Customer Sample Print";
    return null;
  }
  var init_wool_infer = __esm({
    "js/lcm/catalog/wool-infer.js"() {
      init_form_state();
      init_foam_infer();
    }
  });

  // js/lcm/match-options.js
  function susoMatchListOptionCore(low, options) {
    if (!options || !options.length) return null;
    const l = String(low || "").toLowerCase();
    const mHash = /^\s*#\s*(\d+)\s*$/.exec(l);
    if (mHash) {
      const i = parseInt(mHash[1], 10) - 1;
      if (i >= 0 && i < options.length) return options[i];
    }
    const mOpt = /^\s*(?:option|pick)\s*#?\s*(\d+)\s*$/i.exec(l);
    if (mOpt) {
      const i = parseInt(mOpt[1], 10) - 1;
      if (i >= 0 && i < options.length) return options[i];
    }
    for (const o of options) {
      const ou = norm(o).toLowerCase();
      if (l === ou || ou === l) return o;
    }
    const numOnly = /^\s*(-?\d+(?:\.\d+)?|-?\.\d+)\s*$/i.exec(l);
    if (numOnly) {
      const trimmed = numOnly[0].trim();
      const want = toNum(trimmed);
      if (want != null) {
        const valHits = options.filter((o) => {
          const on = toNum(o);
          if (on != null && Math.abs(on - want) < 1e-9) return true;
          return norm(o).toLowerCase() === l;
        });
        if (valHits.length) return valHits[0];
      }
      if (/^-?\d+$/.test(trimmed)) {
        const asInt = parseInt(trimmed, 10);
        if (asInt >= 1 && asInt <= options.length) return options[asInt - 1];
      }
    }
    return null;
  }
  function matchOptionFromUserText(text, options) {
    if (!options || !options.length) return null;
    const low = susoNormalizeNumericText(norm(text)).toLowerCase();
    const core = susoMatchListOptionCore(low, options);
    if (core) return core;
    for (const o of options) {
      const ou = norm(o).toLowerCase();
      if (low.includes(ou) || ou.includes(low)) return o;
    }
    return null;
  }
  function matchFoamCatalogColorFromUserText(text, options) {
    if (!options || !options.length) return null;
    const low = susoNormalizeNumericText(norm(text)).toLowerCase();
    const core = susoMatchListOptionCore(low, options);
    if (core) return core;
    const sorted = options.slice().sort((a, b) => norm(b).length - norm(a).length);
    for (const o of sorted) {
      if (susoCatalogColorPhraseMatchesHay(low, o)) return o;
    }
    return null;
  }
  function matchWoolPrintFromUserText(text, options) {
    if (!options || !options.length) return null;
    const low = susoNormalizeNumericText(norm(text)).toLowerCase();
    const core = susoMatchListOptionCore(low, options);
    if (core) return core;
    const resolved = susoResolveWoolPrintIntentPhrase(low);
    if (resolved) {
      const hit = options.find((o) => norm(o).toLowerCase() === resolved.toLowerCase());
      if (hit) return hit;
    }
    return matchOptionFromUserText(text, options);
  }
  var init_match_options = __esm({
    "js/lcm/match-options.js"() {
      init_form_state();
      init_foam_infer();
      init_wool_infer();
    }
  });

  // js/lcm/infer-fields.js
  function createInferFieldsFromText(host2) {
    return function susoInferFieldsFromText(low, raw, semantic, phraseMatches) {
      const foamRows = host2.getFoamRows();
      const geoRows = host2.getGeoRows();
      const woolRows = host2.getWoolRows();
      const currentMode = host2.getCurrentMode();
      const els = host2.getEls();
      const fields = {};
      const notes = [];
      const clarifications = [];
      const confirmations = [];
      const rb = susoExtractRequestedBy(low, raw);
      if (rb) fields.reqName = rb;
      if (semantic.productType === "foam") fields.prodType = "foam";
      if (semantic.productType === "wool") fields.prodType = "wool";
      if (/\bfoam\b/.test(low) && !semantic.productType) fields.prodType = "foam";
      if (/\btufted\b/.test(low) && /\bwool\b/.test(low)) fields.prodType = "wool";
      if (semantic.loopType) fields.foamLoopType = semantic.loopType;
      if (semantic.finishedPad) fields.foamHole = semantic.finishedPad;
      if (semantic.orientation) fields.woolOrientation = semantic.orientation;
      if (semantic.printType) fields.woolPrint = semantic.printType;
      const lowForFoamColor = susoScrubForFoamColorScan(low);
      const matchedFoamColor = susoMatchFoamCatalogColor(foamRows, lowForFoamColor);
      if (matchedFoamColor) fields.foamColor = matchedFoamColor;
      const nums = susoExtractNumbersForFoam(low);
      const woolish = semantic.productType === "wool" || fields.prodType === "wool" || /\btufted\s+wool\b|\bwool\s+pad\b/.test(low) || /\bwool\b/.test(low) && !/\bfoam\s+pad\b/.test(low) && !/\bfoam\b/.test(low);
      if (!fields.woolPrint && (woolish || currentMode === "wool")) {
        const wp = susoResolveWoolPrintIntentPhrase(low);
        if (wp) fields.woolPrint = wp;
      }
      if (!woolish && (fields.prodType === "foam" || currentMode === "foam" || /\bfoam\b/.test(low))) {
        susoInferFoamThicknessAndPad(low, raw, nums, fields);
        if (fields._thicknessNum != null && fields._thicknessNum >= 2.25) {
          fields._padNum = fields._thicknessNum;
          delete fields._thicknessNum;
        }
      }
      if (!woolish && geoRows.length && (fields.prodType === "foam" || currentMode === "foam" || /\bfoam\b/.test(low))) {
        const wheels = uniqSorted(geoRows, COL.geo_wheel).slice().sort((a, b) => norm(b).length - norm(a).length);
        const wPick = matchOptionFromUserText(low, wheels);
        if (wPick) fields.foamWheel = wPick;
      }
      if (fields._thicknessNum != null && foamRows.length) {
        const thkOpts = fields.foamColor ? uniqSorted(foamRowsByColor(foamRows, fields.foamColor), COL.foam_thickness) : uniqSorted(foamRows, COL.foam_thickness);
        const matchThk = thkOpts.map((t) => ({ t, n: toNum(t) })).find((o) => o.n !== null && Math.abs(o.n - fields._thicknessNum) < 1e-6);
        if (matchThk) fields.foamThickness = matchThk.t;
        else if (fields._thicknessNum < 2.5) {
          notes.push("Thickness " + fields._thicknessNum + " not in current option list (after color context).");
          clarifications.push("Pick thickness from the list or adjust color first.");
        }
      }
      if (!woolish && foamRows.length && geoRows.length) {
        susoInferFoamThicknessWhenUniqueForColorAndWheel(
          foamRows,
          fields,
          (w) => host2.thicknessesForWheel(geoRows, w)
        );
      }
      let woolOdMeta = null;
      if (woolish && woolRows.length) {
        const ods = uniqSorted(woolRows, "Final OD");
        woolOdMeta = susoInferWoolPadSizeFromContext(low, raw, ods);
        if (woolOdMeta) fields.woolPadSize = woolOdMeta.value;
      }
      if (!fields.woolOrientation && woolish) {
        if (/\bcurved\b/i.test(low)) fields.woolOrientation = "Curved";
        else if (/\bflat\b/i.test(low)) fields.woolOrientation = "Flat";
      }
      if (!woolish && fields._padNum != null && geoRows.length && fields._padNum < 72) {
        const wheelRef = fields.foamWheel || els.foamWheel.value;
        const pads = wheelRef ? splitMaybeComma(uniqSorted(geoRowsByWheel(geoRows, wheelRef), COL.geo_padSizes).join(",")) : [...new Set(geoRows.flatMap((r) => splitMaybeComma(r[COL.geo_padSizes])))];
        const asStr = String(fields._padNum);
        const hit = pads.find((p) => Math.abs(toNum(p) - fields._padNum) < 1e-6 || normU(p) === normU(asStr)) || pads.find((p) => norm(p).includes(asStr));
        if (hit) fields.foamPadSize = hit;
        else if (fields._padNum <= 24) {
          notes.push("Pad size " + fields._padNum + " not matched yet (pick **wheel** first if you haven\u2019t).");
          clarifications.push("We\u2019ll confirm pad size after wheel.");
        }
      }
      for (const m of phraseMatches) {
        if (m.category === "loop_type" && m.canonical) fields.foamLoopType = m.canonical;
        if (m.category === "finished_pad" && m.canonical) fields.foamHole = m.canonical;
      }
      if (/white\s+loop|black\s+loop|no\s+loop/i.test(raw) && !fields.foamLoopType) {
        if (/white\s+loop/i.test(raw)) fields.foamLoopType = "White Loop";
        else if (/black\s+loop/i.test(raw)) fields.foamLoopType = "Black Loop";
        else if (/no\s+loop/i.test(raw)) fields.foamLoopType = "No Loop";
      }
      if (/\bno\s+hole\b/i.test(raw)) fields.foamHole = "No Hole";
      if (/\bwith\s+hole\b/i.test(raw)) fields.foamHole = "With Hole";
      if (woolish && woolRows.length) {
        const bits = [];
        if (fields.woolPadSize && woolOdMeta) {
          if (woolOdMeta.confidence === "low") {
            bits.push(
              "**Final OD " + fields.woolPadSize + "** (best guess from a number \u2014 say **no** or the correct size if not)"
            );
          } else {
            bits.push("**Final OD " + fields.woolPadSize + "**");
          }
        }
        if (fields.woolOrientation && !semantic.orientation && /\b(curved|flat)\b/i.test(low)) {
          bits.push("**orientation " + fields.woolOrientation + "** (from \u201Ccurved\u201D / \u201Cflat\u201D in your text)");
        }
        const multiField = (fields.woolPadSize ? 1 : 0) + (fields.woolOrientation ? 1 : 0) >= 2;
        const tentativeOd = woolOdMeta && woolOdMeta.confidence === "low";
        const orientFromText = fields.woolOrientation && !semantic.orientation && /\b(curved|flat)\b/i.test(low);
        if (bits.length && (multiField || tentativeOd || orientFromText)) {
          confirmations.push("From your message I\u2019m using " + bits.join(" and ") + ". **Tell me if any of that\u2019s wrong.**");
        }
      }
      if (!woolish && (fields.foamWheel || fields.foamPadSize)) {
        const bits = [];
        if (fields.foamWheel) bits.push("**wheel " + String(fields.foamWheel).replace(/\*+/g, "") + "**");
        if (fields.foamPadSize) bits.push("**pad " + String(fields.foamPadSize).replace(/\*+/g, "") + "**");
        if (bits.length) {
          confirmations.push("From your message I\u2019m using " + bits.join(" and ") + " for foam. **Tell me if any of that\u2019s wrong.**");
        }
      }
      return { fields, notes, clarifications, confirmations };
    };
  }
  var init_infer_fields = __esm({
    "js/lcm/infer-fields.js"() {
      init_columns();
      init_foam_catalog();
      init_foam_infer();
      init_wool_infer();
      init_form_state();
      init_match_options();
    }
  });

  // js/lcm/foam-wool-ui.js
  function resolveFoamRow(h) {
    const color = h.els.foamColor.value;
    const thk = h.els.foamThickness.value;
    if (!color || !thk) return null;
    const matches = foamRowsByColorThickness(h.foamRows, color, thk);
    if (matches.length === 1) return matches[0];
    const pc = h.els.foamPartColor.value;
    if (!pc) return null;
    return matches.find((r) => normU(r[COL.foam_partColor]) === normU(pc)) || null;
  }
  function recomputeFoam(h) {
    const color = h.els.foamColor.value;
    const thicknessOpts = color ? uniqSorted(foamRowsByColor(h.foamRows, color), COL.foam_thickness) : [];
    h.setSelectOptions(h.els.foamThickness, thicknessOpts, "\u2014 Select Thickness \u2014", true);
    const thk = h.els.foamThickness.value;
    const matches = color && thk ? foamRowsByColorThickness(h.foamRows, color, thk) : [];
    if (matches.length > 1) {
      h.els.foamPartColorRow.classList.remove("hidden");
      const pcs = Array.from(
        new Set(matches.map((r) => norm(r[COL.foam_partColor])).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
      h.setSelectOptions(h.els.foamPartColor, pcs, "\u2014 Select Part Color \u2014", true);
    } else {
      h.els.foamPartColorRow.classList.add("hidden");
      h.els.foamPartColor.innerHTML = '<option value="">\u2014</option>';
      h.els.foamPartColor.value = "";
    }
    const wheelOpts = thk ? wheelsForThickness(h.geoRows, thk) : uniqSorted(h.geoRows, COL.geo_wheel);
    const prevWheel = h.els.foamWheel.value;
    h.setSelectOptions(h.els.foamWheel, wheelOpts, "\u2014 Select Wheel \u2014", true);
    if (prevWheel && !wheelOpts.some((w) => normU(w) === normU(prevWheel))) {
      h.els.foamWheel.value = "";
    }
    const padOpts = uniqSorted(geoRowsByWheel(h.geoRows, h.els.foamWheel.value), COL.geo_padSizes).flatMap(splitMaybeComma);
    const padUnique = Array.from(new Set(padOpts)).sort(
      (a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" })
    );
    h.setSelectOptions(h.els.foamPadSize, padUnique, "\u2014 Select Pad Size \u2014", true);
    updateDebugAndButtons(h);
  }
  function updateDebugAndButtons(h) {
    const foamResolved = resolveFoamRow(h);
    const wheel = h.els.foamWheel.value;
    const pad = h.els.foamPadSize.value;
    let grindDia = null;
    if (wheel && pad) {
      const row = h.geoRows.find(
        (r) => normU(r[COL.geo_wheel]) === normU(wheel) && splitMaybeComma(r[COL.geo_padSizes]).some((p) => normU(p) === normU(pad))
      );
      grindDia = row ? norm(row[COL.geo_grindDia]) : null;
    }
    const out = {
      sheetCounts: {
        foamRows: h.foamRows.length,
        geoRows: h.geoRows.length,
        woolRows: h.woolRows.length,
        stackRows: h.stackRows.length
      },
      selections: {
        productType: h.currentMode,
        requestedBy: h.els.reqName.value,
        sampleName: h.els.sampleName.value
      },
      resolvedFoam: foamResolved ? {
        part: norm(foamResolved[COL.foam_part]),
        partColor: norm(foamResolved[COL.foam_partColor]),
        firmness: norm(foamResolved[COL.foam_firmness])
      } : null,
      resolvedGeo: grindDia ? { grindedLoopDia: grindDia } : null
    };
    h.showDebug(out);
    h.els.btnDownload.disabled = !h.wb;
  }
  function populateWoolPadSizes(h) {
    h.setSelectOptions(h.els.woolPadSize, uniqSorted(h.woolRows, "Final OD"), "\u2014 Select Pad Size \u2014", false);
    h.setSelectOptions(h.els.woolNap, [], "\u2014 Select Nap \u2014", false);
    h.setSelectOptions(h.els.woolYarn, [], "\u2014 Select Yarn \u2014", false);
    h.setSelectOptions(h.els.woolBacking, [], "\u2014 Select Backing \u2014", false);
    h.setSelectOptions(h.els.woolPoly, [], "\u2014 Select Poly \u2014", false);
    h.setSelectOptions(h.els.woolMil, [], "\u2014 Select MIL \u2014", false);
  }
  function recomputeWoolNap(h) {
    const od = h.els.woolPadSize.value;
    const naps = od ? uniqSorted(h.woolRows.filter((r) => normU(r["Final OD"]) === normU(od)), "Nap Length") : [];
    h.setSelectOptions(h.els.woolNap, naps, "\u2014 Select Nap \u2014", true);
  }
  function recomputeWoolYarn(h) {
    const od = h.els.woolPadSize.value;
    const nap = h.els.woolNap.value;
    const rows = h.woolRows.filter(
      (r) => (!od || normU(r["Final OD"]) === normU(od)) && (!nap || normU(r["Nap Length"]) === normU(nap))
    );
    const yarns = uniqSorted(rows, "Yarn");
    h.setSelectOptions(h.els.woolYarn, yarns, "\u2014 Select Yarn \u2014", true);
  }
  function resolveWoolDia(h) {
    const od = h.els.woolPadSize.value;
    const nap = h.els.woolNap.value;
    if (!od || !nap) return null;
    const rows = h.woolRows.filter(
      (r) => normU(r["Final OD"]) === normU(od) && normU(r["Nap Length"]) === normU(nap)
    );
    if (!rows.length) return null;
    const dias = Array.from(new Set(rows.map((r) => norm(r["Op Tufted Pad Dia"])).filter(Boolean)));
    if (dias.length === 1) return dias[0];
    const yarn = h.els.woolYarn.value;
    if (yarn) {
      const rr = rows.find((x) => normU(x["Yarn"]) === normU(yarn));
      return rr ? norm(rr["Op Tufted Pad Dia"]) : null;
    }
    return null;
  }
  function resolveWoolBase(h) {
    const od = h.els.woolPadSize.value;
    const nap = h.els.woolNap.value;
    const yarn = h.els.woolYarn.value;
    if (!od || !nap || !yarn) return null;
    return h.woolRows.find(
      (r) => normU(r["Final OD"]) === normU(od) && normU(r["Nap Length"]) === normU(nap) && normU(r["Yarn"]) === normU(yarn)
    ) || null;
  }
  function stackCandidatesForBase(h) {
    const dia = resolveWoolDia(h);
    if (!dia) return [];
    return h.stackRows.filter((r) => norm(r["Poly Dia"]) === dia);
  }
  function resolveWoolStackFinal(h) {
    const candidates = stackCandidatesForBase(h);
    let cand = candidates.slice();
    if (h.els.woolBacking.value === "Loop") cand = cand.filter((r) => isTruthy(r["Loop"]));
    if (h.els.woolBacking.value === "Canvas") cand = cand.filter((r) => isTruthy(r["Canvas"]));
    if (h.els.woolPoly.value) cand = cand.filter((r) => normU(r["Poly Type"]) === normU(h.els.woolPoly.value));
    if (h.els.woolMil.value) cand = cand.filter((r) => normU(r["Poly Size MIL"]) === normU(h.els.woolMil.value));
    return cand.length === 1 ? cand[0] : null;
  }
  function isWoolComplete(h) {
    const base = resolveWoolBase(h);
    const stack = resolveWoolStackFinal(h);
    return !!(h.wb && base && stack && h.els.woolBacking.value && h.els.woolPoly.value && h.els.woolMil.value);
  }
  function recomputeWoolStack(h) {
    const candidates = stackCandidatesForBase(h);
    const backs = [];
    if (candidates.some((r) => isTruthy(r["Loop"]))) backs.push("Loop");
    if (candidates.some((r) => isTruthy(r["Canvas"]))) backs.push("Canvas");
    h.setSelectOptions(h.els.woolBacking, backs, "\u2014 Select Backing \u2014", true);
    let cand2 = candidates.slice();
    if (h.els.woolBacking.value === "Loop") cand2 = cand2.filter((r) => isTruthy(r["Loop"]));
    if (h.els.woolBacking.value === "Canvas") cand2 = cand2.filter((r) => isTruthy(r["Canvas"]));
    const polys = uniqSorted(cand2, "Poly Type");
    h.setSelectOptions(h.els.woolPoly, polys, "\u2014 Select Poly \u2014", true);
    let cand3 = cand2.slice();
    if (h.els.woolPoly.value) cand3 = cand3.filter((r) => normU(r["Poly Type"]) === normU(h.els.woolPoly.value));
    const mils = uniqSorted(cand3, "Poly Size MIL");
    h.setSelectOptions(h.els.woolMil, mils, "\u2014 Select MIL \u2014", true);
  }
  function recomputeWoolAll(h) {
    recomputeWoolNap(h);
    recomputeWoolYarn(h);
    recomputeWoolStack(h);
    updateDebugAndButtons(h);
  }
  function updateMode(h) {
    const el = document.querySelector('input[name="prodType"]:checked');
    const type = el ? el.value : null;
    h.setCurrentMode(type);
    if (type === "foam") {
      document.getElementById("foamCard").style.display = "";
      document.getElementById("woolCard").style.display = "none";
    } else if (type === "wool") {
      document.getElementById("foamCard").style.display = "none";
      document.getElementById("woolCard").style.display = "";
    } else {
      document.getElementById("foamCard").style.display = "none";
      document.getElementById("woolCard").style.display = "none";
    }
    updateDebugAndButtons(h);
  }
  function susoTryApplyUniqueFoamThicknessFromWheel(h) {
    if (h.currentMode !== "foam" || !h.foamRows.length || !h.geoRows.length) return null;
    if (h.els.foamThickness && h.els.foamThickness.value) return null;
    const color = h.els.foamColor ? h.els.foamColor.value : "";
    const wheel = h.els.foamWheel ? h.els.foamWheel.value : "";
    if (!color || !wheel) return null;
    const nums = thicknessesForWheel(h.geoRows, wheel);
    if (!nums.length) return null;
    const foamOpts = uniqSorted(foamRowsByColor(h.foamRows, color), COL.foam_thickness);
    const candidates = foamOpts.filter((t) => {
      const n = toNum(t);
      return n !== null && nums.some((bw) => Math.abs(bw - n) < 1e-9);
    });
    if (candidates.length !== 1) return null;
    h.els.foamThickness.value = candidates[0];
    recomputeFoam(h);
    return candidates[0];
  }
  var init_foam_wool_ui = __esm({
    "js/lcm/foam-wool-ui.js"() {
      init_columns();
      init_foam_catalog();
      init_geo_thk();
      init_form_state();
    }
  });

  // js/lcm/apply-config.js
  function applyProdType(h, pt) {
    if (pt === "foam") document.getElementById("ptFoam").checked = true;
    else if (pt === "wool") document.getElementById("ptWool").checked = true;
    updateMode(h);
  }
  function applyConfiguratorFields(h, partial) {
    const applied = {};
    const skipped = {};
    const setIf = (key, el, val, list) => {
      if (val == null || val === "") return;
      if (list && list.length && !list.some((o) => normU(o) === normU(val))) {
        skipped[key] = val;
        return;
      }
      el.value = val;
      applied[key] = val;
    };
    if (partial.reqName != null) h.els.reqName.value = partial.reqName;
    if (partial.sampleName != null) h.els.sampleName.value = partial.sampleName;
    if (partial.prodType) {
      applyProdType(h, partial.prodType);
    }
    if (h.currentMode === "foam") {
      setIf("foamColor", h.els.foamColor, partial.foamColor, uniqSorted(h.foamRows, COL.foam_color));
      recomputeFoam(h);
      setIf(
        "foamThickness",
        h.els.foamThickness,
        partial.foamThickness,
        uniqSorted(foamRowsByColor(h.foamRows, h.els.foamColor.value), COL.foam_thickness)
      );
      recomputeFoam(h);
      if (!h.els.foamPartColorRow.classList.contains("hidden")) {
        const pcs = Array.from(
          new Set(
            foamRowsByColorThickness(h.foamRows, h.els.foamColor.value, h.els.foamThickness.value).map((r) => norm(r[COL.foam_partColor])).filter(Boolean)
          )
        );
        setIf("foamPartColor", h.els.foamPartColor, partial.foamPartColor, pcs);
      }
      recomputeFoam(h);
      setIf("foamWheel", h.els.foamWheel, partial.foamWheel, uniqSorted(h.geoRows, COL.geo_wheel));
      recomputeFoam(h);
      const padOpts = uniqSorted(geoRowsByWheel(h.geoRows, h.els.foamWheel.value), COL.geo_padSizes).flatMap(splitMaybeComma);
      setIf("foamPadSize", h.els.foamPadSize, partial.foamPadSize, padOpts);
      setIf("foamLoopType", h.els.foamLoopType, partial.foamLoopType, ["White Loop", "Black Loop", "No Loop"]);
      setIf("foamHole", h.els.foamHole, partial.foamHole, ["With Hole", "No Hole"]);
      if (partial.foamQty != null) {
        const q = parseInt(String(partial.foamQty), 10);
        if (Number.isFinite(q) && q >= 1) h.els.foamQty.value = String(q);
      }
      if (partial.foamNotes != null) h.els.foamNotes.value = partial.foamNotes;
    } else {
      setIf("woolPadSize", h.els.woolPadSize, partial.woolPadSize, uniqSorted(h.woolRows, "Final OD"));
      recomputeWoolAll(h);
      setIf(
        "woolNap",
        h.els.woolNap,
        partial.woolNap,
        uniqSorted(
          h.woolRows.filter((r) => normU(r["Final OD"]) === normU(h.els.woolPadSize.value)),
          "Nap Length"
        )
      );
      recomputeWoolAll(h);
      setIf(
        "woolYarn",
        h.els.woolYarn,
        partial.woolYarn,
        uniqSorted(
          h.woolRows.filter(
            (r) => normU(r["Final OD"]) === normU(h.els.woolPadSize.value) && normU(r["Nap Length"]) === normU(h.els.woolNap.value)
          ),
          "Yarn"
        )
      );
      recomputeWoolAll(h);
      setIf("woolOrientation", h.els.woolOrientation, partial.woolOrientation, ["Curved", "Flat"]);
      recomputeWoolStack(h);
      const backOpts = Array.from(h.els.woolBacking.options).map((o) => o.value).filter(Boolean);
      setIf("woolBacking", h.els.woolBacking, partial.woolBacking, backOpts);
      recomputeWoolStack(h);
      const polyOpts = Array.from(h.els.woolPoly.options).map((o) => o.value).filter(Boolean);
      setIf("woolPoly", h.els.woolPoly, partial.woolPoly, polyOpts);
      recomputeWoolStack(h);
      const milOpts = Array.from(h.els.woolMil.options).map((o) => o.value).filter(Boolean);
      setIf("woolMil", h.els.woolMil, partial.woolMil, milOpts);
      setIf("woolPrint", h.els.woolPrint, partial.woolPrint, ["No Print", "LC Print", "Customer Sample Print"]);
      if (partial.woolNotes != null) h.els.woolNotes.value = partial.woolNotes;
    }
    h.clearMissing();
    if (h.currentMode === "foam") recomputeFoam(h);
    else recomputeWoolAll(h);
    return { applied, skipped };
  }
  function explainConfiguratorInvalid(h) {
    if (h.currentMode === "wool") {
      const base = resolveWoolBase(h);
      const stack = resolveWoolStackFinal(h);
      const parts = [];
      if (!h.els.woolPadSize.value || !h.els.woolNap.value || !h.els.woolYarn.value)
        parts.push("Select Final OD, Nap, and Yarn first.");
      if (!base) parts.push("The selected OD / Nap / Yarn does not resolve to a single wool base row.");
      if (base && !stack)
        parts.push(
          "Backing / Poly / MIL do not narrow to exactly one stack row for this tufted diameter \u2014 adjust Loop vs Canvas and Poly/MIL."
        );
      if (!parts.length) parts.push("Current wool selections resolve; run export to confirm.");
      return parts.join(" ");
    }
    const foamResolved = resolveFoamRow(h);
    const foamParts = [];
    if (!foamResolved) foamParts.push("Foam Part is ambiguous or incomplete \u2014 check color, thickness, and Part Color if shown.");
    return (foamParts.length ? foamParts.join(" ") : "Foam row resolves. ") + "Export also requires Requested By or Sample Name, Wheel, Pad Size, Loop Type, and Finished Pad.";
  }
  var init_apply_config = __esm({
    "js/lcm/apply-config.js"() {
      init_columns();
      init_foam_catalog();
      init_form_state();
      init_foam_wool_ui();
    }
  });

  // js/lcm/validate-export.js
  function hasAnyName(h) {
    return !!(norm(h.els.reqName.value) || norm(h.els.sampleName.value));
  }
  function validateForExport(h) {
    h.clearMissing();
    if (!h.wb) {
      h.setStatus("Load data first.", false);
      return { ok: false, msg: "Load data first." };
    }
    if (!h.currentMode) {
      return { ok: false, msg: "Choose foam pad or tufted wool first." };
    }
    if (!hasAnyName(h)) {
      h.markMissing(h.els.reqName);
      h.markMissing(h.els.sampleName);
      return { ok: false, msg: "Fill Requested By or Sample Name." };
    }
    if (h.currentMode === "foam") {
      if (!h.els.foamColor.value) h.markMissing(h.els.foamColor);
      if (!h.els.foamThickness.value) h.markMissing(h.els.foamThickness);
      const foamNeedsPartColor = !h.els.foamPartColorRow.classList.contains("hidden");
      if (foamNeedsPartColor && !h.els.foamPartColor.value) h.markMissing(h.els.foamPartColor);
      if (!h.els.foamWheel.value) h.markMissing(h.els.foamWheel);
      if (!h.els.foamPadSize.value) h.markMissing(h.els.foamPadSize);
      const qty = parseInt(h.els.foamQty.value || "0", 10);
      if (!Number.isFinite(qty) || qty < 1) h.markMissing(h.els.foamQty);
      if (!h.els.foamLoopType.value) h.markMissing(h.els.foamLoopType);
      if (!h.els.foamHole.value) h.markMissing(h.els.foamHole);
      resolveFoamRow(h);
      const anyMissing2 = document.querySelector(".row.missing");
      return { ok: !anyMissing2, msg: anyMissing2 ? "Fill the highlighted foam fields." : "" };
    }
    if (!h.els.woolPadSize.value) h.markMissing(h.els.woolPadSize);
    if (!h.els.woolNap.value) h.markMissing(h.els.woolNap);
    if (!h.els.woolYarn.value) h.markMissing(h.els.woolYarn);
    if (!h.els.woolBacking.value) h.markMissing(h.els.woolBacking);
    if (!h.els.woolPoly.value) h.markMissing(h.els.woolPoly);
    if (!h.els.woolMil.value) h.markMissing(h.els.woolMil);
    if (!resolveWoolStackFinal(h)) {
      h.markMissing(h.els.woolBacking);
      h.markMissing(h.els.woolPoly);
      h.markMissing(h.els.woolMil);
    }
    const anyMissing = document.querySelector(".row.missing");
    return { ok: !anyMissing, msg: anyMissing ? "Fill the highlighted wool fields." : "" };
  }
  var init_validate_export = __esm({
    "js/lcm/validate-export.js"() {
      init_form_state();
      init_foam_wool_ui();
    }
  });

  // js/lcm/wizard-steps.js
  function susoStepShortLabel(stepId) {
    const map = {
      prodType: "product type",
      identity: "request / sample",
      foamColor: "foam color",
      foamThickness: "thickness",
      foamPartColor: "part color",
      foamWheel: "wheel",
      foamPadSize: "pad size",
      foamQty: "quantity",
      foamLoopType: "loop type",
      foamHole: "hole",
      foamNotes: "foam notes",
      woolPadSize: "pad size (Final OD)",
      woolNap: "nap length",
      woolYarn: "yarn",
      woolOrientation: "orientation",
      woolBacking: "backing",
      woolPoly: "poly",
      woolMil: "MIL",
      woolPrint: "print",
      woolNotes: "wool notes"
    };
    return map[stepId] || "";
  }
  function tryParseIdentityLine(h, text) {
    const t = norm(text);
    if (!t) return;
    const low = t.toLowerCase();
    let req = null;
    let samp = null;
    const rb = t.match(/(?:requested\s*by|requester)\s*[:\-]?\s*([^,\n]+?)(?:\s*,|\s+sample|\s*$)/i);
    const sn = t.match(/(?:sample\s*name|sample)\s*[:\-]?\s*(.+)$/i);
    if (rb) req = norm(rb[1]);
    if (sn) samp = norm(sn[1]);
    if (!req && !samp) {
      if (t.includes(",")) {
        const p = t.split(",").map((x) => norm(x)).filter(Boolean);
        if (p.length >= 2) {
          req = p[0];
          samp = p.slice(1).join(", ");
        } else req = p[0];
      } else if (!/foam|wool|pad|tufted|loop|hole|inch/i.test(low)) {
        req = t;
      }
    }
    if (req) h.els.reqName.value = req;
    if (samp) h.els.sampleName.value = samp;
  }
  function tryApplyStepAnswer(h, text, step) {
    const none = () => ({ applied: false, value: null, step: step || null });
    if (!step || !h.wb) return none();
    const low = norm(text).toLowerCase();
    if (step === "prodType") {
      if (/\bfoam\b/.test(low) && !/\btufted\s+wool\b/.test(low)) {
        applyProdType(h, "foam");
        return { applied: true, value: "Foam pad", step: "prodType" };
      }
      if (/\bwool\b/.test(low) || /\btufted\b/.test(low)) {
        applyProdType(h, "wool");
        return { applied: true, value: "Tufted wool pad", step: "prodType" };
      }
      return none();
    }
    if (step === "identity") {
      const beforeReq = h.els.reqName.value;
      const beforeSamp = h.els.sampleName.value;
      tryParseIdentityLine(h, text);
      if (h.els.reqName.value !== beforeReq || h.els.sampleName.value !== beforeSamp) {
        const parts = [];
        if (h.els.reqName.value) parts.push("requested by " + h.els.reqName.value);
        if (h.els.sampleName.value) parts.push("sample " + h.els.sampleName.value);
        return { applied: true, value: parts.join(", "), step: "identity" };
      }
      return none();
    }
    let opts = [];
    if (step === "foamColor") opts = uniqSorted(h.foamRows, COL.foam_color);
    else if (step === "foamThickness")
      opts = h.els.foamColor.value ? uniqSorted(foamRowsByColor(h.foamRows, h.els.foamColor.value), COL.foam_thickness) : [];
    else if (step === "foamPartColor") {
      opts = Array.from(
        new Set(
          foamRowsByColorThickness(h.foamRows, h.els.foamColor.value, h.els.foamThickness.value).map((r) => norm(r[COL.foam_partColor])).filter(Boolean)
        )
      );
    } else if (step === "foamWheel") {
      opts = wheelsForThickness(h.geoRows, h.els.foamThickness.value);
      if (!opts.length) opts = uniqSorted(h.geoRows, COL.geo_wheel);
    } else if (step === "foamPadSize") {
      opts = uniqSorted(geoRowsByWheel(h.geoRows, h.els.foamWheel.value), COL.geo_padSizes).flatMap(
        (x) => String(x).split(",").map((y) => y.trim()).filter(Boolean)
      );
      opts = Array.from(new Set(opts)).sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
    } else if (step === "foamLoopType") opts = ["White Loop", "Black Loop", "No Loop"];
    else if (step === "foamHole") opts = ["With Hole", "No Hole"];
    else if (step === "woolPadSize") opts = uniqSorted(h.woolRows, "Final OD");
    else if (step === "woolNap")
      opts = uniqSorted(h.woolRows.filter((r) => normU(r["Final OD"]) === normU(h.els.woolPadSize.value)), "Nap Length");
    else if (step === "woolYarn")
      opts = uniqSorted(
        h.woolRows.filter(
          (r) => normU(r["Final OD"]) === normU(h.els.woolPadSize.value) && normU(r["Nap Length"]) === normU(h.els.woolNap.value)
        ),
        "Yarn"
      );
    else if (step === "woolOrientation") opts = ["Curved", "Flat"];
    else if (step === "woolPrint") opts = ["No Print", "LC Print", "Customer Sample Print"];
    else if (step === "woolBacking") opts = Array.from(h.els.woolBacking.options).map((o) => o.value).filter(Boolean);
    else if (step === "woolPoly") opts = Array.from(h.els.woolPoly.options).map((o) => o.value).filter(Boolean);
    else if (step === "woolMil") opts = Array.from(h.els.woolMil.options).map((o) => o.value).filter(Boolean);
    let pick = opts.length ? matchOptionFromUserText(text, opts) : null;
    if (step === "foamColor" && opts.length) {
      const scrubbedAnswer = susoScrubForFoamColorScan(norm(text).toLowerCase());
      pick = matchFoamCatalogColorFromUserText(scrubbedAnswer, opts);
    } else if (step === "woolPrint" && opts.length) {
      pick = matchWoolPrintFromUserText(text, opts);
    }
    if (step === "foamColor" && pick) {
      h.els.foamColor.value = pick;
      recomputeFoam(h);
      return { applied: true, value: pick, step };
    }
    if (step === "foamThickness" && pick) {
      h.els.foamThickness.value = pick;
      recomputeFoam(h);
      return { applied: true, value: pick, step };
    }
    if (step === "foamPartColor" && pick) {
      h.els.foamPartColor.value = pick;
      recomputeFoam(h);
      return { applied: true, value: pick, step };
    }
    if (step === "foamWheel" && pick) {
      h.els.foamWheel.value = pick;
      recomputeFoam(h);
      return { applied: true, value: pick, step };
    }
    if (step === "foamPadSize" && pick) {
      h.els.foamPadSize.value = pick;
      recomputeFoam(h);
      return { applied: true, value: pick, step };
    }
    if (step === "foamQty") {
      const q = parseInt(String(text).replace(/,/g, "").trim(), 10);
      if (Number.isFinite(q) && q >= 1) {
        h.els.foamQty.value = String(q);
        return { applied: true, value: String(q), step };
      }
      return none();
    }
    if (step === "foamLoopType" && pick) {
      h.els.foamLoopType.value = pick;
      return { applied: true, value: pick, step };
    }
    if (step === "foamHole" && pick) {
      h.els.foamHole.value = pick;
      return { applied: true, value: pick, step };
    }
    if (step === "foamNotes") {
      const v = norm(text);
      if (v) {
        h.els.foamNotes.value = v;
        return { applied: true, value: v.length > 80 ? v.slice(0, 77) + "\u2026" : v, step };
      }
      return none();
    }
    if (step === "woolPadSize" && pick) {
      h.els.woolPadSize.value = pick;
      recomputeWoolAll(h);
      return { applied: true, value: pick, step };
    }
    if (step === "woolNap" && pick) {
      h.els.woolNap.value = pick;
      recomputeWoolAll(h);
      return { applied: true, value: pick, step };
    }
    if (step === "woolYarn" && pick) {
      h.els.woolYarn.value = pick;
      recomputeWoolAll(h);
      return { applied: true, value: pick, step };
    }
    if (step === "woolOrientation" && pick) {
      h.els.woolOrientation.value = pick;
      return { applied: true, value: pick, step };
    }
    if (step === "woolBacking" && pick) {
      h.els.woolBacking.value = pick;
      recomputeWoolStack(h);
      return { applied: true, value: pick, step };
    }
    if (step === "woolPoly" && pick) {
      h.els.woolPoly.value = pick;
      recomputeWoolStack(h);
      return { applied: true, value: pick, step };
    }
    if (step === "woolMil" && pick) {
      h.els.woolMil.value = pick;
      return { applied: true, value: pick, step };
    }
    if (step === "woolPrint" && pick) {
      h.els.woolPrint.value = pick;
      return { applied: true, value: pick, step };
    }
    if (step === "woolNotes") {
      const v = norm(text);
      if (v) {
        h.els.woolNotes.value = v;
        return { applied: true, value: v.length > 80 ? v.slice(0, 77) + "\u2026" : v, step };
      }
      return none();
    }
    return none();
  }
  function getNextMissingSlot(h) {
    if (!h.wb) return { stepId: "need_load", prompt: "Load the catalog first (button above).", options: [] };
    if (h.currentMode === null) {
      return {
        stepId: "prodType",
        prompt: "First, which are you configuring? **Foam pad** or **tufted wool** pad?",
        options: ["Foam pad", "Tufted wool pad"]
      };
    }
    if (!h.hasAnyName()) {
      return {
        stepId: "identity",
        prompt: "Who should we list as **requested by**, and what **sample name** (if any)? You can answer like: `Requested by: Jane Doe, Sample: Red test`.",
        allowFreeText: true,
        options: []
      };
    }
    if (h.currentMode === "foam") {
      if (!h.els.foamColor.value) {
        return { stepId: "foamColor", prompt: "Which **foam color**?", options: uniqSorted(h.foamRows, COL.foam_color) };
      }
      if (!h.els.foamThickness.value) {
        return {
          stepId: "foamThickness",
          prompt: "Which **thickness**?",
          options: uniqSorted(foamRowsByColor(h.foamRows, h.els.foamColor.value), COL.foam_thickness)
        };
      }
      const needPart = !h.els.foamPartColorRow.classList.contains("hidden");
      if (needPart && !h.els.foamPartColor.value) {
        const pcs = Array.from(
          new Set(
            foamRowsByColorThickness(h.foamRows, h.els.foamColor.value, h.els.foamThickness.value).map((r) => norm(r[COL.foam_partColor])).filter(Boolean)
          )
        );
        return {
          stepId: "foamPartColor",
          prompt: "Which **part color** (foam part) applies?",
          options: pcs.sort((a, b) => a.localeCompare(b, void 0, { numeric: true }))
        };
      }
      if (!h.els.foamWheel.value) {
        const wopts = wheelsForThickness(h.geoRows, h.els.foamThickness.value);
        return {
          stepId: "foamWheel",
          prompt: "Which **wheel**?",
          options: wopts.length ? wopts : uniqSorted(h.geoRows, COL.geo_wheel)
        };
      }
      if (!h.els.foamPadSize.value) {
        const pads = uniqSorted(geoRowsByWheel(h.geoRows, h.els.foamWheel.value), COL.geo_padSizes).flatMap(
          (x) => String(x).split(",").map((y) => y.trim()).filter(Boolean)
        );
        const padUnique = Array.from(new Set(pads)).sort(
          (a, b) => a.localeCompare(b, void 0, { numeric: true })
        );
        return { stepId: "foamPadSize", prompt: "Which **pad size**?", options: padUnique };
      }
      const qty = parseInt(h.els.foamQty.value || "0", 10);
      if (!Number.isFinite(qty) || qty < 1) {
        return { stepId: "foamQty", prompt: "What **quantity** (minimum 1)?", options: [] };
      }
      if (!h.els.foamLoopType.value) {
        return { stepId: "foamLoopType", prompt: "Which **loop type**?", options: ["White Loop", "Black Loop", "No Loop"] };
      }
      if (!h.els.foamHole.value) {
        return { stepId: "foamHole", prompt: "**Finished pad** \u2014 with hole or no hole?", options: ["With Hole", "No Hole"] };
      }
      if (!resolveFoamRow(h)) {
        return {
          stepId: "foam_resolve",
          prompt: "Foam part is still ambiguous. Try adjusting **color**, **thickness**, or **part color** so one BOM row matches.",
          options: []
        };
      }
      return {
        stepId: "complete",
        prompt: "**Configuration complete.** Say **export** or tap **Download BOM** to save the spreadsheet. (You can add **notes** in chat anytime before exporting.)",
        options: []
      };
    }
    if (h.currentMode === "wool") {
      if (!h.els.woolPadSize.value) {
        return {
          stepId: "woolPadSize",
          prompt: "What **final pad size (Final OD)**? Type the size (e.g. **3** or **5.5**). For a **numbered** list below, use **#3** for line 3.",
          options: uniqSorted(h.woolRows, "Final OD")
        };
      }
      if (!h.els.woolNap.value) {
        return {
          stepId: "woolNap",
          prompt: "Which **nap length**?",
          options: uniqSorted(h.woolRows.filter((r) => normU(r["Final OD"]) === normU(h.els.woolPadSize.value)), "Nap Length")
        };
      }
      if (!h.els.woolYarn.value) {
        return {
          stepId: "woolYarn",
          prompt: "Which **yarn**?",
          options: uniqSorted(
            h.woolRows.filter(
              (r) => normU(r["Final OD"]) === normU(h.els.woolPadSize.value) && normU(r["Nap Length"]) === normU(h.els.woolNap.value)
            ),
            "Yarn"
          )
        };
      }
      if (!h.els.woolOrientation.value) {
        return { stepId: "woolOrientation", prompt: "**Orientation** \u2014 curved or flat?", options: ["Curved", "Flat"] };
      }
      recomputeWoolStack(h);
      if (!h.els.woolBacking.value) {
        const backOpts = Array.from(h.els.woolBacking.options).map((o) => o.value).filter(Boolean);
        return {
          stepId: "woolBacking",
          prompt: "Which **backing type**?",
          options: backOpts.length ? backOpts : ["Loop", "Canvas"]
        };
      }
      if (!h.els.woolPoly.value) {
        const polyOpts = Array.from(h.els.woolPoly.options).map((o) => o.value).filter(Boolean);
        return { stepId: "woolPoly", prompt: "Which **poly type**?", options: polyOpts };
      }
      if (!h.els.woolMil.value) {
        const milOpts = Array.from(h.els.woolMil.options).map((o) => o.value).filter(Boolean);
        return { stepId: "woolMil", prompt: "Which **MIL (sturdyness)**?", options: milOpts };
      }
      if (!h.els.woolPrint.value) {
        return {
          stepId: "woolPrint",
          prompt: "Which **print**? You can say **no print**, **LC print**, or **my logo** / **custom print** (customer-supplied artwork).",
          options: ["No Print", "LC Print", "Customer Sample Print"]
        };
      }
      if (!resolveWoolBase(h) || !resolveWoolStackFinal(h)) {
        return {
          stepId: "wool_resolve",
          prompt: "That combination doesn\u2019t narrow to one stack row yet. Try different **backing / poly / MIL** choices that appear in the list.",
          options: []
        };
      }
      return { stepId: "complete", prompt: "**Configuration complete.** Say **export** or tap **Download BOM**.", options: [] };
    }
    return { stepId: "complete", prompt: "**Done.** Say **export** to download.", options: [] };
  }
  function susoApplyStepValue(h, stepId, value) {
    const v = norm(value);
    if (!v || !stepId) return false;
    if (stepId === "foamColor") {
      h.els.foamColor.value = v;
      recomputeFoam(h);
      return true;
    }
    if (stepId === "foamThickness") {
      h.els.foamThickness.value = v;
      recomputeFoam(h);
      return true;
    }
    if (stepId === "foamPartColor") {
      h.els.foamPartColor.value = v;
      recomputeFoam(h);
      return true;
    }
    if (stepId === "foamWheel") {
      h.els.foamWheel.value = v;
      recomputeFoam(h);
      return true;
    }
    if (stepId === "foamPadSize") {
      h.els.foamPadSize.value = v;
      recomputeFoam(h);
      return true;
    }
    if (stepId === "foamLoopType") {
      h.els.foamLoopType.value = v;
      return true;
    }
    if (stepId === "foamHole") {
      h.els.foamHole.value = v;
      return true;
    }
    if (stepId === "foamQty") {
      const q = parseInt(v, 10);
      if (!Number.isFinite(q) || q < 1) return false;
      h.els.foamQty.value = String(q);
      return true;
    }
    if (stepId === "woolPadSize") {
      h.els.woolPadSize.value = v;
      recomputeWoolAll(h);
      return true;
    }
    if (stepId === "woolNap") {
      h.els.woolNap.value = v;
      recomputeWoolAll(h);
      return true;
    }
    if (stepId === "woolYarn") {
      h.els.woolYarn.value = v;
      recomputeWoolAll(h);
      return true;
    }
    if (stepId === "woolOrientation") {
      h.els.woolOrientation.value = v;
      return true;
    }
    if (stepId === "woolBacking") {
      h.els.woolBacking.value = v;
      recomputeWoolStack(h);
      return true;
    }
    if (stepId === "woolPoly") {
      h.els.woolPoly.value = v;
      recomputeWoolStack(h);
      return true;
    }
    if (stepId === "woolMil") {
      h.els.woolMil.value = v;
      return true;
    }
    if (stepId === "woolPrint") {
      h.els.woolPrint.value = v;
      return true;
    }
    return false;
  }
  function susoStepAllowsAutoSingle(stepId) {
    return stepId === "foamColor" || stepId === "foamThickness" || stepId === "foamPartColor" || stepId === "foamWheel" || stepId === "foamPadSize" || stepId === "foamLoopType" || stepId === "foamHole" || stepId === "woolPadSize" || stepId === "woolNap" || stepId === "woolYarn" || stepId === "woolOrientation" || stepId === "woolBacking" || stepId === "woolPoly" || stepId === "woolMil" || stepId === "woolPrint";
  }
  function susoAutoFillSingleOptionSteps(h, getNextMissingSlotFn) {
    const lines = [];
    for (let g = 0; g < 24; g++) {
      const slot = getNextMissingSlotFn();
      if (["complete", "need_load", "prodType", "identity", "foam_resolve", "wool_resolve"].indexOf(slot.stepId) >= 0) break;
      if (!slot.options || slot.options.length !== 1) break;
      if (!susoStepAllowsAutoSingle(slot.stepId)) break;
      const only = slot.options[0];
      if (!susoApplyStepValue(h, slot.stepId, only)) break;
      if (h.currentMode === "wool") recomputeWoolStack(h);
      const lab = susoStepShortLabel(slot.stepId);
      lines.push("Only one option for **" + (lab || slot.stepId) + "** \u2014 set to **" + susoSanitizeForBoldEcho(only) + "**.");
    }
    return lines;
  }
  var init_wizard_steps = __esm({
    "js/lcm/wizard-steps.js"() {
      init_columns();
      init_foam_catalog();
      init_geo_thk();
      init_form_state();
      init_match_options();
      init_foam_infer();
      init_apply_config();
      init_foam_wool_ui();
    }
  });

  // js/lcm/progress.js
  function susoBuildProgressLine(h) {
    if (!h.wb) return "";
    const parts = [];
    if (h.currentMode === null) {
      return "**Progress:** Pick **foam** or **tufted wool**.";
    }
    if (h.currentMode === "foam") parts.push("Foam");
    else parts.push("Tufted wool");
    if (h.hasAnyName()) {
      const who = norm(h.els.reqName.value);
      const sn = norm(h.els.sampleName.value);
      const idBits = [];
      if (who) idBits.push("req **" + susoSanitizeForBoldEcho(who.length > 24 ? who.slice(0, 21) + "\u2026" : who) + "**");
      if (sn) idBits.push("sample **" + susoSanitizeForBoldEcho(sn.length > 20 ? sn.slice(0, 17) + "\u2026" : sn) + "**");
      if (idBits.length) parts.push(idBits.join(", "));
    } else {
      parts.push("identity pending");
    }
    if (h.currentMode === "foam") {
      if (h.els.foamColor.value) parts.push("color **" + susoSanitizeForBoldEcho(h.els.foamColor.value) + "**");
      if (h.els.foamThickness.value) parts.push("thick **" + h.els.foamThickness.value + "**");
      if (h.els.foamPartColor && h.els.foamPartColor.value && !h.els.foamPartColorRow.classList.contains("hidden"))
        parts.push("part **" + susoSanitizeForBoldEcho(h.els.foamPartColor.value) + "**");
      if (h.els.foamWheel.value) parts.push("wheel **" + susoSanitizeForBoldEcho(h.els.foamWheel.value) + "**");
      if (h.els.foamPadSize.value) parts.push("pad **" + h.els.foamPadSize.value + "**");
      const q = parseInt(h.els.foamQty.value || "0", 10);
      if (Number.isFinite(q) && q >= 1) parts.push("qty **" + q + "**");
      if (h.els.foamLoopType.value) parts.push(h.els.foamLoopType.value);
      if (h.els.foamHole.value) parts.push(h.els.foamHole.value);
    } else if (h.currentMode === "wool") {
      if (h.els.woolPadSize.value) parts.push("OD **" + h.els.woolPadSize.value + "**");
      if (h.els.woolNap.value) parts.push("nap **" + h.els.woolNap.value + "**");
      if (h.els.woolYarn.value) parts.push("yarn **" + susoSanitizeForBoldEcho(h.els.woolYarn.value) + "**");
      if (h.els.woolOrientation.value) parts.push(h.els.woolOrientation.value);
      if (h.els.woolBacking.value) parts.push("back **" + susoSanitizeForBoldEcho(h.els.woolBacking.value) + "**");
      if (h.els.woolPoly.value) parts.push("poly **" + susoSanitizeForBoldEcho(h.els.woolPoly.value) + "**");
      if (h.els.woolMil.value) parts.push("MIL **" + h.els.woolMil.value + "**");
      if (h.els.woolPrint.value) parts.push("print **" + susoSanitizeForBoldEcho(h.els.woolPrint.value) + "**");
    }
    return "**Progress:** " + parts.join(" \xB7 ");
  }
  var init_progress = __esm({
    "js/lcm/progress.js"() {
      init_form_state();
    }
  });

  // js/lcm/wire.js
  function H() {
    return window.LCM_HOST;
  }
  function host() {
    const x = H();
    return {
      els: x.els,
      foamRows: x.foamRows,
      geoRows: x.geoRows,
      woolRows: x.woolRows,
      stackRows: x.stackRows,
      wb: x.wb,
      currentMode: x.currentMode,
      setSelectOptions: x.setSelectOptions,
      showDebug: x.showDebug,
      setCurrentMode: x.setCurrentMode,
      clearMissing: x.clearMissing,
      markMissing: x.markMissing,
      setStatus: x.setStatus,
      hasAnyName: () => hasAnyName({ els: x.els })
    };
  }
  function wireLcm() {
    window.buildThkMaps = () => buildThkMaps(H().geoRows);
    window.wheelsForThickness = (thk) => wheelsForThickness(H().geoRows, thk);
    window.thicknessesForWheel = (wheel) => thicknessesForWheel(H().geoRows, wheel);
    window.foamRowsByColor = (color) => foamRowsByColor(H().foamRows, color);
    window.foamRowsByColorThickness = (color, thickness) => foamRowsByColorThickness(H().foamRows, color, thickness);
    window.geoRowsByWheel = (wheel) => geoRowsByWheel(H().geoRows, wheel);
    window.susoInferFieldsFromText = createInferFieldsFromText({
      getFoamRows: () => H().foamRows,
      getGeoRows: () => H().geoRows,
      getWoolRows: () => H().woolRows,
      getCurrentMode: () => H().currentMode,
      getEls: () => H().els,
      thicknessesForWheel
    });
    window.recomputeFoam = () => recomputeFoam(host());
    window.resolveFoamRow = () => resolveFoamRow(host());
    window.populateWoolPadSizes = () => populateWoolPadSizes(host());
    window.recomputeWoolNap = () => recomputeWoolNap(host());
    window.recomputeWoolYarn = () => recomputeWoolYarn(host());
    window.resolveWoolDia = () => resolveWoolDia(host());
    window.resolveWoolBase = () => resolveWoolBase(host());
    window.stackCandidatesForBase = () => stackCandidatesForBase(host());
    window.resolveWoolStackFinal = () => resolveWoolStackFinal(host());
    window.isWoolComplete = () => isWoolComplete(host());
    window.recomputeWoolStack = () => recomputeWoolStack(host());
    window.recomputeWoolAll = () => recomputeWoolAll(host());
    window.updateDebugAndButtons = () => updateDebugAndButtons(host());
    window.updateMode = () => updateMode(host());
    window.susoTryApplyUniqueFoamThicknessFromWheel = () => susoTryApplyUniqueFoamThicknessFromWheel(host());
    window.applyProdType = (pt) => applyProdType(host(), pt);
    window.applyConfiguratorFields = (partial) => applyConfiguratorFields(host(), partial);
    window.explainConfiguratorInvalid = () => explainConfiguratorInvalid(host());
    window.hasAnyName = () => hasAnyName({ els: H().els });
    window.validateForExport = () => validateForExport(host());
    window.getNextMissingSlot = () => getNextMissingSlot(host());
    window.tryApplyStepAnswer = (text, step) => tryApplyStepAnswer(host(), text, step);
    window.tryParseIdentityLine = (text) => tryParseIdentityLine(host(), text);
    window.susoStepShortLabel = susoStepShortLabel;
    window.susoApplyStepValue = (stepId, value) => susoApplyStepValue(host(), stepId, value);
    window.susoStepAllowsAutoSingle = susoStepAllowsAutoSingle;
    window.susoAutoFillSingleOptionSteps = () => susoAutoFillSingleOptionSteps(host(), () => getNextMissingSlot(host()));
    window.susoBuildProgressLine = () => susoBuildProgressLine(host());
    window.SUSO_DEPS = {
      inferFieldsFromText: window.susoInferFieldsFromText,
      getCurrentMode: () => H().currentMode
    };
  }
  var init_wire = __esm({
    "js/lcm/wire.js"() {
      init_columns();
      init_form_state();
      init_foam_catalog();
      init_geo_thk();
      init_infer_fields();
      init_foam_wool_ui();
      init_apply_config();
      init_validate_export();
      init_wizard_steps();
      init_progress();
      window.COL = COL;
      Object.assign(window, {
        norm,
        normU,
        toNum,
        uniqSorted,
        splitMaybeComma,
        uniq,
        susoNormalizeNumericText,
        susoSanitizeForBoldEcho,
        isTruthy,
        pickMatchingOption
      });
      wireLcm();
    }
  });

  // js/suso/engine/phrase-scan.js
  function susoWordishBoundaryOk(low, start, len) {
    if (start < 0 || len < 1 || start + len > low.length) return false;
    const before = start > 0 ? low[start - 1] : " ";
    const after = start + len < low.length ? low[start + len] : " ";
    if (/[a-z0-9]/.test(before)) return false;
    if (/[a-z0-9]/.test(after)) return false;
    return true;
  }
  function susoPhraseEntriesForConfigurator() {
    const rows = [];
    for (const row of SUSO_PHRASE_PACK_DOCUMENT) {
      const ph = String(row.phrase || "").toLowerCase().trim();
      if (!ph) continue;
      rows.push({
        phrase: ph,
        category: row.category || "concept",
        canonical: row.canonical !== void 0 ? row.canonical : null,
        pack: row.pack || "document"
      });
    }
    for (const row of SUSO_PHRASE_PACK_CONFIGURATOR) {
      const ph = String(row.phrase || "").toLowerCase().trim();
      if (!ph) continue;
      rows.push({
        phrase: ph,
        category: row.category || "concept",
        canonical: row.canonical !== void 0 ? row.canonical : null,
        pack: row.pack || "lcm"
      });
    }
    rows.sort((a, b) => b.phrase.length - a.phrase.length || String(a.phrase).localeCompare(String(b.phrase)));
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const r of rows) {
      const k = r.phrase + "\0" + r.category + "\0" + (r.canonical || "");
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(r);
    }
    return out;
  }
  function susoCollectPhraseMatches(low) {
    if (!low) return [];
    const phrases = susoPhraseEntriesForConfigurator();
    const out = [];
    let i = 0;
    while (i < low.length) {
      if (/\s/.test(low[i])) {
        i++;
        continue;
      }
      let best = null;
      for (const p of phrases) {
        const plen = p.phrase.length;
        if (plen > low.length - i) continue;
        if (low.slice(i, i + plen) !== p.phrase) continue;
        if (!susoWordishBoundaryOk(low, i, plen)) continue;
        best = p;
        break;
      }
      if (best) {
        out.push(Object.assign({}, best, { start: i, end: i + best.phrase.length }));
        i += best.phrase.length;
      } else {
        i++;
      }
    }
    return out;
  }
  var SUSO_PHRASE_PACK_DOCUMENT, SUSO_PHRASE_PACK_CONFIGURATOR;
  var init_phrase_scan = __esm({
    "js/suso/engine/phrase-scan.js"() {
      SUSO_PHRASE_PACK_DOCUMENT = [
        { phrase: "pressure rating", category: "attribute", canonical: "pressure rating", pack: "document" },
        { phrase: "operating temperature", category: "attribute", canonical: "operating temperature", pack: "document" },
        { phrase: "tensile strength", category: "attribute", canonical: "tensile strength", pack: "document" },
        { phrase: "hardness", category: "attribute", canonical: "hardness", pack: "document" },
        { phrase: "dimensions", category: "attribute", canonical: "dimensions", pack: "document" },
        { phrase: "chemical resistance", category: "attribute", canonical: "chemical resistance", pack: "document" },
        { phrase: "part number", category: "attribute", canonical: "part number", pack: "document" },
        { phrase: "model number", category: "attribute", canonical: "model number", pack: "document" },
        { phrase: "material", category: "attribute", canonical: "material", pack: "document" },
        { phrase: "data sheet", category: "document", canonical: "data sheet", pack: "document" },
        { phrase: "spec sheet", category: "document", canonical: "spec sheet", pack: "document" },
        { phrase: "msds", category: "document", canonical: "msds", pack: "document" }
      ];
      SUSO_PHRASE_PACK_CONFIGURATOR = [
        { phrase: "foam pad", category: "product_type", canonical: "foam", pack: "lcm" },
        { phrase: "tufted wool", category: "product_type", canonical: "wool", pack: "lcm" },
        { phrase: "wool pad", category: "product_type", canonical: "wool", pack: "lcm" },
        { phrase: "white loop", category: "loop_type", canonical: "White Loop", pack: "lcm" },
        { phrase: "black loop", category: "loop_type", canonical: "Black Loop", pack: "lcm" },
        { phrase: "no loop", category: "loop_type", canonical: "No Loop", pack: "lcm" },
        { phrase: "with hole", category: "finished_pad", canonical: "With Hole", pack: "lcm" },
        { phrase: "no hole", category: "finished_pad", canonical: "No Hole", pack: "lcm" },
        { phrase: "finished pad", category: "field", canonical: "foamHole", pack: "lcm" },
        { phrase: "loop type", category: "field", canonical: "foamLoopType", pack: "lcm" },
        { phrase: "pad size", category: "field", canonical: "foamPadSize", pack: "lcm" },
        { phrase: "final od", category: "field", canonical: "woolPadSize", pack: "lcm" },
        { phrase: "nap length", category: "field", canonical: "woolNap", pack: "lcm" },
        { phrase: "backing type", category: "field", canonical: "woolBacking", pack: "lcm" },
        { phrase: "poly type", category: "field", canonical: "woolPoly", pack: "lcm" },
        { phrase: "sturdyness", category: "field", canonical: "woolMil", pack: "lcm" },
        { phrase: "mil", category: "field", canonical: "woolMil", pack: "lcm" },
        { phrase: "my custom print", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "customer sample print", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "custom print", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "custom artwork", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "my logo", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "our logo", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "customer logo", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "their logo", category: "print_type", canonical: "Customer Sample Print", pack: "lcm" },
        { phrase: "lc print", category: "print_type", canonical: "LC Print", pack: "lcm" },
        { phrase: "no print", category: "print_type", canonical: "No Print", pack: "lcm" },
        { phrase: "curved", category: "orientation", canonical: "Curved", pack: "lcm" },
        { phrase: "flat", category: "orientation", canonical: "Flat", pack: "lcm" },
        { phrase: "requested by", category: "field", canonical: "reqName", pack: "lcm" },
        { phrase: "sample name", category: "field", canonical: "sampleName", pack: "lcm" },
        { phrase: "bill of materials", category: "intent", canonical: "export_bom", pack: "lcm" },
        { phrase: "bom export", category: "intent", canonical: "export_bom", pack: "lcm" },
        { phrase: "grind dia", category: "concept", canonical: "grinded_loop_dia", pack: "lcm" },
        { phrase: "grinded loop", category: "concept", canonical: "grinded_loop_dia", pack: "lcm" },
        { phrase: "wheel size", category: "concept", canonical: "wheel", pack: "lcm" },
        { phrase: "foam color", category: "field", canonical: "foamColor", pack: "lcm" },
        { phrase: "foam thickness", category: "field", canonical: "foamThickness", pack: "lcm" }
      ];
    }
  });

  // js/suso/engine/semantic-slots.js
  function susoBuildConfiguratorSemanticSlots(low, matches) {
    const mlow = String(low || "");
    const slots = {
      questionType: null,
      intentTag: null,
      productType: null,
      loopType: null,
      finishedPad: null,
      orientation: null,
      printType: null,
      attributes: [],
      document: null,
      domainCue: []
    };
    if (/\b(what|which|how much|how many|list)\b/.test(mlow)) slots.questionType = "wh_question";
    else if (/\bwhy\b/.test(mlow)) slots.questionType = "why_question";
    if (/\b(show|find|tell|give|lookup|display|available)\b/.test(mlow)) slots.intentTag = "retrieve";
    for (const m of matches) {
      if (m.category === "product_type" && m.canonical) slots.productType = m.canonical;
      if (m.category === "loop_type" && m.canonical) slots.loopType = m.canonical;
      if (m.category === "finished_pad" && m.canonical) slots.finishedPad = m.canonical;
      if (m.category === "orientation" && m.canonical) slots.orientation = m.canonical;
      if (m.category === "print_type" && m.canonical) slots.printType = m.canonical;
      if (m.category === "attribute" && m.canonical) {
        slots.attributes.push(m.canonical);
        slots.domainCue.push("attribute:" + m.canonical);
      }
      if (m.category === "document" && m.canonical) {
        slots.document = m.canonical;
        slots.domainCue.push("document:" + m.canonical);
      }
      if (m.category === "intent" && m.canonical === "export_bom") slots.intentTag = "export_bom";
    }
    return slots;
  }
  var init_semantic_slots = __esm({
    "js/suso/engine/semantic-slots.js"() {
    }
  });

  // js/suso/engine/parse-intent.js
  function parseIntentConfigurator(text) {
    const raw = (text || "").trim();
    const t = raw.toLowerCase();
    const intent = { raw, type: "configure", action: null, direction: null, target: null, insane: false };
    if (!t) {
      intent.type = "none";
      return intent;
    }
    if (/\b(fly|divine|god|miracle)\b/.test(t)) intent.insane = true;
    if (/\b(export|download)\b/.test(t) && /\b(bom|xlsx|excel|spreadsheet)\b/.test(t) || /^\s*export\s+bom\s*$/i.test(raw) || /^\s*export\s*$/i.test(raw.trim())) {
      intent.action = "export_bom";
    } else if (/\breset\b/.test(t) && /\b(form|fields|all|everything|inputs?)\b/.test(t) || /^\s*reset\s*$/i.test(raw.trim())) {
      intent.action = "reset_form";
    } else if (/\bwhy\b/.test(t) && (/\b(invalid|wrong|error|bad|doesn'?t|not\s+work|won'?t)\b/.test(t) || /\b(wool|combination|combo)\b/.test(t))) {
      intent.action = "explain_invalid";
    } else if (/\b(validate|check)\b/.test(t) && /\b(form|fields|selections?)\b/.test(t)) {
      intent.action = "validate";
    } else if (slotsLookLikeOptionQuestion(t)) {
      intent.action = "ask_options";
    } else if (/\b(compat|compatible|work with|go with)\b/.test(t)) {
      intent.action = "ask_compatibility";
    }
    if (!intent.action && /\b(set|put|use)\b/.test(t) && /\b(requested|requester)\b/.test(t)) intent.action = "fill_fields";
    else if (!intent.action) intent.action = "fill_fields";
    return intent;
    function slotsLookLikeOptionQuestion(tt) {
      return /\b(what|which|list)\b/.test(tt) && /\b(available|option|choices?)\b/.test(tt) || /\bwhat\b/.test(tt) && /\bwheel/.test(tt) && /\b(size|sizes|available)\b/.test(tt);
    }
  }
  var init_parse_intent = __esm({
    "js/suso/engine/parse-intent.js"() {
    }
  });

  // js/suso/engine/domain.js
  function susoClassifyDomainConfigurator(low, semantic, baseIntent) {
    if (baseIntent.insane) return "meta";
    const sem = semantic || {};
    if (baseIntent.action === "explain_invalid" || baseIntent.action === "ask_compatibility") return "configurator";
    if (baseIntent.action === "ask_options") return "configurator";
    if (sem.questionType === "why_question" && /\b(wool|foam|pad|form)\b/.test(low)) return "configurator";
    if (sem.intentTag === "export_bom" || baseIntent.action === "export_bom") return "configurator";
    if (sem.intentTag === "retrieve" && (sem.attributes.length || sem.document) && /\b(data|sheet|pdf|spec|part|material|pressure|temperature|dimension)\b/.test(low)) {
      return "document_query";
    }
    if ((sem.questionType === "wh_question" || /\b(what|which)\b/.test(low)) && (sem.attributes.length > 0 || /\b(pressure|temperature|dimension|material|part number|model number)\b/.test(low))) {
      return "document_query";
    }
    return "configurator";
  }
  function susoPickAdapterConfigurator(domain) {
    if (domain === "document_query") return { adapter: "document_query", rule: "domain_document_query" };
    return { adapter: "configurator", rule: "domain_configurator" };
  }
  function susoListRejectedAdaptersConfigurator(chosen) {
    return SUSO_ADAPTER_IDS_CONFIGURATOR.filter((id) => id !== chosen).map((id) => ({
      adapter: id,
      reason: "not_selected:winner=" + chosen
    }));
  }
  var SUSO_ADAPTER_IDS_CONFIGURATOR;
  var init_domain = __esm({
    "js/suso/engine/domain.js"() {
      SUSO_ADAPTER_IDS_CONFIGURATOR = ["configurator", "document_query"];
    }
  });

  // js/suso/engine/intent-shell.js
  function susoInitIntentShell(intent, trace) {
    if (!intent._suso) intent._suso = { locks: /* @__PURE__ */ Object.create(null), trace: trace || [], domain: null };
    intent._suso.trace = trace || intent._suso.trace || [];
    return intent;
  }
  function susoNormalizeConfiguratorRequest(adapter, kind, domain, rule, payload) {
    return {
      version: 1,
      kind,
      adapter,
      domain,
      rule,
      payload,
      rejectedAlternatives: susoListRejectedAdaptersConfigurator(adapter)
    };
  }
  var init_intent_shell = __esm({
    "js/suso/engine/intent-shell.js"() {
      init_domain();
    }
  });

  // js/suso/engine/router.js
  function susoRouteConfiguratorInterpretation(intent, text, low, trace, deps) {
    if (!deps || typeof deps.inferFieldsFromText !== "function" || typeof deps.getCurrentMode !== "function") {
      throw new Error("susoRouteConfiguratorInterpretation requires deps: { inferFieldsFromText, getCurrentMode }");
    }
    const sem = intent.semantic || {};
    const pick = susoPickAdapterConfigurator(intent._suso.domain);
    const adapter = pick.adapter;
    if (adapter === "document_query") {
      const payload2 = {
        raw: text,
        questionType: sem.questionType,
        attributes: sem.attributes.slice ? sem.attributes.slice() : [],
        document: sem.document || null,
        execution: { stub: true, note: "Wire workbook / data-sheet resolver (Excel graph, embeddings, or RAG)." }
      };
      const routed2 = susoNormalizeConfiguratorRequest(adapter, "document_query", intent._suso.domain, pick.rule, payload2);
      trace.push({ t: "routing", adapter, kind: routed2.kind, rule: pick.rule, domain: intent._suso.domain });
      return routed2;
    }
    const base = intent;
    if (base.action === "export_bom") {
      const routed2 = susoNormalizeConfiguratorRequest("configurator", "export_bom", intent._suso.domain, "intent_export", { raw: text });
      trace.push({ t: "routing", adapter: "configurator", kind: "export_bom", rule: "intent_export" });
      return routed2;
    }
    if (base.action === "reset_form") {
      const routed2 = susoNormalizeConfiguratorRequest("configurator", "reset_form", intent._suso.domain, "intent_reset", { raw: text });
      trace.push({ t: "routing", adapter: "configurator", kind: "reset_form", rule: "intent_reset" });
      return routed2;
    }
    if (base.action === "explain_invalid") {
      const routed2 = susoNormalizeConfiguratorRequest("configurator", "explain_invalid_state", intent._suso.domain, "why_invalid", {
        raw: text,
        modeHint: deps.getCurrentMode()
      });
      trace.push({ t: "routing", adapter: "configurator", kind: "explain_invalid_state", rule: "why_invalid" });
      return routed2;
    }
    if (base.action === "validate") {
      const routed2 = susoNormalizeConfiguratorRequest("configurator", "validate_form", intent._suso.domain, "validate", { raw: text });
      trace.push({ t: "routing", adapter: "configurator", kind: "validate_form", rule: "validate" });
      return routed2;
    }
    if (base.action === "ask_options") {
      let topic = "unknown";
      if (/\bwheel/.test(low)) topic = "foam_wheel_sizes";
      const routed2 = susoNormalizeConfiguratorRequest("configurator", "ask_options", intent._suso.domain, "options_question", { raw: text, topic });
      trace.push({ t: "routing", adapter: "configurator", kind: "ask_options", rule: "options_question", topic });
      return routed2;
    }
    if (base.action === "ask_compatibility") {
      const routed2 = susoNormalizeConfiguratorRequest("configurator", "ask_compatibility", intent._suso.domain, "compatibility_question", { raw: text });
      trace.push({ t: "routing", adapter: "configurator", kind: "ask_compatibility", rule: "compatibility_question" });
      return routed2;
    }
    const inferred = deps.inferFieldsFromText(low, text, sem, intent._phraseMatches || []);
    const payload = {
      raw: text,
      fields: inferred.fields,
      inferenceNotes: inferred.notes,
      clarifications: inferred.clarifications,
      confirmations: inferred.confirmations || [],
      confidence: inferred.clarifications.length ? "partial" : "high"
    };
    const routed = susoNormalizeConfiguratorRequest("configurator", "set_fields", intent._suso.domain, "fill_partial", payload);
    trace.push({ t: "routing", adapter: "configurator", kind: "set_fields", rule: "fill_partial", confidence: payload.confidence });
    return routed;
  }
  var init_router = __esm({
    "js/suso/engine/router.js"() {
      init_domain();
      init_intent_shell();
    }
  });

  // js/suso/engine/index.js
  var engine_exports = {};
  __export(engine_exports, {
    SUSO_ADAPTER_IDS_CONFIGURATOR: () => SUSO_ADAPTER_IDS_CONFIGURATOR,
    SUSO_PHRASE_PACK_CONFIGURATOR: () => SUSO_PHRASE_PACK_CONFIGURATOR,
    SUSO_PHRASE_PACK_DOCUMENT: () => SUSO_PHRASE_PACK_DOCUMENT,
    interpretIntentRichConfigurator: () => interpretIntentRichConfigurator,
    parseIntentConfigurator: () => parseIntentConfigurator,
    susoBuildConfiguratorSemanticSlots: () => susoBuildConfiguratorSemanticSlots,
    susoClassifyDomainConfigurator: () => susoClassifyDomainConfigurator,
    susoCollectPhraseMatches: () => susoCollectPhraseMatches,
    susoInitIntentShell: () => susoInitIntentShell,
    susoListRejectedAdaptersConfigurator: () => susoListRejectedAdaptersConfigurator,
    susoNormalizeConfiguratorRequest: () => susoNormalizeConfiguratorRequest,
    susoPhraseEntriesForConfigurator: () => susoPhraseEntriesForConfigurator,
    susoPickAdapterConfigurator: () => susoPickAdapterConfigurator,
    susoRouteConfiguratorInterpretation: () => susoRouteConfiguratorInterpretation,
    susoWordishBoundaryOk: () => susoWordishBoundaryOk
  });
  function interpretIntentRichConfigurator(text, deps) {
    if (!deps || typeof deps.inferFieldsFromText !== "function" || typeof deps.getCurrentMode !== "function") {
      throw new Error("interpretIntentRichConfigurator requires deps: { inferFieldsFromText, getCurrentMode }");
    }
    const trace = [];
    const base = parseIntentConfigurator(text);
    const low = String(text || "").toLowerCase();
    const rich = Object.assign({}, base);
    susoInitIntentShell(rich, trace);
    const phraseMatches = susoCollectPhraseMatches(low);
    rich._phraseMatches = phraseMatches;
    rich.semantic = susoBuildConfiguratorSemanticSlots(low, phraseMatches);
    trace.push({
      t: "phrase_layer",
      chunks: phraseMatches.map((m) => ({
        phrase: m.phrase,
        category: m.category,
        canonical: m.canonical,
        span: [m.start, m.end],
        pack: m.pack || null
      })),
      semanticSlots: rich.semantic
    });
    rich._suso.domain = susoClassifyDomainConfigurator(low, rich.semantic, base);
    trace.push({ t: "domain", domain: rich._suso.domain });
    const routed = susoRouteConfiguratorInterpretation(rich, text, low, trace, deps);
    rich.routed = routed;
    trace.push({
      t: "interpretation_path",
      domain: rich._suso.domain,
      adapter: routed.adapter,
      kind: routed.kind,
      rule: routed.rule
    });
    rich.intentTrace = trace;
    return rich;
  }
  var init_engine = __esm({
    "js/suso/engine/index.js"() {
      init_phrase_scan();
      init_phrase_scan();
      init_semantic_slots();
      init_parse_intent();
      init_domain();
      init_intent_shell();
      init_router();
      init_phrase_scan();
      init_semantic_slots();
      init_parse_intent();
      init_domain();
      init_intent_shell();
      init_router();
    }
  });

  // js/suso/session/store.js
  function createSusoSessionStore() {
    return {
      /** @type {string|null} */
      awaitingStep: null,
      /** @type {object|null} */
      undoSnapshot: null
    };
  }
  var init_store = __esm({
    "js/suso/session/store.js"() {
    }
  });

  // js/suso/session/trace.js
  function buildSusoTraceOut(rich, exec) {
    return {
      phraseMatches: (rich._phraseMatches || []).map((m) => ({
        phrase: m.phrase,
        category: m.category,
        canonical: m.canonical,
        pack: m.pack
      })),
      semanticSlots: rich.semantic,
      domain: rich._suso.domain,
      adapter: rich.routed.adapter,
      rule: rich.routed.rule,
      finalRequest: rich.routed,
      execution: exec,
      fullTrace: rich.intentTrace
    };
  }
  var init_trace = __esm({
    "js/suso/session/trace.js"() {
    }
  });

  // js/suso/adapters/document-query-adapter.js
  function buildStubText(routed) {
    const p = routed.payload || {};
    return "Document / data-sheet Q&A is not wired yet. Recognized attributes: " + (p.attributes || []).join(", ") + ". " + (p.execution && p.execution.note ? p.execution.note : "");
  }
  function unwrapSyncComplete(v) {
    if (v == null) return null;
    if (typeof v.then === "function") return null;
    return v;
  }
  function runDocumentQueryAdapter(routed, deps) {
    const stub = buildStubText(routed);
    let llmText = "";
    let getLlm = deps && deps.getLlmAdapter;
    if (typeof getLlm !== "function") {
      return { text: stub, executed: false, stub: true };
    }
    let adapter = null;
    try {
      adapter = getLlm();
    } catch {
      adapter = null;
    }
    if (!adapter || typeof adapter.complete !== "function") {
      return { text: stub, executed: false, stub: true };
    }
    try {
      const raw = adapter.complete({
        prompt: stub,
        context: routed,
        task: "document_query"
      });
      const r = unwrapSyncComplete(raw);
      if (r && typeof r.text === "string" && r.text.trim()) {
        llmText = r.text.trim();
      }
    } catch {
    }
    if (llmText) {
      return { text: llmText, executed: false, stub: true };
    }
    return { text: stub, executed: false, stub: true };
  }
  var init_document_query_adapter = __esm({
    "js/suso/adapters/document-query-adapter.js"() {
    }
  });

  // js/suso/adapters/configurator-adapter.js
  function createConfiguratorAdapter(deps) {
    if (!deps || typeof deps.getCurrentMode !== "function") {
      throw new Error("createConfiguratorAdapter requires ConfiguratorAdapterDeps");
    }
    return function runConfiguratorAdapter(routed) {
      const k = routed.kind;
      const p = routed.payload || {};
      if (k === "document_query") {
        return runDocumentQueryAdapter(routed, deps);
      }
      if (k === "export_bom") {
        deps.exportTestBOM();
        return { text: "Triggered BOM export (same validation as the Download button).", executed: true };
      }
      if (k === "reset_form") {
        deps.triggerResetClick();
        return { text: "Form reset.", executed: true };
      }
      if (k === "validate_form") {
        const v = deps.validateForExport();
        return {
          text: v.ok ? "Validation passed for the current mode." : "Validation: " + (v.msg || "Fix highlighted fields."),
          executed: true
        };
      }
      if (k === "ask_options") {
        if (p.topic === "foam_wheel_sizes") {
          if (deps.getCurrentMode() !== "foam") {
            return { text: "Switch to Foam Pad to inspect wheels for foam geometry.", executed: true };
          }
          const thk = deps.getFoamThickness();
          if (!thk) {
            return { text: "Select a foam thickness first; wheel sizes depend on the THK column mapping.", executed: true };
          }
          const wheels = deps.wheelsForThickness(thk);
          return {
            text: "Wheels available for thickness " + thk + ": " + (wheels.length ? wheels.join(", ") : "(none in sheet for this bucket)"),
            executed: true
          };
        }
        return { text: "Ask a more specific options question (e.g. wheel sizes for this foam).", executed: false };
      }
      if (k === "ask_compatibility") {
        return {
          text: "Compatibility is enforced by the cascading dropdowns and stack resolution. " + deps.explainConfiguratorInvalid(),
          executed: true
        };
      }
      if (k === "explain_invalid_state") {
        const v = deps.validateForExport();
        return {
          text: deps.explainConfiguratorInvalid() + (v.ok ? "" : " Validation message: " + v.msg),
          executed: true
        };
      }
      if (k === "set_fields") {
        const f = Object.assign({}, p.fields);
        delete f._thicknessNum;
        delete f._padNum;
        const res = deps.applyConfiguratorFields(f);
        let msg = "Applied field updates where options matched. ";
        if (p.inferenceNotes && p.inferenceNotes.length) msg += p.inferenceNotes.join(" ");
        if (p.clarifications && p.clarifications.length) msg += " Note: " + p.clarifications.join(" ");
        if (res.skipped && Object.keys(res.skipped).length) msg += " Skipped (no matching option): " + JSON.stringify(res.skipped);
        return { text: msg.trim(), executed: true, applied: res.applied };
      }
      return { text: "Unhandled routed kind: " + k, executed: false };
    };
  }
  var init_configurator_adapter = __esm({
    "js/suso/adapters/configurator-adapter.js"() {
      init_document_query_adapter();
    }
  });

  // js/suso/llm/null-adapter.js
  function createNullSusoLlmAdapter() {
    return {
      complete() {
        try {
          return { text: "", done: true };
        } catch {
          return { text: "", done: true };
        }
      },
      classify() {
        try {
          return { label: null, scores: {} };
        } catch {
          return { label: null, scores: {} };
        }
      },
      embed() {
        try {
          return new Float32Array(0);
        } catch {
          return new Float32Array(0);
        }
      },
      summarize() {
        try {
          return "";
        } catch {
          return "";
        }
      }
    };
  }
  var init_null_adapter = __esm({
    "js/suso/llm/null-adapter.js"() {
    }
  });

  // js/dungeon-embed-entry.js
  var require_dungeon_embed_entry = __commonJS({
    "js/dungeon-embed-entry.js"() {
      init_wire();
      init_engine();
      init_store();
      init_trace();
      init_configurator_adapter();
      init_null_adapter();
      window.SusoEngine = engine_exports;
      window.interpretIntentRichConfigurator = function(text) {
        return interpretIntentRichConfigurator(text, window.SUSO_DEPS);
      };
      window.SusoSession = createSusoSessionStore();
      window.buildSusoTraceOut = buildSusoTraceOut;
      window.createNullSusoLlmAdapter = createNullSusoLlmAdapter;
      if (!window.SUSO_ADAPTER_DEPS) {
        window.SUSO_ADAPTER_DEPS = {
          getCurrentMode: () => window.LCM_HOST && window.LCM_HOST.currentMode || null,
          exportTestBOM: function() {
            console.warn("[Suso] exportTestBOM: standalone dungeon has no LCM export UI.");
          },
          triggerResetClick: function() {
          },
          validateForExport: () => ({ ok: true, msg: "" }),
          explainConfiguratorInvalid: () => "No LCM configurator is mounted in this build.",
          applyConfiguratorFields: () => ({ applied: {}, skipped: {} }),
          wheelsForThickness: () => [],
          getFoamThickness: () => "",
          getLlmAdapter: () => window.SUSO_LLM_ADAPTER
        };
      }
      window.runConfiguratorAdapter = createConfiguratorAdapter(window.SUSO_ADAPTER_DEPS);
    }
  });
  require_dungeon_embed_entry();
})();
