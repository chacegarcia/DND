/**
 * Document / data-sheet phrase pack — reusable across hosts (not game-specific).
 * Categories align with semantic slot filling (attribute, document, intent).
 * Longest phrase wins at scan time (see phrase-scan.js).
 */
export const SUSO_PHRASE_PACK_DOCUMENT = [
  { phrase: "pressure rating", category: "attribute", canonical: "pressure rating", pack: "document" },
  { phrase: "operating temperature", category: "attribute", canonical: "operating temperature", pack: "document" },
  { phrase: "tensile strength", category: "attribute", canonical: "tensile strength", pack: "document" },
  { phrase: "hardness", category: "attribute", canonical: "hardness", pack: "document" },
  { phrase: "dimensions", category: "attribute", canonical: "dimensions", pack: "document" },
  { phrase: "chemical resistance", category: "attribute", canonical: "chemical resistance", pack: "document" },
  { phrase: "part number", category: "attribute", canonical: "part number", pack: "document" },
  { phrase: "model number", category: "attribute", canonical: "model number", pack: "document" },
  { phrase: "material", category: "attribute", canonical: "material", pack: "document" },
  { phrase: "data sheet", category: "document", canonical: "data sheet", pack: "document" },
  { phrase: "spec sheet", category: "document", canonical: "spec sheet", pack: "document" },
  { phrase: "msds", category: "document", canonical: "msds", pack: "document" },
  { phrase: "polyurethane sheet", category: "material_product", canonical: "polyurethane sheet", pack: "document" },
  { phrase: "black oxide screw", category: "material_product", canonical: "black oxide screw", pack: "document" },
];
