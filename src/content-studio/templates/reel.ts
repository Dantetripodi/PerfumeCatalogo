import type { Perfume } from "../../types";
import { REEL_TEXT_MAX_LENGTH, truncateText } from "./text";
// ─── Templates de guion para Reels ──────────────────────────────────────────
// Formato explícito para conservar Hook, shots, texto en pantalla y CTA.

const topStr = (p: Perfume) =>
  p.notes.top.length ? p.notes.top.slice(0, 3).join(", ") : p.category;

const midStr = (p: Perfume) =>
  p.notes.middle.length ? p.notes.middle.slice(0, 2).join(" y ") : "corazón intenso";

const baseStr = (p: Perfume) =>
  p.notes.base.length ? p.notes.base.slice(0, 2).join(" y ") : "base duradera";

const onScreenNotes = (p: Perfume) =>
  truncateText(`Notas: ${topStr(p)}`, REEL_TEXT_MAX_LENGTH);

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
      `🎬 GUION REEL — ${perfume.name.toUpperCase()} (30 seg)\n` +
      `[0–3s] HOOK VISUAL\n` +
      `📷 Frasco sobre madera y lino, con luz natural cálida.\n` +
      `Texto en pantalla: "¿Conocés los perfumes árabes?"\n\n` +
      `[3–10s] IDENTIDAD\n` +
      `📷 Mano sostiene el frasco junto a una bandeja y un libro.\n` +
      `VO: "${perfume.name}, de ${perfume.brand}. Oriental, intenso, imponente."\n\n` +
      `[10–20s] NOTAS Y SENSACIÓN\n` +
      `📷 Detalle de las notas sobre una mesa cálida y minimalista.\n` +
      `VO: "Notas de ${topStr(perfume)} en la apertura. Corazón de ${midStr(perfume)}. Cierre con ${baseStr(perfume)}."\n` +
      `Texto: "Dura más de 8 horas"\n\n` +
      `[20–28s] SENSACIÓN\n` +
      `📷 Frasco en una bandeja, con una planta fuera de foco.\n` +
      `VO: "Un aroma intenso para disfrutar sin apuro."\n\n` +
      `[28–30s] CTA\n` +
      `Texto animado: "Escribinos al WhatsApp 👇"\n` +
      `VO: "Pedilo ahora."`
    );
  }

  return (
    `🎬 GUION REEL — ${perfume.name.toUpperCase()} (30 seg)\n` +
    `[0–3s] HOOK\n` +
    `📷 Plano detalle del frasco sobre madera y lino, con luz natural cálida.\n` +
    `Texto en pantalla: "Este perfume te va a sorprender"\n\n` +
    `[3–8s] PRESENTACIÓN\n` +
    `📷 Frasco completo sobre una bandeja, junto a un libro y una planta.\n` +
    `VO: "${perfume.name} de ${perfume.brand}. ${genderLine}"\n\n` +
    `[8–18s] DESCRIPCIÓN\n` +
    `📷 Movimiento suave alrededor del frasco, en un ambiente cálido y minimalista.\n` +
    `VO: "${perfume.description}"\n` +
    `Texto: "${onScreenNotes(perfume)}"\n\n` +
    `[18–26s] SENSACIÓN\n` +
    `📷 Frasco en mano, movimiento sutil junto a una textura de lino.\n` +
    `VO: "Una presencia cuidada, natural y fácil de hacer tuya."\n` +
    `Texto en pantalla: "Calidad premium, precio accesible"\n\n` +
    `[26–30s] CTA\n` +
    `📷 Logo DT Fragancias.\n` +
    `Texto: "WhatsApp en la bio 📲"\n` +
    `VO: "Hacé tu pedido hoy."`
  );
}
