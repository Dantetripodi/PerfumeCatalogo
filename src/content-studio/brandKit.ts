export interface DTBrandKit {
  palette: string[];
  mood: string[];
  props: string[];
  avoid: string[];
}

export const DT_BRAND_KIT: DTBrandKit = {
  palette: ["crema", "beige", "camel", "marrón cálido", "negro", "dorado sutil"],
  mood: ["cálida", "premium accesible", "natural", "minimalista", "lifestyle"],
  props: ["madera", "lino", "libros", "bandejas", "luz natural cálida", "plantas"],
  avoid: ["neón", "saturación excesiva", "flyer barato", "texto abundante"],
};
