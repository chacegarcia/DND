/**
 * Deterministic phrase scan — longest match, wordish boundaries, no ML.
 * Phrase rows come from `js/suso/packs/*` (document, LCM, game-world); add packs there, not here.
 */
import { SUSO_PHRASE_PACK_DOCUMENT } from "../packs/document.js";
import { SUSO_PHRASE_PACK_CONFIGURATOR } from "../packs/lcm.js";
import { SUSO_PHRASE_PACK_GAME_WORLD } from "../packs/game-world.js";

export { SUSO_PHRASE_PACK_DOCUMENT, SUSO_PHRASE_PACK_CONFIGURATOR, SUSO_PHRASE_PACK_GAME_WORLD };

const PACK_SOURCES = [SUSO_PHRASE_PACK_DOCUMENT, SUSO_PHRASE_PACK_CONFIGURATOR, SUSO_PHRASE_PACK_GAME_WORLD];

export function susoWordishBoundaryOk(low, start, len) {
  if (start < 0 || len < 1 || start + len > low.length) return false;
  const before = start > 0 ? low[start - 1] : " ";
  const after = start + len < low.length ? low[start + len] : " ";
  if (/[a-z0-9]/.test(before)) return false;
  if (/[a-z0-9]/.test(after)) return false;
  return true;
}

/** Merges all registered packs, longest phrases first (tie-break stable). */
export function susoPhraseEntriesForConfigurator() {
  const rows = [];
  for (const pack of PACK_SOURCES) {
    for (const row of pack) {
      const ph = String(row.phrase || "").toLowerCase().trim();
      if (!ph) continue;
      rows.push({
        phrase: ph,
        category: row.category || "concept",
        canonical: row.canonical !== undefined ? row.canonical : null,
        pack: row.pack || "unknown",
      });
    }
  }
  rows.sort((a, b) => b.phrase.length - a.phrase.length || String(a.phrase).localeCompare(String(b.phrase)));
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const k = r.phrase + "\0" + r.category + "\0" + (r.canonical || "");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

export function susoCollectPhraseMatches(low) {
  if (!low) return [];
  const phrases = susoPhraseEntriesForConfigurator();
  const out = [];
  let i = 0;
  while (i < low.length) {
    if (/\s/.test(low[i])) {
      i++;
      continue;
    }
    let best = null;
    for (const p of phrases) {
      const plen = p.phrase.length;
      if (plen > low.length - i) continue;
      if (low.slice(i, i + plen) !== p.phrase) continue;
      if (!susoWordishBoundaryOk(low, i, plen)) continue;
      best = p;
      break;
    }
    if (best) {
      out.push(Object.assign({}, best, { start: i, end: i + best.phrase.length }));
      i += best.phrase.length;
    } else {
      i++;
    }
  }
  return out;
}
