# `js/suso/` — Suso engine (modular)

**Stable surface:** NL interpretation, routing, phrase/semantic layers, adapter **contracts**, executor **registration**, session store, LLM **interface** + null implementation.

**Shipped host:** The dungeon **`index.html`** embeds an IIFE built from **`js/dungeon-embed-entry.js`** (see **`npm run build:suso-iife`**). That bundle runs **`js/lcm/wire.js`** and Suso binds—there are no separate `<script src="...module">` tags in the shipped game.

## Module map

| Folder / file | Role |
|---------------|------|
| **`engine/index.js`** | **`interpretIntentRichConfigurator(text, deps)`** — main entry; composes parse → phrase → semantic → domain → **router** → execution attach. |
| **`engine/parse-intent.js`** | Configurator-focused surface parse (`configure`, export BOM, etc.). |
| **`engine/phrase-scan.js`** | `SUSO_PHRASE_PACK_DOCUMENT`, `SUSO_PHRASE_PACK_CONFIGURATOR`, phrase matching. |
| **`engine/semantic-slots.js`** | Slot fill from phrase matches. |
| **`engine/domain.js`** | `susoClassifyDomainConfigurator`, adapter pick for **configurator vs document_query**. |
| **`engine/router.js`** | **`susoRouteConfiguratorInterpretation`** — builds `routed` payload; calls **`susoAttachExecutionToRouted`** (`executors.js`). |
| **`engine/executors.js`** | Host **registry** (`registerDocumentQueryExecutor`, …), **`normalizeAdapterExecution`**, canonical shape for `routed.execution`. |
| **`engine/intent-shell.js`** | Intent shell + `susoNormalizeConfiguratorRequest`. |
| **`adapters/`** | **Configurator** runner: export/reset/validate/set_fields/document_query; prefers host executor result when present. |
| **`session/`** | Trace + optional session (`bind-adapters.js`). |
| **`llm/`** | `contract.js`, `null-adapter.js`. |
| **`engine/bind.js`** | Attaches engine to `window` (used by `index.html`). |
| **`executors-bind.js`** | Attaches executor APIs + **`runSusoConfiguratorExecutorHarness`** to `window`. |
| **`executor-harness.js`** | Regression harness for executor registration (dev/console). |
| **`bind-llm.js`**, **`bind-adapters.js`** | LLM default + adapter runner + session. |

## Extension points (no fork of `engine/` required)

- **`window.SUSO_LLM_ADAPTER`** — LLM completion (optional).
- **`window.SUSO_DEPS`** — `{ inferFieldsFromText, getCurrentMode }` from LCM.
- **`window.SUSO_ADAPTER_DEPS`** — configurator adapter deps (export, validate, apply fields, …).
- **`registerDocumentQueryExecutor` / …`** — from **`executors-bind.js`**; sync callbacks for non-stub execution on `routed`.

## Optional IIFE bundle

`js/dungeon-embed-entry.js` + `npm run build:dungeon-bundle` produce **`js/dungeon-suso-bundle.iife.js`** (gitignored). That file is a **build artifact**, not the editable Suso source. See repo root **`ARCHITECTURE.md`**.
