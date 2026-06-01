/**
 * Tipos internos del generador de carruseles.
 *
 * Mantenemos un `CarouselProduct` separado del `Perfume` global porque el
 * carrusel necesita campos derivados (ocasión, notas concatenadas en string)
 * que no viven en el tipo Perfume actual. El adaptador `toCarouselProduct`
 * mapea de uno a otro.
 */

export type CarouselCategory = "femenino" | "masculino" | "unisex" | "home";

export interface CarouselProduct {
  id: string;
  nombre: string;
  categoria: CarouselCategory;
  tamano: string;
  notas: string;
  descripcion: string;
  ocasion: string;
  foto: string;
}

export interface CarouselSlide {
  etiqueta: string;
  titulo: string;
  subtitulo: string;
}

export type CarouselStyle = "A" | "B" | "C" | "D" | "E";
export type CarouselFormat = "feed" | "square" | "stories";
export type CarouselPostType = "producto" | "ocasion" | "novedad" | "testimonio";

export interface CarouselFormatSpec {
  w: number;
  h: number;
  label: string;
}

export interface CatGradient {
  from: string;
  to: string;
  text: string;
}

export interface SavedTemplate {
  id: number;
  nombre: string;
  producto: CarouselProduct;
  estilo: CarouselStyle;
  formato: CarouselFormat;
  tipoPost: CarouselPostType;
  slides: CarouselSlide[];
}
