import { describe, expect, it } from "vitest";
import type { ContentPack } from "./contentPackTypes";
import { filterContentPacks, getPackProduct, sortContentPacksByUpdatedAt } from "./ContentPackInbox.utils";
import { contentPackItemKey } from "./ContentPackInbox.utils";

const makePack = (overrides: Partial<ContentPack> = {}): ContentPack => ({
  productId: 1,
  reason: "manual",
  payload: {
    instagramCaption: "caption",
    stories: [],
    reel: { hook: "hook", shots: [], onScreenText: [], cta: "cta", caption: "caption" },
    hashtags: [],
    imageConcepts: [],
    whatsappText: "whatsapp",
  },
  status: "draft",
  createdAt: "2026-08-20T10:00:00.000Z",
  updatedAt: "2026-08-20T10:00:00.000Z",
  ...overrides,
});

describe("ContentPackInbox helpers", () => {
  it("ordena los packs por updatedAt descendente sin mutar la lista original", () => {
    const older = makePack({ clientId: "older", updatedAt: "2026-08-20T10:00:00.000Z" });
    const newer = makePack({ clientId: "newer", updatedAt: "2026-08-22T10:00:00.000Z" });
    const packs = [older, newer];

    expect(sortContentPacksByUpdatedAt(packs).map((pack) => pack.clientId)).toEqual([
      "newer",
      "older",
    ]);
    expect(packs[0]).toBe(older);
  });

  it("filtra por nombre de producto y estado", () => {
    const packs = [
      makePack({ productId: 1, status: "draft" }),
      makePack({ productId: 2, status: "approved" }),
    ];
    const perfumes = [
      { id: 1, name: "Aventus", image: "aventus.jpg" },
      { id: 2, name: "Eros", image: "eros.jpg" },
    ];

    expect(filterContentPacks(packs, perfumes, "aventus", "all")).toHaveLength(1);
    expect(filterContentPacks(packs, perfumes, "", "approved")).toHaveLength(1);
    expect(filterContentPacks(packs, perfumes, "", "rejected")).toHaveLength(0);
  });

  it("resuelve el producto para el detalle y tolera ids sin match", () => {
    const perfumes = [
      { id: 1, name: "Aventus", image: "aventus.jpg" },
      { id: 2, name: "Eros", image: "eros.jpg" },
    ];

    expect(getPackProduct(makePack({ productId: 2 }), perfumes)).toEqual(perfumes[1]);
    expect(getPackProduct(makePack({ productId: 99 }), perfumes)).toBeNull();
  });

  it("deriva keys de contenido estable y usa el índice sólo para contenido vacío", () => {
    expect(contentPackItemKey("story", ["Título", "Texto", "CTA"], 0)).toBe("story-Título|Texto|CTA");
    expect(contentPackItemKey("concept", ["", "", ""], 2)).toBe("concept-empty-2");
  });
});
