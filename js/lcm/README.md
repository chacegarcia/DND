# `js/lcm/` — LCM product layer

Foam/wool **catalog** rules, **wizard** steps, **field inference**, apply/validate, BOM-adjacent helpers. Loaded via **`wire.js`** after `window.LCM_HOST` is set in `index.html`.

**`wire.js`** assigns globals (`recomputeFoam`, `getNextMissingSlot`, `susoInferFieldsFromText`, `window.COL`, etc.) expected by the shell.

**Do not** import LCM from `js/suso/engine` — keep product rules here and inject through `SUSO_DEPS` / host.
