import { Perfume } from "../../types";
import { formatPrice } from "../../utils/price";

// ─── Template de mensaje para WhatsApp ──────────────────────────────────────
// Texto vendedor y ordenado, listo para copiar y pegar.

const topStr = (p: Perfume) =>
  p.notes.top.length ? p.notes.top.join(", ") : "—";

const midStr = (p: Perfume) =>
  p.notes.middle.length ? p.notes.middle.join(", ") : "—";

const baseStr = (p: Perfume) =>
  p.notes.base.length ? p.notes.base.join(", ") : "—";

export function generateWhatsappText(perfume: Perfume): string {
  const price = formatPrice(perfume.price);
  const genderEmoji =
    perfume.gender === "femenino" ? "🌸" : perfume.gender === "masculino" ? "🖤" : "🌿";

  return (
    `Hola! Te cuento sobre este perfume del catálogo:\n\n` +
    `*${perfume.name}* — ${perfume.brand} ${genderEmoji}\n` +
    `📦 Tamaño: ${perfume.size}\n` +
    `💰 Precio: *${price}*\n\n` +
    `📝 ${perfume.description}\n\n` +
    `🌿 Notas:\n` +
    `  · Salida: ${topStr(perfume)}\n` +
    `  · Corazón: ${midStr(perfume)}\n` +
    `  · Fondo: ${baseStr(perfume)}\n\n` +
    `¿Te interesa? Avisame y lo reservo para vos 😊`
  );
}
