/**
 * Shrinks the catalog images that live in the repo, in place.
 *
 * The hand-curated products still carry the original camera-sized JPG/PNG they
 * were added with — several are over 2 MB, against ~45 KB for the supplier's
 * WebP. A customer scrolling past three of those cards downloads more than the
 * rest of the site put together.
 *
 * Rewrites each oversized file at the same path, with the same name and the
 * same format. Nothing else has to change: the paths in src/data, the image_url
 * column in Supabase and any link already shared all keep working.
 *
 * This is NOT scripts/optimize-images.ts. That one uploads to Supabase Storage
 * and rewrites image_url to an absolute Storage URL, which would undo the
 * decision to serve photos from the repo through Vercel's CDN.
 *
 * Usage: npm run optimize-local-images [-- --dry-run] [-- --min-kb=300]
 */
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { perfumes } from "../src/data";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const MIN_KB = Number(process.argv.find(a => a.startsWith("--min-kb="))?.split("=")[1] ?? 300);

/** Cards render at most ~600px wide; 900 leaves room for retina without bloat. */
const MAX_EDGE = 900;
const JPEG_QUALITY = 82;

const asKb = (bytes: number) => bytes / 1024;

async function shrink(absolutePath: string): Promise<Buffer> {
  const source = readFileSync(absolutePath);
  const pipeline = sharp(source).rotate();
  const { width, height } = await pipeline.metadata();

  if ((width ?? 0) > MAX_EDGE || (height ?? 0) > MAX_EDGE) {
    pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true });
  }

  // Keep the original container so every existing path stays valid.
  const ext = extname(absolutePath).toLowerCase();
  if (ext === ".png") return pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
  if (ext === ".webp") return pipeline.webp({ quality: JPEG_QUALITY }).toBuffer();
  return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

async function main() {
  // One path can back several products; only touch each file once.
  const paths = [...new Set(perfumes.map(perfume => perfume.image))].filter(p => p.startsWith("/"));

  const oversized = paths
    .map(imagePath => ({ imagePath, absolute: join(ROOT, "public", imagePath) }))
    .filter(({ absolute }) => existsSync(absolute))
    .map(entry => ({ ...entry, kb: asKb(statSync(entry.absolute).size) }))
    .filter(entry => entry.kb > MIN_KB)
    .sort((a, b) => b.kb - a.kb);

  console.log(`${paths.length} images referenced by the catalog, ${oversized.length} over ${MIN_KB} kB\n`);

  if (oversized.length === 0) return;

  let before = 0;
  let after = 0;
  let skipped = 0;

  for (const entry of oversized) {
    before += entry.kb;

    if (DRY_RUN) {
      console.log(`  ${entry.kb.toFixed(0).padStart(5)} kB  ${entry.imagePath}`);
      continue;
    }

    try {
      const output = await shrink(entry.absolute);
      const newKb = asKb(output.length);

      // Never write a bigger file than the one already there.
      if (newKb >= entry.kb) {
        skipped += 1;
        after += entry.kb;
        console.log(`  ${entry.kb.toFixed(0).padStart(5)} kB → sin cambio  ${entry.imagePath}`);
        continue;
      }

      writeFileSync(entry.absolute, output);
      after += newKb;
      console.log(
        `  ${entry.kb.toFixed(0).padStart(5)} kB → ${newKb.toFixed(0).padStart(4)} kB  ${entry.imagePath}`
      );
    } catch (error) {
      skipped += 1;
      after += entry.kb;
      console.warn(`  ! no se pudo procesar ${entry.imagePath}: ${String(error)}`);
    }
  }

  if (DRY_RUN) {
    console.log(`\nDry run — ${before.toFixed(0)} kB en total, nada modificado.`);
    return;
  }

  console.log(
    `\n${(before / 1024).toFixed(1)} MB → ${(after / 1024).toFixed(1)} MB ` +
    `(−${(100 - (after / before) * 100).toFixed(0)}%)${skipped ? `, ${skipped} sin tocar` : ""}`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
