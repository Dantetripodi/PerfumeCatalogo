import { describe, expect, it, vi } from "vitest";
import type { ContentPack } from "./contentPackTypes";

vi.mock("./contentPackRepository", () => ({
  createContentPack: vi.fn(),
  listContentPacks: vi.fn(),
  setContentPackStatus: vi.fn(),
  updateContentPack: vi.fn(),
}));

import {
  canEdit,
  canCreateDraft,
  createPackSaveQueue,
  createLocalContentPack,
  createPackRequestSequence,
  mergeRefreshedPacks,
  normalizeContentPackError,
  nextStatus,
  preserveEditedPack,
  replacePack,
  regenerateContentPack,
  resetScopedPackState,
  selectRefreshedPack,
} from "./useContentPacks";

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

  it("asigna identidades locales distintas a dos drafts", () => {
    const first = createLocalContentPack(perfume, "manual");
    const second = createLocalContentPack(perfume, "manual");

    expect(first.id).toBeUndefined();
    expect(second.id).toBeUndefined();
    expect(first.clientId).toBeDefined();
    expect(second.clientId).toBeDefined();
    expect(first.clientId).not.toBe(second.clientId);
  });

  it("preserva el payload editado cuando falla el save", () => {
    const first = createLocalContentPack(perfume, "manual");
    const second = createLocalContentPack(perfume, "manual");
    const edited = { ...second, payload: { ...second.payload, instagramCaption: "Edición local" } };

    const preserved = preserveEditedPack([first, second], edited);

    expect(preserved).toHaveLength(2);
    expect(preserved.find((pack) => pack.clientId === second.clientId)?.payload.instagramCaption).toBe(
      "Edición local",
    );
    expect(preserved.find((pack) => pack.clientId === first.clientId)).toBe(first);
  });

  it("preserva drafts locales al aplicar un refresh persistido", () => {
    const localDraft = createLocalContentPack(perfume, "manual", "admin-a");
    const otherDraft = createLocalContentPack(perfume, "manual", "admin-b");
    const persisted = { ...existingPack, payload: { ...payload, instagramCaption: "Persistido" } };

    expect(mergeRefreshedPacks([localDraft, otherDraft, existingPack], [persisted], "admin-a")).toEqual([
      localDraft,
      persisted,
    ]);
    const unscopedDraft = createLocalContentPack(perfume, "manual", null);
    expect(mergeRefreshedPacks([unscopedDraft], [persisted], "admin-a")).toEqual([persisted]);
  });

  it("no mezcla drafts al cambiar de identidad ni al hacer logout", () => {
    const adminADraft = createLocalContentPack(perfume, "manual", "admin-a");
    const adminBDraft = createLocalContentPack(perfume, "manual", "admin-b");

    expect(mergeRefreshedPacks([adminADraft], [], "admin-b")).toEqual([]);
    expect(mergeRefreshedPacks([adminADraft], [], null)).toEqual([]);
    expect(mergeRefreshedPacks([adminBDraft], [], "admin-b")).toEqual([adminBDraft]);
  });

  it("bloquea drafts sin scope o con el hook disabled", () => {
    expect(canCreateDraft(false, "admin-a")).toBe(false);
    expect(canCreateDraft(true, null)).toBe(false);
    expect(canCreateDraft(true, "admin-a")).toBe(true);
  });

  it("limpia también el producto seleccionado al cerrar el scope", () => {
    expect(resetScopedPackState()).toEqual({
      packs: [],
      selectedPack: null,
      selectedProduct: null,
      error: null,
    });
  });

  it("limpia la selección persistida si refresh ya no la devuelve", () => {
    expect(selectRefreshedPack(existingPack, [])).toBeNull();
    expect(selectRefreshedPack(existingPack, [existingPack])).toBe(existingPack);
  });

  it("descarta respuestas de refresh que ya no son la última secuencia", () => {
    const sequence = createPackRequestSequence();
    const first = sequence.next("refresh");
    const second = sequence.next("refresh");

    expect(sequence.isCurrent("refresh", first)).toBe(false);
    expect(sequence.isCurrent("refresh", second)).toBe(true);
  });

  it("mantiene secuencias independientes por identidad persistida", () => {
    const sequence = createPackRequestSequence();
    const oldPackOne = sequence.next("persisted:pack-1");
    const packTwo = sequence.next("persisted:pack-2");
    const newPackOne = sequence.next("persisted:pack-1");

    expect(sequence.isCurrent("persisted:pack-1", oldPackOne)).toBe(false);
    expect(sequence.isCurrent("persisted:pack-1", newPackOne)).toBe(true);
    expect(sequence.isCurrent("persisted:pack-2", packTwo)).toBe(true);
  });

  it("encola el último payload y deja seleccionado el resultado B", async () => {
    const queue = createPackSaveQueue();
    let resolveFirst!: (value: ContentPack) => void;
    const first = { ...existingPack, payload: { ...payload, instagramCaption: "A" } };
    const second = { ...existingPack, payload: { ...payload, instagramCaption: "B" } };
    const repositoryCalls: string[] = [];
    const firstPending = new Promise<ContentPack>((resolve) => {
      resolveFirst = resolve;
    });
    const firstSave = queue.run<ContentPack>("persisted:pack-1", async () => {
      repositoryCalls.push(first.payload.instagramCaption);
      return firstPending;
    });
    const secondSave = queue.run<ContentPack>("persisted:pack-1", async (previous) => {
      repositoryCalls.push(second.payload.instagramCaption);
      expect(previous).toBe(first);
      return second;
    });

    resolveFirst(first);
    await expect(firstSave).resolves.toBe(first);
    const savedB = await secondSave;

    expect(repositoryCalls).toEqual(["A", "B"]);
    expect(replacePack([first], second, savedB)[0].payload.instagramCaption).toBe("B");
  });

  it("ordena save y status en la misma cola por identidad", async () => {
    const queue = createPackSaveQueue();
    const calls: string[] = [];
    const saved = { ...existingPack, status: "draft" as const };
    const approved = { ...saved, status: "approved" as const };
    const save = queue.run<ContentPack>("persisted:pack-1", async () => {
      calls.push("save");
      return saved;
    });
    const status = queue.run<ContentPack>("persisted:pack-1", async (previous) => {
      calls.push(`status:${previous?.status}`);
      return approved;
    });

    await expect(save).resolves.toBe(saved);
    await expect(status).resolves.toBe(approved);
    expect(calls).toEqual(["save", "status:draft"]);
  });

  it("normaliza errores sin exponer el Error.message original", () => {
    expect(normalizeContentPackError(new Error("token=secret"), "save")).toBe(
      "No se pudo guardar el content pack.",
    );
  });
});
