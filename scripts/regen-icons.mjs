/**
 * Regenerate PWA / home-screen icons from public/images/black-logo.png.
 *
 * Fix: the previous icons wrapped a tiny logo inside a huge black square,
 * so when Android's launcher applied its circular / squircle mask the
 * result looked like a small floating logo on a big black disk.
 *
 * New rules:
 *   - **Maskable** icons (used by Android home-screen, TWA): we trim the
 *     source logo to its tight bounding box and rescale it to fill ~80%
 *     of the target canvas — the W3C-recommended maskable safe zone
 *     (https://web.dev/maskable-icon/). The surrounding 10% margin stays
 *     black so circular crops show a clean black edge, not a weird
 *     transparent halo.
 *   - **Apple touch icons** (iOS doesn't mask): logo at 92% for maximum
 *     visual punch.
 *   - **Favicons** (16 / 32): logo at 88% — tiny icons benefit from
 *     bigger content.
 *
 * Uses `sharp` (already present via transitive deps) — no new install.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public/images/black-logo.png');

const BLACK = { r: 0, g: 0, b: 0, alpha: 1 };

async function getTrimmedLogo() {
  // black-logo.png is a 640×640 black canvas with a white wordmark in the
  // middle. Trim the uniform black edge so we can confidently upscale the
  // content into the maskable safe zone.
  const meta = await sharp(SRC).metadata();
  const trimmed = await sharp(SRC)
    .trim({ background: '#000000', threshold: 5 })
    .toBuffer({ resolveWithObject: true });
  console.log(
    `source ${meta.width}×${meta.height} → trimmed ${trimmed.info.width}×${trimmed.info.height}`,
  );
  return trimmed;
}

async function makeIcon(outPath, size, safeRatio, trimmedBuf) {
  const safeW = Math.round(size * safeRatio);
  const safeH = Math.round(size * safeRatio);

  const resized = await sharp(trimmedBuf)
    .resize(safeW, safeH, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BLACK },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);

  console.log(`wrote ${path.relative(ROOT, outPath)} @ ${size}×${size} (safe ${safeRatio})`);
}

async function main() {
  const { data: trimmed } = await getTrimmedLogo();

  // Maskable icons — 80% safe zone so circular launcher crops stay clean.
  // These are declared in manifest.json with purpose: "maskable".
  await makeIcon(path.join(ROOT, 'public/icon-512x512.png'), 512, 0.80, trimmed);
  await makeIcon(path.join(ROOT, 'public/icon-192x192.png'), 192, 0.80, trimmed);

  // "any" purpose — fills more of the canvas since it won't be masked;
  // used by iOS splash, PWA install prompt, some app drawers.
  await makeIcon(path.join(ROOT, 'public/icon-any-512.png'), 512, 0.92, trimmed);

  // Apple touch icon — iOS rounds corners but does NOT mask to circle
  await makeIcon(path.join(ROOT, 'public/apple-touch-icon.png'), 180, 0.92, trimmed);

  // Favicons
  await makeIcon(path.join(ROOT, 'public/favicon-32x32.png'), 32, 0.88, trimmed);
  await makeIcon(path.join(ROOT, 'public/favicon-16x16.png'), 16, 0.88, trimmed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
