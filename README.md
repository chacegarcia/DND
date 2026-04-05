# Aillumi's Dungeon — Suso engine

## Two entry HTML files

| File | What it is |
|------|------------|
| **`index.html`** | **Dungeon game** — open this for the full game (map, combat, dice, embedded Suso). |
| **`lcm-configurator.html`** | **LCM work app** — Excel-backed foam/wool BOM helper + modular Suso (`js/lcm/`, `js/suso/`). |

## Shared code under `js/`

The **`js/suso/`** and **`js/lcm/`** trees are loaded by **`lcm-configurator.html`** (and by the optional esbuild IIFE). They are **not** the runtime for the monolithic dungeon **`index.html`**.

**Do not** treat `js/dungeon-suso-bundle.iife.js` as source — it is an optional **esbuild output** (`npm run build:suso-iife`). See **`ARCHITECTURE.md`**.

## Run locally

Serve the repo root over HTTP, then open **`index.html`** (game) or **`lcm-configurator.html`** (LCM), e.g. `python3 -m http.server`.

## LCM page script order (reference)

1. Inline host + `LCM_HOST`
2. `js/lcm/wire.js` — `window.SUSO_DEPS`
3. `js/suso/engine/bind.js` — `interpretIntentRichConfigurator`
4. `js/suso/bind-llm.js`, `bind-adapters.js`, `executors-bind.js`

See **`ARCHITECTURE.md`**, **`js/suso/README.md`**, and **`js/lcm/README.md`**.
