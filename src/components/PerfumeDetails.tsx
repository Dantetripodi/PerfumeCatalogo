import React, { useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Perfume } from "../types";
import { useCart } from "../context/useCart";
import { formatPrice } from "../utils/price";
import LazyImage from "./LazyImage";

interface PerfumeDetailsProps {
  perfume: Perfume | null;
  onClose: () => void;
  onAddToCart?: (perfume: Perfume) => void;
}

const PerfumeDetails: React.FC<PerfumeDetailsProps> = ({ perfume, onClose, onAddToCart }) => {
  const { addToCart } = useCart();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && perfume) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [perfume, onClose]);

  useEffect(() => {
    if (!perfume) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [perfume]);

  if (!perfume) return null;

  const handleAddToCart = () => {
    addToCart(perfume);
    if (onAddToCart) {
      onAddToCart(perfume);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="perfume-details-title"
      >
        <div className="relative">
          <div className="sticky top-0 z-10 flex justify-end border-b bg-white/95 p-3 backdrop-blur">
            <button onClick={onClose} className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Cerrar detalle">
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col gap-6 p-6 md:flex-row">
            <div className="mb-4 w-full md:mb-0 md:w-1/2">
              <div className="overflow-hidden rounded-lg bg-[#F2ECE1]">
                <LazyImage
                  src={perfume.image}
                  alt={perfume.name}
                  className="aspect-[4/5] w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <h2 id="perfume-details-title" className="mb-2 font-serif text-2xl font-bold text-[#1A2238] md:text-3xl">
                {perfume.name}
              </h2>
              <h3 className="text-xl text-gray-600 mb-4">{perfume.brand}</h3>

              <div className="flex items-center mb-4">
                <div className="mr-2 rounded-full bg-[#D4AF37] px-3 py-1 text-sm font-medium text-white">
                  {perfume.gender}
                </div>
                <div className="mr-2 rounded-full bg-[#F8F0E3] px-3 py-1 text-sm font-medium text-[#1A2238]">
                  {perfume.category}
                </div>
                <div className="rounded-full bg-[#F8F0E3] px-3 py-1 text-sm font-medium text-[#1A2238]">
                  {perfume.size}
                </div>
              </div>

              <div className="mb-4 text-3xl font-bold text-[#9A7A1F]">
                {formatPrice(perfume.price)}
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
                className="flex w-full items-center justify-center rounded-md bg-[#1A2238] py-3 font-medium text-white transition-colors duration-200 hover:bg-[#25304F]"
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
