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

## Optional: edit Suso/LCM and rebuild the embedded bundle

Sources live under **`js/`** (and **`js/dungeon-embed-entry.js`**). After changes:

```bash
npm install
npm run build:suso-iife
```

That writes **`js/dungeon-suso-bundle.iife.js`** (gitignored). To update the game, copy the file contents into the **first** `<script>` block in **`index.html`** (replacing the old embedded bundle), or load that file with a `<script src="...">` if you refactor the page to use an external script.

## Repo layout

- **`index.html`** — Ship this + assets for the game.
- **`js/`** — ES module sources for Suso + LCM stubs used inside the embedded IIFE.
- **`scripts/embed-dungeon-bundle.mjs`** — esbuild step for the IIFE.
