import { describe, expect, it } from "vitest";
import type { ContentPack } from "./contentPackTypes";
import {
  contentPackItemKey,
  contentPackListItemKey,
  filterContentPacks,
  getPackProduct,
  sortContentPacksByUpdatedAt,
} from "./ContentPackInbox.utils";

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

  it("mantiene estable la key del editor cuando cambia el texto", () => {
    const originalText = ["Título", "Texto original|CTA"];
    const editedText = ["Título editado", "Texto nuevo|CTA"];

    expect(contentPackItemKey("story", 0, originalText)).toBe("story-0");
    expect(contentPackItemKey("story", 0, editedText)).toBe(contentPackItemKey("story", 0, originalText));
  });

  it("usa el índice para evitar colisiones entre items idénticos", () => {
    const duplicateKeys = [0, 1].map((index) => contentPackItemKey("story", index, ["Mismo", "contenido"]));

    expect(new Set(duplicateKeys).size).toBe(duplicateKeys.length);
  });

  it("mantiene únicas las keys de Inbox en fallback duplicado", () => {
    const duplicatePacks = [
      makePack({ productId: 7, updatedAt: "2026-08-23T10:00:00.000Z" }),
      makePack({ productId: 7, updatedAt: "2026-08-23T10:00:00.000Z" }),
    ];
    const keys = duplicatePacks.map((pack, index) => contentPackListItemKey(pack, index));

    expect(new Set(keys).size).toBe(duplicatePacks.length);
  });
});
