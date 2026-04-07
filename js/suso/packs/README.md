# Phrase packs (`js/suso/packs/`)

**Purpose:** Multi-word strings registered as **reusable concepts** for Suso’s deterministic scan (longest match, word boundaries). Packs are **data**, not game or product logic.

| File | Pack id | Role |
|------|---------|------|
| **`document.js`** | `document` | Data-sheet / industrial / spec language (attributes, materials). |
| **`lcm.js`** | `lcm` | Foam/wool BOM configurator fields and intents. |
| **`game-world.js`** | `game_world` | Hub, Depths, NPCs, economy vocabulary for the dungeon host. |

**Registration:** `engine/phrase-scan.js` merges all packs via `susoPhraseEntriesForConfigurator()` (name kept for backward compatibility). To add a pack, export an array of `{ phrase, category, canonical, pack }` and import it in `phrase-scan.js` merge loop.

**Categories** feed `semantic-slots.js` (e.g. `attribute`, `document`, `location`, `npc`). Add new categories there when you introduce new phrase types.
