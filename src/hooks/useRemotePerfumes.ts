import { useState, useEffect, useCallback } from "react";
import { USE_LOCAL_CATALOG } from "../lib/supabase";
import { fetchPerfumes as fetchFromRepository } from "../data/perfumesRepository";
import { Perfume } from "../types";

export interface UseRemotePerfumesResult {
  perfumes: Perfume[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRemotePerfumes(): UseRemotePerfumesResult {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Preview what src/data holds before pushing it live with `npm run sync-catalog`.
    // Imported dynamically so the ~250KB static catalog is fetched only in this
    // mode and never lands in the bundle customers download.
    if (USE_LOCAL_CATALOG) {
      const { perfumes: localPerfumes } = await import("../data");
      setPerfumes(localPerfumes);
      setLoading(false);
      return;
    }

    const result = await fetchFromRepository();
    if (result.ok) setPerfumes(result.data);
    else setError(result.error);

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { perfumes, loading, error, refetch: load };
}
