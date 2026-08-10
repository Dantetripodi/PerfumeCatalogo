import React, { useState, useEffect, ReactNode } from 'react';
import { Perfume, CartItem, PerfumeVariant, cartItemKey, cartLineKey } from '../types';
import { CART_STORAGE_KEY, CartContext } from './cartState';

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

  // Lines are keyed by product *and* variant: two scents of the same diffuser
  // are two separate things to order.
  const addToCart = (perfume: Perfume, variant?: PerfumeVariant) => {
    const key = cartLineKey(perfume.id, variant?.code);

    setCart((prevCart) => {
      const exists = prevCart.some((item) => cartItemKey(item) === key);
      if (exists) {
        return prevCart.map((item) =>
          cartItemKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { perfume, quantity: 1, variant }];
    });
  };

  const removeFromCart = (key: string) => {
    setCart((prevCart) => prevCart.filter((item) => cartItemKey(item) !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (cartItemKey(item) === key ? { ...item, quantity } : item))
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
