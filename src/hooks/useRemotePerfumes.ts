import { useState, useEffect, useCallback } from "react";
import { supabase, USE_LOCAL_CATALOG } from "../lib/supabase";
import { normalizePerfume, rowToInput } from "../data/normalize";
import { Perfume, PerfumeRow } from "../types";

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

  const fetchPerfumes = useCallback(async () => {
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

    const { data, error: fetchError } = await supabase
      .from("perfumes")
      .select("*")
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError("No se pudo cargar el catálogo. Verificá tu conexión e intentá de nuevo.");
      setLoading(false);
      return;
    }

    const rows = data as PerfumeRow[];
    const mapped = rows.map((row) => {
      const { input, id, collection, isFeatured } = rowToInput(row);
      return normalizePerfume(input, id, collection, isFeatured);
    });

    setPerfumes(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPerfumes();
  }, [fetchPerfumes]);

  return { perfumes, loading, error, refetch: fetchPerfumes };
}
