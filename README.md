# LCM Sample Configurator

Static **HTML + ES modules** app: Excel-backed foam/wool BOM helper with a Suso NL assistant.

## Layout

| Path | Role |
|------|------|
| `index.html` | **Host shell** (source of truth for load order): DOM, auth/load, chat, `window.LCM_HOST`, `SUSO_ADAPTER_DEPS` |
| `js/suso/` | Suso **engine**, **adapters**, **executors**, **session**, **LLM** contract (see `js/suso/README.md`) |
| `js/lcm/` | **LCM product** logic: wizard, inference, catalog geometry; `wire.js` sets `SUSO_DEPS` |

**Do not** treat `js/dungeon-suso-bundle.iife.js` as source — it is an optional **esbuild output** (`npm run build:suso-iife`, alias `build:dungeon-bundle`). See **`ARCHITECTURE.md`**.

## Run locally

Serve the folder over HTTP (ES modules), e.g. `python3 -m http.server`, then open `index.html`.

## Scripts (main app)

1. Inline host + `LCM_HOST`
2. `js/lcm/wire.js` — product globals + `window.SUSO_DEPS`
3. `js/suso/engine/bind.js` — `interpretIntentRichConfigurator`, `SusoEngine`
4. `js/suso/bind-llm.js` — default `window.SUSO_LLM_ADAPTER`
5. `js/suso/bind-adapters.js` — `runConfiguratorAdapter`, session, trace
6. `js/suso/executors-bind.js` — `register*Executor`, `resetSusoExecutors`, harness

See **`ARCHITECTURE.md`**, `js/suso/README.md`, and `js/lcm/README.md` for boundaries.
