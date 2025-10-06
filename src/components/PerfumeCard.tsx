import React from 'react';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(perfume);
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
      onClick={() => onShowDetails(perfume)}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={perfume.image} 
          alt={perfume.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
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