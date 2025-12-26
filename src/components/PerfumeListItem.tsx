import React from 'react';
import { Plus, Info } from 'lucide-react';
import { Perfume } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/price';
import LazyImage from './LazyImage';

interface PerfumeListItemProps {
  perfume: Perfume;
  onShowDetails: (perfume: Perfume) => void;
  onAddToCart?: (perfume: Perfume) => void;
}

const PerfumeListItem: React.FC<PerfumeListItemProps> = ({ perfume, onShowDetails, onAddToCart }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(perfume);
    if (onAddToCart) {
      onAddToCart(perfume);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onShowDetails(perfume)}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <LazyImage
            src={perfume.image}
            alt={perfume.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-[#D4AF37] text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
            {perfume.gender}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-serif font-semibold text-[#1A2238] line-clamp-1 mb-1">
                  {perfume.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{perfume.brand}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                  {perfume.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-[#D4AF37]">
                  {formatPrice(perfume.price)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-[#F8F0E3] text-[#1A2238] text-xs px-2 py-1 rounded-full">
                {perfume.category}
              </span>
              <span className="bg-[#F8F0E3] text-[#1A2238] text-xs px-2 py-1 rounded-full">
                {perfume.size}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 sm:flex-col sm:w-32 flex-shrink-0">
            <button
              onClick={(e) => handleAddToCart(e)}
              className="flex-1 sm:flex-none bg-[#1A2238] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center text-sm"
            >
              <Plus size={16} className="mr-1" />
              Agregar
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(perfume);
              }}
              className="flex-1 sm:flex-none border border-[#1A2238] text-[#1A2238] py-2 px-4 rounded-md hover:bg-[#1A2238] hover:text-white transition-colors duration-200 flex items-center justify-center text-sm"
            >
              <Info size={16} className="mr-1" />
              Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeListItem;

