# Repository architecture

## Host surface

| Piece | Role |
|-------|------|
| **`index.html`** | **Dungeon game** host: UI, world, chronicle, map, embedded Suso IIFE (first `<script>`), game logic (second `<script>`). Not a generic chat client — narrative and systems are first-class. |
| **`js/suso/`** | **Suso engine** — deterministic interpretation, routing, executors (see **`js/suso/ARCHITECTURE.md`**). |
| **`js/lcm/`** | **LCM product** logic for BOM/configurator; compiled into the embedded bundle, used when those fields are active. |
| **Phrase packs** | **`js/suso/packs/`** — document, LCM, **game-world** (Lumen, Depths, NPCs, Lights vocabulary) as reusable chunks. |

## Suso core vs domain vs game

- **Core:** `js/suso/engine/*` — phrase scan, slots, parse, domain, router, executors; **no** dungeon plot.
- **Domain packs:** Phrase data + classification rules for configurator vs document-query paths; future: explicit navigation/filter routes in router + domain.
- **Game:** Story, Lights, Gate loop, registry copy — in the **game script** in `index.html`; consumes Suso outputs, does not live inside `engine/` as chat text.

## Routed contract

The stable handoff is **`routed`** (+ `intentTrace`, `execution`, `canonical`). Hosts and future projects should implement **`register*Executor`** and read structured payloads — not ad hoc per-line parsing.

## Rebuild embedded bundle

```bash
npm run rebuild:game-suso
```

Sources: **`js/`**. Output: injected into **`index.html`** between `SUSO_EMBEDDED_BUNDLE_*` markers.
