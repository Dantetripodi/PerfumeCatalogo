import { createContext } from "react";
import { CartItem, Perfume, PerfumeVariant } from "../types";

export interface CartContextValue {
  cart: CartItem[];
  addToCart: (perfume: Perfume, variant?: PerfumeVariant) => void;
  /** Keyed by `cartItemKey`, not the product id: a product can hold several lines. */
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number | "Consultar";
  getCartCount: () => number;
}

export const CART_STORAGE_KEY = "dtfragancias_cart";

export const CartContext = createContext<CartContextValue | undefined>(undefined);
