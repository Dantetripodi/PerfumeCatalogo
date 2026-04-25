import { CartItem } from "../types";
import { computeNumericTotal, formatPrice, lineItemTotal } from "./price";

export function buildWhatsappMessage(cart: CartItem[]): string {
  const lines = cart.map(item => {
    const unit = formatPrice(item.perfume.price);
    const total = lineItemTotal(item.perfume.price, item.quantity);
    return `${item.perfume.name} (${item.perfume.brand}) - ${item.quantity} x ${unit} = ${total}`;
  });

  const total = computeNumericTotal(
    cart.map(c => ({ price: c.perfume.price, qty: c.quantity }))
  );

  const totalText = formatPrice(total);
  const message = `*Mi Pedido de Perfumes:*\n\n${lines.join("\n")}\n\n*Total: ${totalText}*\n\nPor favor, confirma mi pedido. ¡Gracias!`;
  return encodeURIComponent(message);
}
