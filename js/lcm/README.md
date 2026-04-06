# `js/lcm/` — LCM product layer

Foam/wool **catalog** rules, **wizard** steps, **field inference**, apply/validate, BOM-adjacent helpers. In the shipped game, **`wire.js`** runs inside the **embedded IIFE** in **`index.html`** (not as a separate network request). `window.LCM_HOST` is set by the bundle banner before modules load.

**`wire.js`** assigns globals (`recomputeFoam`, `getNextMissingSlot`, `susoInferFieldsFromText`, `window.COL`, etc.) and **`window.SUSO_DEPS`** for Suso.

**Do not** import LCM from `js/suso/engine` — keep product rules here and inject through `SUSO_DEPS` / host.
