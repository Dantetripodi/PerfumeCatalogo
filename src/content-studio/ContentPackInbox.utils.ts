import type { Perfume } from "../types";
import type { ContentPack } from "./contentPackTypes";

export type ContentPackInboxTab = "all" | ContentPack["status"];
type ProductLookup = Pick<Perfume, "id" | "name" | "image">;

export function sortContentPacksByUpdatedAt(packs: ContentPack[]): ContentPack[] {
  return [...packs].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export function getPackProduct<T extends ProductLookup>(pack: ContentPack, perfumes: T[]): T | null {
  return perfumes.find((perfume) => perfume.id === pack.productId) ?? null;
}

export function filterContentPacks<T extends ProductLookup>(packs: ContentPack[], perfumes: T[], search: string, tab: ContentPackInboxTab): ContentPack[] {
  const query = search.trim().toLocaleLowerCase("es-AR");
  return sortContentPacksByUpdatedAt(packs).filter((pack) => {
    const product = getPackProduct(pack, perfumes);
    const matchesTab = tab === "all" || pack.status === tab;
    const matchesSearch = !query || product?.name.toLocaleLowerCase("es-AR").includes(query) || String(pack.productId).includes(query);
    return matchesTab && matchesSearch;
  });
}

export function contentPackItemKey(prefix: string, values: string[], index: number): string {
  const content = values.join(" ").trim();
  const stableSlug = content
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "empty";
  return `${prefix}-${index}-${stableSlug}`;
}
