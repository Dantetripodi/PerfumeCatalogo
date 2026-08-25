import { Perfume } from "../../types";
// ─── Templates de caption para Instagram ────────────────────────────────────
// Cada template trabaja un solo ángulo de producto y cierra con un CTA.

type TemplateFunc = (p: Perfume) => string;

const topNotesStr = (p: Perfume) =>
  p.notes.top.length ? p.notes.top.slice(0, 2).join(" y ") : p.category;

const templates: TemplateFunc[] = [
  (p) =>
    `✨ ${p.name}\n\n` +
    `Un aroma ${p.category}, luminoso y fácil de llevar. ` +
    `${topNotesStr(p)} le dan una salida fresca y cercana.\n\n` +
    `¿Querés probarlo? Escribinos por WhatsApp 📩`,

  (p) =>
    `Para esos días en los que querés sentirte fresco sin pensarlo demasiado. 🌿\n\n` +
    `${p.name} combina ${topNotesStr(p)} con una sensación limpia y natural.\n\n` +
    `Mandanos un mensaje y te recomendamos cómo usarlo.`,

  (p) =>
    `La primera impresión puede ser suave y memorable. 🤎\n\n` +
    `${p.name} deja una huella serena con ${topNotesStr(p)}.\n\n` +
    `¿Te gustaría conocerlo? Consultá por WhatsApp.`,

  (p) =>
    `${p.name} ✦\n\n` +
    `Un gesto simple para hacer especial tu rutina: ${p.description.toLowerCase()}\n\n` +
    `Pedilo por WhatsApp y te asesoramos 📲`,
];

export function generateInstagramCaption(perfume: Perfume): string {
  const idx = perfume.id % templates.length;
  return templates[idx](perfume);
}
