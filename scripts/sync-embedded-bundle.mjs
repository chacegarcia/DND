#!/usr/bin/env node
// Injects js/dungeon-suso-bundle.iife.js into index.html between SUSO_EMBEDDED_BUNDLE_START/END markers.
// Run after: npm run build:suso-iife
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlPath = join(root, "index.html");
const bundlePath = join(root, "js/dungeon-suso-bundle.iife.js");

const START = "/* SUSO_EMBEDDED_BUNDLE_START */";
const END = "/* SUSO_EMBEDDED_BUNDLE_END */";

const html = readFileSync(htmlPath, "utf8");
const bundle = readFileSync(bundlePath, "utf8");

const i0 = html.indexOf(START);
const i1 = html.indexOf(END);
if (i0 === -1 || i1 === -1 || i1 < i0) {
  console.error("sync-embedded-bundle: markers not found in index.html (expected " + START + " / " + END + ")");
  process.exit(1);
}

const injected = START + "\n" + bundle.trim() + "\n" + END;
const out = html.slice(0, i0) + injected + html.slice(i1 + END.length);
writeFileSync(htmlPath, out);
console.log("Updated embedded bundle in index.html");
