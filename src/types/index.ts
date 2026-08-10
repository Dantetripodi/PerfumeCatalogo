export interface Notes {
  top: string[];
  middle: string[];
  base: string[];
}

export type PerfumeCategory =
  | "floral"
  | "amaderado"
  | "oriental"
  | "cítrico"
  | "acuático"
  | "frutal"
  | "amaderado especiado"
  | "amaderada dulce"
  | "cítrico acuático"
  | "acuático oriental"
  | "floral frutal"
  | "oriental especiado"
  | "oriental floral"
  | "amaderado frutal"
  | "cítrico floral"
  | "acuático floral"
  | "aromático especiado"
  | "perfumeria"
  | "perfumería"
  | "aromatica"
  | "aromático"
  | "ambar"
  | "ámbar"
  | "ambar floral"
  | "ámbar floral"
  | "ambar oriental"
  | "ámbar oriental"
  | "ambar especiado"
  | "ámbar especiado"
  | "ambar frutal"
  | "ámbar frutal"
  | "ambar cítrico"
  | "ámbar cítrico"
  | "ambar acuático"
  | "ámbar acuático"
  | "vainilla dulce"
  | "vainilla especiada"
  | "floral amaderado"
  | "oriental amaderado"
  | "aromático amaderado"
  | "acuático amaderado"
  | "oriental gourmand";

export type PerfumeCollection =
  | "regular"
  | "mini"
  | "accesorio"
  | "arabe"
  | "arabic"
  | "home"
  | "jacques"
  | "probador";

export const COLLECTION_LABELS: Record<PerfumeCollection, string> = {
  regular: "Yves",
  arabe: "Árabes",
  arabic: "Arabic",
  jacques: "Jacques Ryon",
  mini: "Minis",
  probador: "Probadores",
  home: "Home",
  accesorio: "Accesorios",
};
/**
 * One of the options a product comes in — the scent of a diffuser, the sign of
 * a zodiac candle, the flavour of a soap.
 *
 * No price: the supplier charges the same for every variant of a product, which
 * the importer re-checks on each run and warns about if it ever stops being
 * true. Stock does vary, so a variant can be listed and unavailable.
 */
export interface PerfumeVariant {
  code: string;
  name: string;
  inStock: boolean;
}

export type PerfumeStock = "by-order" | "consult";
export type PerfumeIntensity = "suave" | "media" | "intensa";

export interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: number | "Consultar";
  gender: "masculino" | "femenino" | "unisex";
  category: PerfumeCategory;
  size: string;
  image: string;
  description: string;
  notes: Notes;
  collection: PerfumeCollection;
  stock: PerfumeStock;
  tags: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  occasion?: string;
  season?: string;
  intensity?: PerfumeIntensity;
  longevity?: string;
  whatsappHint?: string;
  slug: string;
  /** Present when the product is sold in several options. */
  variants?: PerfumeVariant[];
  /** What the supplier calls the choice: "Sahumerios", "Body Splash"… */
  variantLabel?: string;
}

export type PerfumeInput = Omit<
  Perfume,
  | "id"
  | "collection"
  | "stock"
  | "tags"
  | "isFeatured"
  | "isBestSeller"
  | "isNew"
  | "occasion"
  | "season"
  | "intensity"
  | "longevity"
  | "whatsappHint"
  | "slug"
>;

export interface PerfumeRow {
  id: number;
  name: string;
  brand: string;
  price: number | null;
  gender: "masculino" | "femenino" | "unisex";
  category: PerfumeCategory;
  size: string;
  image_url: string;
  description: string;
  notes: Notes;
  collection: PerfumeCollection;
  is_featured: boolean;
  variants: PerfumeVariant[] | null;
  variant_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  perfume: Perfume;
  quantity: number;
  /** The option chosen at add time. Absent for products sold in one version. */
  variant?: PerfumeVariant;
}

/**
 * Identifies a line. The product id alone is not enough: two scents of the same
 * diffuser are two different things to order, and collapsing them would send a
 * WhatsApp message that does not say which one the customer wanted.
 */
export function cartLineKey(perfumeId: number, variantCode?: string): string {
  return `${perfumeId}::${variantCode ?? ""}`;
}

export function cartItemKey(item: CartItem): string {
  return cartLineKey(item.perfume.id, item.variant?.code);
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (perfume: Perfume, variant?: PerfumeVariant) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number | "Consultar";
  getCartCount: () => number;
}
