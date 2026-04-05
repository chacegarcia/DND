/**
 * Host-pluggable execution layer (sync). Core interpretation stays deterministic; callbacks are optional.
 * Used by the configurator route (index.html / js/suso/engine/router.js).
 */

/** @type {{ document_query: Function|null, ui_navigation: Function|null, search_filter: Function|null, configurator: Function|null, game: Function|null }} */
const SUSO_EXECUTOR_REGISTRY = {
  document_query: null,
  ui_navigation: null,
  search_filter: null,
  configurator: null,
  game: null,
};

export function registerDocumentQueryExecutor(fn) {
  SUSO_EXECUTOR_REGISTRY.document_query = typeof fn === "function" ? fn : null;
}
export function registerNavigationExecutor(fn) {
  SUSO_EXECUTOR_REGISTRY.ui_navigation = typeof fn === "function" ? fn : null;
}
export function registerFilterExecutor(fn) {
  SUSO_EXECUTOR_REGISTRY.search_filter = typeof fn === "function" ? fn : null;
}
export function registerConfiguratorExecutor(fn) {
  SUSO_EXECUTOR_REGISTRY.configurator = typeof fn === "function" ? fn : null;
}
export function registerGameExecutor(fn) {
  SUSO_EXECUTOR_REGISTRY.game = typeof fn === "function" ? fn : null;
}
export function resetSusoExecutors() {
  SUSO_EXECUTOR_REGISTRY.document_query = null;
  SUSO_EXECUTOR_REGISTRY.ui_navigation = null;
  SUSO_EXECUTOR_REGISTRY.search_filter = null;
  SUSO_EXECUTOR_REGISTRY.configurator = null;
  SUSO_EXECUTOR_REGISTRY.game = null;
}
export function getSusoExecutorRegistry() {
  return { ...SUSO_EXECUTOR_REGISTRY };
}

/**
 * Canonical request (portable); configurator fills segments it knows (same shape as other Suso hosts).
 */
export function buildCanonicalConfigurator(routed, intent, text) {
  const sem = intent.semantic || {};
  const p = routed.payload || {};
  const adapter = routed.adapter;
  const activeSegment =
    adapter === "document_query"
      ? "documentQuery"
      : adapter === "ui_navigation"
        ? "navigation"
        : adapter === "search_filter"
          ? "filter"
          : "configurator";
  return {
    version: 1,
    kind: routed.kind,
    adapter,
    domainClassification: routed.domain,
    routingRule: routed.rule,
    raw: String(text || ""),
    slots: {
      questionType: sem.questionType ?? null,
      intent: sem.intentTag ?? null,
      attributes: (sem.attributes && sem.attributes.slice) ? sem.attributes.slice() : [],
      attribute: (sem.attributes && sem.attributes[0]) || null,
      document: sem.document ?? null,
      source: sem.document ?? null,
      targetItem: sem.targetItem ?? null,
      location: sem.location ?? null,
      entity: sem.entity ?? null,
      comparison: !!sem.comparison,
      domainCue: (sem.domainCue || []).slice(),
    },
    segments: {
      game: null,
      configurator: adapter === "configurator" ? p : null,
      documentQuery: adapter === "document_query" ? p : null,
      navigation: adapter === "ui_navigation" ? (p.navigation || p) : null,
      filter: adapter === "search_filter" ? p : null,
    },
    activeSegment,
  };
}

/**
 * @param {string} adapter
 * @param {string} kind
 * @param {object} partial
 * @param {object} canonical
 * @param {object} payload
 */
export function normalizeAdapterExecution(adapter, kind, partial, canonical, payload) {
  const stub = !!partial.stub;
  let success = partial.success;
  if (success === undefined || success === null) {
    if (partial.error) success = false;
    else if (stub) success = null;
    else success = true;
  } else {
    success = !!success;
  }
  const exec = {
    executed: partial.executed !== undefined ? !!partial.executed : !stub,
    adapter: partial.adapter || adapter,
    kind: partial.kind || kind,
    success,
    result:
      partial.result !== undefined
        ? partial.result
        : partial.query != null
          ? partial.query
          : partial.filter != null
            ? partial.filter
            : partial.delegate != null
              ? partial.delegate
              : null,
    error: partial.error ? String(partial.error) : null,
    stub,
    canonical,
    payload,
    executorRegistered: !!partial.executorRegistered,
  };
  if (partial.note != null) exec.note = partial.note;
  if (partial.delegate) exec.delegate = partial.delegate;
  if (partial.query != null) exec.query = partial.query;
  if (partial.filter != null) exec.filter = partial.filter;
  if (partial.destination != null) exec.destination = partial.destination;
  if (partial.navigation != null) exec.navigation = partial.navigation;
  return exec;
}

function documentStubPartial(routed, payload) {
  return {
    stub: true,
    executed: false,
    adapter: "document_query",
    kind: routed.kind,
    query: {
      attribute: payload.attribute ?? null,
      attributes: payload.attributes || [],
      document: payload.document ?? null,
      source: payload.source != null ? payload.source : payload.document,
      targetItem: payload.targetItem ?? null,
      comparison: !!payload.comparison,
      qualifiers: payload.qualifiers || [],
      questionType: payload.questionType ?? null,
    },
    note: (payload.execution && payload.execution.note) || "No document_query executor registered.",
    executorRegistered: false,
  };
}

/**
 * @param {object} routed
 * @param {{ intent: object, text: string, low: string, deps: object, trace?: array }} ctx
 */
export function susoAttachExecutionToRouted(routed, ctx) {
  const { intent, text, low, deps, trace } = ctx;
  const adapter = routed.adapter;
  const kind = routed.kind;
  const payload = routed.payload || {};
  const canonical = buildCanonicalConfigurator(routed, intent, text);

  const execCtx = {
    adapter,
    kind,
    routingRule: routed.rule,
    intent,
    payload,
    canonical,
    raw: String(text || ""),
    low: String(low || ""),
    deps,
    routed,
  };

  let partial;
  let path = "stub";
  let hostError = null;

  if (adapter === "document_query") {
    const fn = SUSO_EXECUTOR_REGISTRY.document_query;
    if (!fn) {
      partial = documentStubPartial(routed, payload);
      path = "stub";
    } else {
      try {
        const out = fn(execCtx) || {};
        partial = {
          stub: false,
          executed: out.executed !== false,
          success: out.success !== false,
          result: out.result !== undefined ? out.result : out,
          error: out.error || null,
          query: out.query || documentStubPartial(routed, payload).query,
          note: out.note,
          executorRegistered: true,
          adapter: "document_query",
          kind,
        };
        path = "host";
      } catch (err) {
        hostError = String(err.message || err);
        partial = Object.assign(documentStubPartial(routed, payload), {
          success: false,
          error: hostError,
          executorRegistered: true,
        });
        path = "host_error";
      }
    }
  } else if (adapter === "ui_navigation") {
    const fn = SUSO_EXECUTOR_REGISTRY.ui_navigation;
    if (!fn) {
      partial = {
        stub: true,
        executed: false,
        adapter: "ui_navigation",
        kind,
        destination: payload.destination || null,
        note: "No ui_navigation executor registered.",
        executorRegistered: false,
      };
      path = "stub";
    } else {
      try {
        const out = fn(execCtx) || {};
        partial = {
          stub: false,
          executed: out.executed !== false,
          success: out.success !== false,
          result: out.result !== undefined ? out.result : out,
          error: out.error || null,
          destination: out.destination,
          navigation: out.navigation,
          executorRegistered: true,
          adapter: "ui_navigation",
          kind,
        };
        path = "host";
      } catch (err) {
        hostError = String(err.message || err);
        partial = { stub: true, executed: false, error: hostError, executorRegistered: true, adapter: "ui_navigation", kind };
        path = "host_error";
      }
    }
  } else if (adapter === "search_filter") {
    const fn = SUSO_EXECUTOR_REGISTRY.search_filter;
    if (!fn) {
      partial = {
        stub: true,
        executed: false,
        adapter: "search_filter",
        kind,
        filter: payload.filter || payload,
        note: "No search_filter executor registered.",
        executorRegistered: false,
      };
      path = "stub";
    } else {
      try {
        const out = fn(execCtx) || {};
        partial = {
          stub: false,
          executed: out.executed !== false,
          success: out.success !== false,
          result: out.result !== undefined ? out.result : out,
          error: out.error || null,
          filter: out.filter || payload.filter,
          attributes: out.attributes,
          executorRegistered: true,
          adapter: "search_filter",
          kind,
        };
        path = "host";
      } catch (err) {
        hostError = String(err.message || err);
        partial = { stub: true, error: hostError, executorRegistered: true, adapter: "search_filter", kind };
        path = "host_error";
      }
    }
  } else if (adapter === "configurator") {
    const fn = SUSO_EXECUTOR_REGISTRY.configurator;
    if (!fn) {
      partial = {
        stub: false,
        executed: false,
        delegate: "runConfiguratorAdapter",
        success: null,
        note: "Use runConfiguratorAdapter(routed) for LCM side effects.",
        executorRegistered: false,
        adapter: "configurator",
        kind,
      };
      path = "configurator_delegate";
    } else {
      try {
        const out = fn(execCtx) || {};
        partial = {
          stub: false,
          executed: out.executed !== false,
          success: out.success,
          result: out.result,
          error: out.error || null,
          executorRegistered: true,
          adapter: "configurator",
          kind,
          note: out.note,
        };
        path = "host";
      } catch (err) {
        hostError = String(err.message || err);
        partial = { stub: false, success: false, error: hostError, executorRegistered: true, adapter: "configurator", kind };
        path = "host_error";
      }
    }
  } else {
    partial = {
      stub: false,
      executed: false,
      delegate: "game_intent",
      success: null,
      note: "Game / host resolver (not used in LCM configurator).",
      executorRegistered: !!SUSO_EXECUTOR_REGISTRY.game,
      adapter: adapter || "game",
      kind,
    };
    path = "game_delegate";
  }

  const execution = normalizeAdapterExecution(adapter, kind, partial, canonical, payload);
  Object.assign(canonical, {
    executionStub: !!execution.stub,
    executionDelegate: execution.delegate != null ? execution.delegate : null,
  });
  execution.canonical = canonical;

  routed.canonical = canonical;
  routed.execution = execution;

  if (trace) {
    trace.push({
      t: "execution",
      executionDebug: {
        executorFound: !!partial.executorRegistered,
        executionPath: path,
        hostError,
        stub: !!execution.stub,
      },
    });
  }
}
