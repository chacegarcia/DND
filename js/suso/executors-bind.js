/**
 * Exposes Suso executor registration + harness on window (index.html entry).
 * Load after js/suso/engine/bind.js (window.SusoEngine) and after window.SUSO_DEPS exists.
 */
import * as Exec from "./engine/executors.js";
import { runSusoConfiguratorExecutorHarness } from "./executor-harness.js";

Object.assign(window, {
  registerDocumentQueryExecutor: Exec.registerDocumentQueryExecutor,
  registerNavigationExecutor: Exec.registerNavigationExecutor,
  registerFilterExecutor: Exec.registerFilterExecutor,
  registerConfiguratorExecutor: Exec.registerConfiguratorExecutor,
  registerGameExecutor: Exec.registerGameExecutor,
  resetSusoExecutors: Exec.resetSusoExecutors,
  getSusoExecutorRegistry: Exec.getSusoExecutorRegistry,
  buildCanonicalConfigurator: Exec.buildCanonicalConfigurator,
  normalizeAdapterExecution: Exec.normalizeAdapterExecution,
  susoAttachExecutionToRouted: Exec.susoAttachExecutionToRouted,
  runSusoConfiguratorExecutorHarness: () =>
    runSusoConfiguratorExecutorHarness(window.SUSO_DEPS || { inferFieldsFromText: () => ({}), getCurrentMode: () => null }),
});
