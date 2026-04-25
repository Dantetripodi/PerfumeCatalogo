import { Perfume, PerfumeCategory, PerfumeCollection, PerfumeInput, Notes } from "../types";
import { perfumesRegulares } from "./perfumesRegulares";
import { perfumesMinis } from "./minis";
import { otrosProductos } from "./otros";
import { perfumesArabes } from "./arabes";

const ID_RANGES = {
  regulares: { start: 1, end: 999 },
  minis: { start: 1000, end: 1999 },
  otros: { start: 2000, end: 2999 },
  arabes: { start: 3000, end: 3999 },
};

function assignIds(
  items: PerfumeInput[],
  startId: number,
  collection: PerfumeCollection
): Perfume[] {
  return items.map((item, index) => normalizePerfume(item, startId + index, collection));
}

const regularesWithIds = assignIds(perfumesRegulares, ID_RANGES.regulares.start, "regular");
const minisWithIds = assignIds(perfumesMinis, ID_RANGES.minis.start, "mini");
const otrosWithIds = assignIds(otrosProductos, ID_RANGES.otros.start, "accesorio");
const arabesWithIds = assignIds(perfumesArabes, ID_RANGES.arabes.start, "arabe");

export const perfumes: Perfume[] = [
  ...regularesWithIds,
  ...minisWithIds,
  ...otrosWithIds,
  ...arabesWithIds,
];

export { perfumesRegulares, perfumesMinis, otrosProductos, perfumesArabes };

function normalizePerfume(item: PerfumeInput, id: number, collection: PerfumeCollection): Perfume {
  const category = normalizeCategory(item.category);
  const stock = item.price === "Consultar" ? "consult" : collection === "arabe" ? "low" : "available";
  const tags = buildTags(item, category, collection, stock);

  return {
    ...item,
    id,
    name: normalizeText(item.name),
    brand: normalizeBrand(item.brand, collection),
    category,
    size: normalizeSize(item.size),
    description: normalizeDescription(item.description),
    notes: normalizeNotes(item.notes),
    collection,
    stock,
    tags,
    ...buildCommercialMetadata(item, category, collection, stock, id),
  };
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeDescription(value: string) {
  return normalizeText(value)
    .replace(/\s+\./g, ".")
    .replace(/\.\./g, ".")
    .replace(/momento\.Cuando/g, "momento. Cuando")
    .replace(/viaje de negocios, es/g, "viaje de negocios, es")
    .replace(/IMPORTANTE\(/g, "IMPORTANTE (");
}

function normalizeBrand(brand: string, collection: PerfumeCollection) {
  const cleanedBrand = normalizeText(brand);
  if (collection === "arabe" || cleanedBrand.toLowerCase() === "arabic" || cleanedBrand.toLowerCase() === "arabes") {
    return "Árabes";
  }
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

function buildTags(item: PerfumeInput, category: PerfumeCategory, collection: PerfumeCollection, stock: Perfume["stock"]) {
  const tags = new Set<string>([category, item.gender]);

  if (collection === "mini") tags.add("mini perfume");
  if (collection === "arabe") tags.add("perfume árabe");
  if (stock === "consult") tags.add("precio a consultar");
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
  id: number
): Pick<Perfume, "isFeatured" | "isBestSeller" | "isNew" | "occasion" | "season" | "intensity" | "longevity" | "whatsappHint"> {
  const text = `${item.name} ${item.description} ${category}`.toLowerCase();
  const isFresh = category.includes("cítrico") || category.includes("acuático") || text.includes("fresco");
  const isSweet = category.includes("vainilla") || text.includes("dulce") || text.includes("caramelo");
  const isIntense = category.includes("oriental") || category.includes("ámbar") || text.includes("intensa") || text.includes("seductor");
  const isFeatured = collection === "arabe" || id < 8 || text.includes("sauvage") || text.includes("good girl") || text.includes("one million");

  return {
    isFeatured,
    isBestSeller: text.includes("sauvage") || text.includes("good girl") || text.includes("yara") || text.includes("one million"),
    isNew: collection === "arabe" && (text.includes("2023") || text.includes("nueva")),
    occasion: isFresh ? "Ideal para uso diario y climas cálidos" : isIntense || isSweet ? "Ideal para noche, salidas y ocasiones especiales" : "Versátil para uso diario",
    season: isFresh ? "Primavera / verano" : isIntense || isSweet ? "Otoño / invierno" : "Todo el año",
    intensity: isIntense ? "intensa" : isFresh ? "suave" : "media",
    longevity: isIntense || collection === "arabe" ? "Duración alta estimada" : "Duración media estimada",
    whatsappHint: stock === "consult"
      ? "Consultá precio y disponibilidad actual antes de confirmar."
      : "Podés pedirlo directo o consultar combinaciones similares.",
  };
}
