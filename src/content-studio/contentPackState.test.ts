import { describe, expect, it, vi } from "vitest";
import type { ContentPack } from "./contentPackTypes";

vi.mock("./contentPackRepository", () => ({
  createContentPack: vi.fn(),
  listContentPacks: vi.fn(),
  setContentPackStatus: vi.fn(),
  updateContentPack: vi.fn(),
}));

import { canEdit, nextStatus, regenerateContentPack } from "./useContentPacks";

const payload = {
  instagramCaption: "Caption",
  stories: [{ title: "Story", text: "Texto" }],
  reel: { hook: "Hook", shots: ["Frasco"], onScreenText: ["Texto"], cta: "CTA", caption: "Caption" },
  hashtags: ["#perfume"],
  imageConcepts: [{ title: "Luz", scene: "Lino" }],
  whatsappText: "Hola",
};

const perfume = {
  id: 42,
  name: "Eau de Lumière",
  brand: "DT Collection",
  price: 18500,
  gender: "unisex" as const,
  category: "cítrico" as const,
  size: "100 ml",
  image: "/images/eau-de-lumiere.jpg",
  description: "Una fragancia luminosa.",
  notes: { top: ["bergamota"], middle: ["neroli"], base: ["cedro"] },
  collection: "regular" as const,
  stock: "by-order" as const,
  tags: ["fresco"],
  slug: "eau-de-lumiere",
};

const existingPack: ContentPack = {
  id: "pack-1",
  productId: perfume.id,
  reason: "manual",
  payload,
  status: "approved",
  createdAt: "2026-08-25T12:00:00.000Z",
  updatedAt: "2026-08-25T12:00:00.000Z",
};

describe("content pack state transitions", () => {
  it.each(["draft", "approved", "rejected"] as const)("permite editar %s", (status) => {
    expect(canEdit(status)).toBe(true);
  });

  it.each([
    ["draft", "approve", "approved"],
    ["draft", "reject", "rejected"],
    ["approved", "reject", "rejected"],
  ] as const)("transiciona %s con %s a %s", (status, action, expected) => {
    expect(nextStatus(status, action)).toBe(expected);
  });

  it("regenera un pack existente como draft local nuevo sin mutar el original", () => {
    const regenerated = regenerateContentPack(existingPack, perfume);

    expect(regenerated.id).toBeUndefined();
    expect(regenerated.status).toBe("draft");
    expect(regenerated.productId).toBe(existingPack.productId);
    expect(existingPack.id).toBe("pack-1");
    expect(existingPack.status).toBe("approved");
    expect(regenerated).not.toBe(existingPack);
  });
});
