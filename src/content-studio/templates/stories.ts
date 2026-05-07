import { Perfume } from "../../types";
import { formatPrice } from "../../utils/price";

// ─── Templates para Historias de Instagram ──────────────────────────────────
// Texto corto y de impacto — 2 a 4 líneas máximo.

type TemplateFunc = (p: Perfume) => string;

const priceShort = (p: Perfume) =>
  typeof p.price === "number" ? formatPrice(p.price) : "Consultá precio";

const templates: TemplateFunc[] = [
  (p) =>
    `✨ NUEVO EN EL CATÁLOGO ✨\n` +
    `${p.name.toUpperCase()}\n` +
    `Fragancia ${p.category} · ${p.size}\n` +
    `${priceShort(p)} → Escribinos ya 💬`,

  (p) =>
    `¿Buscás un perfume que deje huella?\n` +
    `${p.name} · ${p.brand}\n` +
    `${priceShort(p)} · ${p.size}\n` +
    `👆 Deslizá o escribinos al WhatsApp`,

  (p) =>
    `${p.gender === "femenino" ? "Para ella 🌸" : p.gender === "masculino" ? "Para él 🖤" : "Para vos 🌿"}\n` +
    `${p.name.toUpperCase()} — ${p.brand}\n` +
    `Fragancia ${p.category}\n` +
    `Consultá precio → DM o WhatsApp 📩`,

  (p) =>
    `Hoy en el catálogo:\n` +
    `${p.name} 🖤\n` +
    `${p.size} · ${priceShort(p)}\n` +
    `¿Te gusta? Escribinos ↓`,
];

export function generateInstagramStory(perfume: Perfume): string {
  const idx = (perfume.id + 1) % templates.length;
  return templates[idx](perfume);
}
