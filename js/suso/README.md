# `js/suso/` — Suso engine

**Purpose:** Deterministic NL interpretation — phrase matches, semantic slots, domain classification, **routing**, and **executor** attachment. Outputs are **routed canonical requests** and **traces**, not conversational replies.

**Shipped host:** The dungeon **`index.html`** embeds an IIFE built from **`js/dungeon-embed-entry.js`**. Rebuild with **`npm run rebuild:game-suso`** (or `build:suso-iife` + `sync:embedded-bundle`). See **`ARCHITECTURE.md`** in this folder.

## Module map

| Area | Role |
|------|------|
| **`packs/`** | Phrase pack **data** (document, LCM, game-world). |
| **`engine/phrase-scan.js`** | Merges packs, longest-match scan. |
| **`engine/semantic-slots.js`** | Slot object from matches + cues. |
| **`engine/parse-intent.js`** | Configurator surface verbs. |
| **`engine/domain.js`** | Adapter family classification. |
| **`engine/router.js`** | Builds `routed`. |
| **`engine/executors.js`** | Canonical shape + host callbacks. |
| **`engine/index.js`** | **`interpretIntentRichConfigurator`**. |
| **`adapters/`** | Configurator + document-query adapters. |
| **`session/`** | Trace + session store. |
| **`llm/`** | Contract + null adapter. |
| **`bind-*.js`**, **`executors-bind.js`** | Window wiring for HTML hosts. |

## Extension points

- **`window.SUSO_LLM_ADAPTER`** — optional completion.
- **`window.SUSO_DEPS`** — `{ inferFieldsFromText, getCurrentMode }`.
- **`window.SUSO_ADAPTER_DEPS`** — configurator adapter deps.
- **`registerDocumentQueryExecutor` / `registerNavigationExecutor` / `registerFilterExecutor` / `registerGameExecutor`** — sync host execution.

## Phrase packs

See **`packs/README.md`**. Add phrases to existing packs or add a new pack file and import it in **`engine/phrase-scan.js`**.
