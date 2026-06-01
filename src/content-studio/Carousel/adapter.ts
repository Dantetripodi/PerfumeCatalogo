import type { Perfume } from "../../types";
import type { CarouselCategory, CarouselProduct } from "./types";

/**
 * Convierte un `Perfume` del catálogo principal al formato interno del
 * generador de carruseles. El carrusel necesita campos derivados (notas como
 * string concatenado, ocasión inferida del género/categoría) que no existen
 * en el tipo Perfume actual.
 *
 * Cuando avancemos con la ETAPA 2 (estructura de datos extendida con
 * ocasión, tags, descripciones largas y cortas separadas), este adapter
 * pasa a ser un mapeo casi 1:1 y puede simplificarse.
 */

const OCASIONES_POR_GENERO: Record<string, string> = {
  masculino: "Día a día, oficina, salidas",
  femenino: "Noche, eventos, cita",
  unisex: "Cualquier ocasión, todo el año",
};

function normalizeCategoria(perfume: Perfume): CarouselCategory {
  // El campo `gender` del repo es 'masculino' | 'femenino' | 'unisex'.
  // El generador acepta también 'home' para variantes futuras.
  const g = perfume.gender;
  if (g === "masculino" || g === "femenino" || g === "unisex") return g;
  return "unisex";
}

function buildNotas(perfume: Perfume): string {
  const all = [
    ...perfume.notes.top,
    ...perfume.notes.middle,
    ...perfume.notes.base,
  ].filter(Boolean);
  if (all.length === 0) return "Notas olfativas únicas";
  // Limito a 6 notas para que entren bien en el slide
  return all.slice(0, 6).join(", ");
}

export function toCarouselProduct(perfume: Perfume): CarouselProduct {
  return {
    id: String(perfume.id),
    nombre: perfume.name,
    categoria: normalizeCategoria(perfume),
    tamano: perfume.size,
    notas: buildNotas(perfume),
    descripcion: perfume.description || perfume.name,
    ocasion:
      perfume.occasion ||
      OCASIONES_POR_GENERO[perfume.gender] ||
      "Cualquier ocasión",
    foto: perfume.image,
  };
}
