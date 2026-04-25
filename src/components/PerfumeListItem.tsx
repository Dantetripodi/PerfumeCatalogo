import React from 'react';
import { Heart, Info, Plus } from 'lucide-react';
import { Perfume } from '../types';
import { useCart } from '../context/useCart';
import { formatPrice } from '../utils/price';
import LazyImage from './LazyImage';
import { useFavorites } from '../hooks/useFavorites';

interface PerfumeListItemProps {
  perfume: Perfume;
  onShowDetails: (perfume: Perfume) => void;
  onAddToCart?: (perfume: Perfume) => void;
}

const PerfumeListItem: React.FC<PerfumeListItemProps> = ({ perfume, onShowDetails, onAddToCart }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isConsultPrice = typeof perfume.price !== "number";
  const favorite = isFavorite(perfume.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(perfume);
    if (onAddToCart) {
      onAddToCart(perfume);
    }
  };

  return (
    <div 
      className="cursor-pointer overflow-hidden rounded-lg border border-[#E8DDBF] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => onShowDetails(perfume)}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="product-photo-frame relative h-48 w-full flex-shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-32">
          <LazyImage
            src={perfume.image}
            alt={perfume.name}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute right-2 top-2 z-10 rounded-full bg-[#D4AF37] px-2 py-1 text-xs font-semibold text-white">
            {perfume.gender}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(perfume.id);
            }}
            className={`absolute bottom-2 right-2 z-10 rounded-full p-2 shadow-sm backdrop-blur transition-colors ${
              favorite ? "bg-[#D4AF37] text-white" : "bg-white/90 text-[#1A2238]"
            }`}
            aria-label={favorite ? `Quitar ${perfume.name} de favoritos` : `Guardar ${perfume.name} en favoritos`}
          >
            <Heart size={15} fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 line-clamp-1 font-serif text-lg font-semibold text-[#1A2238]">
                  {perfume.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{perfume.brand}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                  {perfume.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-[#9A7A1F]">
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
              {isConsultPrice && (
                <span className="rounded-full bg-[#1A2238] px-2 py-1 text-xs font-medium text-white">
                  Consultar stock
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 sm:flex-col sm:w-32 flex-shrink-0">
            <button
              onClick={(e) => handleAddToCart(e)}
              className="flex flex-1 items-center justify-center rounded-md bg-[#1A2238] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#25304F] sm:flex-none"
            >
              <Plus size={16} className="mr-1" />
              Agregar
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(perfume);
              }}
              className="flex flex-1 items-center justify-center rounded-md border border-[#1A2238] px-4 py-2 text-sm font-medium text-[#1A2238] transition-colors duration-200 hover:bg-[#1A2238] hover:text-white sm:flex-none"
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
