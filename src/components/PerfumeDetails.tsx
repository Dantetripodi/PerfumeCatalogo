import React, { useEffect, useState } from "react";
import { Heart, Link, MessageCircle, Plus, Sparkles, X } from "lucide-react";
import { Perfume } from "../types";
import { useCart } from "../context/useCart";
import { formatPrice } from "../utils/price";
import LazyImage from "./LazyImage";
import { buildProductInquiryMessage, buildWhatsappUrl } from "../utils/whatsapp";
import { useFavorites } from "../hooks/useFavorites";

interface PerfumeDetailsProps {
  perfume: Perfume | null;
  onClose: () => void;
  onAddToCart?: (perfume: Perfume) => void;
}

const PerfumeDetails: React.FC<PerfumeDetailsProps> = ({ perfume, onClose, onAddToCart }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copiedLink, setCopiedLink] = useState(false);
  const [variantCode, setVariantCode] = useState<string | null>(null);

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
    setCopiedLink(false);
    // Nothing is preselected: picking the scent is the decision, and choosing
    // it for the customer is how the wrong one ends up ordered.
    setVariantCode(null);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [perfume]);

  if (!perfume) return null;

  const hasNotes =
    perfume.notes.top.length + perfume.notes.middle.length + perfume.notes.base.length > 0;
  const variants = perfume.variants ?? [];
  const hasVariants = variants.length > 0;
  const selectedVariant = variants.find(variant => variant.code === variantCode);
  const needsChoice = hasVariants && !selectedVariant;

  const handleAddToCart = () => {
    if (needsChoice) return;
    addToCart(perfume, selectedVariant);
    if (onAddToCart) {
      onAddToCart(perfume);
    }
  };

  const handleWhatsappInquiry = () => {
    window.open(buildWhatsappUrl(buildProductInquiryMessage(perfume)), "_blank");
  };

  const handleCopyLink = async () => {
    const productUrl = `${window.location.origin}${window.location.pathname}#/perfume/${perfume.slug}`;
    await navigator.clipboard.writeText(productUrl);
    setCopiedLink(true);
  };

  const favorite = isFavorite(perfume.id);

  // Home products — diffusers, soaps, candles — carry no olfactory notes, and an
  // empty "Notas de salida:" heading reads as a bug.
  const renderNotes = (title: string, notes: string[]) => notes.length === 0 ? null : (
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
              <div className="product-photo-frame overflow-hidden rounded-lg">
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

              <div className="mb-4 flex flex-wrap gap-2">
                {perfume.isBestSeller && (
                  <span className="flex items-center rounded-full bg-[#1A2238] px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles size={13} className="mr-1" />
                    Más vendido
                  </span>
                )}
                {perfume.isNew && (
                  <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold text-white">
                    Nuevo
                  </span>
                )}
                {perfume.stock === "consult" && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    Precio a consultar
                  </span>
                )}
                {perfume.stock === "by-order" && (
                  <span className="rounded-full bg-[#F8F0E3] px-3 py-1 text-xs font-semibold text-[#1A2238]">
                    Por pedido
                  </span>
                )}
              </div>

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

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoBox label="Uso ideal" value={perfume.occasion} />
                <InfoBox label="Temporada" value={perfume.season} />
                <InfoBox label="Intensidad" value={perfume.intensity} />
                <InfoBox label="Duración" value={perfume.longevity} />
              </div>

              {hasNotes && (
                <div className="mb-6">
                  <h3 className="text-lg font-serif font-semibold text-[#1A2238] mb-3">
                    Notas de fragancia
                  </h3>
                  {renderNotes("Notas de salida", perfume.notes.top)}
                  {renderNotes("Notas de corazón", perfume.notes.middle)}
                  {renderNotes("Notas de fondo", perfume.notes.base)}
                </div>
              )}

              {hasVariants && (
                <div className="mb-5">
                  <div className="mb-2 flex items-baseline justify-between">
                    <h3 className="font-serif text-lg font-semibold text-[#1A2238]">
                      {perfume.variantLabel ?? "Opciones"}
                    </h3>
                    <span className="text-xs text-gray-500">{variants.length} disponibles</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variants.map(variant => {
                      const selected = variant.code === variantCode;
                      return (
                        <button
                          key={variant.code || variant.name}
                          onClick={() => setVariantCode(selected ? null : variant.code)}
                          disabled={!variant.inStock}
                          aria-pressed={selected}
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300 disabled:line-through ${
                            selected
                              ? "border-[#D4AF37] bg-[#D4AF37] font-medium text-white"
                              : "border-[#E8DDBF] text-[#1A2238] hover:border-[#D4AF37]"
                          }`}
                          title={variant.inStock ? undefined : "Sin stock"}
                        >
                          {variant.name}
                        </button>
                      );
                    })}
                  </div>
                  {needsChoice && (
                    <p className="mt-2 text-xs text-[#9A7A1F]">
                      Elegí una opción para agregarlo al carrito.
                    </p>
                  )}
                </div>
              )}

              {perfume.whatsappHint && (
                <p className="mb-4 rounded-lg bg-[#F8F0E3] p-3 text-sm leading-6 text-[#1A2238]">
                  {perfume.whatsappHint}
                </p>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  disabled={needsChoice}
                  className="flex w-full items-center justify-center rounded-md bg-[#1A2238] py-3 font-medium text-white transition-colors duration-200 hover:bg-[#25304F] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <Plus size={18} className="mr-2" />
                  {needsChoice ? "Elegí una opción" : "Agregar al carrito"}
                </button>
                <button
                  onClick={handleWhatsappInquiry}
                  className="flex w-full items-center justify-center rounded-md bg-green-600 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Consultar este perfume por WhatsApp
                </button>
                <button
                  onClick={() => toggleFavorite(perfume.id)}
                  className="flex w-full items-center justify-center rounded-md border border-[#1A2238] py-3 font-medium text-[#1A2238] transition-colors duration-200 hover:bg-[#1A2238] hover:text-white"
                >
                  <Heart size={18} className="mr-2" fill={favorite ? "currentColor" : "none"} />
                  {favorite ? "Guardado en favoritos" : "Guardar favorito"}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center justify-center rounded-md border border-[#D4AF37] py-3 font-medium text-[#1A2238] transition-colors duration-200 hover:bg-[#F8F0E3]"
                >
                  <Link size={18} className="mr-2" />
                  {copiedLink ? "Link copiado" : "Copiar link del perfume"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeDetails;

const InfoBox: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="rounded-lg border border-[#E8DDBF] bg-[#FBF8F1] p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7A1F]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[#1A2238]">{value}</div>
    </div>
  );
};
