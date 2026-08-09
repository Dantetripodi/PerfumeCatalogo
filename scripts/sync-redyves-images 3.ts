/**
 * Re-downloads RED YVES product photos that changed since the last import.
 *
 * The supplier embeds the upload timestamp in every filename
 * (producto-3542-1783533157157.webp), so a replaced photo always arrives under a
 * new URL. This compares each product's current imagenUrl against what
 * scripts/redyves-manifest.json recorded and pulls only the differences.
 *
 * Usage: npm run sync-redyves-images [-- --dry-run]
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://redyveshome.com/api/productos";
const ORIGIN = "https://redyveshome.com";
const MANIFEST = join(ROOT, "scripts", "redyves-manifest.json");
const DRY_RUN = process.argv.includes("--dry-run");

interface ManifestEntry {
  sourceUrl: string;
  localPath: string;
}

interface SupplierProduct {
  id: number;
  nombre: string;
  imagenUrl: string | null;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, attempts = 4): Promise<Response | null> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 404) return null;
    } catch {
      // Fall through to the backoff below.
    }
    if (attempt < attempts) await wait(attempt * 1500);
  }
  return null;
}

async function fetchCatalog(): Promise<SupplierProduct[]> {
  const all: SupplierProduct[] = [];

  for (let page = 1; page <= 50; page += 1) {
    const res = await fetchWithRetry(`${API}?page=${page}&limit=100`);
    if (!res) throw new Error(`Could not reach the supplier API (page ${page})`);

    const body = (await res.json()) as {
      productos: SupplierProduct[];
      pagination: { totalPages: number };
    };

    all.push(...body.productos);
    if (page >= body.pagination.totalPages) break;
  }

  return all;
}

async function main() {
  if (!existsSync(MANIFEST)) {
    console.error("No manifest found. Run `npm run import-redyves` first.");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as Record<string, ManifestEntry>;
  console.log("Checking the supplier catalog for updated photos...");

  const catalog = await fetchCatalog();
  const changed: Array<{ product: SupplierProduct; entry: ManifestEntry }> = [];
  const missingLocally: string[] = [];

  for (const product of catalog) {
    const entry = manifest[String(product.id)];
    if (!entry || !product.imagenUrl) continue;

    if (entry.sourceUrl !== product.imagenUrl) {
      changed.push({ product, entry });
    } else if (!existsSync(join(ROOT, "public", entry.localPath))) {
      missingLocally.push(product.nombre);
      changed.push({ product, entry });
    }
  }

  if (changed.length === 0) {
    console.log(`All ${Object.keys(manifest).length} photos are current. Nothing to do.`);
    return;
  }

  console.log(`${changed.length} photo(s) to update${missingLocally.length ? ` (${missingLocally.length} missing from disk)` : ""}:`);
  for (const { product } of changed) console.log(`  - ${product.nombre}`);

  if (DRY_RUN) {
    console.log("\nDry run — nothing was downloaded.");
    return;
  }

  let updated = 0;
  for (const { product, entry } of changed) {
    const res = await fetchWithRetry(`${ORIGIN}${product.imagenUrl}`);
    if (!res) {
      console.warn(`  ! could not fetch the new photo for ${product.nombre}`);
      continue;
    }

    const absolute = join(ROOT, "public", entry.localPath);
    mkdirSync(dirname(absolute), { recursive: true });
    if (existsSync(absolute)) unlinkSync(absolute);
    writeFileSync(absolute, Buffer.from(await res.arrayBuffer()));

    manifest[String(product.id)] = { sourceUrl: product.imagenUrl!, localPath: entry.localPath };
    updated += 1;
    await wait(120);
  }

  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${updated} photo(s) updated. The local paths did not change, so no data file edits are needed.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
