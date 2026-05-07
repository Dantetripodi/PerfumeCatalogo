import { Perfume } from "../../types";
import { formatPrice } from "../../utils/price";

// ─── Templates de guion para Reels ──────────────────────────────────────────
// Formato: [0-3s] escena · [3-10s] escena · etc.
// Con indicaciones de plano y texto en pantalla.

const topStr = (p: Perfume) =>
  p.notes.top.length ? p.notes.top.slice(0, 3).join(", ") : p.category;

const midStr = (p: Perfume) =>
  p.notes.middle.length ? p.notes.middle.slice(0, 2).join(" y ") : "corazón intenso";

const baseStr = (p: Perfume) =>
  p.notes.base.length ? p.notes.base.slice(0, 2).join(" y ") : "base duradera";

const priceText = (p: Perfume) =>
  typeof p.price === "number" ? formatPrice(p.price) : "precio especial";

export function generateReelScript(perfume: Perfume): string {
  const isArab = perfume.brand.toLowerCase().includes("arab") || perfume.category === "oriental";
  const genderLine =
    perfume.gender === "femenino"
      ? "Una fragancia pensada para ella."
      : perfume.gender === "masculino"
      ? "Una fragancia pensada para él."
      : "Una fragancia para cualquiera que quiera destacar.";

  if (isArab) {
    return (
      `🎬 GUION REEL — ${perfume.name.toUpperCase()} (30 seg)\n\n` +
      `[0–3s] HOOK VISUAL\n` +
      `📷 Plano cerrado del frasco sobre superficie oscura, luz cálida dorada.\n` +
      `Texto en pantalla: "¿Conocés los perfumes árabes?"\n\n` +
      `[3–10s] IDENTIDAD\n` +
      `📷 Mano sostiene el frasco. Leve movimiento de cámara.\n` +
      `VO: "${perfume.name}, de ${perfume.brand}. Oriental, intenso, imponente."\n\n` +
      `[10–20s] NOTAS Y SENSACIÓN\n` +
      `📷 Transición rápida: ambiente nocturno o atardecer.\n` +
      `VO: "Notas de ${topStr(perfume)} en la apertura. Corazón de ${midStr(perfume)}. Cierre con ${baseStr(perfume)}."\n` +
      `Texto: "Dura más de 8 horas"\n\n` +
      `[20–28s] PRECIO Y DISPONIBILIDAD\n` +
      `📷 Frasco frente a cámara, logo de DT Fragancias.\n` +
      `VO: "${perfume.size} · ${priceText(perfume)}"\n\n` +
      `[28–30s] CTA\n` +
      `Texto animado: "Escribinos al WhatsApp 👇"\n` +
      `VO: "Pedilo ahora."`
    );
  }

  return (
    `🎬 GUION REEL — ${perfume.name.toUpperCase()} (30 seg)\n\n` +
    `[0–3s] HOOK\n` +
    `📷 Plano detalle del frasco. Música elegante de fondo.\n` +
    `Texto en pantalla: "Este perfume te va a sorprender"\n\n` +
    `[3–8s] PRESENTACIÓN\n` +
    `📷 Frasco completo, bien iluminado sobre fondo crema o negro.\n` +
    `VO: "${perfume.name} de ${perfume.brand}. ${genderLine}"\n\n` +
    `[8–18s] DESCRIPCIÓN\n` +
    `📷 Ambiente acorde a la fragancia (campo, noche, oficina según categoría).\n` +
    `VO: "${perfume.description}"\n` +
    `Texto: "Notas: ${topStr(perfume)}"\n\n` +
    `[18–26s] VALOR\n` +
    `📷 Frasco en mano, movimiento sutil.\n` +
    `VO: "${perfume.size} · ${priceText(perfume)} · Envíos disponibles."\n` +
    `Texto en pantalla: "Calidad premium, precio accesible"\n\n` +
    `[26–30s] CTA\n` +
    `📷 Logo DT Fragancias.\n` +
    `Texto: "WhatsApp en la bio 📲"\n` +
    `VO: "Hacé tu pedido hoy."`
  );
}
