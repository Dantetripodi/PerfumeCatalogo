// ─── Content Studio — Tipos ─────────────────────────────────────────────────

export interface ContentOutput {
  instagramCaption: string;
  instagramStory: string;
  reelScript: string;
  whatsappText: string;
  hashtags: string[];
  imagePrompt: string;
}

export type ContentSection =
  | "instagramCaption"
  | "instagramStory"
  | "reelScript"
  | "whatsappText"
  | "hashtags"
  | "imagePrompt";

export const CONTENT_SECTION_LABELS: Record<ContentSection, string> = {
  instagramCaption: "Caption para Instagram",
  instagramStory: "Historia de Instagram",
  reelScript: "Guion de Reel",
  whatsappText: "Texto para WhatsApp",
  hashtags: "Hashtags",
  imagePrompt: "Prompt para imagen IA",
};

export const CONTENT_SECTION_ICONS: Record<ContentSection, string> = {
  instagramCaption: "📸",
  instagramStory: "✨",
  reelScript: "🎬",
  whatsappText: "💬",
  hashtags: "#",
  imagePrompt: "🤖",
};
