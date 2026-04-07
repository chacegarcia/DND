import { susoPickAdapterConfigurator } from "./domain.js";
import { susoNormalizeConfiguratorRequest } from "./intent-shell.js";
import { susoAttachExecutionToRouted } from "./executors.js";

/**
 * Routes interpreted intent → **routed** canonical request (`kind`, `adapter`, `payload`, `rule`).
 *
 * Extension points (keep deterministic):
 * - Add branches for new `kind` values with explicit predicates (no fuzzy “assistant” routing).
 * - `document_query` builds a structured payload for `registerDocumentQueryExecutor`.
 * - Future: `ui_navigation` / `search_filter` branches once `domain.js` classifies to those adapters.
 *
 * @param {object} deps — host hooks (e.g. LCM `inferFieldsFromText`); not part of phrase scan.
 * @param {function} deps.inferFieldsFromText
 * @param {function} deps.getCurrentMode
 */
export function susoRouteConfiguratorInterpretation(intent, text, low, trace, deps) {
  if (!deps || typeof deps.inferFieldsFromText !== "function" || typeof deps.getCurrentMode !== "function") {
    throw new Error("susoRouteConfiguratorInterpretation requires deps: { inferFieldsFromText, getCurrentMode }");
  }
  const sem = intent.semantic || {};
  const pick = susoPickAdapterConfigurator(intent._suso.domain);
  const adapter = pick.adapter;

  if (adapter === "document_query") {
    const payload = {
      raw: text,
      questionType: sem.questionType,
      attributes: sem.attributes.slice ? sem.attributes.slice() : [],
      attribute: (sem.attributes && sem.attributes[0]) || null,
      document: sem.document || null,
      source: sem.document || null,
      targetItem: sem.targetItem || null,
      comparison: !!sem.comparison,
      qualifiers: (sem.domainCue || []).slice(),
      execution: { stub: true, note: "Wire workbook / data-sheet resolver (Excel graph, embeddings, or RAG)." },
    };
    const routed = susoNormalizeConfiguratorRequest(adapter, "document_query", intent._suso.domain, pick.rule, payload);
    trace.push({ t: "routing", adapter, kind: routed.kind, rule: pick.rule, domain: intent._suso.domain });
    susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
    return routed;
  }

  const base = intent;
  if (base.action === "export_bom") {
    const routed = susoNormalizeConfiguratorRequest("configurator", "export_bom", intent._suso.domain, "intent_export", { raw: text });
    trace.push({ t: "routing", adapter: "configurator", kind: "export_bom", rule: "intent_export" });
    susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
    return routed;
  }
  if (base.action === "reset_form") {
    const routed = susoNormalizeConfiguratorRequest("configurator", "reset_form", intent._suso.domain, "intent_reset", { raw: text });
    trace.push({ t: "routing", adapter: "configurator", kind: "reset_form", rule: "intent_reset" });
    susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
    return routed;
  }
  if (base.action === "explain_invalid") {
    const routed = susoNormalizeConfiguratorRequest("configurator", "explain_invalid_state", intent._suso.domain, "why_invalid", {
      raw: text,
      modeHint: deps.getCurrentMode(),
    });
    trace.push({ t: "routing", adapter: "configurator", kind: "explain_invalid_state", rule: "why_invalid" });
    susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
    return routed;
  }
  if (base.action === "validate") {
    const routed = susoNormalizeConfiguratorRequest("configurator", "validate_form", intent._suso.domain, "validate", { raw: text });
    trace.push({ t: "routing", adapter: "configurator", kind: "validate_form", rule: "validate" });
    susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
    return routed;
  }
  if (base.action === "ask_options") {
    let topic = "unknown";
    if (/\bwheel/.test(low)) topic = "foam_wheel_sizes";
    const routed = susoNormalizeConfiguratorRequest("configurator", "ask_options", intent._suso.domain, "options_question", { raw: text, topic });
    trace.push({ t: "routing", adapter: "configurator", kind: "ask_options", rule: "options_question", topic });
    susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
    return routed;
  }
  if (base.action === "ask_compatibility") {
    const routed = susoNormalizeConfiguratorRequest("configurator", "ask_compatibility", intent._suso.domain, "compatibility_question", { raw: text });
    trace.push({ t: "routing", adapter: "configurator", kind: "ask_compatibility", rule: "compatibility_question" });
    susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
    return routed;
  }

  const inferred = deps.inferFieldsFromText(low, text, sem, intent._phraseMatches || []);
  const payload = {
    raw: text,
    fields: inferred.fields,
    inferenceNotes: inferred.notes,
    clarifications: inferred.clarifications,
    confirmations: inferred.confirmations || [],
    confidence: inferred.clarifications.length ? "partial" : "high",
  };
  const routed = susoNormalizeConfiguratorRequest("configurator", "set_fields", intent._suso.domain, "fill_partial", payload);
  trace.push({ t: "routing", adapter: "configurator", kind: "set_fields", rule: "fill_partial", confidence: payload.confidence });
  susoAttachExecutionToRouted(routed, { intent, text, low, deps, trace });
  return routed;
}
