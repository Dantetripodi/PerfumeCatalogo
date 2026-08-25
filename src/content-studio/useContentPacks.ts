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

export function createLocalContentPack(
  product: Perfume,
  reason: ContentPackReason,
  clientScope: string,
): ContentPack {
  const now = new Date().toISOString();
  return {
    ...generateContentPack(product, reason),
    id: undefined,
    clientId: uniqueLocalPackId(),
    clientScope,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function regenerateContentPack(
  pack: ContentPack,
  product: Perfume,
  clientScope: string,
): ContentPack {
  return createLocalContentPack(product, pack.reason, clientScope);
}

function samePack(left: ContentPack | null | undefined, right: ContentPack): boolean {
  if (!left) return false;
  if (left.id || right.id) return left.id !== undefined && left.id === right.id;
  return left.clientId !== undefined && left.clientId === right.clientId;
}

export function replacePack(
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
  clientScope: string | null = null,
): ContentPack[] {
  const localDrafts = currentPacks.filter(
    (pack) =>
      pack.id === undefined &&
      pack.clientId !== undefined &&
      clientScope !== null &&
      pack.clientScope === clientScope,
  );
  return [...localDrafts, ...refreshedPacks];
}

export function selectRefreshedPack(
  selectedPack: ContentPack | null,
  refreshedPacks: ContentPack[],
  clientScope?: string | null,
): ContentPack | null {
  if (!selectedPack) return null;
  if (selectedPack.id === undefined) {
    return clientScope !== null && selectedPack.clientScope === clientScope ? selectedPack : null;
  }
  return refreshedPacks.find((pack) => pack.id === selectedPack.id) ?? null;
}

export function canCreateDraft(
  enabled: boolean,
  clientScope: string | null,
): clientScope is string {
  return enabled && clientScope !== null;
}

export function resetScopedPackState() {
  return {
    packs: [] as ContentPack[],
    selectedPack: null as ContentPack | null,
    selectedProduct: null as Perfume | null,
    error: null as string | null,
  };
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

interface SaveQueueJob<T> {
  operation: (previous?: T) => Promise<T>;
  waiters: Array<{ resolve: (value: T) => void; reject: (cause: unknown) => void }>;
}

interface SaveQueueEntry<T> {
  queued: SaveQueueJob<T> | null;
}

export function createPackSaveQueue() {
  const entries = new Map<string, SaveQueueEntry<unknown>>();

  function start<T>(key: string, entry: SaveQueueEntry<T>, job: SaveQueueJob<T>, previous?: T): void {
    void Promise.resolve()
      .then(() => job.operation(previous))
      .then(
        (result) => {
          job.waiters.forEach(({ resolve }) => resolve(result));
          if (entry.queued) {
            const next = entry.queued;
            entry.queued = null;
            start(key, entry, next, result);
          } else {
            entries.delete(key);
          }
        },
        (cause) => {
          job.waiters.forEach(({ reject }) => reject(cause));
          if (entry.queued) {
            const next = entry.queued;
            entry.queued = null;
            start(key, entry, next);
          } else {
            entries.delete(key);
          }
        },
      );
  }

  return {
    run<T>(key: string, operation: (previous?: T) => Promise<T>): Promise<T> {
      let entry = entries.get(key) as SaveQueueEntry<T> | undefined;
      return new Promise<T>((resolve, reject) => {
        if (!entry) {
          entry = { queued: null };
          entries.set(key, entry as SaveQueueEntry<unknown>);
          start(key, entry, { operation, waiters: [{ resolve, reject }] });
          return;
        }

        if (!entry.queued) {
          entry.queued = { operation, waiters: [{ resolve, reject }] };
          return;
        }

        entry.queued.operation = operation;
        entry.queued.waiters.push({ resolve, reject });
      });
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
  /** Stable admin/user id that owns this hook state; null disables persistence and clears state. */
  adminIdentity?: string | null;
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
  const {
    adminIdentity,
    session = null,
    isAdmin,
    selectedProduct: initialProduct = null,
  } = options;
  const clientScope = adminIdentity !== undefined ? adminIdentity : session?.user.id ?? null;
  const admin = isAdmin ?? session?.user.app_metadata?.content_admin === true;
  const enabled = clientScope !== null && session !== null && admin;
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Perfume | null>(initialProduct);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const lifecycleRef = useRef(0);
  const requestSequenceRef = useRef(createPackRequestSequence());
  const saveQueueRef = useRef(createPackSaveQueue());
  const authKey = `${clientScope ?? "signed-out"}:${session?.user.id ?? ""}`;

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
      setPacks((current) => mergeRefreshedPacks(current, nextPacks, clientScope));
      setSelectedPack((current) => selectRefreshedPack(current, nextPacks, clientScope));
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
  }, [clientScope, enabled]);

  useEffect(() => {
    const lifecycle = ++lifecycleRef.current;
    requestSequenceRef.current = createPackRequestSequence();
    saveQueueRef.current = createPackSaveQueue();
    const reset = resetScopedPackState();
    setPacks(reset.packs);
    setSelectedPack(reset.selectedPack);
    setSelectedProduct(reset.selectedProduct);
    setError(reset.error);
    setLoading(enabled);
    if (enabled) void refresh();
    return () => {
      if (lifecycleRef.current === lifecycle) lifecycleRef.current += 1;
    };
  }, [authKey, enabled, refresh]);

  const selectPack = useCallback((pack: ContentPack | null) => {
    setSelectedPack(pack);
  }, []);

  const selectProduct = useCallback((product: Perfume | null) => {
    setSelectedProduct(product);
  }, []);

  const createDraft = useCallback(
    (product = selectedProduct ?? undefined, reason: ContentPackReason = "manual") => {
      if (!product || !canCreateDraft(enabled, clientScope)) return null;
      const draft = createLocalContentPack(product, reason, clientScope);
      setPacks((current) => [draft, ...current]);
      setSelectedPack(draft);
      setError(null);
      return draft;
    },
    [clientScope, enabled, selectedProduct],
  );

  const savePack = useCallback((pack: ContentPack) => {
    const candidate = pack.id || pack.clientId ? pack : { ...pack, clientId: uniqueLocalPackId() };
    const key = packKey(candidate);
    const lifecycle = lifecycleRef.current;
    const sequence = requestSequenceRef.current.next(key);
    setError(null);
    const pending = saveQueueRef.current.run<ContentPack>(key, async (previous) => {
      const target = !candidate.id && previous?.id ? { ...candidate, id: previous.id } : candidate;
      try {
        const saved = target.id
          ? await updateContentPack(target.id, target.payload)
          : await createContentPack({
              productId: target.productId,
              reason: target.reason,
              payload: target.payload,
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
        throw cause;
      }
    });
    return pending.catch(() => null);
  }, []);

  const changeStatus = useCallback((pack: ContentPack | undefined, action: ContentPackAction) => {
    const current = pack ?? selectedPack;
    if (!current?.id) {
      setError("Guardá el draft antes de cambiar su estado.");
      return Promise.resolve(null);
    }

    const key = packKey(current);
    const lifecycle = lifecycleRef.current;
    const sequence = requestSequenceRef.current.next(key);
    setError(null);
    const pending = saveQueueRef.current.run<ContentPack>(key, async (previous) => {
      const target = previous?.id ? previous : current;
      try {
        const updated = await setContentPackStatus(
          target.id as string,
          nextStatus(target.status, action),
        );
        if (
          lifecycleRef.current === lifecycle &&
          requestSequenceRef.current.isCurrent(key, sequence)
        ) {
          setPacks((items) => replacePack(items, current, updated));
          setSelectedPack((item) => (samePack(item, current) ? updated : item));
        }
        return updated;
      } catch (cause) {
        if (
          lifecycleRef.current === lifecycle &&
          requestSequenceRef.current.isCurrent(key, sequence)
        ) setError(normalizeContentPackError(cause, "status"));
        throw cause;
      }
    });
    return pending.catch(() => null);
  }, [selectedPack]);

  const regeneratePack = useCallback(
    (pack = selectedPack ?? undefined, product = selectedProduct ?? undefined) => {
      if (!pack || !product) return null;
      if (!clientScope) return null;
      const regenerated = regenerateContentPack(pack, product, clientScope);
      setPacks((current) => [regenerated, ...current]);
      setSelectedPack(regenerated);
      setError(null);
      return regenerated;
    },
    [clientScope, selectedPack, selectedProduct],
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
