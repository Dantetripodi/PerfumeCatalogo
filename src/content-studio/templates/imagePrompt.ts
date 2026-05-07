import { Perfume, PerfumeCategory } from "../../types";

// ─── Prompts para generar imágenes con IA (Midjourney / DALL-E / Stable Diffusion)

interface StyleConfig {
  palette: string;
  mood: string;
  setting: string;
  lighting: string;
}

const CATEGORY_STYLES: Partial<Record<PerfumeCategory, StyleConfig>> = {
  oriental: {
    palette: "deep burgundy, gold, amber, black",
    mood: "mysterious, luxurious, exotic",
    setting: "ornate middle-eastern architecture, silk drapes, candlelight",
    lighting: "warm golden backlight, dramatic shadows",
  },
  amaderado: {
    palette: "warm browns, cream, muted gold, forest green",
    mood: "sophisticated, earthy, timeless",
    setting: "dark wooden table, autumn leaves, leather-bound books",
    lighting: "soft side lighting, warm tones",
  },
  floral: {
    palette: "soft pink, ivory, pale lavender, sage green",
    mood: "romantic, delicate, feminine",
    setting: "blooming garden, petals, white marble, morning light",
    lighting: "diffused natural light, golden hour",
  },
  cítrico: {
    palette: "bright yellow, lime, white, cobalt blue",
    mood: "fresh, energetic, clean",
    setting: "citrus fruits, Mediterranean terrace, ocean background",
    lighting: "bright midday sun, high contrast",
  },
  acuático: {
    palette: "ocean blue, silver, white, teal",
    mood: "fresh, clean, invigorating",
    setting: "ocean shore, water droplets, sea foam, driftwood",
    lighting: "cool natural light, reflective surfaces",
  },
  frutal: {
    palette: "warm peach, coral, deep red, cream",
    mood: "playful, sweet, vibrant",
    setting: "exotic fruits, colorful summer scene, tropical flowers",
    lighting: "warm colorful light, soft shadows",
  },
};

const DEFAULT_STYLE: StyleConfig = {
  palette: "black, gold, ivory, dark navy",
  mood: "elegant, premium, sophisticated",
  setting: "minimalist luxury surface, editorial perfume photography",
  lighting: "studio three-point lighting, dramatic",
};

export function generateImagePrompt(perfume: Perfume): string {
  const style = CATEGORY_STYLES[perfume.category] ?? DEFAULT_STYLE;
  const notes = [
    ...perfume.notes.top.slice(0, 2),
    ...perfume.notes.base.slice(0, 1),
  ].filter(Boolean);
  const notesStr = notes.length ? `, subtle visual references to ${notes.join(", ")}` : "";

  return (
    `Commercial perfume bottle photography, product advertisement.\n\n` +
    `Perfume: ${perfume.name} by ${perfume.brand}.\n` +
    `Color palette: ${style.palette}.\n` +
    `Mood: ${style.mood}.\n` +
    `Setting: ${style.setting}${notesStr}.\n` +
    `Lighting: ${style.lighting}.\n\n` +
    `Style: ultra high-end luxury perfume ad, editorial quality, 8k resolution, ` +
    `bokeh background, photorealistic, award-winning commercial photography.\n\n` +
    `Negative prompt: low quality, blurry, text, watermark, people, faces.`
  );
}
