# Repository architecture

**Source of truth:** the modular app under `index.html` + `js/`. There is no separate standalone HTML game shell in this repo; an older monolithic page was removed in favor of this layout.

## Host surface

| Layer | Role |
|--------|------|
| **`index.html`** | UI shell, inline host state (`LCM_HOST`, `SUSO_ADAPTER_DEPS`), script **load order**. Not generated — edit here. |
| **`js/lcm/wire.js`** | LCM product wiring: globals, **`window.SUSO_DEPS`** (`inferFieldsFromText`, `getCurrentMode`). Product/domain logic stays in `js/lcm/`. |
| **`js/suso/engine/bind.js`** | Exposes **`interpretIntentRichConfigurator`** on `window` using `SUSO_DEPS`. |
| **`js/suso/executors-bind.js`** | Optional host hooks: **`register*Executor`**, **`resetSusoExecutors`**, harness. |

## Suso engine (`js/suso/`)

| Area | Modules | Owns |
|------|---------|------|
| **Interpretation core** | `engine/index.js`, `parse-intent.js`, `semantic-slots.js`, `phrase-scan.js`, `domain.js`, `intent-shell.js`, `router.js` | NL parse, phrase packs (configurator), semantic slots, domain classification, **configurator** routing. |
| **Phrase / registry** | `phrase-scan.js` (`SUSO_PHRASE_PACK_*`) | Multi-word chunks → categories for the configurator pipeline. |
| **Routing & adapters** | `router.js`, `adapters/configurator-adapter.js`, `adapters/document-query-adapter.js` | Maps `routed.kind` to LCM actions; document path can use LLM or host executor result. |
| **Executors (host callbacks)** | `engine/executors.js`, `executors-bind.js`, `executor-harness.js` | Pluggable sync callbacks + normalized **`routed.execution`** / **`routed.canonical`**. |
| **Session / trace** | `session/` | Trace payload, optional session store. |
| **LLM** | `llm/` | Contract + null adapter; host may set `window.SUSO_LLM_ADAPTER`. |

**LCM-specific** behavior is injected via **`SUSO_DEPS`** and **`SUSO_ADAPTER_DEPS`**, not hard-coded inside the pure phrase/domain helpers.

## Optional build artifact (not source)

| Output | Produced by | Notes |
|--------|-------------|--------|
| **`js/dungeon-suso-bundle.iife.js`** | `npm run build:suso-iife` or `npm run build:dungeon-bundle` → `scripts/embed-dungeon-bundle.mjs` | **Gitignored.** Single-file IIFE from `js/dungeon-embed-entry.js` for tooling or embedding elsewhere. **Do not hand-edit** — regenerate if needed. |

`build:dungeon-bundle` is a legacy script name; prefer **`build:suso-iife`** for clarity. Both run the same command.

## Coupling guidelines

- **`js/suso/engine`** should stay free of LCM catalog imports; use **`deps`** passed into `interpretIntentRichConfigurator`.
- **`js/lcm/`** owns foam/wool rules, wizard, Excel-backed inference.
- **`js/dungeon-embed-entry.js`** is a **bundle entry only** (esbuild); it mirrors globals the main app sets, with stub `SUSO_ADAPTER_DEPS` when no UI is mounted.

For more detail on Suso folders, see **`js/suso/README.md`**. For LCM, see **`js/lcm/README.md`**.
