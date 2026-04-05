/**
 * Optional IIFE bundle entry (npm run build:dungeon-bundle → js/dungeon-suso-bundle.iife.js).
 * Full app: index.html + js/suso/. window.LCM_HOST is injected via esbuild banner before any module runs.
 */
import "./lcm/wire.js";
import * as SusoEngine from "./suso/engine/index.js";
import { createSusoSessionStore } from "./suso/session/store.js";
import { buildSusoTraceOut } from "./suso/session/trace.js";
import { createConfiguratorAdapter } from "./suso/adapters/configurator-adapter.js";
import { createNullSusoLlmAdapter } from "./suso/llm/null-adapter.js";

window.SusoEngine = SusoEngine;
window.interpretIntentRichConfigurator = function (text) {
  return SusoEngine.interpretIntentRichConfigurator(text, window.SUSO_DEPS);
};

window.SusoSession = createSusoSessionStore();
window.buildSusoTraceOut = buildSusoTraceOut;
window.createNullSusoLlmAdapter = createNullSusoLlmAdapter;

if (!window.SUSO_ADAPTER_DEPS) {
  window.SUSO_ADAPTER_DEPS = {
    getCurrentMode: () => (window.LCM_HOST && window.LCM_HOST.currentMode) || null,
    exportTestBOM: function () {
      console.warn("[Suso] exportTestBOM: IIFE bundle has no LCM export UI (use index.html).");
    },
    triggerResetClick: function () {},
    validateForExport: () => ({ ok: true, msg: "" }),
    explainConfiguratorInvalid: () => "No LCM configurator is mounted in this build.",
    applyConfiguratorFields: () => ({ applied: {}, skipped: {} }),
    wheelsForThickness: () => [],
    getFoamThickness: () => "",
    getLlmAdapter: () => window.SUSO_LLM_ADAPTER,
  };
}
window.runConfiguratorAdapter = createConfiguratorAdapter(window.SUSO_ADAPTER_DEPS);
