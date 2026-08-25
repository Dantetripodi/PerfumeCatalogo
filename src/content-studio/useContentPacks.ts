import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Perfume } from "../types";
import {
  createContentPack,
  listContentPacks,
  setContentPackStatus,
  updateContentPack,
} from "./contentPackRepository";
import { generateContentPack } from "./contentPackGenerators";
import type {
  ContentPack,
  ContentPackReason,
  ContentPackStatus,
} from "./contentPackTypes";

export type ContentPackAction = "approve" | "reject";

export function canEdit(status: ContentPackStatus): boolean {
  return status === "draft" || status === "approved" || status === "rejected";
}

export function nextStatus(
  status: ContentPackStatus,
  action: ContentPackAction,
): ContentPackStatus {
  if (action === "approve") return "approved";
  if (status === "draft" || status === "approved") return "rejected";
  return "rejected";
}

let localPackSequence = 0;

function uniqueLocalPackId(): string {
  localPackSequence += 1;
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ? `local-${randomId}` : `local-${Date.now()}-${localPackSequence}`;
}

export function createLocalContentPack(product: Perfume, reason: ContentPackReason): ContentPack {
  const now = new Date().toISOString();
  return {
    ...generateContentPack(product, reason),
    id: undefined,
    clientId: uniqueLocalPackId(),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function regenerateContentPack(pack: ContentPack, product: Perfume): ContentPack {
  return createLocalContentPack(product, pack.reason);
}

function samePack(left: ContentPack | null | undefined, right: ContentPack): boolean {
  if (!left) return false;
  if (left.id || right.id) return left.id !== undefined && left.id === right.id;
  return left.clientId !== undefined && left.clientId === right.clientId;
}

function replacePack(
  packs: ContentPack[],
  targetPack: ContentPack,
  replacement: ContentPack,
): ContentPack[] {
  const index = packs.findIndex((pack) => samePack(pack, targetPack));
  if (index === -1) return [replacement, ...packs];
  return packs.map((pack, packIndex) => (packIndex === index ? replacement : pack));
}

export function preserveEditedPack(packs: ContentPack[], editedPack: ContentPack): ContentPack[] {
  return replacePack(packs, editedPack, editedPack);
}

export interface UseContentPacksOptions {
  session?: Session | null;
  isAdmin?: boolean;
  selectedProduct?: Perfume | null;
}

export interface UseContentPacksState {
  packs: ContentPack[];
  selectedPack: ContentPack | null;
  selectedProduct: Perfume | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectPack: (pack: ContentPack | null) => void;
  selectProduct: (product: Perfume | null) => void;
  createDraft: (product?: Perfume, reason?: ContentPackReason) => ContentPack | null;
  savePack: (pack: ContentPack) => Promise<ContentPack | null>;
  approvePack: (pack?: ContentPack) => Promise<ContentPack | null>;
  rejectPack: (pack?: ContentPack) => Promise<ContentPack | null>;
  regeneratePack: (pack?: ContentPack, product?: Perfume) => ContentPack | null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo procesar el content pack.";
}

export function useContentPacks(options: UseContentPacksOptions = {}): UseContentPacksState {
  const { session = null, isAdmin, selectedProduct: initialProduct = null } = options;
  const admin = isAdmin ?? session?.user.app_metadata?.content_admin === true;
  const enabled = session !== null && admin;
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Perfume | null>(initialProduct);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const nextPacks = await listContentPacks();
      setPacks(nextPacks);
      setSelectedPack((current) =>
        current?.id ? nextPacks.find((pack) => pack.id === current.id) ?? null : current,
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectPack = useCallback((pack: ContentPack | null) => {
    setSelectedPack(pack);
  }, []);

  const selectProduct = useCallback((product: Perfume | null) => {
    setSelectedProduct(product);
  }, []);

  const createDraft = useCallback(
    (product = selectedProduct ?? undefined, reason: ContentPackReason = "manual") => {
      if (!product) return null;
      const draft = createLocalContentPack(product, reason);
      setPacks((current) => [draft, ...current]);
      setSelectedPack(draft);
      setError(null);
      return draft;
    },
    [selectedProduct],
  );

  const savePack = useCallback(async (pack: ContentPack) => {
    setError(null);
    try {
      const saved = pack.id
        ? await updateContentPack(pack.id, pack.payload)
        : await createContentPack({
            productId: pack.productId,
            reason: pack.reason,
            payload: pack.payload,
          });
      setPacks((current) => {
        return replacePack(current, pack, saved);
      });
      setSelectedPack((current) => (samePack(current, pack) ? saved : current));
      return saved;
    } catch (cause) {
      setPacks((current) => preserveEditedPack(current, pack));
      setSelectedPack((current) => (samePack(current, pack) ? pack : current));
      setError(errorMessage(cause));
      return null;
    }
  }, []);

  const changeStatus = useCallback(async (pack: ContentPack | undefined, action: ContentPackAction) => {
    const current = pack ?? selectedPack;
    if (!current?.id) {
      setError("Guardá el draft antes de cambiar su estado.");
      return null;
    }

    setError(null);
    try {
      const updated = await setContentPackStatus(current.id, nextStatus(current.status, action));
      setPacks((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedPack((item) => (item?.id === updated.id ? updated : item));
      return updated;
    } catch (cause) {
      setError(errorMessage(cause));
      return null;
    }
  }, [selectedPack]);

  const regeneratePack = useCallback(
    (pack = selectedPack ?? undefined, product = selectedProduct ?? undefined) => {
      if (!pack || !product) return null;
      const regenerated = regenerateContentPack(pack, product);
      setPacks((current) => [regenerated, ...current]);
      setSelectedPack(regenerated);
      setError(null);
      return regenerated;
    },
    [selectedPack, selectedProduct],
  );

  return {
    packs,
    selectedPack,
    selectedProduct,
    loading,
    error,
    refresh,
    selectPack,
    selectProduct,
    createDraft,
    savePack,
    approvePack: (pack) => changeStatus(pack, "approve"),
    rejectPack: (pack) => changeStatus(pack, "reject"),
    regeneratePack,
  };
}
