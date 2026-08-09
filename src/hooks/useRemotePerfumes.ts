import { useState, useEffect, useCallback, useRef } from "react";
import { USE_LOCAL_CATALOG } from "../lib/supabase";
import { fetchPerfumes as fetchFromRepository } from "../data/perfumesRepository";
import { Perfume } from "../types";

export interface UseRemotePerfumesResult {
  perfumes: Perfume[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /**
   * Applies a change to one product in memory, without going back to the
   * network. For writes that already succeeded: the database is the authority
   * on what was saved, so re-reading the whole catalog to learn about a single
   * row we just wrote is a round trip nobody needs.
   */
  patchPerfume: (id: number, changes: Partial<Perfume>) => void;
}

export function useRemotePerfumes(): UseRemotePerfumesResult {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only the very first load has nothing to show. A refresh keeps the current
  // list on screen instead of swapping it for a spinner.
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    setError(null);

    // Preview what src/data holds before pushing it live with `npm run sync-catalog`.
    // Imported dynamically so the ~250KB static catalog is fetched only in this
    // mode and never lands in the bundle customers download.
    if (USE_LOCAL_CATALOG) {
      const { perfumes: localPerfumes } = await import("../data");
      setPerfumes(localPerfumes);
      hasLoadedOnce.current = true;
      setLoading(false);
      return;
    }

    const result = await fetchFromRepository();
    if (result.ok) setPerfumes(result.data);
    else setError(result.error);

    hasLoadedOnce.current = true;
    setLoading(false);
  }, []);

  const patchPerfume = useCallback((id: number, changes: Partial<Perfume>) => {
    setPerfumes(current =>
      current.map(perfume => (perfume.id === id ? { ...perfume, ...changes } : perfume))
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { perfumes, loading, error, refetch: load, patchPerfume };
}
