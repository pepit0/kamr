/**
 * Export Kamr logo SVGs to PNG. Run from repo root:
 *   node assets/logo/export-png.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const exports = [
  { svg: "kamr-logo-light.svg", png: "kamr-logo-light.png", width: 512 },
  { svg: "kamr-logo-dark.svg", png: "kamr-logo-dark.png", width: 512 },
  { svg: "kamr-logo-light.svg", png: "kamr-logo-light@2x.png", width: 1024 },
  { svg: "kamr-logo-dark.svg", png: "kamr-logo-dark@2x.png", width: 1024 },
];

for (const item of exports) {
  const svgPath = join(__dirname, item.svg);
  const svg = readFileSync(svgPath, "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: item.width },
    background: "transparent",
  });
  const png = resvg.render().asPng();
  writeFileSync(join(__dirname, item.png), png);
  console.log(`Wrote ${item.png} (${item.width}px wide)`);
}
