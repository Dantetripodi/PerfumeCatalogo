import type {
  CarouselFormat,
  CarouselFormatSpec,
  CarouselPostType,
  CatGradient,
} from "./types";

// ── Textos -------------------------------------------------------------------

export const HOOKS: Record<CarouselPostType, string[]> = {
  producto: [
    "✨ Conocé nuestro perfume estrella",
    "🌟 El que todas piden",
    "💫 Tu próxima fragancia favorita",
    "🔥 Lo más vendido del mes",
    "🏆 El número 1 en pedidos",
    "💎 Calidad que se siente",
    "🌸 Fragancias que enamoran",
    "⚡ Esto sí que dura todo el día",
  ],
  ocasion: [
    "💼 Para tu día a día",
    "🌙 Perfecto para la noche",
    "💕 Tu cita ideal",
    "✨ Para ocasiones especiales",
    "🎉 Que no te falte en eventos",
    "🌅 Del trabajo a la salida",
    "💃 Para bailar hasta tarde",
    "☀️ Frescura que acompaña todo el verano",
  ],
  novedad: [
    "🆕 Recién llegado",
    "⚡ Stock fresco disponible",
    "🎁 Nuevo en el catálogo",
    "🌟 Lo último que llegó",
    "🚀 Acabamos de recibirlo",
    "📦 Llegó lo que esperabas",
    "🔔 Nuevo en stock",
    "✅ Disponible ahora mismo",
  ],
  testimonio: [
    "💬 Lo que dicen nuestros clientes",
    "⭐ La opinión de quien lo probó",
    "💖 Testimonios reales",
    "🌟 Por qué lo eligen",
    "🙌 Clientes que volvieron por más",
    "❤️ El perfume que te van a preguntar",
    "😍 Lo que nos escriben",
    "👃 El aroma que no pasa desapercibido",
  ],
};

export const CTAS: string[] = [
  "📲 Escribinos al DM para pedirlo",
  "💌 Consultá disponibilidad por mensaje",
  "🛍️ Reservá el tuyo hoy mismo",
  "✨ Pedilo antes de que se agote",
  "📦 Envíos a todo el país",
  "💬 Hablanos por DM",
  "🔗 Pedilo por mensaje directo",
  "🎁 Ideal para regalar, consultanos",
  "⚡ Respondemos al instante",
  "📩 Mandanos un mensaje",
];

export const ETIQUETAS: Record<CarouselPostType, string[]> = {
  producto: [
    "PRODUCTO DEL DÍA",
    "FAVORITO DE LA SEMANA",
    "DESTACADO",
    "BESTSELLER",
    "TOP VENTAS",
  ],
  ocasion: [
    "POR OCASIÓN",
    "PARA TU CITA",
    "PARA LA NOCHE",
    "PARA EL DÍA",
    "PARA EVENTOS",
  ],
  novedad: [
    "NOVEDAD",
    "RECIÉN LLEGADO",
    "NUEVO STOCK",
    "RECIÉN INGRESADO",
    "DISPONIBLE YA",
  ],
  testimonio: [
    "TESTIMONIO",
    "LO DICEN ELLOS",
    "CLIENTES SATISFECHOS",
    "OPINIÓN REAL",
    "⭐ RESEÑA",
  ],
};

export const HASHTAGS_BASE =
  "#perfumes #fragancias #perfumesarabes #perfumeria #dtfragancias #argentina #regalos #aromas #fraganciasdeluxe";

// ── Estilo visual ------------------------------------------------------------

export const CAT_GRADIENTS: Record<string, CatGradient> = {
  femenino: { from: "#c44569", to: "#f8a5c2", text: "#fff" },
  masculino: { from: "#1A2238", to: "#3a4f8a", text: "#fff" },
  unisex: { from: "#614124", to: "#D4AF37", text: "#fff" },
  home: { from: "#1a3619", to: "#2d5a27", text: "#fff" },
};

export function getCatGradient(cat: string): CatGradient {
  return CAT_GRADIENTS[cat] || CAT_GRADIENTS.unisex;
}

// ── Formatos de exportación --------------------------------------------------

export const FORMATOS: Record<CarouselFormat, CarouselFormatSpec> = {
  feed: { w: 1080, h: 1350, label: "Feed (4:5)" },
  square: { w: 1080, h: 1080, label: "Cuadrado (1:1)" },
  stories: { w: 1080, h: 1920, label: "Stories (9:16)" },
};
