/**
 * Host integration surface: registers sync executors for document / navigation / filter / game paths.
 * The dungeon or LCM shell loads this after `engine/bind.js` and after `window.SUSO_DEPS` exists.
 * Executors are **not** chat handlers — they return structured results consumed by the host.
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
