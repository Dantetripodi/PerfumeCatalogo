import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Perfume, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (perfume: Perfume) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number | "Consultar";
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dtfragancias_cart';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return [];
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());

  const addToCart = (perfume: Perfume) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.perfume.id === perfume.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.perfume.id === perfume.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { perfume, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.perfume.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.perfume.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = (): number | "Consultar" => {
    if (cart.some((item) => typeof item.perfume.price !== 'number')) return "Consultar";
    return cart.reduce((total, item) => total + (item.perfume.price as number) * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};