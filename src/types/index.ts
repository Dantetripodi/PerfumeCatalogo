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
  | "vainilla especiada";

export type PerfumeCollection = "regular" | "mini" | "accesorio" | "arabe" | "arabic";

export const COLLECTION_LABELS: Record<PerfumeCollection, string> = {
  regular: "Yves",
  arabe: "Árabes",
  arabic: "Arabic",
  mini: "Minis",
  accesorio: "Accesorios",
};
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
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  perfume: Perfume;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (perfume: Perfume) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number | "Consultar";
  getCartCount: () => number;
}
