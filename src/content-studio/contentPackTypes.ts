export type ContentPackReason = "manual" | "new_product";
export type ContentPackStatus = "draft" | "approved" | "rejected";

export interface StoryIdea {
  title: string;
  text: string;
  cta?: string;
}

export interface ReelIdea {
  hook: string;
  shots: string[];
  onScreenText: string[];
  cta: string;
  caption: string;
}

export interface ImageConcept {
  title: string;
  scene: string;
  overlayText?: string;
}

export interface ContentPackPayload {
  instagramCaption: string;
  stories: StoryIdea[];
  reel: ReelIdea;
  hashtags: string[];
  imageConcepts: ImageConcept[];
  whatsappText: string;
}

export interface ContentPack {
  /** Undefined while the pack is only being edited locally. */
  id?: string;
  /** Stable client-only identity for unsaved local packs. */
  clientId?: string;
  productId: number;
  reason: ContentPackReason;
  payload: ContentPackPayload;
  status: ContentPackStatus;
  createdAt: string;
  updatedAt: string;
}

export type NewContentPack = Pick<ContentPack, "productId" | "reason" | "payload">;
