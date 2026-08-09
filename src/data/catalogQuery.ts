/**
 * Searching, filtering and sorting the catalog — plain functions over plain
 * arrays, with no React and no data source.
 *
 * This is the part of the catalog that decides what a customer sees, so it is
 * kept free of hooks: it can be reasoned about, reused and tested by calling it
 * with an array and reading the result.
 */
import { Perfume } from "../types";

export interface CatalogFilters {
  collection: string;
  line: string;
  brand: string;
  gender: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export const EMPTY_FILTERS: CatalogFilters = {
  collection: "featured",
  line: "",
  brand: "",
  gender: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "featured",
};

/**
 * Lowercases and drops diacritics. Nobody types "Acqua di Giò" with the accent,
 * and half the catalog's searchable text carries one — the fragrance it is
 * inspired by, the olfactory family, the notes.
 */
function foldAccents(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Matches a query against every field a customer might plausibly type. */
export function matchesSearch(perfume: Perfume, query: string): boolean {
  const q = foldAccents(query);

  return (
    foldAccents(perfume.name).includes(q) ||
    foldAccents(perfume.brand).includes(q) ||
    foldAccents(perfume.description).includes(q) ||
    foldAccents(perfume.category).includes(q) ||
    perfume.notes.top.some(note => foldAccents(note).includes(q)) ||
    perfume.notes.middle.some(note => foldAccents(note).includes(q)) ||
    perfume.notes.base.some(note => foldAccents(note).includes(q)) ||
    perfume.tags.some(tag => foldAccents(tag).includes(q))
  );
}

function matchesCollectionChip(perfume: Perfume, collection: string): boolean {
  if (collection === "all") return true;
  if (collection === "featured") return Boolean(perfume.isFeatured);
  if (collection === "consult") return perfume.stock === "consult";
  return perfume.collection === collection;
}

export function filterPerfumes(perfumes: Perfume[], filters: CatalogFilters, search: string): Perfume[] {
  const minPrice = Number(filters.minPrice);
  const maxPrice = Number(filters.maxPrice);
  const hasMin = Boolean(filters.minPrice) && !Number.isNaN(minPrice);
  const hasMax = Boolean(filters.maxPrice) && !Number.isNaN(maxPrice);

  return perfumes.filter(perfume => {
    if (search && !matchesSearch(perfume, search)) return false;
    if (filters.line && perfume.collection !== filters.line) return false;
    if (filters.brand && perfume.brand !== filters.brand) return false;
    if (filters.gender && perfume.gender !== filters.gender) return false;
    if (filters.category && perfume.category !== filters.category) return false;
    if (!matchesCollectionChip(perfume, filters.collection)) return false;
    if (hasMin && !(typeof perfume.price === "number" && perfume.price >= minPrice)) return false;
    if (hasMax && !(typeof perfume.price === "number" && perfume.price <= maxPrice)) return false;
    return true;
  });
}

/** "Consultar" sorts last by price, since it has no comparable number. */
function numericPrice(price: Perfume["price"]): number {
  return typeof price === "number" ? price : Number.POSITIVE_INFINITY;
}

/** Weights the "Recomendados" ordering. Moved verbatim — tweaking it reorders the home grid. */
export function featuredScore(perfume: Perfume): number {
  let score = 0;

  if (perfume.isBestSeller) score += 5;
  if (perfume.isFeatured) score += 4;
  if (perfume.isNew) score += 3;
  if (perfume.category.includes("ambar") || perfume.category.includes("oriental")) score += 3;
  if (perfume.gender === "unisex") score += 2;
  if (typeof perfume.price !== "number") score += 1;
  if (perfume.id < 10 || perfume.id >= 3000) score += 1;

  return score;
}

export function sortPerfumes(perfumes: Perfume[], sort: string): Perfume[] {
  const sorted = [...perfumes];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => numericPrice(a.price) - numericPrice(b.price));
    case "price-desc":
      return sorted.sort((a, b) => numericPrice(b.price) - numericPrice(a.price));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    case "brand-asc":
      return sorted.sort((a, b) => a.brand.localeCompare(b.brand, "es"));
    default:
      return sorted.sort((a, b) => featuredScore(b) - featuredScore(a));
  }
}

export function queryCatalog(perfumes: Perfume[], filters: CatalogFilters, search: string): Perfume[] {
  return sortPerfumes(filterPerfumes(perfumes, filters, search), filters.sort);
}
