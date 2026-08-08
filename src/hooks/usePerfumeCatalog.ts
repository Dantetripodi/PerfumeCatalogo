import { useEffect, useMemo, useState } from "react";
import { Perfume } from "../types";
import { useDebounce } from "./useDebounce";
import { useRemotePerfumes } from "./useRemotePerfumes";

/** Divisible by the 2, 3 and 4 column grids so a batch never leaves a ragged row. */
const PAGE_SIZE = 24;

interface FiltersState {
  collection: string;
  line: string;
  brand: string;
  gender: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export function usePerfumeCatalog() {
  const { perfumes: remotePerfumes, loading, error, refetch } = useRemotePerfumes();

  const [filters, setFilters] = useState<FiltersState>({
    collection: "featured",
    line: "",
    brand: "",
    gender: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "featured",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const all = useMemo(() => remotePerfumes, [remotePerfumes]);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#\/perfume\/(.+)$/);
    if (!match) return;

    const perfume = all.find(item => item.slug === match[1]);
    if (perfume) setSelectedPerfume(perfume);
  }, [all]);

  const filteredPerfumes = useMemo(() => {
    let result = all;
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.notes.top.some(note => note.toLowerCase().includes(q)) ||
        p.notes.middle.some(note => note.toLowerCase().includes(q)) ||
        p.notes.base.some(note => note.toLowerCase().includes(q)) ||
        p.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (filters.line) result = result.filter(p => p.collection === filters.line);
    if (filters.brand) result = result.filter(p => p.brand === filters.brand);
    if (filters.gender) result = result.filter(p => p.gender === filters.gender);
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.collection !== "all") {
      result = result.filter(p => {
        if (filters.collection === "featured") return Boolean(p.isFeatured);
        if (filters.collection === "consult") return p.stock === "consult";
        return p.collection === filters.collection;
      });
    }

    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);

    if (filters.minPrice && !Number.isNaN(minPrice)) {
      result = result.filter(p => typeof p.price === "number" && p.price >= minPrice);
    }

    if (filters.maxPrice && !Number.isNaN(maxPrice)) {
      result = result.filter(p => typeof p.price === "number" && p.price <= maxPrice);
    }

    const sorted = [...result];

    switch (filters.sort) {
      case "price-asc":
        sorted.sort((a, b) => numericPrice(a.price) - numericPrice(b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => numericPrice(b.price) - numericPrice(a.price));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "brand-asc":
        sorted.sort((a, b) => a.brand.localeCompare(b.brand, "es"));
        break;
      default:
        sorted.sort((a, b) => featuredScore(b) - featuredScore(a));
    }
    return sorted;
  }, [all, debouncedSearchQuery, filters]);

  // Rendering all 450 cards at once buries the footer and costs a lot of DOM on
  // a mid-range phone, so the grid grows a batch at a time instead.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearchQuery, filters]);

  const visiblePerfumes = useMemo(
    () => filteredPerfumes.slice(0, visibleCount),
    [filteredPerfumes, visibleCount]
  );
  const hasMore = visibleCount < filteredPerfumes.length;
  const loadMore = () => setVisibleCount(count => count + PAGE_SIZE);

  const handleFilterChange = (name: keyof FiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      collection: "featured",
      line: "",
      brand: "",
      gender: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "featured",
    });
    setSearchQuery("");
  };

  const handleSearch = (q: string) => setSearchQuery(q);

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

function numericPrice(price: Perfume["price"]) {
  return typeof price === "number" ? price : Number.POSITIVE_INFINITY;
}

function featuredScore(perfume: Perfume) {
  let score = 0;

  if (perfume.isBestSeller) score += 5;
  if (perfume.isFeatured) score += 4;
  if (perfume.isNew) score += 3;
  if (perfume.category.includes("ambar") || perfume.category.includes("oriental")) score += 3;
  if (perfume.gender === "unisex") score += 2;
  if (typeof perfume.price !== "number") score += 1;
  if (perfume.id < 10 || perfume.id >= 3000) score += 1;

  return score;
}
