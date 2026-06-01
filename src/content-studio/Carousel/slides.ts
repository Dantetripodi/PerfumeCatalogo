import { CTAS, ETIQUETAS, HASHTAGS_BASE, HOOKS } from "./constants";
import type {
  CarouselPostType,
  CarouselProduct,
  CarouselSlide,
} from "./types";

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generarSlides(
  producto: CarouselProduct,
  tipoPost: CarouselPostType,
): CarouselSlide[] {
  const hook = random(HOOKS[tipoPost] || HOOKS.producto);
  const cta = random(CTAS);
  const etiqueta = random(ETIQUETAS[tipoPost] || ETIQUETAS.producto);

  return [
    { etiqueta, titulo: hook, subtitulo: "Un perfume, una historia" },
    {
      etiqueta: producto.categoria.toUpperCase(),
      titulo: producto.nombre,
      subtitulo: `${producto.tamano} · ${producto.descripcion}`,
    },
    {
      etiqueta: "NOTAS OLFATIVAS",
      titulo: producto.notas,
      subtitulo: `⏰ Ideal para: ${producto.ocasion}`,
    },
    {
      etiqueta: "CONSULTÁ",
      titulo: cta,
      subtitulo: "Te respondemos al instante",
    },
    {
      etiqueta: "SEGUINOS",
      titulo: "@dt_fragancias",
      subtitulo: "Un perfume, una historia ✨",
    },
  ];
}

export function buildCaption(
  producto: CarouselProduct,
  slides: CarouselSlide[],
): string {
  return (
    `✨ ${slides[1].titulo} (${producto.tamano})\n\n` +
    `${producto.descripcion}\n\n` +
    `🌿 ${slides[2].titulo}\n` +
    `${slides[2].subtitulo}\n\n` +
    `${slides[3].titulo}\n\n` +
    `Un perfume, una historia ✨`
  );
}

export function buildHashtags(producto: CarouselProduct): string {
  const extra =
    producto.categoria === "masculino"
      ? " #perfumesmasculinos #fraganciasmasculinas"
      : producto.categoria === "femenino"
      ? " #perfumesfemeninos #fraganciasfemeninas"
      : " #perfumesunisex #fraganciaunisex";
  return HASHTAGS_BASE + extra;
}
