import React from 'react';
import { Heart, Info, Plus } from 'lucide-react';
import { Perfume } from '../types';
import { useCart } from '../context/useCart';
import { formatPrice } from '../utils/price';
import LazyImage from './LazyImage';
import { useFavorites } from '../hooks/useFavorites';

interface PerfumeCardProps {
  perfume: Perfume;
  onShowDetails: (perfume: Perfume) => void;
  onAddToCart?: (perfume: Perfume) => void;
  priority?: boolean;
}

const PerfumeCard: React.FC<PerfumeCardProps> = ({ perfume, onShowDetails, onAddToCart, priority = false }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const badges = getPerfumeBadges(perfume);
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
      className="group cursor-pointer overflow-hidden rounded-lg border border-[#E8DDBF] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onShowDetails(perfume)}
    >
      <div className="product-photo-frame relative aspect-[4/5] overflow-hidden">
        <LazyImage
          src={perfume.image}
          alt={perfume.name}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#1A2238] shadow-sm backdrop-blur">
              {badge}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(perfume.id);
          }}
          className={`absolute right-3 top-3 rounded-full p-2 shadow-sm backdrop-blur transition-colors ${
            favorite ? "bg-[#D4AF37] text-white" : "bg-white/90 text-[#1A2238] hover:bg-white"
          } z-10`}
          aria-label={favorite ? `Quitar ${perfume.name} de favoritos` : `Guardar ${perfume.name} en favoritos`}
          title={favorite ? "Quitar de favoritos" : "Guardar favorito"}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-bold text-white shadow-sm">
          {perfume.gender}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 font-serif text-lg font-semibold text-[#1A2238]">{perfume.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{perfume.brand}</p>
          </div>
          <span className="shrink-0 text-right text-lg font-bold text-[#9A7A1F]">{formatPrice(perfume.price)}</span>
        </div>
        
        <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-gray-500">{perfume.description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F8F0E3] px-2.5 py-1 text-xs font-medium text-[#1A2238]">
            {perfume.category}
          </span>
          <span className="rounded-full bg-[#EEF0F4] px-2.5 py-1 text-xs font-medium text-[#1A2238]">
            {perfume.size}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={(e) => handleAddToCart(e)}
            className="flex flex-1 items-center justify-center rounded-md bg-[#1A2238] py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#25304F]"
          >
            <Plus size={16} className="mr-1" />
            Agregar
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails(perfume);
            }}
            className="flex flex-1 items-center justify-center rounded-md border border-[#1A2238] py-2 text-sm font-medium text-[#1A2238] transition-colors duration-200 hover:bg-[#1A2238] hover:text-white"
          >
            <Info size={16} className="mr-1" />
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfumeCard;

function getPerfumeBadges(perfume: Perfume) {
  const badges: string[] = [];

  if (typeof perfume.price !== "number") badges.push("Consultar");
  if (perfume.stock === "by-order") badges.push("Por pedido");
  if (perfume.collection === "arabe") badges.push("Arabe");
  if (perfume.collection === "arabic") badges.push("Arabic");
  if (perfume.collection === "mini") badges.push("Mini");
  if (perfume.isBestSeller) badges.push("Mas vendido");
  if (perfume.isNew) badges.push("Nuevo");
  if (badges.length === 0 && perfume.isFeatured) badges.push("Destacado");

  return badges.slice(0, 2);
}
