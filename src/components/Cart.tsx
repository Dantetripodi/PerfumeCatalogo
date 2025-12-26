import React from "react";
import { X, Minus, Plus, ShoppingBag, Send } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice, lineItemTotal } from "../utils/price";
import { buildWhatsappMessage } from "../utils/whatsapp";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const phoneNumber = "541145630304";
    const message = buildWhatsappMessage(cart);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const total = getCartTotal();

  return (
    <div
      className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-serif font-semibold text-[#1A2238] flex items-center">
            <ShoppingBag size={20} className="mr-2 text-[#D4AF37]" />
            Carrito de Compras
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li
                  key={item.perfume.id}
                  className="border-b border-gray-100 pb-4"
                >
                  <div className="flex items-start">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <img
                        src={item.perfume.image}
                        alt={item.perfume.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-[#1A2238] line-clamp-1">
                            {item.perfume.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {item.perfume.brand}
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#D4AF37]">
                            {formatPrice(item.perfume.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.perfume.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(item.perfume.id, item.quantity - 1)
                          }
                          className="text-gray-500 hover:text-[#1A2238] p-1"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-2 text-sm text-gray-700 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.perfume.id, item.quantity + 1)
                          }
                          className="text-gray-500 hover:text-[#1A2238] p-1"
                        >
                          <Plus size={16} />
                        </button>
                        <div className="ml-auto text-sm font-medium">
                          {lineItemTotal(item.perfume.price, item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-base font-medium text-[#1A2238]">
                Total
              </span>
              <span className="text-base font-medium text-[#1A2238]">
                {formatPrice(total)}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Send size={18} className="mr-2" />
                Pedir por WhatsApp
              </button>

              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;