export interface DTBrandKit {
  readonly palette: readonly string[];
  readonly mood: readonly string[];
  readonly props: readonly string[];
  readonly avoid: readonly string[];
}

export const DT_BRAND_KIT = {
  palette: ["crema", "beige", "camel", "marrón cálido", "negro", "dorado sutil"],
  mood: ["cálida", "premium accesible", "natural", "minimalista", "lifestyle"],
  props: ["madera", "lino", "libros", "bandejas", "luz natural cálida", "plantas"],
  avoid: ["neón", "saturación excesiva", "flyer barato", "texto abundante"],
} as const satisfies DTBrandKit;
