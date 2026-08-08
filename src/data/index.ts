/**
 * The static catalog: the hand-curated products plus everything imported from
 * the RED YVES supplier, assembled with stable ids.
 *
 * The app reads its catalog from Supabase, not from here — this module is the
 * source that `npm run sync-catalog` pushes, and what the app falls back to
 * under VITE_USE_LOCAL_CATALOG. Import it dynamically from app code so the
 * products do not end up in the bundle customers download.
 */
import { Perfume, PerfumeCollection, PerfumeInput } from "../types";
import { normalizePerfume } from "./normalize";
import { perfumesRegulares } from "./perfumesRegulares";
import { perfumesMinis } from "./minis";
import { otrosProductos } from "./otros";
import { perfumesArabes } from "./arabes";
import { perfumesArabic } from "./arabic";
import { yvesRegulares } from "./yvesRegulares";
import { yvesProbadores } from "./yvesProbadores";
import { yvesArabic } from "./yvesArabic";
import { yvesHome } from "./yvesHome";
import { yvesJacques } from "./yvesJacques";

const CUSTOM_PERFUMES_STORAGE_KEY = "dtfragancias_custom_perfumes";

const ID_RANGES = {
  regulares: { start: 1, end: 999 },
  minis: { start: 1000, end: 1999 },
  otros: { start: 2000, end: 2999 },
  arabes: { start: 3000, end: 3999 },
  arabic: { start: 4000, end: 4999 },
  // 5000-5999 is reserved for locally stored custom perfumes (see getStoredPerfumes).
  home: { start: 6000, end: 6999 },
  jacques: { start: 7000, end: 7999 },
  probadores: { start: 8000, end: 8999 },
};

function assignIds(items: PerfumeInput[], startId: number, collection: PerfumeCollection): Perfume[] {
  return items.map((item, index) => normalizePerfume(item, startId + index, collection));
}

// Hand-curated entries stay first so their ids never shift when the RED YVES
// import is re-run and appends or drops products.
const regularesWithIds = assignIds([...perfumesRegulares, ...yvesRegulares], ID_RANGES.regulares.start, "regular");
const minisWithIds = assignIds(perfumesMinis, ID_RANGES.minis.start, "mini");
const otrosWithIds = assignIds(otrosProductos, ID_RANGES.otros.start, "accesorio");
const arabesWithIds = assignIds(perfumesArabes, ID_RANGES.arabes.start, "arabe");
const arabicWithIds = assignIds([...perfumesArabic, ...yvesArabic], ID_RANGES.arabic.start, "arabic");
const homeWithIds = assignIds(yvesHome, ID_RANGES.home.start, "home");
const jacquesWithIds = assignIds(yvesJacques, ID_RANGES.jacques.start, "jacques");
const probadoresWithIds = assignIds(yvesProbadores, ID_RANGES.probadores.start, "probador");

export const perfumes: Perfume[] = [
  ...regularesWithIds,
  ...minisWithIds,
  ...otrosWithIds,
  ...arabesWithIds,
  ...arabicWithIds,
  ...homeWithIds,
  ...jacquesWithIds,
  ...probadoresWithIds,
];

export { perfumesRegulares, perfumesMinis, otrosProductos, perfumesArabes, perfumesArabic };
export { yvesRegulares, yvesProbadores, yvesArabic, yvesHome, yvesJacques };

export function getStoredPerfumes(): Perfume[] {
  return getStoredPerfumeInputs().map((item, index) => normalizePerfume(item, 5000 + index, "regular"));
}

export function getStoredPerfumeInputs(): PerfumeInput[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(CUSTOM_PERFUMES_STORAGE_KEY);
    if (!saved) return [];

    return JSON.parse(saved) as PerfumeInput[];
  } catch (error) {
    console.error("Error loading custom perfumes:", error);
    return [];
  }
}

export function saveStoredPerfumes(items: PerfumeInput[]) {
  localStorage.setItem(CUSTOM_PERFUMES_STORAGE_KEY, JSON.stringify(items));
}

export { CUSTOM_PERFUMES_STORAGE_KEY };
export { normalizePerfume, rowToInput, buildSlug } from "./normalize";
