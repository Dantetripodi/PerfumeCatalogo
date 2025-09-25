import React from "react";
import { X, Plus } from "lucide-react";
import { Perfume } from "../types";
import { useCart } from "../context/CartContext";

interface PerfumeDetailsProps {
  perfume: Perfume | null;
  onClose: () => void;
}

const PerfumeDetails: React.FC<PerfumeDetailsProps> = ({perfume,onClose,}) => {const { addToCart } = useCart();

  if (!perfume) return null;

  const handleAddToCart = () => {
    addToCart(perfume);
  };

  const renderNotes = (title: string, notes: string[]) => (
    <div className="mb-3">
      <h4 className="font-medium text-[#1A2238] mb-1">{title}:</h4>
      <div className="flex flex-wrap gap-1">
        {notes.map((note, index) => (
          <span
            key={index}
            className="bg-[#F8F0E3] text-[#1A2238] text-xs px-2 py-1 rounded-full"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <div className="sticky top-0 z-10 bg-white p-2 border-b flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={perfume.image}
                  alt={perfume.name}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A2238] mb-2">
                {perfume.name}
              </h2>
              <h3 className="text-xl text-gray-600 mb-4">{perfume.brand}</h3>

              <div className="flex items-center mb-4">
                <div className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {perfume.gender}
                </div>
                <div className="bg-[#F8F0E3] text-[#1A2238] px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {perfume.category}
                </div>
                <div className="bg-[#F8F0E3] text-[#1A2238] px-3 py-1 rounded-full text-sm font-medium">
                  {perfume.size}
                </div>
              </div>

              <div className="text-2xl font-bold text-[#D4AF37] mb-4">
                ${perfume.price}
              </div>

              <p className="text-gray-700 mb-6">{perfume.description}</p>

              <div className="mb-6">
                <h3 className="text-lg font-serif font-semibold text-[#1A2238] mb-3">
                  Notas de fragancia
                </h3>
                {renderNotes("Notas de salida", perfume.notes.top)}
                {renderNotes("Notas de corazón", perfume.notes.middle)}
                {renderNotes("Notas de fondo", perfume.notes.base)}
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-[#1A2238] text-white py-3 rounded-md hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center"
              >
                <Plus size={18} className="mr-2" />
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeDetails;
