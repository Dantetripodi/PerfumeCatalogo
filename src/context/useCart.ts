import { useContext } from "react";
import { CartContext, CartContextValue } from "./cartState";

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
