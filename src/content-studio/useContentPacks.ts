import { useCallback, useEffect, useRef, useState } from "react";
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
export type ContentPackErrorOperation = "refresh" | "save" | "status";

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

export function mergeRefreshedPacks(
  currentPacks: ContentPack[],
  refreshedPacks: ContentPack[],
): ContentPack[] {
  const localDrafts = currentPacks.filter((pack) => pack.id === undefined && pack.clientId !== undefined);
  return [...localDrafts, ...refreshedPacks];
}

export function createPackRequestSequence() {
  const latest = new Map<string, number>();
  return {
    next(key: string): number {
      const sequence = (latest.get(key) ?? 0) + 1;
      latest.set(key, sequence);
      return sequence;
    },
    isCurrent(key: string, sequence: number): boolean {
      return latest.get(key) === sequence;
    },
  };
}

export function createPackSaveLock() {
  const pending = new Map<string, Promise<unknown>>();
  return {
    run<T>(key: string, operation: () => Promise<T>): Promise<T> {
      const current = pending.get(key);
      if (current) return current as Promise<T>;

      const next = operation();
      pending.set(key, next);
      void next.then(
        () => {
          if (pending.get(key) === next) pending.delete(key);
        },
        () => {
          if (pending.get(key) === next) pending.delete(key);
        },
      );
      return next;
    },
  };
}

export function normalizeContentPackError(
  error: unknown,
  operation: ContentPackErrorOperation,
): string {
  void error;
  if (operation === "refresh") return "No se pudieron cargar los content packs.";
  if (operation === "status") return "No se pudo actualizar el estado del content pack.";
  return "No se pudo guardar el content pack.";
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

function packKey(pack: ContentPack): string {
  return pack.id ? `persisted:${pack.id}` : `local:${pack.clientId ?? "anonymous"}`;
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
  const lifecycleRef = useRef(0);
  const requestSequenceRef = useRef(createPackRequestSequence());
  const saveLockRef = useRef(createPackSaveLock());
  const authKey = session?.user.id ?? "signed-out";

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const lifecycle = lifecycleRef.current;
    const sequence = requestSequenceRef.current.next("refresh");
    setLoading(true);
    setError(null);
    try {
      const nextPacks = await listContentPacks();
      if (
        lifecycleRef.current !== lifecycle ||
        !requestSequenceRef.current.isCurrent("refresh", sequence)
      ) return;
      setPacks((current) => mergeRefreshedPacks(current, nextPacks));
      setSelectedPack((current) =>
        current?.id ? nextPacks.find((pack) => pack.id === current.id) ?? current : current,
      );
    } catch (cause) {
      if (
        lifecycleRef.current === lifecycle &&
        requestSequenceRef.current.isCurrent("refresh", sequence)
      ) setError(normalizeContentPackError(cause, "refresh"));
    } finally {
      if (
        lifecycleRef.current === lifecycle &&
        requestSequenceRef.current.isCurrent("refresh", sequence)
      ) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    const lifecycle = ++lifecycleRef.current;
    void refresh();
    return () => {
      if (lifecycleRef.current === lifecycle) lifecycleRef.current += 1;
    };
  }, [authKey, refresh]);

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

  const savePack = useCallback((pack: ContentPack) => {
    const candidate = pack.id || pack.clientId ? pack : { ...pack, clientId: uniqueLocalPackId() };
    const key = packKey(candidate);
    const lifecycle = lifecycleRef.current;
    setError(null);
    return saveLockRef.current.run(key, async () => {
      const sequence = requestSequenceRef.current.next(key);
      try {
        const saved = candidate.id
          ? await updateContentPack(candidate.id, candidate.payload)
          : await createContentPack({
              productId: candidate.productId,
              reason: candidate.reason,
              payload: candidate.payload,
            });
        if (
          lifecycleRef.current === lifecycle &&
          requestSequenceRef.current.isCurrent(key, sequence)
        ) {
          setPacks((current) => replacePack(current, candidate, saved));
          setSelectedPack((current) => (samePack(current, candidate) ? saved : current));
        }
        return saved;
      } catch (cause) {
        if (
          lifecycleRef.current === lifecycle &&
          requestSequenceRef.current.isCurrent(key, sequence)
        ) {
          setPacks((current) => preserveEditedPack(current, candidate));
          setSelectedPack((current) => (samePack(current, candidate) ? candidate : current));
          setError(normalizeContentPackError(cause, "save"));
        }
        return null;
      }
    });
  }, []);

  const changeStatus = useCallback(async (pack: ContentPack | undefined, action: ContentPackAction) => {
    const current = pack ?? selectedPack;
    if (!current?.id) {
      setError("Guardá el draft antes de cambiar su estado.");
      return null;
    }

    const key = packKey(current);
    const lifecycle = lifecycleRef.current;
    const sequence = requestSequenceRef.current.next(key);
    setError(null);
    try {
      const updated = await setContentPackStatus(current.id, nextStatus(current.status, action));
      if (
        lifecycleRef.current !== lifecycle ||
        !requestSequenceRef.current.isCurrent(key, sequence)
      ) return updated;
      setPacks((items) => replacePack(items, current, updated));
      setSelectedPack((item) => (samePack(item, current) ? updated : item));
      return updated;
    } catch (cause) {
      if (
        lifecycleRef.current === lifecycle &&
        requestSequenceRef.current.isCurrent(key, sequence)
      ) setError(normalizeContentPackError(cause, "status"));
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
