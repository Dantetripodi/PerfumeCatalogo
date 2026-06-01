import { CartItem } from "../types";
import { computeNumericTotal, formatPrice, lineItemTotal } from "./price";
import { Perfume } from "../types";

export const WHATSAPP_PHONE_NUMBER = "541145630304";

export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsappMessage(cart: CartItem[]): string {
  const lines = cart.map(item => {
    const unit = formatPrice(item.perfume.price);
    const total = lineItemTotal(item.perfume.price, item.quantity);
    const stockNote = item.perfume.stock === "consult" ? " - precio/stock a confirmar" : " - por pedido";
    return `- ${item.quantity} x ${item.perfume.name} (${item.perfume.brand}) | ${item.perfume.size} | ${unit} = ${total}${stockNote}`;
  });

  const total = computeNumericTotal(
    cart.map(c => ({ price: c.perfume.price, qty: c.quantity }))
  );

  const totalText = formatPrice(total);
  return `Hola DTFragancias, quiero hacer este pedido:\n\n${lines.join("\n")}\n\n*Total estimado: ${totalText}*\n\nMe confirmás disponibilidad, precio final, demora por pedido y forma de entrega? Gracias.`;
}

export function buildProductInquiryMessage(perfume: Perfume): string {
  const price = formatPrice(perfume.price);
  const notes = [
    perfume.occasion,
    perfume.season,
    perfume.intensity && `Intensidad ${perfume.intensity}`,
  ].filter(Boolean).join(" | ");

  return `Hola DTFragancias, quiero consultar por este perfume:\n\n*${perfume.name}*\nMarca: ${perfume.brand}\nTamaño: ${perfume.size}\nPrecio: ${price}\nPerfil: ${perfume.category}\n${notes ? `Detalle: ${notes}\n` : ""}\nMe confirmás disponibilidad, precio final y demora por pedido?`;
}
