/**
 * DTFragancias — Optimize existing Supabase images
 * ==================================================
 * For every row in the `perfumes` table:
 *   1. Reads the local source image from public/imagenes/
 *   2. Resizes to max 900px longest side, converts to WebP @ quality 82
 *   3. Uploads to Storage at perfumes/{collection}/{basename}.webp (upsert)
 *   4. UPDATEs that row's image_url — preserves id, is_featured, everything else
 *
 * Idempotent: safe to re-run (upsert overwrites, UPDATE is a no-op if URL unchanged).
 *
 * Required env (in .env.local):
 *   SUPABASE_URL              — project URL (or VITE_SUPABASE_URL as fallback)
 *   SUPABASE_SERVICE_ROLE_KEY — secret service-role key (bypasses RLS)
 *
 * Run:
 *   npm run optimize-images
 *
 * IMPORTANT: Remove SUPABASE_SERVICE_ROLE_KEY from .env.local after running.
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// Config / env
// ---------------------------------------------------------------------------

dotenv.config({ path: ".env.local" });

const supabaseUrl =
  process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl) {
  console.error(
    "\n[optimize] ERROR: SUPABASE_URL (or VITE_SUPABASE_URL) is not set in .env.local.\n"
  );
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error(
    "\n[optimize] ERROR: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.\n" +
      "  Find it: Supabase dashboard → Settings → API → service_role (secret)\n" +
      "  IMPORTANT: Remove it from .env.local after running.\n"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Supabase client (service-role — bypasses RLS)
// ---------------------------------------------------------------------------

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Types (minimal — only what we need from the DB)
// ---------------------------------------------------------------------------

interface PerfumeRow {
  id: number;
  name: string;
  collection: string;
  image_url: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_SIDE = 900;
const WEBP_QUALITY = 82;
const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const BUCKET = "perfume-images";

// Local image folder structure matches collection name in most cases,
// but the migrate script used these subfolder names:
const COLLECTION_FOLDER: Record<string, string> = {
  regular:   "perfumes",
  arabe:     "arabes",
  arabic:    "perfumes",
  mini:      "minis",
  accesorio: "perfumes",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Given a current image_url from Supabase Storage, extract the storage key
 * (the part after /object/public/{bucket}/).
 * Returns null if the URL is not a Supabase Storage URL.
 */
function extractStorageKey(imageUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  // Strip any query string
  return imageUrl.slice(idx + marker.length).split("?")[0];
}

/**
 * Try to find the local source file for a perfume row.
 * Strategy:
 *   1. Extract basename from the current storage key.
 *   2. Look it up in the known local folder for that collection.
 *   3. Also try without extension (scan for any matching basename stem).
 */
function findLocalFile(row: PerfumeRow): string | null {
  const storageKey = extractStorageKey(row.image_url);

  // If not a Storage URL, try treating image_url as a local path directly
  const localCandidates: string[] = [];

  if (storageKey) {
    const basename = path.basename(storageKey);
    const folder = COLLECTION_FOLDER[row.collection] ?? "perfumes";
    localCandidates.push(
      path.join(PROJECT_ROOT, "public", "imagenes", folder, basename)
    );
  }

  // Also try all known folders with the basename from the storage key
  if (storageKey) {
    const basename = path.basename(storageKey);
    for (const folder of Object.values(COLLECTION_FOLDER)) {
      const candidate = path.join(PROJECT_ROOT, "public", "imagenes", folder, basename);
      if (!localCandidates.includes(candidate)) {
        localCandidates.push(candidate);
      }
    }
  }

  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

/**
 * Resize image to max MAX_SIDE on the longest side and convert to WebP.
 */
async function optimizeImage(input: string | Buffer): Promise<Buffer> {
  const metadata = await sharp(input).metadata();
  const { width = 0, height = 0 } = metadata;
  const longestSide = Math.max(width, height);

  const pipeline = sharp(input);

  if (longestSide > MAX_SIDE) {
    pipeline.resize(
      width >= height ? MAX_SIDE : undefined,
      height > width ? MAX_SIDE : undefined,
      { fit: "inside", withoutEnlargement: true }
    );
  }

  return pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n=== DTFragancias — optimize-images ===\n");

  // Fetch all rows
  const { data: rows, error: fetchError } = await supabase
    .from("perfumes")
    .select("id, name, collection, image_url")
    .order("id");

  if (fetchError) {
    console.error("[optimize] Failed to fetch rows:", fetchError.message);
    process.exit(1);
  }

  const perfumes = (rows ?? []) as PerfumeRow[];
  console.log(`Found ${perfumes.length} rows.\n`);

  let skipped = 0;
  let alreadyOptimized = 0;
  let optimized = 0;
  let errors = 0;
  let totalOldBytes = 0;
  let totalNewBytes = 0;

  for (const row of perfumes) {
    const localFile = findLocalFile(row);

    // Determine the source image: a local file, or (for admin-uploaded /
    // storage-only images) download the current image straight from Storage.
    let sourceInput: string | Buffer;
    let oldSize: number;

    if (localFile) {
      sourceInput = localFile;
      oldSize = fs.statSync(localFile).size;
    } else {
      const existingKey = extractStorageKey(row.image_url);
      if (!existingKey) {
        console.warn(`  [skip] ${row.name} — not a Supabase Storage URL: ${row.image_url}`);
        skipped++;
        continue;
      }
      if (existingKey.toLowerCase().endsWith(".webp")) {
        console.log(`  [skip] ${row.name} — already WebP`);
        alreadyOptimized++;
        continue;
      }
      try {
        const res = await fetch(row.image_url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        sourceInput = Buffer.from(await res.arrayBuffer());
        oldSize = sourceInput.length;
      } catch (err) {
        console.error(`  [error] ${row.name} — download from Storage failed: ${String(err)}`);
        errors++;
        continue;
      }
    }

    totalOldBytes += oldSize;

    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await optimizeImage(sourceInput);
    } catch (err) {
      console.error(`  [error] ${row.name} — resize failed: ${String(err)}`);
      errors++;
      continue;
    }

    totalNewBytes += optimizedBuffer.length;

    // Derive the WebP storage key from the existing key (replace extension)
    const existingKey = extractStorageKey(row.image_url);
    const baseKey = existingKey
      ? existingKey.replace(/\.[^.]+$/, ".webp")
      : `perfumes/${row.collection}/${(localFile ? path.basename(localFile) : String(row.id)).replace(/\.[^.]+$/, ".webp")}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(baseKey, optimizedBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error(`  [error] ${row.name} — upload failed: ${uploadError.message}`);
      errors++;
      continue;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(baseKey);
    const newUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("perfumes")
      .update({ image_url: newUrl, updated_at: new Date().toISOString() })
      .eq("id", row.id);

    if (updateError) {
      console.error(`  [error] ${row.name} — DB update failed: ${updateError.message}`);
      errors++;
      continue;
    }

    const oldKB = (oldSize / 1024).toFixed(0);
    const newKB = (optimizedBuffer.length / 1024).toFixed(0);
    console.log(`  ✓ ${row.name.padEnd(40)} ${oldKB.padStart(5)} KB → ${newKB.padStart(4)} KB`);
    optimized++;
  }

  const totalOldMB = (totalOldBytes / 1024 / 1024).toFixed(1);
  const totalNewMB = (totalNewBytes / 1024 / 1024).toFixed(1);
  const savedPct = totalOldBytes > 0
    ? Math.round((1 - totalNewBytes / totalOldBytes) * 100)
    : 0;

  console.log("\n=== Summary ===");
  console.log(`  Optimized    : ${optimized}`);
  console.log(`  Already WebP : ${alreadyOptimized}`);
  console.log(`  Skipped      : ${skipped}`);
  console.log(`  Errors       : ${errors}`);
  console.log(`  Size         : ${totalOldMB} MB → ${totalNewMB} MB  (${savedPct}% reduction)`);

  if (errors > 0 || skipped > 0) {
    console.log("\n⚠️  Finished with issues — review output above.\n");
    process.exit(1);
  } else {
    console.log("\n✅  All images optimized (already-WebP images left untouched).\n");
  }
}

main().catch((err: unknown) => {
  console.error("[optimize] Unexpected error:", err);
  process.exit(1);
});
