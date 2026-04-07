# Suso module architecture

This folder is the **deterministic interpretation engine**, not a chatbot. The stable contract is the **routed** object + **trace** + optional **canonical** execution payload.

## Layers (inside → outside)

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Phrase scan** | `engine/phrase-scan.js`, `packs/*.js` | Longest match, word boundaries; data-driven packs (document, LCM, game-world). |
| **Semantic slots** | `engine/semantic-slots.js` | Project matches + light regex into structured slots (`intent`, `questionType`, `attributes`, `entity`, `location`, …). |
| **Surface parse** | `engine/parse-intent.js` | Configurator verbs (export BOM, validate, …). |
| **Intent shell** | `engine/intent-shell.js` | Locks, trace container, normalized request envelope. |
| **Domain classification** | `engine/domain.js` | Choose adapter **family** (`configurator` vs `document_query`, …). |
| **Routing** | `engine/router.js` | Build `routed` (`kind`, `adapter`, `rule`, `payload`). |
| **Executors** | `engine/executors.js` | Attach **execution** via host-registered callbacks; stubs are first-class. |
| **Adapters** | `adapters/*` | Configurator + document-query runners (LCM-oriented). |

## What is *not* Suso core

- **Game narrative, Lights economy, map rendering** — live in the host (`index.html` game script) and game state; Suso supplies interpretation + traces the host consumes.
- **Excel / workbook I/O** — LCM under `js/lcm/`; injected through `SUSO_DEPS` / `SUSO_ADAPTER_DEPS`.

## Phrase packs

Add rows in `packs/document.js`, `packs/lcm.js`, or `packs/game-world.js`. Registering a new file requires importing it in `engine/phrase-scan.js` (`PACK_SOURCES`).

## Host integration (future / other projects)

1. Set `window.SUSO_DEPS` (`inferFieldsFromText`, `getCurrentMode` — can be no-ops).
2. Set `window.SUSO_ADAPTER_DEPS` for configurator adapter needs.
3. Call `interpretIntentRichConfigurator(text, deps)` from `engine/index.js` (or bundled IIFE).
4. Register executors: `registerDocumentQueryExecutor`, `registerNavigationExecutor`, `registerFilterExecutor`, etc., from `executors-bind.js`.
5. Read `routed`, `intentTrace`, and `routed.execution` / `routed.canonical` — **do not** treat as free-form chat text.

## Build artifacts

- `npm run build:suso-iife` → `js/dungeon-suso-bundle.iife.js` (gitignored).
- `npm run sync:embedded-bundle` → injects that file into `index.html` between bundle markers.

Editable source is **`js/`**, not the generated IIFE.
