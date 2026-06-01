import React, { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Send } from "lucide-react";
import { useCart } from "../context/useCart";
import { formatPrice, lineItemTotal } from "../utils/price";
import { buildWhatsappMessage, buildWhatsappUrl } from "../utils/whatsapp";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const message = buildWhatsappMessage(cart);
    window.open(buildWhatsappUrl(message), "_blank");
  };

  const total = getCartTotal();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#101827]/55 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="flex items-center font-serif text-xl font-semibold text-[#1A2238]">
            <ShoppingBag size={20} className="mr-2 text-[#D4AF37]" />
            Carrito
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="font-medium text-[#1A2238]">Tu carrito está vacío</p>
              <p className="mt-2 text-sm text-gray-500">Agregá fragancias para armar tu pedido.</p>
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
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`Quitar ${item.perfume.name}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(item.perfume.id, item.quantity - 1)
                          }
                          className="rounded p-1 text-gray-500 hover:bg-[#F8F0E3] hover:text-[#1A2238]"
                          aria-label={`Restar ${item.perfume.name}`}
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
                          className="rounded p-1 text-gray-500 hover:bg-[#F8F0E3] hover:text-[#1A2238]"
                          aria-label={`Sumar ${item.perfume.name}`}
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
          <div className="border-t border-gray-200 bg-[#FBF8F1] p-4">
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
                className="flex w-full items-center justify-center rounded-md bg-green-600 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
              >
                <Send size={18} className="mr-2" />
                Pedir por WhatsApp
              </button>

              <button
                onClick={clearCart}
                className="w-full rounded-md bg-gray-200 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-300"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
      </aside>
    </>
  );
};

export default Cart;
