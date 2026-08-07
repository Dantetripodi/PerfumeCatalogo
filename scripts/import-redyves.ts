/**
 * Imports the RED YVES supplier catalog into src/data/.
 *
 * The supplier exposes its catalog at /api/productos. Product descriptions are
 * HTML blobs that embed the data our Perfume type needs (olfactory family,
 * top/middle/base notes, the original fragrance each one is inspired by), so we
 * parse them out here instead of hand-typing 400 products.
 *
 * Images are downloaded into public/imagenes/redyves/ rather than hot-linked:
 * the supplier's filenames embed an upload timestamp, so a replaced photo gets a
 * brand new URL and a hot-link would silently rot. scripts/redyves-manifest.json
 * records which remote file each local image came from, which is what
 * sync-redyves-images.ts diffs against.
 *
 * Usage: npm run import-redyves [-- --skip-images]
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { perfumesRegulares } from "../src/data/perfumesRegulares";
import { perfumesMinis } from "../src/data/minis";
import { otrosProductos } from "../src/data/otros";
import { perfumesArabes } from "../src/data/arabes";
import { perfumesArabic } from "../src/data/arabic";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://redyveshome.com/api/productos";
const ORIGIN = "https://redyveshome.com";
const IMAGE_DIR = join(ROOT, "public", "imagenes", "redyves");
const MANIFEST = join(ROOT, "scripts", "redyves-manifest.json");
const SKIP_IMAGES = process.argv.includes("--skip-images");

type Subcategoria = { id: number; nombre: string };

interface SupplierProduct {
  id: number;
  codigo: string | null;
  nombre: string;
  nombreInterno: string | null;
  descripcion: string | null;
  categoriaNombre: string | null;
  volumen: string | null;
  precioFinal: number;
  imagenUrl: string | null;
  agotado: boolean;
  subcategorias: Subcategoria[];
}

type Gender = "masculino" | "femenino" | "unisex";
type Target = "regular" | "probador" | "jacques" | "arabic" | "home" | "skip";

interface Draft {
  name: string;
  brand: string;
  price: number;
  gender: Gender;
  category: string;
  size: string;
  image: string;
  description: string;
  notes: { top: string[]; middle: string[]; base: string[] };
  target: Target;
  sourceId: number;
  sourceImage: string | null;
}

// ---------------------------------------------------------------- fetching

async function fetchCatalog(): Promise<SupplierProduct[]> {
  const all: SupplierProduct[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= 50; page += 1) {
    const res = await fetch(`${API}?page=${page}&limit=100`);
    if (!res.ok) throw new Error(`API responded ${res.status} on page ${page}`);

    const body = (await res.json()) as {
      productos: SupplierProduct[];
      pagination: { totalPages: number };
    };

    for (const product of body.productos) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        all.push(product);
      }
    }

    if (page >= body.pagination.totalPages) break;
  }

  return all;
}

// ------------------------------------------------------- description parsing

/** Strips tags and collapses whitespace so the field regexes can work on plain text. */
function toPlainText(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

interface ParsedDescription {
  pitch: string;
  inspiredBy: string;
  family: string;
  top: string[];
  middle: string[];
  base: string[];
  season: string;
}

function splitNotes(raw: string): string[] {
  return raw
    .replace(/\.$/, "")
    .split(/,| y (?=[a-záéíóúñ])/i)
    .map(note => note.replace(/^[\s.·-]+|[\s.·-]+$/g, "").trim())
    .filter(note => note.length > 1 && note.length < 40)
    .map(note => note.charAt(0).toUpperCase() + note.slice(1));
}

function parseDescription(html: string | null): ParsedDescription {
  const text = toPlainText(html);
  const grab = (re: RegExp): string => {
    const match = re.exec(text);
    return match ? match[1].trim() : "";
  };

  return {
    pitch: text.split(/Inspirado en/i)[0].trim(),
    inspiredBy: grab(/Inspirado en\s+(.+?)\s*(?:Familia olfativa|NOTAS|CÓMO SE SIENTE|$)/i),
    family: grab(/Familia olfativa:\s*([^|]+)\|/i),
    top: splitNotes(grab(/Salida\s*:?\s*(.+?)(?=▸|Coraz|Fondo|CÓMO|$)/i)),
    middle: splitNotes(grab(/Coraz[oó]n\s*:?\s*(.+?)(?=▸|Fondo|CÓMO|$)/i)),
    base: splitNotes(grab(/Fondo\s*:?\s*(.+?)(?=▸|CÓMO|Temporada|$)/i)),
    season: grab(/Temporada ideal:\s*(.+?)(?=Momento|Estela|Duración|$)/i),
  };
}

// ------------------------------------------------------- field normalization

const CATEGORY_UNION = new Set([
  "floral", "amaderado", "oriental", "cítrico", "acuático", "frutal",
  "amaderado especiado", "amaderada dulce", "cítrico acuático", "acuático oriental",
  "floral frutal", "oriental especiado", "oriental floral", "amaderado frutal",
  "cítrico floral", "acuático floral", "aromático especiado", "perfumería", "aromático",
  "ámbar", "ámbar floral", "ámbar oriental", "ámbar especiado", "ámbar frutal",
  "ámbar cítrico", "ámbar acuático", "vainilla dulce", "vainilla especiada",
  // Added for the RED YVES families that had no equivalent.
  "floral amaderado", "oriental amaderado", "aromático amaderado",
  "acuático amaderado", "oriental gourmand",
]);

/** Maps the supplier's free-text olfactory family onto our PerfumeCategory union. */
const FAMILY_WORDS: Record<string, string> = {
  amaderada: "amaderado", amaderado: "amaderado", floral: "floral", oriental: "oriental",
  citrico: "cítrico", acuatico: "acuático", frutal: "frutal", afrutado: "frutal",
  aromatico: "aromático", ambar: "ámbar", amber: "ámbar", especiado: "especiado",
  especiada: "especiado", dulce: "dulce", gourmand: "gourmand", chipre: "amaderado",
  chypre: "amaderado", fougere: "aromático", marino: "acuático", oud: "amaderado",
  cuero: "amaderado", almizcle: "amaderado", powdery: "floral", aldehidico: "floral",
  solar: "floral", verde: "aromático", ahumado: "amaderado", vainilla: "vainilla",
  oscura: "", oscuro: "", intense: "",
};

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function toCategory(family: string, fallback: string): string {
  if (!family) return fallback;

  const words = family
    .toLowerCase()
    .split(/\s+/)
    .map(word => FAMILY_WORDS[stripAccents(word)] ?? word)
    .filter(Boolean);

  const unique = [...new Set(words)];
  const pair = unique.slice(0, 2).join(" ");
  const reversed = unique.slice(0, 2).reverse().join(" ");

  if (CATEGORY_UNION.has(pair)) return pair;
  if (CATEGORY_UNION.has(reversed)) return reversed;
  if (CATEGORY_UNION.has(unique[0])) return unique[0];
  if (unique[0] === "dulce") return "vainilla dulce";
  return fallback;
}

function toGender(product: SupplierProduct): Gender {
  const names = product.subcategorias.map(sub => sub.nombre.toLowerCase());
  if (names.includes("femeninos")) return "femenino";
  if (names.includes("masculinos")) return "masculino";
  if (names.includes("unisex")) return "unisex";

  const text = `${product.nombre} ${product.nombreInterno ?? ""}`.toLowerCase();
  if (/\bfem\b|femme|woman|girl|lady|her\b/.test(text)) return "femenino";
  if (/\bmen\b|homme|hombre|boy|pour homme/.test(text)) return "masculino";
  return "unisex";
}

function toSize(product: SupplierProduct): string {
  if (product.volumen && /\d/.test(product.volumen)) return product.volumen.toLowerCase().trim();

  const fromName = /(\d+)\s*ml/i.exec(product.nombre);
  if (fromName) return `${fromName[1]}ml`;
  return product.volumen?.trim() || "Consultar";
}

/** Title-cases the supplier's ALL-CAPS names, keeping short tokens like YD/EDP upper. */
function toDisplayName(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (cleaned !== cleaned.toUpperCase()) return cleaned;

  return cleaned
    .toLowerCase()
    .replace(/(\d+)\s*ml\b/g, "$1ml")
    .split(" ")
    .map(word => {
      if (/^\d+ml$/.test(word)) return word;
      if (/^(yd|yd12|gh|ad|xs)$/.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/** The supplier pastes the whole product-line copy into every Yves Home item. */
function trimLongCopy(text: string, limit = 320): string {
  if (text.length <= limit) return text;

  const cut = text.slice(0, limit);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("· "));
  return `${(lastStop > 120 ? cut.slice(0, lastStop) : cut).trim()}.`;
}

// ------------------------------------------------------------------ pricing

/**
 * Dante's pricing rule: a fixed peso margin rounded to clean tiers, not a
 * multiplier. Cheap items carry a proportionally bigger markup.
 */
function toSalePrice(cost: number): number {
  const roundTo5k = (value: number) => Math.round(value / 5000) * 5000;

  if (cost < 12_000) return roundTo5k(cost * 2.5);
  if (cost < 20_000) return roundTo5k(cost + 15_000);
  if (cost < 30_000) return 45_000;
  if (cost <= 35_000) return 50_000;
  if (cost <= 40_000) return 55_000;
  // Above 40k is the Arabic line. The lone concentrate above 55k of cost would
  // sell at a loss on that tier, so it gets its own price.
  if (cost > 55_000) return 75_000;
  return 55_000;
}

// ------------------------------------------------------------------ routing

function toTarget(product: SupplierProduct): Target {
  const category = product.categoriaNombre ?? "";
  const subs = product.subcategorias.map(sub => sub.nombre);

  if (category === "Packaging") return "skip";
  if (category === "Probador" || /probador/i.test(product.nombre)) return "probador";
  if (subs.includes("Arabic Collection")) return "arabic";
  if (category === "Yves Home" || category === "Yves beauty and home") return "home";
  if (category === "Jacques") return "jacques";
  return "regular";
}

/** The Jacques Ryon 50ml line is priced as a flat tier, like the minis. */
const JACQUES_PRICE = 18_000;

function toBrand(product: SupplierProduct, target: Target): string {
  if (target === "home") return "Yves Home";
  if (target === "jacques") return "Jacques Ryon";
  if (product.categoriaNombre === "Importados") return "Importados";
  return "Yves Dorgeval";
}

function buildDescription(product: SupplierProduct, parsed: ParsedDescription, target: Target): string {
  const parts: string[] = [];

  if (parsed.pitch) parts.push(parsed.pitch);
  if (parsed.inspiredBy) parts.push(`Inspirado en ${parsed.inspiredBy}.`);
  if (parsed.family) parts.push(`Familia olfativa: ${parsed.family.trim()}.`);
  if (parsed.season) parts.push(`Temporada ideal: ${parsed.season}.`);

  if (parts.length === 0) {
    const name = toDisplayName(product.nombre);
    if (target === "probador") parts.push(`Probador de ${name.replace(/^Probador\s+/i, "")}. Ideal para probar la fragancia antes de llevarte el frasco completo.`);
    else if (target === "home") parts.push(`${name}. Línea Yves Home para perfumar y decorar tu casa.`);
    else parts.push(`${name}. Consultanos por notas y disponibilidad.`);
  }

  const joined = parts.join(" ").replace(/\s+/g, " ").trim();
  return target === "home" ? trimLongCopy(joined) : joined;
}

/**
 * Probadores ship with no description at all, so they inherit the olfactory
 * family and notes from their full-size counterpart when we can find it.
 */
function enrichProbadores(drafts: Draft[]): number {
  const fullSize = new Map<string, Draft>();
  for (const draft of drafts) {
    if (draft.target === "regular" || draft.target === "arabic") {
      fullSize.set(dedupeKey(draft.name), draft);
    }
  }

  let enriched = 0;
  for (const draft of drafts) {
    if (draft.target !== "probador" || draft.notes.top.length > 0) continue;

    const key = dedupeKey(draft.name);
    // "Probador Charm In Black" is the tester for "Charm In Black Vintage", so
    // fall back to a prefix match — but only when it resolves to a single
    // product, otherwise "Probador Bella" would silently grab "Bella Rose".
    let parent = fullSize.get(key);
    if (!parent) {
      const candidates = [...fullSize.entries()].filter(([candidate]) => candidate.startsWith(`${key} `));
      if (candidates.length === 1) parent = candidates[0][1];
    }
    if (!parent) continue;

    draft.category = parent.category;
    draft.gender = parent.gender;
    draft.notes = parent.notes;
    draft.description = `Probador de ${draft.name.replace(/^Probador\s+/i, "").replace(/\s*10ml$/i, "")}. ${parent.description}`;
    enriched += 1;
  }

  return enriched;
}

// ------------------------------------------------------------------ dedupe

/**
 * Collapses a product name to a comparison key: accents, volume suffixes and
 * the "Probador" prefix stripped. Lets "Clayton" match "CLAYTON 120ML" while
 * still keeping "Miss Millionaire Gold" distinct from "Miss Millionaire Fabulous".
 */
function dedupeKey(name: string): string {
  return stripAccents(name)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\bprobador\b/g, " ")
    .replace(/\d+\s*ml\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function existingKeys(): Set<string> {
  const owned = [
    ...perfumesRegulares,
    ...perfumesMinis,
    ...otrosProductos,
    ...perfumesArabes,
    ...perfumesArabic,
  ];
  return new Set(owned.map(item => dedupeKey(item.name)));
}

// ------------------------------------------------------------------- images

interface ManifestEntry {
  sourceUrl: string;
  localPath: string;
}

function loadManifest(): Record<string, ManifestEntry> {
  if (!existsSync(MANIFEST)) return {};
  return JSON.parse(readFileSync(MANIFEST, "utf8")) as Record<string, ManifestEntry>;
}

function imageSlug(name: string, sourceId: number): string {
  const slug = stripAccents(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  return `${slug || "producto"}-${sourceId}`;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** The supplier's server drops the socket after a few hundred sequential pulls. */
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

async function downloadImages(drafts: Draft[]): Promise<Record<string, ManifestEntry>> {
  const manifest = loadManifest();
  let downloaded = 0;
  let reused = 0;
  let failed = 0;

  for (const draft of drafts) {
    if (!draft.sourceImage) continue;

    const key = String(draft.sourceId);
    const absolute = join(ROOT, "public", draft.image);
    const unchanged = manifest[key]?.sourceUrl === draft.sourceImage && existsSync(absolute);

    if (unchanged) {
      reused += 1;
      manifest[key] = { sourceUrl: draft.sourceImage, localPath: draft.image };
      continue;
    }

    // Never record a manifest entry we did not actually download — the sync
    // script trusts the manifest to decide what is already up to date.
    if (SKIP_IMAGES) continue;

    const res = await fetchWithRetry(`${ORIGIN}${draft.sourceImage}`);
    if (!res) {
      console.warn(`  ! could not fetch image for ${draft.name}`);
      failed += 1;
      continue;
    }

    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, Buffer.from(await res.arrayBuffer()));
    manifest[key] = { sourceUrl: draft.sourceImage, localPath: draft.image };
    downloaded += 1;

    if (downloaded % 25 === 0) {
      // Checkpoint so an interrupted run resumes instead of starting over.
      writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
      console.log(`  ...${downloaded} images downloaded`);
    }
    await wait(120);
  }

  console.log(`  images: ${downloaded} downloaded, ${reused} already current, ${failed} failed`);
  return manifest;
}

// ---------------------------------------------------------------- emitting

function emitDataFile(exportName: string, drafts: Draft[], banner: string): string {
  const entries = drafts.map(draft => `  {
    name: ${JSON.stringify(draft.name)},
    brand: ${JSON.stringify(draft.brand)},
    price: ${draft.price},
    gender: ${JSON.stringify(draft.gender)},
    category: ${JSON.stringify(draft.category)},
    size: ${JSON.stringify(draft.size)},
    image: ${JSON.stringify(draft.image)},
    description: ${JSON.stringify(draft.description)},
    notes: {
      top: ${JSON.stringify(draft.notes.top)},
      middle: ${JSON.stringify(draft.notes.middle)},
      base: ${JSON.stringify(draft.notes.base)},
    },
  },`);

  return `// ${banner}
// Generated by scripts/import-redyves.ts — re-run the script instead of editing by hand.
import { PerfumeInput } from "../types";

export const ${exportName}: PerfumeInput[] = [
${entries.join("\n")}
];
`;
}

// --------------------------------------------------------------------- main

async function main() {
  console.log("Fetching RED YVES catalog...");
  const catalog = await fetchCatalog();
  console.log(`  ${catalog.length} products`);

  const drafts: Draft[] = [];
  const owned = existingKeys();
  let skippedOwned = 0;
  let skippedSoldOut = 0;

  for (const product of catalog) {
    const target = toTarget(product);
    if (target === "skip") continue;

    if (product.agotado) {
      skippedSoldOut += 1;
      continue;
    }

    const parsed = parseDescription(product.descripcion);
    const name = toDisplayName(product.nombre);

    if (owned.has(dedupeKey(name))) {
      skippedOwned += 1;
      continue;
    }
    // Probadores get their real category from enrichProbadores below; anything
    // still unmatched stays in the generic bucket rather than claiming a family.
    const fallback = target === "regular" || target === "arabic" ? "oriental" : "perfumería";
    const category = toCategory(parsed.family, fallback);

    drafts.push({
      name,
      brand: toBrand(product, target),
      price: target === "jacques" ? JACQUES_PRICE : toSalePrice(product.precioFinal),
      gender: toGender(product),
      category,
      size: toSize(product),
      image: `/imagenes/redyves/${target}/${imageSlug(name, product.id)}.webp`,
      description: buildDescription(product, parsed, target),
      notes: { top: parsed.top, middle: parsed.middle, base: parsed.base },
      target,
      sourceId: product.id,
      sourceImage: product.imagenUrl,
    });
  }

  const enriched = enrichProbadores(drafts);

  const byTarget = (target: Target) => drafts.filter(draft => draft.target === target);
  console.log(`  skipped: ${skippedOwned} already in the catalog, ${skippedSoldOut} sold out`);
  console.log(`  ${enriched} probadores inherited notes from their full-size counterpart`);
  console.log(
    `  routed: regular ${byTarget("regular").length}, probador ${byTarget("probador").length}, ` +
    `jacques ${byTarget("jacques").length}, arabic ${byTarget("arabic").length}, home ${byTarget("home").length}`
  );

  console.log("Downloading images...");
  const manifest = await downloadImages(drafts);
  mkdirSync(IMAGE_DIR, { recursive: true });
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const files: Array<[string, string, Draft[], string]> = [
    ["yvesRegulares.ts", "yvesRegulares", byTarget("regular"), "RED YVES — perfumes Yves D'orgeval e importados"],
    ["yvesProbadores.ts", "yvesProbadores", byTarget("probador"), "RED YVES — probadores 10ml"],
    ["yvesJacques.ts", "yvesJacques", byTarget("jacques"), "RED YVES — línea Jacques Ryon 50ml"],
    ["yvesArabic.ts", "yvesArabic", byTarget("arabic"), "RED YVES — Arabic Collection"],
    ["yvesHome.ts", "yvesHome", byTarget("home"), "RED YVES — Yves Home (difusores, home spray, velas, jabones)"],
  ];

  for (const [fileName, exportName, items, banner] of files) {
    writeFileSync(join(ROOT, "src", "data", fileName), emitDataFile(exportName, items, banner));
    console.log(`  wrote src/data/${fileName} (${items.length})`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
