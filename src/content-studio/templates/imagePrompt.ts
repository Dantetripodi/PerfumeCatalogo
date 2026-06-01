import { Perfume, PerfumeCategory } from "../../types";

// ─── Prompts de imagen para Instagram ────────────────────────────────────────
// Dos estilos inspirados en referencias reales de perfumería premium:
//
// ESTILO A — "Botanical Flat" (tipo infografía con ingredientes reales):
//   Fondo crema/beige, producto rodeado de ingredientes, anotaciones elegantes.
//   Ideal para carruseles y posts informativos.
//
// ESTILO B — "Studio Pedestal" (foto de producto premium sobre pedestal):
//   Fondo degradé cálido, frasco sobre peana circular, ingredientes en la base.
//   Ideal para foto de producto de lanzamiento o stories.

interface PaletteConfig {
  bg: string;
  accent: string;
  ingredients: string;
}

const CATEGORY_PALETTE: Partial<Record<PerfumeCategory, PaletteConfig>> = {
  oriental: {
    bg: "warm terracotta gradient, deep amber, burnt sienna",
    accent: "gold, dark bronze",
    ingredients: "cinnamon sticks, amber resin, oud wood chips, cardamom pods",
  },
  "vainilla dulce": {
    bg: "warm caramel gradient, creamy peach, soft terracotta",
    accent: "gold, warm bronze",
    ingredients: "vanilla beans, caramelized almonds, tonka beans, cinnamon sticks",
  },
  "vainilla especiada": {
    bg: "warm caramel gradient, deep amber, cream",
    accent: "dark gold, cognac",
    ingredients: "vanilla pods, mixed spices, amber resin, dark wood pieces",
  },
  amaderado: {
    bg: "warm sand gradient, muted taupe, ivory",
    accent: "warm gold, olive",
    ingredients: "cedar wood pieces, sandalwood shavings, dried moss, dark bark",
  },
  "amaderado especiado": {
    bg: "deep brown gradient, cognac, warm ochre",
    accent: "antique gold, copper",
    ingredients: "patchouli leaves, vetiver roots, pepper, raw wood shavings",
  },
  floral: {
    bg: "soft ivory gradient, blush pink, pale cream",
    accent: "rose gold, dusty pink",
    ingredients: "fresh rose petals, jasmine blooms, white peonies, green leaves",
  },
  "ambar floral": {
    bg: "warm nude gradient, soft peach, ivory",
    accent: "gold, rose gold",
    ingredients: "amber resin chunks, dried flower petals, rose buds, vanilla pods",
  },
  cítrico: {
    bg: "bright cream gradient, warm white, pale yellow",
    accent: "gold, citrus orange",
    ingredients: "lemon slices, bergamot fruit, orange zest, fresh herb sprigs",
  },
  acuático: {
    bg: "cool mist gradient, pale silver-blue, white",
    accent: "silver, platinum",
    ingredients: "sea salt crystals, driftwood, water droplets, coastal pebbles",
  },
  frutal: {
    bg: "warm cream gradient, soft peach, ivory",
    accent: "warm gold, coral",
    ingredients: "exotic tropical fruits, melon slices, fresh berries, pineapple",
  },
  "floral frutal": {
    bg: "light blush gradient, peach, ivory",
    accent: "rose gold, soft coral",
    ingredients: "fresh berries, pink peonies, rose petals, sliced fruits",
  },
  aromatica: {
    bg: "warm sage gradient, soft khaki, cream",
    accent: "olive gold, earthy green",
    ingredients: "lavender sprigs, rosemary, fresh herbs, citrus wedges",
  },
};

const DEFAULT_PALETTE: PaletteConfig = {
  bg: "warm cream gradient, ivory, soft beige",
  accent: "antique gold, dark navy",
  ingredients: "exotic spices, amber resin, wood elements, delicate flowers",
};

function getIngredients(perfume: Perfume): string {
  const allNotes = [
    ...perfume.notes.top.slice(0, 2),
    ...perfume.notes.middle.slice(0, 1),
    ...perfume.notes.base.slice(0, 1),
  ].filter(Boolean);
  const palette = CATEGORY_PALETTE[perfume.category] ?? DEFAULT_PALETTE;
  return allNotes.length >= 3 ? allNotes.join(", ") : palette.ingredients;
}

// ─── Estilo A: Botanical Flat ─────────────────────────────────────────────────

function generateBotanicalPrompt(perfume: Perfume): string {
  const palette = CATEGORY_PALETTE[perfume.category] ?? DEFAULT_PALETTE;
  const ingredients = getIngredients(perfume);
  const genderMood =
    perfume.gender === "femenino"
      ? "feminine, delicate, romantic"
      : perfume.gender === "masculino"
      ? "masculine, bold, sophisticated"
      : "elegant, modern, unisex";

  return (
    `Botanical flat lay product photography for Instagram, editorial infographic style, ` +
    `similar to artisan candle brand catalog photography.\n\n` +
    `Product: Perfume bottle "${perfume.name}" by ${perfume.brand}.\n` +
    `Background: Flat clean ${palette.bg} surface. Warm, minimal, cream/beige tones.\n` +
    `Composition: Bottle centered, naturally surrounded by its key fragrance ingredients: ` +
    `${ingredients}. Real botanicals — whole, sliced and scattered around the bottle in a ` +
    `beautiful organic arrangement. Some ingredients slightly overlapping the base.\n` +
    `Leave clean space at the top (30% of frame) for serif title typography in ${palette.accent}.\n` +
    `Leave narrow side margins for annotation lines pointing to ingredients.\n` +
    `Lighting: Soft diffused overhead natural light, no harsh shadows, warm and clean.\n` +
    `Mood: ${genderMood}, ${perfume.category} fragrance family. Premium artisan product.\n` +
    `Format: Instagram portrait 4:5 ratio, 4K resolution, photorealistic, no text, no people, ` +
    `no watermark. Kinfolk / Monocle magazine editorial aesthetic.\n` +
    `Negative: blurry, dark, low quality, text on image, people, faces, cartoon, flat white background.`
  );
}

// ─── Estilo B: Studio Pedestal ────────────────────────────────────────────────

function generateStudioPrompt(perfume: Perfume): string {
  const palette = CATEGORY_PALETTE[perfume.category] ?? DEFAULT_PALETTE;
  const ingredients = getIngredients(perfume);
  const genderMood =
    perfume.gender === "femenino"
      ? "feminine luxury, soft glamour"
      : perfume.gender === "masculino"
      ? "masculine luxury, powerful elegance"
      : "unisex luxury, modern sophistication";

  return (
    `Luxury perfume bottle product photography for Instagram, studio pedestal style, ` +
    `similar to Yves d'Orgeval Paris or Parfums de Marly product campaigns.\n\n` +
    `Product: Perfume bottle "${perfume.name}" by ${perfume.brand}.\n` +
    `Background: Smooth gradient backdrop — ${palette.bg}. Warm gradient from slightly darker ` +
    `edges to lighter center, no sharp transitions. Elegant and premium.\n` +
    `Composition: Bottle on a small circular marble or cream pedestal/plinth centered in frame. ` +
    `Key ingredients elegantly arranged around the pedestal base: ${ingredients}. ` +
    `Ingredients are beautiful and realistic, artfully placed — some whole, some broken naturally.\n` +
    `Lighting: Professional studio 3-point lighting. Strong warm key light from upper-right ` +
    `creating beautiful gloss on the bottle. Soft fill. Subtle drop shadow under pedestal. ` +
    `Bottle glass catches light and shows depth.\n` +
    `Mood: ${genderMood}. Ultra premium niche perfumery. Aspirational and desirable.\n` +
    `Colors: Dominant ${palette.bg}. Accent touches of ${palette.accent}.\n` +
    `Format: Instagram portrait 4:5 ratio, 8K resolution, photorealistic commercial product ` +
    `photography, shallow DOF with bottle sharp and background softly blurred. No text, no people, no watermark.\n` +
    `Negative: blurry, white studio background, cheap look, flat lighting, low quality, text, people, faces, overexposed.`
  );
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function generateImagePrompt(perfume: Perfume): string {
  const botanical = generateBotanicalPrompt(perfume);
  const studio = generateStudioPrompt(perfume);

  return (
    `━━━ OPCIÓN A — Botanical Flat ━━━\n` +
    `(carrusel · infografía de notas · post educativo)\n\n` +
    botanical +
    `\n\n` +
    `━━━ OPCIÓN B — Studio Pedestal ━━━\n` +
    `(foto de producto · lanzamiento · story premium)\n\n` +
    studio
  );
}
