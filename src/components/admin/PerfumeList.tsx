import React, { useMemo, useState } from "react";
import { Pencil, Trash2, Star, PlusCircle, Search, X } from "lucide-react";
import { Perfume } from "../../types";
import { formatPrice } from "../../utils/price";

interface PerfumeListProps {
  perfumes: Perfume[];
  loading: boolean;
  onNew: () => void;
  onEdit: (perfume: Perfume) => void;
  onDelete: (perfume: Perfume) => void;
  onToggleFeatured: (perfume: Perfume) => void;
  /** Ids currently being saved, so their star can show it is in flight. */
  savingFeaturedIds: number[];
}

/** Scrolling 448 rows to find one product is not a way to work. */
const MAX_ROWS = 60;

const PerfumeList: React.FC<PerfumeListProps> = ({
  perfumes,
  loading,
  onNew,
  onEdit,
  onDelete,
  onToggleFeatured,
  savingFeaturedIds,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const featuredCount = perfumes.filter(perfume => perfume.isFeatured).length;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return perfumes.filter(perfume => {
      if (onlyFeatured && !perfume.isFeatured) return false;
      if (!q) return true;
      return (
        perfume.name.toLowerCase().includes(q) ||
        perfume.brand.toLowerCase().includes(q) ||
        perfume.collection.toLowerCase().includes(q)
      );
    });
  }, [perfumes, query, onlyFeatured]);

  const visible = matches.slice(0, MAX_ROWS);

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
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {perfumes.length} {perfumes.length === 1 ? "perfume" : "perfumes"} ·{" "}
          <span className="font-medium text-[#9A7A1F]">{featuredCount} destacados</span>
        </p>
        <button
          onClick={onNew}
          className="flex shrink-0 items-center gap-2 rounded-md bg-[#1A2238] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#25304F]"
        >
          <PlusCircle size={16} />
          Nuevo perfume
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Buscar por nombre, marca o línea…"
            className="w-full rounded-md border border-[#E8DDBF] bg-[#FBF8F1] py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setOnlyFeatured(value => !value)}
          className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            onlyFeatured
              ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#9A7A1F]"
              : "border-[#E8DDBF] text-gray-600 hover:bg-[#F8F0E3]"
          }`}
        >
          <Star size={14} className={onlyFeatured ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
          Solo destacados
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
          {visible.map((perfume) => (
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
                    onClick={() => onToggleFeatured(perfume)}
                    disabled={savingFeaturedIds.includes(perfume.id)}
                    className={`rounded p-1.5 transition-colors disabled:opacity-40 ${
                      perfume.isFeatured
                        ? "text-[#D4AF37] hover:bg-[#D4AF37]/10"
                        : "text-gray-300 hover:bg-[#F8F0E3] hover:text-[#D4AF37]"
                    }`}
                    title={perfume.isFeatured ? "Quitar de destacados" : "Destacar en el catálogo"}
                    aria-label={`${perfume.isFeatured ? "Quitar de" : "Agregar a"} destacados: ${perfume.name}`}
                    aria-pressed={perfume.isFeatured}
                  >
                    <Star size={15} className={perfume.isFeatured ? "fill-[#D4AF37]" : ""} />
                  </button>
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

      {matches.length === 0 && perfumes.length > 0 && (
        <div className="rounded-lg border border-dashed border-[#E8DDBF] py-10 text-center">
          <p className="text-sm text-gray-500">Ningún perfume coincide con la búsqueda.</p>
        </div>
      )}

      {matches.length > MAX_ROWS && (
        <p className="pt-4 text-center text-xs text-gray-500">
          Mostrando {MAX_ROWS} de {matches.length}. Afiná la búsqueda para ver el resto.
        </p>
      )}
    </div>
  );
};

export default PerfumeList;
