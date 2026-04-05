#!/usr/bin/env node
/**
 * Builds js/dungeon-suso-bundle.iife.js (esbuild IIFE). Output is gitignored — not editable source.
 * Primary app: index.html + js/suso/ + js/lcm/. This bundle is optional (tooling, tests, external embed).
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
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

console.log("Wrote", bundlePath);
