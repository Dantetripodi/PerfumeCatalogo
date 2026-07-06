import React, { useState } from "react";
import { Pencil, Trash2, Star, PlusCircle } from "lucide-react";
import { Perfume } from "../../types";
import { formatPrice } from "../../utils/price";

interface PerfumeListProps {
  perfumes: Perfume[];
  loading: boolean;
  onNew: () => void;
  onEdit: (perfume: Perfume) => void;
  onDelete: (perfume: Perfume) => void;
}

const PerfumeList: React.FC<PerfumeListProps> = ({
  perfumes,
  loading,
  onNew,
  onEdit,
  onDelete,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDeleteClick = (perfume: Perfume) => {
    setConfirmDeleteId(perfume.id);
  };

  const handleConfirmDelete = (perfume: Perfume) => {
    setConfirmDeleteId(null);
    onDelete(perfume);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8DDBF] border-t-[#D4AF37]" />
        <span className="ml-3 text-sm text-gray-500">Cargando perfumes…</span>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {perfumes.length} {perfumes.length === 1 ? "perfume" : "perfumes"} en el catálogo
        </p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 rounded-md bg-[#1A2238] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#25304F]"
        >
          <PlusCircle size={16} />
          Nuevo perfume
        </button>
      </div>

      {perfumes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E8DDBF] py-12 text-center">
          <p className="text-sm text-gray-500">No hay perfumes en el catálogo todavía.</p>
          <button
            onClick={onNew}
            className="mt-3 text-sm font-medium text-[#D4AF37] hover:underline"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-[#E8DDBF]">
          {perfumes.map((perfume) => (
            <li key={perfume.id} className="flex items-center gap-3 py-3">
              {/* Thumbnail */}
              <img
                src={perfume.image}
                alt={perfume.name}
                className="h-12 w-12 flex-shrink-0 rounded-md border border-[#E8DDBF] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/imagenes/perfumes/fotos-varias.jpg";
                }}
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-[#1A2238]">
                    {perfume.name}
                  </span>
                  {perfume.isFeatured && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-xs font-medium text-[#9A7A1F]">
                      <Star size={10} className="fill-[#D4AF37] text-[#D4AF37]" />
                      Destacado
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-500">
                  {perfume.brand} · {perfume.collection} · {formatPrice(perfume.price)}
                </p>
              </div>

              {/* Actions */}
              {confirmDeleteId === perfume.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-red-600">¿Borrar?</span>
                  <button
                    onClick={() => handleConfirmDelete(perfume)}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Sí
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    No
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => onEdit(perfume)}
                    className="rounded p-1.5 text-[#1A2238] transition-colors hover:bg-[#F8F0E3]"
                    title="Editar"
                    aria-label={`Editar ${perfume.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(perfume)}
                    className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Borrar"
                    aria-label={`Borrar ${perfume.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PerfumeList;
