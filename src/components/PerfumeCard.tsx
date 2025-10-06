import React, { useState, useRef, useEffect } from 'react';
import { Plus, Info } from 'lucide-react';
import { Perfume } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/price';

interface PerfumeCardProps {
  perfume: Perfume;
  onShowDetails: (perfume: Perfume) => void;
}

const PerfumeCard: React.FC<PerfumeCardProps> = ({ perfume, onShowDetails }) => {
  const { addToCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(perfume);
  };

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
      onClick={() => onShowDetails(perfume)}
    >
      <div className="relative h-64 overflow-hidden">
        {isVisible && (
          <picture>
            <source
              type="image/webp"
              srcSet={`
                ${perfume.image.replace(/\.(jpg|jpeg|png)$/i, '-320.webp')} 320w,
                ${perfume.image.replace(/\.(jpg|jpeg|png)$/i, '-640.webp')} 640w,
                ${perfume.image.replace(/\.(jpg|jpeg|png)$/i, '-960.webp')} 960w
              `}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <img 
              src={perfume.image} 
              alt={perfume.name} 
              className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </picture>
        )}
        {!imageLoaded && isVisible && (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Cargando...</div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-[#D4AF37] text-white px-2 py-1 rounded-full text-xs font-semibold">
          {perfume.gender}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif font-semibold text-[#1A2238] line-clamp-1">{perfume.name}</h3>
          <span className="font-bold text-[#D4AF37]">{formatPrice(perfume.price)}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{perfume.brand}</p>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{perfume.description}</p>
        
        <div className="flex justify-between space-x-2">
          <button
            onClick={(e) => handleAddToCart(e)}
            className="flex-1 bg-[#1A2238] text-white py-2 rounded-md hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center"
          >
            <Plus size={16} className="mr-1" />
            Agregar
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails(perfume);
            }}
            className="flex-1 border border-[#1A2238] text-[#1A2238] py-2 rounded-md hover:bg-[#1A2238] hover:text-white transition-colors duration-200 flex items-center justify-center"
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