/**
 * Generate PWA icon PNGs from public/logo-askseba.svg.
 * Outputs: favicon-16x16.png, favicon-32x32.png, pwa-192.png, pwa-512.png, apple-touch-icon.png
 * Run: node scripts/generate-pwa-icons.js (from repo root)
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SVG_PATH = path.join(PUBLIC, 'logo-askseba.svg');
// manifest.json background_color
const BG = { r: 254, g: 243, b: 199 };

const outputs = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'pwa-192.png', size: 192 },
  { file: 'pwa-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('Missing source:', SVG_PATH);
    process.exit(1);
  }
  const svgBuffer = fs.readFileSync(SVG_PATH);
  await Promise.all(
    outputs.map(({ file, size }) =>
      sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: BG })
        .png()
        .toFile(path.join(PUBLIC, file))
        .then(() => console.log('Written', file))
    )
  );
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
