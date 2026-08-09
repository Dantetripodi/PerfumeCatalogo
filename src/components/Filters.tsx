import React, { useState } from 'react';
import { ChevronDown, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Perfume, COLLECTION_LABELS, PerfumeCollection } from '../types';
import { formatPrice } from '../utils/price';

/** Display order; a line only appears once it actually has products. */
const LINE_ORDER: PerfumeCollection[] = [
  "regular", "arabe", "arabic", "jacques", "mini", "probador", "home", "accesorio",
];

export type FiltersLayout = "panel" | "bar";

interface FiltersState {
  collection: string;
  line: string;
  gender: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

interface FilterProps {
  filters: FiltersState;
  onFilterChange: (name: keyof FiltersState, value: string) => void;
  onResetFilters: () => void;
  perfumes: Perfume[];
  /** "bar" lays the controls across the top so the grid gets the full width. */
  layout?: FiltersLayout;
}

const SELECT_CLASS =
  "w-full rounded border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]";

const Filters: React.FC<FilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  perfumes,
  layout = "panel",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const genders = Array.from(new Set(perfumes.map(perfume => perfume.gender)));
  const presentLines = new Set(perfumes.map(perfume => perfume.collection));
  const lineCollections = LINE_ORDER.filter(collection => presentLines.has(collection));
  const numericPrices = perfumes
    .map(perfume => perfume.price)
    .filter((price): price is number => typeof price === "number");
  const minCatalogPrice = Math.min(...numericPrices);
  const maxCatalogPrice = Math.max(...numericPrices);
  const lineLabel = filters.line ? COLLECTION_LABELS[filters.line as PerfumeCollection] : "";
  const activeFilters = [
    lineLabel,
    filters.gender,
    filters.minPrice && `Desde ${formatPrice(Number(filters.minPrice))}`,
    filters.maxPrice && `Hasta ${formatPrice(Number(filters.maxPrice))}`,
  ].filter(Boolean);

  // Both layouts drive the same state, so the controls are declared once and
  // only their wrapper changes.
  const lineSelect = (
    <select
      id="line-filter"
      aria-label="Línea"
      value={filters.line}
      onChange={(e) => onFilterChange('line', e.target.value)}
      className={SELECT_CLASS}
    >
      <option value="">Todas las líneas</option>
      {lineCollections.map((col) => (
        <option key={col} value={col}>{COLLECTION_LABELS[col]}</option>
      ))}
    </select>
  );

  const genderSelect = (
    <select
      id="gender-filter"
      aria-label="Género"
      value={filters.gender}
      onChange={(e) => onFilterChange('gender', e.target.value)}
      className={SELECT_CLASS}
    >
      <option value="">Todos los géneros</option>
      {genders.map((gender) => (
        <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
      ))}
    </select>
  );

  const sortSelect = (
    <select
      id="sort-filter"
      aria-label="Ordenar por"
      value={filters.sort}
      onChange={(e) => onFilterChange('sort', e.target.value)}
      className={SELECT_CLASS}
    >
      <option value="featured">Recomendados</option>
      <option value="price-asc">Menor precio</option>
      <option value="price-desc">Mayor precio</option>
      <option value="name-asc">Nombre A-Z</option>
      <option value="brand-asc">Marca A-Z</option>
    </select>
  );

  const priceInputs = (
    <div className="grid grid-cols-2 gap-2">
      <input
        type="number"
        aria-label="Precio desde"
        min={minCatalogPrice}
        max={maxCatalogPrice}
        value={filters.minPrice}
        onChange={(e) => onFilterChange('minPrice', e.target.value)}
        placeholder={`Desde ${minCatalogPrice}`}
        className={`${SELECT_CLASS} text-sm`}
      />
      <input
        type="number"
        aria-label="Precio hasta"
        min={minCatalogPrice}
        max={maxCatalogPrice}
        value={filters.maxPrice}
        onChange={(e) => onFilterChange('maxPrice', e.target.value)}
        placeholder={`Hasta ${maxCatalogPrice}`}
        className={`${SELECT_CLASS} text-sm`}
      />
    </div>
  );

  const clearButton = (
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
  );

  const activeChips = activeFilters.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(filter => (
        <span key={filter} className="rounded-full bg-[#F8F0E3] px-3 py-1 text-xs font-medium text-[#1A2238]">
          {filter}
        </span>
      ))}
    </div>
  );

  // ── Bar layout ─────────────────────────────────────────────────────────────
  if (layout === "bar") {
    return (
      <div className="rounded-lg border border-[#E8DDBF] bg-white p-3 shadow-sm sm:p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-[#1A2238] lg:hidden"
          aria-expanded={isOpen}
        >
          <span className="flex items-center">
            <Filter size={18} className="mr-2" />
            Filtros
            {activeFilters.length > 0 && (
              <span className="ml-2 rounded-full bg-[#D4AF37] px-2 py-0.5 text-xs font-semibold text-white">
                {activeFilters.length}
              </span>
            )}
          </span>
          <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
        </button>

        <div className={`${isOpen ? 'mt-3 block' : 'hidden'} lg:mt-0 lg:block`}>
          {/* Five columns so the price range — two inputs sharing a cell — gets
              double the width of a single select and stops clipping. */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:items-center">
            {lineSelect}
            {genderSelect}
            {sortSelect}
            <div className="sm:col-span-2 lg:col-span-2">{priceInputs}</div>
          </div>

          {(activeFilters.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8DDBF] pt-3">
              {activeChips}
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-sm font-medium text-[#9A7A1F] hover:underline"
              >
                <X size={14} />
                Limpiar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Panel layout ───────────────────────────────────────────────────────────
  return (
    <div className="rounded-lg border border-[#E8DDBF] bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-[#1A2238] lg:hidden"
        aria-expanded={isOpen}
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

        {activeFilters.length > 0 && <div className="mb-4">{activeChips}</div>}

        <div className="mb-4">
          <label htmlFor="line-filter" className="mb-2 block font-medium text-[#1A2238]">Línea</label>
          {lineSelect}
        </div>

        <div className="mb-4">
          <label htmlFor="gender-filter" className="mb-2 block font-medium text-[#1A2238]">Género</label>
          {genderSelect}
        </div>

        <div className="mb-4">
          <label htmlFor="sort-filter" className="mb-2 block font-medium text-[#1A2238]">Ordenar por</label>
          {sortSelect}
        </div>

        <div className="mb-4 rounded-lg bg-[#FBF8F1] p-3">
          <div className="mb-3 text-sm font-medium text-[#1A2238]">Rango de precio</div>
          {priceInputs}
          <div className="mt-2 text-xs text-gray-500">
            Catálogo: {formatPrice(minCatalogPrice)} - {formatPrice(maxCatalogPrice)}
          </div>
        </div>

        {clearButton}
      </div>
    </div>
  );
};

export default Filters;
