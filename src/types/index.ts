export interface Notes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: number;
  gender: "masculino" | "femenino" | "unisex";
  category:
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
    | "oriental especiaido"
    | "oriental floral"
    | "amaderado frutal"
    | "cítrico floral"
    | "acuático floral"
    | "aromático especiado"
    | "perfumeria"
    | "aromatica"
    | "ambar"
    | "ambar floral"
    | "ambar oriental"
    | "ambar especiado"
    | "ambar frutal"
    | "ambar cítrico"
    | "ambar acuático"
    | "ambar oriental";
  size: string;
  image: string;
  description: string;
  notes: Notes;
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
  getCartTotal: () => number;
  getCartCount: () => number;
}
