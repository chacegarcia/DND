#!/usr/bin/env node
/**
 * Rebuilds js/dungeon-suso-bundle.iife.js with esbuild and splices it into the standalone dungeon HTML.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlName = "Aillumi_Dungeon_Suso_v9_combat_weapons_health100_fix22_affordance_engine_layers_fix1.html";
const htmlPath = join(root, htmlName);
const bundlePath = join(root, "js/dungeon-suso-bundle.iife.js");
const esbuildBin = join(root, "node_modules/esbuild/bin/esbuild");

const banner =
  "window.LCM_HOST={els:{},foamRows:[],geoRows:[],woolRows:[],stackRows:[],wb:null,currentMode:null,setSelectOptions:function(){},showDebug:function(){},setCurrentMode:function(v){this.currentMode=v;},clearMissing:function(){},markMissing:function(){},setStatus:function(){}};";

execFileSync(
  esbuildBin,
  [
    join(root, "js/dungeon-embed-entry.js"),
    "--bundle",
    "--format=iife",
    "--platform=browser",
    "--legal-comments=none",
    `--banner:js=${banner}`,
    `--outfile=${bundlePath}`,
  ],
  { stdio: "inherit" }
);

const bundle = readFileSync(bundlePath, "utf8");
let html = readFileSync(htmlPath, "utf8");

const startNeedle = '<script>\n/* Embedded `js/` tree';
const gameScriptNeedle = "\n\n<script>\n(()=>{";
const start = html.indexOf(startNeedle);
const gameAt = html.indexOf(gameScriptNeedle, start);

if (start === -1 || gameAt === -1) {
  console.error("Could not find embedded bundle markers in HTML.");
  process.exit(1);
}

const comment =
  "/* Embedded `js/` tree (LCM wire + Suso engine, adapters, session, LLM helpers). Regenerate: npm run build:dungeon-bundle */";
const newBlock = `<script>\n${comment}\n${bundle}\n</script>`;

html = html.slice(0, start) + newBlock + html.slice(gameAt);

writeFileSync(htmlPath, html, "utf8");
console.log("Updated", htmlName, "(embedded", bundle.length, "bytes)");
