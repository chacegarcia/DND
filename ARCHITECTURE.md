# Repository architecture

**Primary page:** **`index.html`** is the **dungeon game** (monolithic HTML/CSS/JS). It does not load `js/lcm/wire.js` or the modular Suso ES modules; Suso logic is embedded in that file where applicable.

**Work / LCM app:** **`lcm-configurator.html`** is the Excel-backed foam/wool BOM configurator. It is the **modular** host: inline shell + `js/lcm/wire.js`, `js/suso/engine/bind.js`, etc. Use this file for the LCM product + shared Suso engine under `js/`.

| File | Role |
|------|------|
| **`index.html`** | Dungeon game — UI, map, dice, embedded game + Suso hooks. |
| **`lcm-configurator.html`** | LCM host shell, `LCM_HOST`, `SUSO_ADAPTER_DEPS`, script load order for `js/lcm/` + `js/suso/`. |
| **`js/lcm/wire.js`** | LCM wiring: **`window.SUSO_DEPS`**, catalog helpers (used by LCM page only). |
| **`js/suso/engine/bind.js`** | **`interpretIntentRichConfigurator`** on `window` (LCM page). |
| **`js/suso/executors-bind.js`** | Executor registration + harness (LCM page). |

## Suso engine (`js/suso/`)

Shared library for **`lcm-configurator.html`** (and optional **`js/dungeon-embed-entry.js`** IIFE bundle). Not loaded by the monolithic dungeon `index.html`.

| Area | Modules | Owns |
|------|---------|------|
| **Interpretation core** | `engine/index.js`, `parse-intent.js`, semantic slots, phrase packs, `domain.js`, `router.js` | Configurator NL pipeline. |
| **Routing & adapters** | `router.js`, `adapters/*` | Maps `routed.kind` to LCM actions. |
| **Executors** | `engine/executors.js`, `executors-bind.js`, `executor-harness.js` | Host callbacks + **`routed.execution`**. |
| **Session / trace** | `session/` | Trace + session store. |
| **LLM** | `llm/` | Contract + null adapter. |

## Optional build artifact (not source)

| Output | Produced by | Notes |
|--------|-------------|--------|
| **`js/dungeon-suso-bundle.iife.js`** | `npm run build:suso-iife` / `build:dungeon-bundle` → `scripts/embed-dungeon-bundle.mjs` | **Gitignored.** IIFE from `js/dungeon-embed-entry.js`. |

## Coupling guidelines

- **`js/suso/engine`** stays free of LCM catalog imports; use **`deps`** from `interpretIntentRichConfigurator`.
- **`js/lcm/`** owns foam/wool rules for **`lcm-configurator.html`**.

For Suso folders see **`js/suso/README.md`**. For LCM see **`js/lcm/README.md`**.
