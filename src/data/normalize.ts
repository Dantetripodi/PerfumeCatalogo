/**
 * Turns a raw PerfumeInput — from src/data or from a Supabase row — into the
 * Perfume the UI renders: cleaned fields, a slug, search tags and the derived
 * commercial copy.
 *
 * Deliberately imports no product data. src/data/index.ts builds the whole
 * static catalog at module scope, so anything that reached these helpers
 * through it dragged ~250KB of products into the bundle along the way.
 */
import { Notes, Perfume, PerfumeCategory, PerfumeCollection, PerfumeInput, PerfumeRow } from "../types";

export function normalizePerfume(
  item: PerfumeInput,
  id: number,
  collection: PerfumeCollection,
  isFeaturedOverride?: boolean
): Perfume {
  const category = normalizeCategory(item.category);
  const stock = item.price === "Consultar" ? "consult" : "by-order";
  const tags = buildTags(item, category, collection, stock);

  return {
    ...item,
    id,
    name: normalizeText(item.name),
    brand: normalizeBrand(item.brand),
    category,
    size: normalizeSize(item.size),
    description: normalizeDescription(item.description),
    notes: normalizeNotes(item.notes),
    collection,
    stock,
    slug: buildSlug(`${item.name}-${id}`),
    tags,
    ...buildCommercialMetadata(item, category, collection, stock, id, isFeaturedOverride),
  };
}

export function rowToInput(row: PerfumeRow): {
  input: PerfumeInput;
  id: number;
  collection: PerfumeCollection;
  isFeatured: boolean;
} {
  const input: PerfumeInput = {
    name: row.name,
    brand: row.brand,
    price: row.price === null ? "Consultar" : row.price,
    gender: row.gender,
    category: row.category,
    size: row.size,
    image: row.image_url,
    description: row.description,
    notes: row.notes,
  };
  return { input, id: row.id, collection: row.collection, isFeatured: row.is_featured };
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function buildSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeDescription(value: string) {
  return normalizeText(value)
    .replace(/\s+\./g, ".")
    .replace(/\.\./g, ".")
    .replace(/momento\.Cuando/g, "momento. Cuando")
    .replace(/viaje de negocios, es/g, "viaje de negocios, es")
    .replace(/IMPORTANTE\(/g, "IMPORTANTE (");
}

function normalizeBrand(brand: string) {
  const cleanedBrand = normalizeText(brand);
  if (cleanedBrand === "Jaques Ryon") return "Jacques Ryon";
  return cleanedBrand;
}

function normalizeSize(size: string) {
  const cleanedSize = normalizeText(size).toLowerCase();
  return cleanedSize.replace(/ml$/i, "ml");
}

function normalizeCategory(category: PerfumeCategory): PerfumeCategory {
  const cleanedCategory = normalizeText(category).toLowerCase() as PerfumeCategory;
  const categoryMap: Partial<Record<PerfumeCategory, PerfumeCategory>> = {
    aromatica: "aromático",
    perfumeria: "perfumería",
    ambar: "ámbar",
    "ambar floral": "ámbar floral",
    "ambar oriental": "ámbar oriental",
    "ambar especiado": "ámbar especiado",
    "ambar frutal": "ámbar frutal",
    "ambar cítrico": "ámbar cítrico",
    "ambar acuático": "ámbar acuático",
  };

  return categoryMap[cleanedCategory] ?? cleanedCategory;
}

function normalizeNotes(notes: Notes): Notes {
  return {
    top: cleanNotes(notes.top),
    middle: cleanNotes(notes.middle),
    base: cleanNotes(notes.base),
  };
}

function cleanNotes(notes: string[]) {
  return notes
    .map(note => normalizeText(note).replace(/\.$/, ""))
    .filter(Boolean)
    .map(note => note.charAt(0).toUpperCase() + note.slice(1));
}

function buildTags(
  item: PerfumeInput,
  category: PerfumeCategory,
  collection: PerfumeCollection,
  stock: Perfume["stock"]
) {
  const tags = new Set<string>([category, item.gender, item.brand.toLowerCase()]);

  if (collection === "mini") tags.add("mini perfume");
  if (collection === "home") tags.add("home");
  if (collection === "arabe") tags.add("perfume árabe");
  if (collection === "arabic") tags.add("arabic");
  if (collection === "jacques") tags.add("jacques ryon");
  if (collection === "probador") tags.add("probador");

  // The supplier renames every fragrance, so the original it is inspired by is
  // the term customers actually search for. It only lives in the description.
  const inspiredBy = /Inspirado en\s+([^.—]+)/i.exec(item.description);
  if (inspiredBy) tags.add(inspiredBy[1].trim().toLowerCase());

  tags.add(item.size.toLowerCase());
  if (stock === "consult") tags.add("precio a consultar");
  if (stock === "by-order") tags.add("por pedido");
  if (category.includes("vainilla") || item.description.toLowerCase().includes("dulce")) tags.add("dulce");
  if (category.includes("amader")) tags.add("amaderado");
  if (category.includes("floral")) tags.add("floral");
  if (category.includes("cítrico")) tags.add("fresco");
  if (category.includes("oriental") || category.includes("ámbar")) tags.add("intenso");

  return Array.from(tags);
}

function buildCommercialMetadata(
  item: PerfumeInput,
  category: PerfumeCategory,
  collection: PerfumeCollection,
  stock: Perfume["stock"],
  id: number,
  isFeaturedOverride?: boolean
): Pick<
  Perfume,
  "isFeatured" | "isBestSeller" | "isNew" | "occasion" | "season" | "intensity" | "longevity" | "whatsappHint"
> {
  const text = `${item.name} ${item.description} ${category}`.toLowerCase();
  const isFresh = category.includes("cítrico") || category.includes("acuático") || text.includes("fresco");
  const isSweet = category.includes("vainilla") || text.includes("dulce") || text.includes("caramelo");
  const isIntense =
    category.includes("oriental") || category.includes("ámbar") || text.includes("intensa") || text.includes("seductor");
  // When an explicit DB flag is provided (remote path), it is authoritative.
  // When called from the static pipeline (no override), fall back to the heuristic so local data still works.
  const isFeatured =
    isFeaturedOverride !== undefined
      ? isFeaturedOverride
      : collection === "arabe" ||
        collection === "arabic" ||
        id < 8 ||
        text.includes("sauvage") ||
        text.includes("good girl") ||
        text.includes("one million");

  return {
    isFeatured,
    isBestSeller:
      text.includes("sauvage") || text.includes("good girl") || text.includes("yara") || text.includes("one million"),
    isNew: (collection === "arabe" || collection === "arabic") && (text.includes("2023") || text.includes("nueva")),
    occasion: isFresh
      ? "Ideal para uso diario y climas cálidos"
      : isIntense || isSweet
        ? "Ideal para noche, salidas y ocasiones especiales"
        : "Versátil para uso diario",
    season: isFresh ? "Primavera / verano" : isIntense || isSweet ? "Otoño / invierno" : "Todo el año",
    intensity: isIntense ? "intensa" : isFresh ? "suave" : "media",
    longevity:
      isIntense || collection === "arabe" || collection === "arabic"
        ? "Duración alta estimada"
        : "Duración media estimada",
    whatsappHint:
      stock === "consult"
        ? "Consultá precio y disponibilidad actual antes de confirmar."
        : "Producto mayormente por pedido. Consultá disponibilidad y tiempo estimado antes de confirmar.",
  };
}
