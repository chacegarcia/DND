# Aillumi's Dungeon (Suso engine)

## Entry point

**`index.html`** is the full game: map, combat, dice, AI, and an **embedded** Suso/LCM bundle (first `<script>`) plus dungeon logic (second `<script>`). Nothing under `js/` is loaded at runtime as separate files—the browser only requests this HTML plus assets below.

## Assets (same folder as `index.html`)

| File | Used by |
|------|---------|
| **`bg_main.png`** | Page background |
| **`dice_tray_bg.png`** | Dice tray panel |
| **`dungeon_tiles_atlas_32.png`** | Map atlas (optional; procedural fallback if missing) |
| **`favicon.ico`** | Tab icon |

Serve the directory over HTTP and open **`index.html`**.

## Edit Suso / LCM and refresh the embedded bundle

Sources live under **`js/`** (`dungeon-embed-entry.js` is the esbuild entry). After changes:

```bash
npm install
npm run rebuild:game-suso
```

That runs **`build:suso-iife`** then **`sync:embedded-bundle`**, writing the IIFE into **`index.html`** between `/* SUSO_EMBEDDED_BUNDLE_START */` and `/* SUSO_EMBEDDED_BUNDLE_END */`. See **`js/suso/ARCHITECTURE.md`**.

## Repo layout

- **`index.html`** — Ship this + assets for the game.
- **`js/`** — ES module sources for Suso + LCM stubs used inside the embedded IIFE.
- **`scripts/embed-dungeon-bundle.mjs`** — esbuild step for the IIFE.
