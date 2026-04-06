# Architecture (game-first)

## Runtime

| Piece | Role |
|-------|------|
| **`index.html`** | Only HTML entry. Two inline scripts: (1) embedded IIFE from `js/` sources—`window.LCM_HOST`, Suso engine, adapters; (2) dungeon game (state, map, combat, UI). |
| **PNG assets** | `bg_main.png`, `dice_tray_bg.png`, `dungeon_tiles_atlas_32.png` (atlas optional). |

No ES module `<script type="module" src="...">` is used—the game is self-contained in `index.html` for deployment.

## Development sources (not loaded directly by the game)

| Path | Role |
|------|------|
| **`js/lcm/`** | LCM catalog/helpers—compiled into the embedded IIFE; stubs satisfy Suso when no Excel UI is mounted. |
| **`js/suso/`** | Suso engine, adapters, session, LLM contract—same bundle. |
| **`js/dungeon-embed-entry.js`** | esbuild entry for the IIFE. |
| **`scripts/embed-dungeon-bundle.mjs`** | Runs esbuild → `js/dungeon-suso-bundle.iife.js`. |

Edit **`js/`**, rebuild with **`npm run build:suso-iife`**, then merge output into **`index.html`**’s first script block (see **`README.md`**).

## Coupling

- **`js/suso/engine`** avoids hard LCM imports; receives **`deps`** at runtime from the bundle wiring.
- Dungeon code in the second script uses **`interpretIntentRichConfigurator`**, **`runConfiguratorAdapter`**, etc., exposed by the first block.
