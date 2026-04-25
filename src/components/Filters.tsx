import React, { useState } from 'react';
import { ChevronDown, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Perfume } from '../types';
import { formatPrice } from '../utils/price';

interface FilterProps {
  filters: {
    collection: string;
    brand: string;
    gender: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
  };
  onFilterChange: (name: string, value: string) => void;
  onResetFilters: () => void;
  perfumes: Perfume[];
}

const Filters: React.FC<FilterProps> = ({ filters, onFilterChange, onResetFilters, perfumes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const brands = Array.from(new Set(perfumes.map(perfume => perfume.brand))).sort((a, b) => a.localeCompare(b, "es"));
  const categories = Array.from(new Set(perfumes.map(perfume => perfume.category))).sort((a, b) => a.localeCompare(b, "es"));
  const genders = Array.from(new Set(perfumes.map(perfume => perfume.gender)));
  const numericPrices = perfumes
    .map(perfume => perfume.price)
    .filter((price): price is number => typeof price === "number");
  const minCatalogPrice = Math.min(...numericPrices);
  const maxCatalogPrice = Math.max(...numericPrices);
  const activeFilters = [
    filters.brand,
    filters.gender,
    filters.category,
    filters.minPrice && `Desde ${formatPrice(Number(filters.minPrice))}`,
    filters.maxPrice && `Hasta ${formatPrice(Number(filters.maxPrice))}`,
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-[#E8DDBF] bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-[#1A2238] lg:hidden"
      >
        <span className="flex items-center">
          <Filter size={20} className="mr-2" />
          Filtros
        </span>
        <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4`}>
        <div className="mb-4 hidden items-center justify-between lg:flex">
          <h2 className="flex items-center font-serif text-xl font-semibold text-[#1A2238]">
            <SlidersHorizontal size={20} className="mr-2 text-[#D4AF37]" />
            Filtros
          </h2>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span key={filter} className="rounded-full bg-[#F8F0E3] px-3 py-1 text-xs font-medium text-[#1A2238]">
                {filter}
              </span>
            ))}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="brand-filter" className="mb-2 block font-medium text-[#1A2238]">Marca</label>
          <select
            id="brand-filter"
            value={filters.brand}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="gender-filter" className="mb-2 block font-medium text-[#1A2238]">Género</label>
          <select
            id="gender-filter"
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            <option value="">Todos los géneros</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="category-filter" className="mb-2 block font-medium text-[#1A2238]">Categoría</label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="sort-filter" className="mb-2 block font-medium text-[#1A2238]">Ordenar por</label>
          <select
            id="sort-filter"
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            <option value="featured">Recomendados</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="brand-asc">Marca A-Z</option>
          </select>
        </div>

        <div className="mb-4 rounded-lg bg-[#FBF8F1] p-3">
          <div className="mb-3 text-sm font-medium text-[#1A2238]">Rango de precio</div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-gray-600">
              Desde
              <input
                type="number"
                min={minCatalogPrice}
                max={maxCatalogPrice}
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                placeholder={String(minCatalogPrice)}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </label>
            <label className="text-xs text-gray-600">
              Hasta
              <input
                type="number"
                min={minCatalogPrice}
                max={maxCatalogPrice}
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                placeholder={String(maxCatalogPrice)}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </label>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Catálogo: {formatPrice(minCatalogPrice)} - {formatPrice(maxCatalogPrice)}
          </div>
        </div>

        <button
          onClick={() => {
            onResetFilters();
            setIsOpen(false);
          }}
          className="flex w-full items-center justify-center rounded-md bg-[#1A2238] px-4 py-2 text-white transition-all duration-200 hover:bg-[#25304F]"
        >
          <X size={16} className="mr-2" />
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default Filters;
