/**
 * Convert the source product photography to WebP and emit a manifest carrying
 * dimensions plus a base64 blur placeholder for each image.
 *
 * Run manually after adding or replacing photography:
 *   node scripts/optimize-images.mjs
 *
 * Why a build-time manifest instead of letting next/image handle it: the blur
 * placeholder has to be inlined into the HTML, so it must be known at build
 * time, and reading image dimensions from disk inside a Server Component would
 * make every product page do filesystem I/O it does not need to do.
 */
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.join(process.cwd(), 'public', 'products');
const MANIFEST = path.join(process.cwd(), 'data', 'media-manifest.ts');

// 1400px on the long edge is ample: the largest slot the image is used in is
// the PDP gallery at roughly 46vw on desktop, and next/image downscales from
// here for every smaller slot.
const MAX_EDGE = 1400;
const QUALITY = 82;

const entries = [];

for (const file of (await readdir(SOURCE_DIR)).sort()) {
  if (!file.endsWith('.png')) continue;

  const handle = path.basename(file, '.png');
  const sourcePath = path.join(SOURCE_DIR, file);
  const outputPath = path.join(SOURCE_DIR, `${handle}.webp`);

  const image = sharp(await readFile(sourcePath));
  const meta = await image.metadata();

  const resized = image.resize({
    width: Math.min(meta.width ?? MAX_EDGE, MAX_EDGE),
    withoutEnlargement: true,
  });

  const buffer = await resized.webp({ quality: QUALITY, effort: 6 }).toBuffer();
  await writeFile(outputPath, buffer);

  const outMeta = await sharp(buffer).metadata();

  // A 16px-wide blur, inlined as a data URI. Big enough to convey the shape and
  // the dominant tone, small enough that it costs well under a kilobyte.
  const blur = await sharp(buffer)
    .resize({ width: 16 })
    .webp({ quality: 40 })
    .toBuffer();

  entries.push({
    handle,
    file: `/products/${handle}.webp`,
    width: outMeta.width,
    height: outMeta.height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
    bytes: buffer.length,
  });

  await unlink(sourcePath);
  console.log(
    `${handle.padEnd(18)} ${String(outMeta.width).padStart(4)}x${String(outMeta.height).padEnd(4)}  ` +
      `${(buffer.length / 1024).toFixed(0).padStart(4)} KB  (was ${((meta.size ?? 0) / 1024).toFixed(0)} KB)`,
  );
}

const body = `/**
 * GENERATED FILE — do not edit by hand.
 * Produced by scripts/optimize-images.mjs.
 *
 * Dimensions and blur placeholders for the committed brand photography.
 * Keeping them here means a product page never touches the filesystem and the
 * blur is inlined into the prerendered HTML, so there is no layout shift and no
 * flash of empty frame.
 */
export interface MediaManifestEntry {
  file: string;
  width: number;
  height: number;
  blurDataURL: string;
}

export const MEDIA_MANIFEST: Record<string, MediaManifestEntry> = {
${entries
  .map(
    (e) =>
      `  '${e.handle}': {\n    file: '${e.file}',\n    width: ${e.width},\n    height: ${e.height},\n    blurDataURL:\n      '${e.blurDataURL}',\n  },`,
  )
  .join('\n')}
};

/** Look up committed photography for a handle, if any exists. */
export function mediaFor(handle: string): MediaManifestEntry | undefined {
  return MEDIA_MANIFEST[handle];
}
`;

await writeFile(MANIFEST, body);

const total = entries.reduce((sum, e) => sum + e.bytes, 0);
console.log(`\n${entries.length} images · ${(total / 1024 / 1024).toFixed(2)} MB total`);
