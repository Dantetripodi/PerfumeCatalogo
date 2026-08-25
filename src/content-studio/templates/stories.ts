import { Perfume } from "../../types";
// ─── Templates para Historias de Instagram ──────────────────────────────────
// Frames breves, conversacionales y fáciles de acompañar con una foto.

type TemplateFunc = (p: Perfume) => string;

const templates: TemplateFunc[] = [
  (p) =>
    `Hola ✨ ¿Qué aroma te acompaña hoy?\n` +
    `${p.name}, una fragancia ${p.category}.\n` +
    `¿La conocemos juntos? Escribinos 💬`,

  (p) =>
    `Hola 🌿 ¿Buscás algo fresco y fácil de llevar?\n` +
    `${p.name} abre con ${p.notes.top[0] ?? p.category}.\n` +
    `Escribinos por WhatsApp y te contamos más.`,

  (p) =>
    `Hola ✨ ¿Querés descubrir un aroma con personalidad?\n` +
    `${p.name} se siente ${p.notes.middle[0] ?? p.category}.\n` +
    `¿Te lo reservamos? Mandanos un mensaje.`,

  (p) =>
    `Hola 🤎 ¿Te gustan los aromas que dejan huella?\n` +
    `${p.name}: ${p.notes.base[0] ?? p.category} en una base cálida.\n` +
    `Escribinos y te ayudamos a elegir.`,
];

export function generateInstagramStory(perfume: Perfume): string {
  const idx = (perfume.id + 1) % templates.length;
  return templates[idx](perfume);
}
