import { useEffect, useMemo, useState } from "react";
import { perfumes as all } from "../data/perfumes";
import { Perfume } from "../types";

interface FiltersState {
  brand: string;
  gender: string;
  category: string;
}

export function usePerfumeCatalog() {
  const [filters, setFilters] = useState<FiltersState>({ brand: "", gender: "", category: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredPerfumes = useMemo(() => {
    let result = all;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (filters.brand) result = result.filter(p => p.brand === filters.brand);
    if (filters.gender) result = result.filter(p => p.gender === filters.gender);
    if (filters.category) result = result.filter(p => p.category === filters.category);
    return result;
  }, [searchQuery, filters]);

  const handleFilterChange = (name: keyof FiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
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
    toggleCart,
    openDetails,
    closeDetails,
  };
}