/**
 * Kamr app icon generator — iOS light/dark + preview variants.
 * Run from repo root: node assets/logo/export-app-icons.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const MOBILE_ASSETS = join(ROOT, "apps/mobile/assets");

const CREAM = "#EDE4C8";
const BROWN = "#1A1209";
const SIZE = 1024;
/** iOS squircle approximation for preview tiles */
const PREVIEW_RADIUS = 226;
const PREVIEW_INSET = 0;

function logoMarkup(ink, highlight) {
  return `
  <path d="M -50 92 C -48 70, -28 56, -16 64 C -4 72, -2 52, 4 56" stroke="${ink}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <rect x="4" y="20" width="58" height="38" rx="6" stroke="${ink}" stroke-width="2.8" fill="none"/>
  <rect x="20" y="13" width="18" height="9" rx="4" stroke="${ink}" stroke-width="2.8" fill="none"/>
  <circle cx="33" cy="39" r="11" stroke="${ink}" stroke-width="2.8" fill="none"/>
  <circle cx="33" cy="39" r="4.5" fill="${ink}"/>
  <circle cx="30.5" cy="36.5" r="1.8" fill="${highlight}"/>
  <path d="M 60 20 C 70 6, 90 -6, 88 14 C 86 34, 66 32, 70 18 C 74 4, 90 8, 94 -4" stroke="${ink}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  `;
}

/** Lens center — anchor point placed at icon center */
const LENS_CX = 33;
const LENS_CY = 39;
const LOGO_SCALE = 6.0;

function logoTransform() {
  return `translate(${SIZE / 2}, ${SIZE / 2}) scale(${LOGO_SCALE}) translate(${-LENS_CX}, ${-LENS_CY})`;
}

function iconSvg({ bg, ink, highlight, roundedPreview }) {
  const logo = `<g transform="${logoTransform()}">${logoMarkup(ink, highlight)}</g>`;

  const background = roundedPreview
    ? `<rect x="${PREVIEW_INSET}" y="${PREVIEW_INSET}" width="${SIZE - PREVIEW_INSET * 2}" height="${SIZE - PREVIEW_INSET * 2}" rx="${PREVIEW_RADIUS}" fill="${bg}"/>`
    : `<rect width="${SIZE}" height="${SIZE}" fill="${bg}"/>`;

  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">${background}${logo}</svg>`;
}

function renderPng(svg, outPath) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: SIZE },
  });
  writeFileSync(outPath, resvg.render().asPng());
}

mkdirSync(MOBILE_ASSETS, { recursive: true });

const variants = [
  {
    name: "light",
    bg: CREAM,
    ink: BROWN,
    highlight: CREAM,
  },
  {
    name: "dark",
    bg: BROWN,
    ink: CREAM,
    highlight: BROWN,
  },
];

for (const v of variants) {
  const opts = { bg: v.bg, ink: v.ink, highlight: v.highlight };

  // iOS submission — full-bleed square (system applies squircle mask)
  const iosSvg = iconSvg({ ...opts, roundedPreview: false });
  writeFileSync(join(__dirname, `app-icon-${v.name}.svg`), iosSvg);
  const iosPath = join(MOBILE_ASSETS, `ios-icon-${v.name}.png`);
  renderPng(iosSvg, iosPath);
  console.log(`Wrote ${iosPath}`);

  // Preview / marketing — visible rounded square tile
  const previewSvg = iconSvg({ ...opts, roundedPreview: true });
  writeFileSync(join(__dirname, `app-icon-${v.name}-preview.svg`), previewSvg);
  const previewPath = join(__dirname, `app-icon-${v.name}.png`);
  renderPng(previewSvg, previewPath);
  console.log(`Wrote ${previewPath}`);
}

// Default Expo icon + favicon
renderPng(
  iconSvg({ bg: CREAM, ink: BROWN, highlight: CREAM, roundedPreview: false }),
  join(MOBILE_ASSETS, "icon.png")
);
renderPng(
  iconSvg({ bg: CREAM, ink: BROWN, highlight: CREAM, roundedPreview: false }),
  join(MOBILE_ASSETS, "favicon.png")
);
console.log(`Wrote ${join(MOBILE_ASSETS, "icon.png")}`);
console.log(`Wrote ${join(MOBILE_ASSETS, "favicon.png")}`);

// Android adaptive foreground (transparent outside logo area on cream is fine as PNG)
const androidFgSvg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <g transform="${logoTransform()}">${logoMarkup(BROWN, CREAM)}</g>
</svg>`;
renderPng(androidFgSvg, join(MOBILE_ASSETS, "android-icon-foreground.png"));
console.log(`Wrote ${join(MOBILE_ASSETS, "android-icon-foreground.png")}`);

// Android background — solid cream
const androidBgSvg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${SIZE}" height="${SIZE}" fill="${CREAM}"/></svg>`;
renderPng(androidBgSvg, join(MOBILE_ASSETS, "android-icon-background.png"));
renderPng(androidBgSvg, join(MOBILE_ASSETS, "android-icon-monochrome.png"));
console.log("Done.");
