/**
 * Binds Suso engine entry to window (loaded from index.html after js/lcm/wire.js).
 * Requires window.SUSO_DEPS = { inferFieldsFromText, getCurrentMode }.
 * Executor registration lives in js/suso/executors-bind.js (separate module).
 */
import * as SusoEngine from "./index.js";

window.SusoEngine = SusoEngine;
window.interpretIntentRichConfigurator = function (text) {
  return SusoEngine.interpretIntentRichConfigurator(text, window.SUSO_DEPS);
};
