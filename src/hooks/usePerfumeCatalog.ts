import { useEffect, useMemo, useState } from "react";
import { Perfume } from "../types";
import { useDebounce } from "./useDebounce";
import { useRemotePerfumes } from "./useRemotePerfumes";
import { CatalogFilters, EMPTY_FILTERS, queryCatalog } from "../data/catalogQuery";

/** Divisible by the 2, 3 and 4 column grids so a batch never leaves a ragged row. */
const PAGE_SIZE = 24;

export function usePerfumeCatalog() {
  const { perfumes: all, loading, error, refetch } = useRemotePerfumes();

  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Rendering all 448 cards at once buries the footer and costs a lot of DOM on
  // a mid-range phone, so the grid grows a batch at a time instead. Reset happens
  // in the handlers that narrow the list, not in an effect: an effect would
  // render the long list once before trimming it back.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Deep-link support: #/perfume/<slug> opens that product's modal.
  useEffect(() => {
    const match = window.location.hash.match(/^#\/perfume\/(.+)$/);
    if (!match) return;

    const perfume = all.find(item => item.slug === match[1]);
    if (perfume) setSelectedPerfume(perfume);
  }, [all]);

  const filteredPerfumes = useMemo(
    () => queryCatalog(all, filters, debouncedSearchQuery),
    [all, filters, debouncedSearchQuery]
  );

  const visiblePerfumes = useMemo(
    () => filteredPerfumes.slice(0, visibleCount),
    [filteredPerfumes, visibleCount]
  );
  const hasMore = visibleCount < filteredPerfumes.length;
  const loadMore = () => setVisibleCount(count => count + PAGE_SIZE);

  const handleFilterChange = (name: keyof CatalogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setVisibleCount(PAGE_SIZE);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchQuery("");
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setVisibleCount(PAGE_SIZE);
  };

  const toggleCart = () => setIsCartOpen(v => !v);

  const openDetails = (p: Perfume) => {
    setSelectedPerfume(p);
    window.history.replaceState(null, "", `#/perfume/${p.slug}`);
  };

  const closeDetails = () => {
    setSelectedPerfume(null);
    if (window.location.hash.startsWith("#/perfume/")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  return {
    allPerfumes: all,
    filteredPerfumes,
    visiblePerfumes,
    hasMore,
    loadMore,
    filters,
    searchQuery,
    selectedPerfume,
    isCartOpen,
    loading,
    error,
    refetch,
    handleFilterChange,
    handleSearch,
    resetFilters,
    toggleCart,
    openDetails,
    closeDetails,
  };
}
