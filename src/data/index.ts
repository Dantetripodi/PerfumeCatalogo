import { Perfume, PerfumeInput } from "../types";
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
  startId: number
): Perfume[] {
  return items.map((item, index) => ({
    ...item,
    id: startId + index,
  }));
}

const regularesWithIds = assignIds(perfumesRegulares, ID_RANGES.regulares.start);
const minisWithIds = assignIds(perfumesMinis, ID_RANGES.minis.start);
const otrosWithIds = assignIds(otrosProductos, ID_RANGES.otros.start);
const arabesWithIds = assignIds(perfumesArabes, ID_RANGES.arabes.start);

export const perfumes: Perfume[] = [
  ...regularesWithIds,
  ...minisWithIds,
  ...otrosWithIds,
  ...arabesWithIds,
];

export { perfumesRegulares, perfumesMinis, otrosProductos, perfumesArabes };

