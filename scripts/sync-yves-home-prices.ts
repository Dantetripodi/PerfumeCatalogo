/**
 * Updates only Yves Home prices in Supabase from src/data/yvesHome.ts.
 *
 * Usage:
 *   npm run sync-yves-home-prices                 # safe preview, no writes
 *   npm run sync-yves-home-prices -- --dry-run   # explicit preview
 *   npm run sync-yves-home-prices -- --apply     # apply price changes only
 *
 * Required env (.env.local):
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import * as dotenv from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { perfumes } from "../src/data";
import { buildPriceUpdates, RemotePriceRow } from "./yvesHomePriceSyncLogic";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: join(ROOT, ".env.local") });

const APPLY = process.argv.includes("--apply");
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan SUPABASE_URL (o VITE_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY en .env.local."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function formatPrice(price: number | null): string {
  return price === null
    ? "Consultar"
    : `$${price.toLocaleString("es-AR")}`;
}

async function main() {
  const { data, error } = await supabase
    .from("perfumes")
    .select("id,name,price,collection")
    .eq("collection", "home")
    .order("name", { ascending: true });

  if (error) {
    console.error(`No se pudo leer Supabase: ${error.message}`);
    process.exit(1);
  }

  const remoteRows = (data ?? []) as RemotePriceRow[];
  const localRows = perfumes.map(perfume => ({
    name: perfume.name,
    collection: perfume.collection,
    price: perfume.price,
  }));
  const updates = buildPriceUpdates(localRows, remoteRows);

  console.log(`Yves Home local: ${localRows.filter(row => row.collection === "home").length}`);
  console.log(`Yves Home en Supabase: ${remoteRows.length}`);
  console.log(`Precios para actualizar: ${updates.length}`);

  if (updates.length > 0) {
    console.log("");
    for (const update of updates) {
      console.log(`- ${update.name}: ${formatPrice(update.from)} → ${formatPrice(update.to)}`);
    }
  }

  if (!APPLY) {
    console.log("\nSimulación terminada. No se modificó Supabase.");
    console.log("Para aplicar estos cambios: npm run sync-yves-home-prices -- --apply");
    return;
  }

  if (updates.length === 0) {
    console.log("\nNo hay cambios de precios para aplicar.");
    return;
  }

  console.log("\nAplicando únicamente precios y updated_at...");
  for (const [index, update] of updates.entries()) {
    const { error: updateError } = await supabase
      .from("perfumes")
      .update({ price: update.to, updated_at: new Date().toISOString() })
      .eq("id", update.id)
      .eq("collection", "home");

    if (updateError) {
      console.error(`Falló ${update.name}: ${updateError.message}`);
      process.exit(1);
    }

    console.log(`  ${index + 1}/${updates.length} ${update.name}`);
  }

  console.log("\nListo. Se actualizaron solo los precios detectados.");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
