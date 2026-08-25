import type { Perfume } from "../types";
import { generateAllContent } from "./generators";
import type {
  ContentPackReason,
  NewContentPack,
  ReelIdea,
  StoryIdea,
} from "./contentPackTypes";

const cleanLines = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function normalizeStories(source: string): StoryIdea[] {
  const lines = cleanLines(source);
  if (lines.length === 0) return [];

  const storyCount = Math.min(4, Math.max(2, lines.length));
  return Array.from({ length: storyCount }, (_, index) => {
    const line = lines[Math.min(index, lines.length - 1)];
    const isLast = index === storyCount - 1;
    return {
      title: `Story ${index + 1}`,
      text: line,
      ...(isLast ? { cta: line } : {}),
    };
  });
}

const CONTENT_LABEL = "Texto(?: en pantalla| animado)?|VO";
const ON_SCREEN_LABEL = "Texto(?: en pantalla| animado)?";

const hasLabel = (line: string, label: string): boolean =>
  new RegExp(`^(?:${label})\\s*:`, "i").test(line);

const stripLabel = (line: string, label: string): string =>
  line.replace(new RegExp(`^(?:${label})\\s*:\\s*`, "i"), "").trim();

export function normalizeReel(source: string, caption: string): ReelIdea {
  const lines = cleanLines(source);
  const hookIndex = lines.findIndex((line) => /HOOK/i.test(line));
  const ctaIndex = lines.findIndex((line) => /CTA/i.test(line));
  const hookText = lines
    .slice(Math.max(0, hookIndex), ctaIndex === -1 ? undefined : ctaIndex)
    .find((line) => hasLabel(line, CONTENT_LABEL));
  const shots = lines
    .filter((line) => line.startsWith("📷"))
    .map((line) => line.replace(/^📷\s*/, "").trim());
  const onScreenText = lines
    .filter((line) => hasLabel(line, ON_SCREEN_LABEL))
    .map((line) => stripLabel(line, ON_SCREEN_LABEL));
  const ctaLines = ctaIndex === -1 ? [] : lines.slice(ctaIndex + 1);
  const ctaTextLine =
    ctaLines.find((line) => hasLabel(line, ON_SCREEN_LABEL)) ??
    ctaLines.find((line) => hasLabel(line, "VO"));
  const ctaLabel = ctaTextLine && hasLabel(ctaTextLine, ON_SCREEN_LABEL) ? ON_SCREEN_LABEL : "VO";

  return {
    hook: hookText ? stripLabel(hookText, CONTENT_LABEL) : lines[0] ?? "",
    shots,
    onScreenText,
    cta: ctaTextLine ? stripLabel(ctaTextLine, ctaLabel) : "",
    caption,
  };
}

export function generateContentPack(
  perfume: Perfume,
  reason: ContentPackReason = "manual",
): NewContentPack {
  const base = generateAllContent(perfume);

  return {
    productId: perfume.id,
    reason,
    payload: {
      instagramCaption: base.instagramCaption,
      stories: normalizeStories(base.instagramStory),
      reel: normalizeReel(base.reelScript, base.instagramCaption),
      hashtags: base.hashtags,
      imageConcepts: [{ title: "Concepto DT", scene: base.imagePrompt }],
      whatsappText: base.whatsappText,
    },
  };
}
