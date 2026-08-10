/**
 * Collects the RED YVES product variants — the scent, colour or flavour a
 * product comes in.
 *
 * /api/productos returns one row per product with a single representative
 * `varianteNombre` and a `variantesCount`, so the listing alone hides most of
 * what the supplier sells: "Jabones Exfoliantes" is one row and forty-four
 * scents. /api/variantes answers 401, but the public product page embeds the
 * full list in its RSC payload, which is what this reads.
 *
 * Writes scripts/redyves-variants.json keyed by supplier product id, for
 * import-redyves.ts to fold into the generated data files.
 *
 * Usage: npm run fetch-redyves-variants
 */
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://redyveshome.com/api/productos";
const ORIGIN = "https://redyveshome.com";
const OUTPUT = join(ROOT, "scripts", "redyves-variants.json");

interface SupplierProduct {
  id: number;
  slug: string;
  nombre: string;
  variantesCount: number;
}

export interface ScrapedVariant {
  code: string;
  name: string;
  price: number | null;
  inStock: boolean;
  image: string | null;
}

export interface ScrapedVariantGroup {
  /** What the choice is called on the supplier's page: "Aroma", "Body Splash"… */
  label: string | null;
  variants: ScrapedVariant[];
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, attempts = 4): Promise<string | null> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
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
    const body = await fetchWithRetry(`${API}?page=${page}&limit=100`);
    if (!body) throw new Error(`Could not reach the supplier API (page ${page})`);

    const parsed = JSON.parse(body) as {
      productos: SupplierProduct[];
      pagination: { totalPages: number };
    };

    all.push(...parsed.productos);
    if (page >= parsed.pagination.totalPages) break;
  }

  return all;
}

/** Rebuilds the RSC payload Next.js streams as a series of pushed string chunks. */
function readRscPayload(html: string): string {
  const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)];
  let payload = "";

  for (const [, raw] of chunks) {
    try {
      payload += JSON.parse(`"${raw}"`);
    } catch {
      // A chunk that will not parse on its own is not worth failing the page for.
    }
  }

  return payload;
}

/**
 * Reads the `variantes` array out of the payload by balancing brackets rather
 * than with a regex: entries carry nested `imagenes` arrays, so a lazy match
 * stops at the first inner bracket and a greedy one runs past the end.
 */
function extractJsonArray(payload: string, key: string): string | null {
  const marker = `"${key}":[`;
  const start = payload.indexOf(marker);
  if (start === -1) return null;

  const open = start + marker.length - 1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = open; i < payload.length; i += 1) {
    const char = payload[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) return payload.slice(open, i + 1);
    }
  }

  return null;
}

interface RawVariant {
  codigo?: string;
  variante_nombre?: string;
  precio?: number;
  disponible?: boolean;
  stock?: number;
  imagenes?: Array<{ url?: string; es_principal?: number }>;
}

function parseVariants(html: string): ScrapedVariantGroup | null {
  const payload = readRscPayload(html);
  const rawArray = extractJsonArray(payload, "variantes");
  if (!rawArray) return null;

  let parsed: RawVariant[];
  try {
    parsed = JSON.parse(rawArray) as RawVariant[];
  } catch {
    return null;
  }

  const labelMatch = /"variantLabel":"([^"]*)"/.exec(payload);

  const variants = parsed
    .filter(variant => variant.variante_nombre)
    .map<ScrapedVariant>(variant => {
      const principal = variant.imagenes?.find(image => image.es_principal === 1) ?? variant.imagenes?.[0];
      return {
        code: variant.codigo ?? "",
        name: String(variant.variante_nombre).trim(),
        price: typeof variant.precio === "number" ? variant.precio : null,
        inStock: variant.disponible !== false && (variant.stock ?? 0) > 0,
        image: principal?.url ?? null,
      };
    });

  return variants.length > 0 ? { label: labelMatch?.[1] || null, variants } : null;
}

async function main() {
  console.log("Fetching the RED YVES catalog...");
  const catalog = await fetchCatalog();

  const targets = catalog.filter(product => product.variantesCount > 1);
  console.log(`  ${catalog.length} products, ${targets.length} with more than one variant\n`);

  const existing: Record<string, ScrapedVariantGroup> = existsSync(OUTPUT)
    ? (JSON.parse(readFileSync(OUTPUT, "utf8")) as Record<string, ScrapedVariantGroup>)
    : {};

  const collected: Record<string, ScrapedVariantGroup> = { ...existing };
  let scraped = 0;
  let failed = 0;

  for (const product of targets) {
    const html = await fetchWithRetry(`${ORIGIN}/catalogo/producto/${product.slug}`);
    const group = html ? parseVariants(html) : null;

    if (!group) {
      failed += 1;
      console.warn(`  ! ${product.nombre} — no variants found`);
      await wait(150);
      continue;
    }

    collected[String(product.id)] = group;
    scraped += 1;

    if (scraped % 10 === 0) {
      writeFileSync(OUTPUT, `${JSON.stringify(collected, null, 2)}\n`);
      console.log(`  ...${scraped}/${targets.length}`);
    }

    await wait(150);
  }

  writeFileSync(OUTPUT, `${JSON.stringify(collected, null, 2)}\n`);

  const total = Object.values(collected).reduce((sum, group) => sum + group.variants.length, 0);
  console.log(`\n${scraped} products scraped, ${failed} without variants.`);
  console.log(`${total} variants across ${Object.keys(collected).length} products.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
