/**
 * Regression harness for Suso host executors (loads after bind.js + SusoEngine).
 */
import { interpretIntentRichConfigurator } from "./engine/index.js";
import {
  resetSusoExecutors,
  registerDocumentQueryExecutor,
  registerNavigationExecutor,
  registerFilterExecutor,
  susoAttachExecutionToRouted,
} from "./engine/executors.js";

/**
 * @param {{ inferFieldsFromText: function, getCurrentMode: function }} deps
 */
export function runSusoConfiguratorExecutorHarness(deps) {
  const errors = [];

  resetSusoExecutors();
  let r = interpretIntentRichConfigurator("what is the pressure rating", deps);
  if (!r.routed.execution || !r.routed.execution.stub || r.routed.execution.executorRegistered) {
    errors.push({ case: "document_no_executor", execution: r.routed && r.routed.execution });
  }

  let docCtx = null;
  registerDocumentQueryExecutor((ctx) => {
    docCtx = ctx;
    return { success: true, result: { answer: "mock" }, query: ctx.payload };
  });
  r = interpretIntentRichConfigurator("show operating temperature", deps);
  if (!r.routed.execution || !r.routed.execution.executorRegistered || r.routed.execution.stub) {
    errors.push({ case: "document_mock", execution: r.routed && r.routed.execution });
  }
  if (!docCtx || !docCtx.canonical || !docCtx.payload) {
    errors.push({ case: "document_ctx", docCtx });
  }
  if (!r.routed.execution.result || r.routed.execution.result.answer !== "mock") {
    errors.push({ case: "document_result", result: r.routed.execution.result });
  }

  let navCtx = null;
  registerNavigationExecutor((ctx) => {
    navCtx = ctx;
    return { success: true, result: { ok: true }, destination: "panel-a" };
  });
  const fakeRouted = {
    version: 1,
    adapter: "ui_navigation",
    kind: "navigation",
    domain: "navigation",
    rule: "test",
    payload: { destination: "panel-a", raw: "go" },
  };
  const fakeIntent = { semantic: {}, raw: "go" };
  susoAttachExecutionToRouted(fakeRouted, { intent: fakeIntent, text: "go", low: "go", deps, trace: [] });
  if (!fakeRouted.execution.executorRegistered || fakeRouted.execution.stub) {
    errors.push({ case: "nav_mock", execution: fakeRouted.execution });
  }
  if (!navCtx || !navCtx.canonical) {
    errors.push({ case: "nav_ctx", navCtx });
  }

  let filtCtx = null;
  registerFilterExecutor((ctx) => {
    filtCtx = ctx;
    return { success: true, result: { ids: [1, 2] } };
  });
  const fakeFilter = {
    version: 1,
    adapter: "search_filter",
    kind: "filter",
    domain: "world",
    rule: "test",
    payload: { filter: { hint: "x" }, raw: "filter" },
  };
  susoAttachExecutionToRouted(fakeFilter, { intent: { semantic: {} }, text: "filter", low: "filter", deps, trace: [] });
  if (!fakeFilter.execution.executorRegistered || fakeFilter.execution.stub) {
    errors.push({ case: "filter_mock", execution: fakeFilter.execution });
  }
  if (!filtCtx || !filtCtx.payload) {
    errors.push({ case: "filter_ctx", filtCtx });
  }

  resetSusoExecutors();
  const pass = errors.length === 0;
  return { pass, errors };
}
