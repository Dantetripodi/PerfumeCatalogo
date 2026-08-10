/**
 * Pushes the full local catalog (src/data) into the Supabase `perfumes` table.
 *
 * Supersedes scripts/migrate-to-supabase.ts, which carried its own inline copy
 * of the original 55 products and therefore cannot see the generated
 * src/data/yves*.ts files.
 *
 * Images are NOT uploaded to Supabase Storage. image_url keeps the repo-relative
 * path (/imagenes/...), so the photos are served by Vercel's CDN in production
 * and straight off disk in local dev — no Storage quota, no network needed to
 * see the catalog locally. Photos uploaded later through the admin panel store
 * absolute Storage URLs instead; both forms work as an <img src>.
 *
 * Required env (.env.local):
 *   SUPABASE_URL               (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY  — secret service-role key, bypasses RLS
 *
 * Usage:
 *   npm run sync-catalog -- --dry-run   # report what would change, write nothing
 *   SYNC_FORCE=true npm run sync-catalog # wipe the table and reinsert
 */
import * as dotenv from "dotenv";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { perfumes } from "../src/data";
import type { Perfume } from "../src/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: join(ROOT, ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.env.SYNC_FORCE === "true";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars. Set SUPABASE_URL (or VITE_SUPABASE_URL) and " +
    "SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
    "The service-role key is in Supabase → Settings → API → service_role (secret)."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

interface PerfumeRowInsert {
  name: string;
  brand: string;
  price: number | null;
  gender: string;
  category: string;
  size: string;
  image_url: string;
  description: string;
  notes: Perfume["notes"];
  collection: string;
  is_featured: boolean;
  variants: Perfume["variants"] | null;
  variant_label: string | null;
}

function toRow(perfume: Perfume): PerfumeRowInsert {
  return {
    name: perfume.name,
    brand: perfume.brand,
    price: perfume.price === "Consultar" ? null : Number(perfume.price),
    gender: perfume.gender,
    category: perfume.category,
    size: perfume.size,
    image_url: perfume.image,
    description: perfume.description,
    notes: perfume.notes,
    collection: perfume.collection,
    is_featured: Boolean(perfume.isFeatured),
    variants: perfume.variants?.length ? perfume.variants : null,
    variant_label: perfume.variants?.length ? perfume.variantLabel ?? "Opciones" : null,
  };
}

async function main() {
  console.log("\n=== DTFragancias → Supabase catalog sync ===\n");

  const byCollection = perfumes.reduce<Record<string, number>>((acc, perfume) => {
    acc[perfume.collection] = (acc[perfume.collection] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Local catalog: ${perfumes.length} products`);
  for (const [collection, count] of Object.entries(byCollection).sort()) {
    console.log(`  ${collection.padEnd(10)} ${count}`);
  }

  // Every image_url must resolve under public/ or the card renders a fallback.
  const missingImages = perfumes.filter(
    perfume => perfume.image.startsWith("/") && !existsSync(join(ROOT, "public", perfume.image))
  );
  if (missingImages.length > 0) {
    console.log(`\n${missingImages.length} product(s) point at a file that is not in public/:`);
    for (const perfume of missingImages) console.log(`  - ${perfume.name} → ${perfume.image}`);
  }

  const { count: existing, error: countError } = await supabase
    .from("perfumes")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error(`\nCould not read the perfumes table: ${countError.message}`);
    process.exit(1);
  }

  console.log(`\nRemote table: ${existing ?? 0} rows`);

  if (DRY_RUN) {
    console.log(`\nDry run — would replace ${existing ?? 0} remote rows with ${perfumes.length} local ones.`);
    return;
  }

  if ((existing ?? 0) > 0 && !FORCE) {
    console.error(
      `\nThe table already has ${existing} rows. Aborting so nothing is duplicated.\n` +
      "  Re-run with SYNC_FORCE=true to wipe and reinsert."
    );
    process.exit(1);
  }

  if ((existing ?? 0) > 0) {
    console.log(`\nSYNC_FORCE=true — deleting ${existing} existing rows...`);
    const { error: deleteError } = await supabase.from("perfumes").delete().gte("id", 0);
    if (deleteError) {
      console.error(`Delete failed: ${deleteError.message}`);
      process.exit(1);
    }
  }

  console.log("\nInserting...");
  const rows = perfumes.map(toRow);
  const CHUNK = 200;
  let inserted = 0;

  for (let start = 0; start < rows.length; start += CHUNK) {
    const chunk = rows.slice(start, start + CHUNK);
    const { error: insertError } = await supabase.from("perfumes").insert(chunk);

    if (insertError) {
      console.error(`  Insert failed at row ${start}: ${insertError.message}`);
      process.exit(1);
    }

    inserted += chunk.length;
    console.log(`  ${inserted}/${rows.length}`);
  }

  const { count: final } = await supabase
    .from("perfumes")
    .select("*", { count: "exact", head: true });

  console.log(`\nDone. Remote table now has ${final ?? 0} rows.`);
  if (final !== perfumes.length) {
    console.warn(`Expected ${perfumes.length} — check the output above.`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
