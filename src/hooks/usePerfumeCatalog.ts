import { useMemo, useState } from "react";
import { perfumes as all } from "../data";
import { Perfume } from "../types";
import { useDebounce } from "./useDebounce";

interface FiltersState {
  brand: string;
  gender: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export function usePerfumeCatalog() {
  const [filters, setFilters] = useState<FiltersState>({
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
        p.notes.base.some(note => note.toLowerCase().includes(q))
      );
    }
    if (filters.brand) result = result.filter(p => p.brand === filters.brand);
    if (filters.gender) result = result.filter(p => p.gender === filters.gender);
    if (filters.category) result = result.filter(p => p.category === filters.category);

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
  }, [debouncedSearchQuery, filters]);

  const handleFilterChange = (name: keyof FiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
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
  const openDetails = (p: Perfume) => setSelectedPerfume(p);
  const closeDetails = () => setSelectedPerfume(null);

  return {
    allPerfumes: all,
    filteredPerfumes,
    filters,
    searchQuery,
    selectedPerfume,
    isCartOpen,
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

  if (perfume.category.includes("ambar") || perfume.category.includes("oriental")) score += 3;
  if (perfume.gender === "unisex") score += 2;
  if (typeof perfume.price !== "number") score += 1;
  if (perfume.id < 10 || perfume.id >= 3000) score += 1;

  return score;
}
