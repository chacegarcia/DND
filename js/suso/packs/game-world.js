/**
 * Game / world phrase pack — Lumen Town, Depths, NPCs, plot-spine vocabulary.
 * Same machinery as document/LCM packs: multi-word chunks → categories → semantic slots.
 * Does not hard-wire game logic; hosts map slots to narrative/systems.
 */
export const SUSO_PHRASE_PACK_GAME_WORLD = [
  { phrase: "lumen town", category: "location", canonical: "lumen_town", pack: "game_world" },
  { phrase: "covenant stair", category: "world_feature", canonical: "covenant_stair", pack: "game_world" },
  { phrase: "bright torch", category: "world_feature", canonical: "bright_torch", pack: "game_world" },
  { phrase: "old plaza", category: "location", canonical: "old_plaza", pack: "game_world" },
  { phrase: "depths gate", category: "world_feature", canonical: "depths_gate", pack: "game_world" },
  { phrase: "covenant depths", category: "location", canonical: "covenant_depths", pack: "game_world" },
  { phrase: "ironfold", category: "location", canonical: "ironfold", pack: "game_world" },
  { phrase: "mara", category: "npc", canonical: "mara", pack: "game_world" },
  { phrase: "brant", category: "npc", canonical: "brant", pack: "game_world" },
  { phrase: "elwen", category: "npc", canonical: "elwen", pack: "game_world" },
  { phrase: "mara's lanterns", category: "location", canonical: "maras_lanterns", pack: "game_world" },
  { phrase: "lights", category: "economy", canonical: "lights_currency", pack: "game_world" },
  { phrase: "story lights", category: "economy", canonical: "lights_currency", pack: "game_world" },
];
