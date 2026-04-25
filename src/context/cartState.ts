import { createContext } from "react";
import { CartItem, Perfume } from "../types";

export interface CartContextValue {
  cart: CartItem[];
  addToCart: (perfume: Perfume) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number | "Consultar";
  getCartCount: () => number;
}

export const CART_STORAGE_KEY = "dtfragancias_cart";

export const CartContext = createContext<CartContextValue | undefined>(undefined);
