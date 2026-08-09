// ─── Content Studio — Generadores principales ────────────────────────────────
// Punto de entrada único para generar todo el contenido de un perfume.

import { Perfume } from "../types";
import { ContentOutput } from "./types";
import { generateInstagramCaption } from "./templates/instagram";
import { generateInstagramStory } from "./templates/stories";
import { generateReelScript } from "./templates/reel";
import { generateWhatsappText } from "./templates/whatsapp";
import { generateHashtags } from "./templates/hashtags";
import { generateImagePrompt } from "./templates/imagePrompt";

/**
 * Genera el set completo de contenido para un perfume dado.
 * Todos los outputs son strings listos para copiar y pegar.
 */
export function generateAllContent(perfume: Perfume): ContentOutput {
  return {
    instagramCaption: generateInstagramCaption(perfume),
    instagramStory: generateInstagramStory(perfume),
    reelScript: generateReelScript(perfume),
    whatsappText: generateWhatsappText(perfume),
    hashtags: generateHashtags(perfume),
    imagePrompt: generateImagePrompt(perfume),
  };
}

export {
  generateInstagramCaption,
  generateInstagramStory,
  generateReelScript,
  generateWhatsappText,
  generateHashtags,
  generateImagePrompt,
};
