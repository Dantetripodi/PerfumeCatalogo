import React from 'react';
import { Heart, Plus, Star } from 'lucide-react';
import { Perfume, COLLECTION_LABELS } from '../types';
import { useCart } from '../context/useCart';
import { formatPrice } from '../utils/price';
import LazyImage from './LazyImage';
import { useFavorites } from '../hooks/useFavorites';

interface PerfumeListItemProps {
  perfume: Perfume;
  onShowDetails: (perfume: Perfume) => void;
  onAddToCart?: (perfume: Perfume) => void;
  priority?: boolean;
}

const PerfumeListItem: React.FC<PerfumeListItemProps> = ({ perfume, onShowDetails, onAddToCart, priority = false }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isConsultPrice = typeof perfume.price !== "number";
  const favorite = isFavorite(perfume.id);
  const lineBadge = getLineBadge(perfume);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(perfume);
    if (onAddToCart) {
      onAddToCart(perfume);
    }
  };

  return (
    <div
      className="group flex cursor-pointer items-stretch gap-3 rounded-xl border border-[#E8DDBF] bg-white p-2.5 shadow-sm transition duration-200 hover:border-[#D4AF37] hover:shadow-md"
      onClick={() => onShowDetails(perfume)}
    >
      <div className="product-photo-frame relative h-[92px] w-[76px] flex-shrink-0 overflow-hidden rounded-lg">
        <LazyImage
          src={perfume.image}
          alt={perfume.name}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-gray-500">
            {perfume.brand}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(perfume.id);
            }}
            className={`-mr-1 -mt-0.5 flex-shrink-0 rounded-full p-1 transition-colors ${
              favorite ? "text-[#D4AF37]" : "text-gray-300 hover:text-[#D4AF37]"
            }`}
            aria-label={favorite ? `Quitar ${perfume.name} de favoritos` : `Guardar ${perfume.name} en favoritos`}
            title={favorite ? "Quitar de favoritos" : "Guardar favorito"}
          >
            <Heart size={17} fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>

        <h3 className="flex items-center gap-1.5 truncate font-serif text-base font-semibold leading-snug text-[#1A2238]">
          {perfume.isFeatured && (
            <Star size={13} className="flex-shrink-0 text-[#D4AF37]" fill="currentColor" aria-label="Destacado" />
          )}
          <span className="truncate">{perfume.name}</span>
        </h3>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-[#9A7A1F]">{formatPrice(perfume.price)}</span>
          {isConsultPrice ? (
            <span className="rounded-full bg-[#1A2238] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Consultar
            </span>
          ) : lineBadge ? (
            <span className="rounded-full bg-[#F8F0E3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1A2238]">
              {lineBadge}
            </span>
          ) : null}

          <button
            onClick={handleAddToCart}
            className="ml-auto flex-shrink-0 rounded-full bg-[#1A2238] p-1.5 text-white transition-colors hover:bg-[#25304F]"
            aria-label={`Agregar ${perfume.name} al carrito`}
            title="Agregar al carrito"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfumeListItem;

function getLineBadge(perfume: Perfume): string | null {
  if (perfume.collection === "regular" || perfume.collection === "accesorio") return null;
  return COLLECTION_LABELS[perfume.collection] ?? null;
}
