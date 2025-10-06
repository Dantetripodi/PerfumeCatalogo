import { CartItem } from "../types";
import { computeNumericTotal, lineItemTotal } from "./price";

export function buildWhatsappMessage(cart: CartItem[]): string {
  const lines = cart.map(item => {
    const unit = typeof item.perfume.price === "number" ? `$${item.perfume.price}` : "Consultar";
    const total = lineItemTotal(item.perfume.price, item.quantity);
    return `${item.perfume.name} (${item.perfume.brand}) - ${item.quantity} x ${unit} = ${total}`;
  });

  const total = computeNumericTotal(
    cart.map(c => ({ price: c.perfume.price, qty: c.quantity }))
  );

  const totalText = total === "Consultar" ? "Consultar" : `$${total}`;
  const message = `*Mi Pedido de Perfumes:*\n\n${lines.join("\n")}\n\n*Total: ${totalText}*\n\nPor favor, confirma mi pedido. ¡Gracias!`;
  return encodeURIComponent(message);
}