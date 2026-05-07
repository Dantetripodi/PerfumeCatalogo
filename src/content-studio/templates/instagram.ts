import { Perfume } from "../../types";
import { formatPrice } from "../../utils/price";

// ─── Templates de caption para Instagram ────────────────────────────────────
// Cada template recibe el perfume y retorna un string listo para copiar.
// Se elige uno al azar para dar variedad.

type TemplateFunc = (p: Perfume) => string;

const topNotesStr = (p: Perfume) =>
  p.notes.top.length ? p.notes.top.slice(0, 2).join(" y ") : p.category;

const baseNotesStr = (p: Perfume) =>
  p.notes.base.length ? p.notes.base.slice(0, 2).join(" y ") : "notas profundas";

const priceText = (p: Perfume) =>
  typeof p.price === "number"
    ? `💰 Solo ${formatPrice(p.price)}`
    : "💰 Consultá precio por privado";

const templates: TemplateFunc[] = [
  (p) =>
    `✨ ${p.name.toUpperCase()} — ${p.brand}\n\n` +
    `Una fragancia ${p.category} que te envuelve desde el primer golpe.\n` +
    `Arranca con ${topNotesStr(p)} y cierra con ${baseNotesStr(p)}.\n\n` +
    `${p.gender === "femenino" ? "Para ella 🌸" : p.gender === "masculino" ? "Para él 🖤" : "Para todos 🌿"} · ${p.size}\n\n` +
    `${priceText(p)}\n` +
    `📩 Escribinos al WhatsApp para hacer tu pedido`,

  (p) =>
    `No hace falta gastar una fortuna para oler increíble. 🤫\n\n` +
    `${p.name} de ${p.brand} es la prueba.\n` +
    `${p.description}\n\n` +
    `${priceText(p)} · ${p.size}\n` +
    `👇 Mandanos un mensaje y te lo enviamos`,

  (p) =>
    `La primera impresión lo es todo. 🌟\n\n` +
    `${p.name} — fragancia ${p.category} ${p.gender === "femenino" ? "femenina" : p.gender === "masculino" ? "masculina" : "unisex"}.\n` +
    `Con toques de ${topNotesStr(p)}, deja una huella que no se olvida.\n\n` +
    `${priceText(p)} · Tamaño: ${p.size}\n` +
    `💬 Consultá disponibilidad por WhatsApp`,

  (p) =>
    `${p.name} ✦ ${p.brand}\n\n` +
    `"${p.description}"\n\n` +
    `Familia olfativa: ${p.category} · ${p.gender}\n` +
    `Notas: ${topNotesStr(p)}\n\n` +
    `${priceText(p)}\n` +
    `📲 Pedilo por WhatsApp — envíos disponibles`,
];

export function generateInstagramCaption(perfume: Perfume): string {
  const idx = perfume.id % templates.length;
  return templates[idx](perfume);
}
