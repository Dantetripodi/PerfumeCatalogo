// Importaciones necesarias de React
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Perfume, CartItem } from '../types';

// Definición de la interfaz que describe la estructura del contexto
interface CartContextType {
  cart: CartItem[];                    // Array de items en el carrito
  addToCart: (perfume: Perfume) => void;    // Función para agregar un perfume
  removeFromCart: (id: number) => void;     // Función para remover un perfume
  updateQuantity: (id: number, quantity: number) => void;  // Función para actualizar cantidad
  clearCart: () => void;              // Función para vaciar el carrito
  getCartTotal: () => number;         // Función para obtener el total
  getCartCount: () => number;         // Función para obtener la cantidad total de items
}

// Creación del contexto con valor inicial undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

// Componente proveedor del contexto
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado que mantiene los items del carrito
  const [cart, setCart] = useState<CartItem[]>([]);

  // Función para agregar un perfume al carrito
  const addToCart = (perfume: Perfume) => {
    setCart((prevCart) => {
      // Busca si el perfume ya existe en el carrito
      const existingItem = prevCart.find((item) => item.perfume.id === perfume.id);
      
      if (existingItem) {
        // Si existe, aumenta la cantidad en 1
        return prevCart.map((item) =>
          item.perfume.id === perfume.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Si no existe, agrega el nuevo item con cantidad 1
        return [...prevCart, { perfume, quantity: 1 }];
      }
    });
  };

  // Función para remover un perfume del carrito
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.perfume.id !== id));
  };

  // Función para actualizar la cantidad de un perfume
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menor, remueve el item
      removeFromCart(id);
      return;
    }
    
    // Actualiza la cantidad del item específico
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.perfume.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Función para vaciar el carrito
  const clearCart = () => {
    setCart([]);
  };

  // Función para calcular el total del carrito
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.perfume.price * item.quantity, 0);
  };

  // Función para obtener el número total de items en el carrito
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Proveedor del contexto que envuelve a los componentes hijos
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

// Hook personalizado para usar el contexto
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};