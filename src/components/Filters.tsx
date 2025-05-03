import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Perfume } from '../types';

interface FilterProps {
  filters: {
    brand: string;
    gender: string;
    category: string;
  };
  onFilterChange: (name: string, value: string) => void;
  perfumes: Perfume[];
}

const Filters: React.FC<FilterProps> = ({ filters, onFilterChange, perfumes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const brands = Array.from(new Set(perfumes.map(perfume => perfume.brand)));
  const categories = Array.from(new Set(perfumes.map(perfume => perfume.category)));
  const genders = Array.from(new Set(perfumes.map(perfume => perfume.gender)));

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full p-4 flex items-center justify-between text-[#1A2238]"
      >
        <span className="flex items-center">
          <Filter size={20} className="mr-2" />
          Filtros
        </span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4`}>
        <h2 className="text-xl font-serif font-semibold mb-4 text-[#1A2238] hidden lg:block">Filtros</h2>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-[#1A2238]">Marca</h3>
          <select
            value={filters.brand}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
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
          <h3 className="font-medium mb-2 text-[#1A2238]">Género</h3>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
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
          <h3 className="font-medium mb-2 text-[#1A2238]">Categoría</h3>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            onFilterChange('brand', '');
            onFilterChange('gender', '');
            onFilterChange('category', '');
            setIsOpen(false);
          }}
          className="w-full bg-[#1A2238] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default Filters;