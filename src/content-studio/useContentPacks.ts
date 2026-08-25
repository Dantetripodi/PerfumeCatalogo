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

export function isValidScope(scope: string | null | undefined): scope is string {
  return typeof scope === "string" && scope.trim().length > 0;
}

export function isCurrentHookContext(
  renderEpoch: number,
  renderScope: string | null,
  currentEpoch: number,
  currentScope: string | null,
  mounted: boolean,
): boolean {
  return mounted &&
    renderEpoch === currentEpoch &&
    renderScope === currentScope &&
    isValidScope(currentScope);
}

export function applyIfCurrentHookContext(
  renderEpoch: number,
  renderScope: string | null,
  currentEpoch: number,
  currentScope: string | null,
  mounted: boolean,
  effect: () => void,
): boolean {
  if (!isCurrentHookContext(renderEpoch, renderScope, currentEpoch, currentScope, mounted)) {
    return false;
  }
  effect();
  return true;
}

export interface HookRenderContext {
  readonly key: string;
  readonly scope: string | null;
  readonly epoch: number;
}

export function createHookRenderContext(
  key: string,
  scope: string | null,
  epoch: number,
): HookRenderContext {
  return Object.freeze({ key, scope, epoch });
}

export function isCurrentHookRenderContext(
  callbackContext: HookRenderContext,
  currentContext: HookRenderContext,
  currentEpoch: number,
  currentScope: string | null,
  mounted: boolean,
): boolean {
  return mounted &&
    callbackContext === currentContext &&
    callbackContext.epoch === currentEpoch &&
    callbackContext.scope === currentScope &&
    isValidScope(currentScope);
}

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
  if (!isValidScope(clientScope)) {
    throw new Error("El content pack necesita un scope de administrador válido.");
  }
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
): ContentPack | null {
  if (!isValidScope(clientScope)) return null;
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
      isValidScope(clientScope) &&
      isValidScope(pack.clientScope) &&
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
    return isValidScope(clientScope) &&
      isValidScope(selectedPack.clientScope) &&
      selectedPack.clientScope === clientScope
      ? selectedPack
      : null;
  }
  return refreshedPacks.find((pack) => pack.id === selectedPack.id) ?? null;
}

export function canCreateDraft(
  enabled: boolean,
  clientScope: string | null,
): clientScope is string {
  return enabled && isValidScope(clientScope);
}

export function canSavePack(pack: ContentPack): boolean {
  return pack.id !== undefined || isValidScope(pack.clientScope);
}

export function canMutatePack(
  enabled: boolean,
  clientScope: string | null,
  pack: ContentPack,
): boolean {
  return enabled &&
    isValidScope(clientScope) &&
    isValidScope(pack.clientScope) &&
    pack.clientScope === clientScope;
}

export function canRegeneratePack(
  enabled: boolean,
  clientScope: string | null,
  pack: ContentPack,
): boolean {
  return canMutatePack(enabled, clientScope, pack);
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

let queueGenerationSequence = 0;

export function createPackSaveQueue(
  getEpoch: () => number = () => 0,
  isMounted: () => boolean = () => true,
) {
  const entries = new Map<string, SaveQueueEntry<unknown>>();
  const queueEpoch = getEpoch();
  const queueGeneration = Object.freeze({ id: ++queueGenerationSequence });
  let queueActive = true;

  const isQueueActive = (): boolean =>
    queueActive && queueGeneration.id > 0 && isMounted() && getEpoch() === queueEpoch;

  const invalidate = (): void => {
    queueActive = false;
    entries.forEach((entry) => {
      if (!entry.queued) return;
      const cause = new Error("stale pack queue");
      entry.queued.waiters.forEach(({ reject }) => reject(cause));
      entry.queued = null;
    });
  };

  // The repository currently has no AbortSignal contract: in-flight requests
  // finish, but lifecycle guards suppress their state updates and queued jobs.
  function start<T>(key: string, entry: SaveQueueEntry<T>, job: SaveQueueJob<T>, previous?: T): void {
    if (!isQueueActive()) {
      const cause = new Error("stale pack queue");
      job.waiters.forEach(({ reject }) => reject(cause));
      if (entry.queued) entry.queued.waiters.forEach(({ reject }) => reject(cause));
      entries.delete(key);
      return;
    }
    void Promise.resolve()
      .then(() => {
        if (!isQueueActive()) throw new Error("stale pack queue");
        return job.operation(previous);
      })
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
    invalidate,
    run<T>(key: string, operation: (previous?: T) => Promise<T>): Promise<T> {
      if (!isQueueActive()) return Promise.reject(new Error("stale pack queue"));
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
  const enabled = isValidScope(clientScope) && session !== null && admin;
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Perfume | null>(initialProduct);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const lifecycleRef = useRef(0);
  const epochRef = useRef(0);
  const requestSequenceRef = useRef(createPackRequestSequence());
  const authKey = `${clientScope ?? "signed-out"}:${session?.user.id ?? ""}`;
  const mountedRef = useRef(false);
  const saveQueueRef = useRef(createPackSaveQueue(() => epochRef.current, () => mountedRef.current));
  const scopeRef = useRef<string | null>(clientScope);
  scopeRef.current = clientScope;
  const renderKey = `${authKey}:${enabled}`;
  const renderContextRef = useRef<HookRenderContext>({
    ...createHookRenderContext(renderKey, clientScope, epochRef.current + 1),
  });
  if (epochRef.current === 0) epochRef.current = renderContextRef.current.epoch;
  if (renderContextRef.current.key !== renderKey) {
    epochRef.current += 1;
    renderContextRef.current = createHookRenderContext(renderKey, clientScope, epochRef.current);
  }
  const callbackContext = renderContextRef.current;

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
      const nextPacks = (await listContentPacks()).map((pack) => ({
        ...pack,
        clientScope,
      }));
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
    const queue = createPackSaveQueue(() => epochRef.current, () => mountedRef.current);
    saveQueueRef.current = queue;
    const reset = resetScopedPackState();
    setPacks(reset.packs);
    setSelectedPack(reset.selectedPack);
    setSelectedProduct(reset.selectedProduct);
    setError(reset.error);
    setLoading(enabled);
    mountedRef.current = true;
    if (enabled) void refresh();
    return () => {
      mountedRef.current = false;
      queue.invalidate();
      if (lifecycleRef.current === lifecycle) lifecycleRef.current += 1;
    };
  }, [authKey, clientScope, enabled, refresh]);

  const selectPack = useCallback((pack: ContentPack | null) => {
    if (!isCurrentHookRenderContext(
      callbackContext,
      renderContextRef.current,
      epochRef.current,
      scopeRef.current,
      mountedRef.current,
    )) return;
    setSelectedPack(pack);
  }, [callbackContext]);

  const selectProduct = useCallback((product: Perfume | null) => {
    if (!isCurrentHookRenderContext(
      callbackContext,
      renderContextRef.current,
      epochRef.current,
      scopeRef.current,
      mountedRef.current,
    )) return;
    setSelectedProduct(product);
  }, [callbackContext]);

  const createDraft = useCallback(
    (product = selectedProduct ?? undefined, reason: ContentPackReason = "manual") => {
      if (
        !isCurrentHookRenderContext(callbackContext, renderContextRef.current, epochRef.current, scopeRef.current, mountedRef.current) ||
        !product ||
        !canCreateDraft(enabled, clientScope)
      ) return null;
      const draft = createLocalContentPack(product, reason, clientScope);
      setPacks((current) => [draft, ...current]);
      setSelectedPack(draft);
      setError(null);
      return draft;
    },
    [callbackContext, clientScope, enabled, selectedProduct],
  );

  const savePack = useCallback((pack: ContentPack) => {
    if (!isCurrentHookRenderContext(callbackContext, renderContextRef.current, epochRef.current, scopeRef.current, mountedRef.current)) {
      return Promise.resolve(null);
    }
    if (!canSavePack(pack) || !canMutatePack(enabled, clientScope, pack)) {
      setError("El content pack necesita un scope de administrador válido.");
      return Promise.resolve(null);
    }
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
        const scopedSaved = { ...saved, clientScope };
        if (
          lifecycleRef.current === lifecycle &&
          requestSequenceRef.current.isCurrent(key, sequence)
        ) {
          setPacks((current) => replacePack(current, candidate, scopedSaved));
          setSelectedPack((current) => (samePack(current, candidate) ? scopedSaved : current));
        }
        return scopedSaved;
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
  }, [callbackContext, clientScope, enabled]);

  const changeStatus = useCallback((pack: ContentPack | undefined, action: ContentPackAction) => {
    const current = pack ?? selectedPack;
    if (!isCurrentHookRenderContext(callbackContext, renderContextRef.current, epochRef.current, scopeRef.current, mountedRef.current)) {
      return Promise.resolve(null);
    }
    if (!current?.id || !canMutatePack(enabled, clientScope, current)) {
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
        const scopedUpdated = { ...updated, clientScope };
        if (
          lifecycleRef.current === lifecycle &&
          requestSequenceRef.current.isCurrent(key, sequence)
        ) {
          setPacks((items) => replacePack(items, current, scopedUpdated));
          setSelectedPack((item) => (samePack(item, current) ? scopedUpdated : item));
        }
        return scopedUpdated;
      } catch (cause) {
        if (
          lifecycleRef.current === lifecycle &&
          requestSequenceRef.current.isCurrent(key, sequence)
        ) setError(normalizeContentPackError(cause, "status"));
        throw cause;
      }
    });
    return pending.catch(() => null);
  }, [callbackContext, clientScope, enabled, selectedPack]);

  const regeneratePack = useCallback(
    (pack = selectedPack ?? undefined, product = selectedProduct ?? undefined) => {
      if (
        !isCurrentHookRenderContext(callbackContext, renderContextRef.current, epochRef.current, scopeRef.current, mountedRef.current) ||
        !pack ||
        !product ||
        !isValidScope(clientScope) ||
        !canRegeneratePack(enabled, clientScope, pack)
      ) {
        return null;
      }
      const regenerated = regenerateContentPack(pack, product, clientScope);
      if (!regenerated) return null;
      setPacks((current) => [regenerated, ...current]);
      setSelectedPack(regenerated);
      setError(null);
      return regenerated;
    },
    [callbackContext, clientScope, enabled, selectedPack, selectedProduct],
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
