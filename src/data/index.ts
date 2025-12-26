import { Perfume } from "../types";
import { perfumesRegulares } from "./perfumesRegulares";
import { perfumesMinis } from "./minis";
import { otrosProductos } from "./otros";
import { perfumesArabes } from "./arabes";

export const perfumes: Perfume[] = [
  ...perfumesRegulares,
  ...perfumesMinis,
  ...otrosProductos,
  ...perfumesArabes,
];

export { perfumesRegulares, perfumesMinis, otrosProductos, perfumesArabes };

