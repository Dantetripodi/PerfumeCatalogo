import React, { useState, useMemo } from "react";
import { ArrowLeft, FlaskConical, Search, ChevronDown } from "lucide-react";
import { Perfume } from "../types";
import { formatPrice } from "../utils/price";
import { generateAllContent } from "./generators";
import { CONTENT_SECTION_LABELS, CONTENT_SECTION_ICONS, ContentSection } from "./types";
import ContentCard from "./ContentCard";

interface ContentStudioProps {
  perfumes: Perfume[];
  onBack: () => void;
}

const SECTIONS: ContentSection[] = [
  "instagramCaption",
  "instagramStory",
  "reelScript",
  "whatsappText",
  "hashtags",
  "imagePrompt",
];

const ContentStudio: React.FC<ContentStudioProps> = ({ perfumes, onBack }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedPerfume = perfumes.find((p) => p.id === selectedId) ?? null;
  const content = useMemo(
    () => (selectedPerfume ? generateAllContent(selectedPerfume) : null),
    [selectedPerfume]
  );

  const filteredPerfumes = useMemo(() => {
    if (!search.trim()) return perfumes;
    const q = search.toLowerCase();
    return perfumes.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [perfumes, search]);

  const handleSelect = (p: Perfume) => {
    setSelectedId(p.id);
    setIsDropdownOpen(false);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#F8F0E3]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 border-b border-[#E8DDBF] bg-white/95 shadow-sm backdrop-blur">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-md p-2 text-[#1A2238] transition-colors hover:bg-[#F8F0E3]"
            aria-label="Volver al catálogo"
          >
            <ArrowLeft size={20} />
            <span className="hidden text-sm font-medium sm:inline">Catálogo</span>
          </button>

          <div className="flex flex-1 items-center gap-2">
            <FlaskConical size={22} className="text-[#D4AF37]" />
            <h1 className="font-serif text-xl font-bold text-[#1A2238] sm:text-2xl">
              Content Studio
            </h1>
          </div>

          {selectedPerfume && (
            <span className="hidden rounded-full bg-[#1A2238] px-3 py-1 text-xs font-medium text-white sm:inline">
              {selectedPerfume.name}
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ── Intro ── */}
        <div className="mb-8 text-center">
          <p className="mx-auto max-w-xl text-sm text-gray-500">
            Elegí un perfume del catálogo y generá automáticamente captions, historias,
            guiones de reels, mensajes de WhatsApp y prompts de imagen listos para usar.
          </p>
        </div>

        {/* ── Selector de perfume ── */}
        <div className="mx-auto mb-10 max-w-lg">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#1A2238]">
            Perfume
          </label>

          {/* Custom dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border-2 border-[#E8DDBF] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              {selectedPerfume ? (
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selectedPerfume.image}
                    alt={selectedPerfume.name}
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1A2238]">{selectedPerfume.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedPerfume.brand} · {formatPrice(selectedPerfume.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">Seleccioná un perfume…</span>
              )}
              <ChevronDown
                size={18}
                className={`flex-shrink-0 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-hidden rounded-xl border border-[#E8DDBF] bg-white shadow-xl">
                {/* Search inside dropdown */}
                <div className="border-b border-[#E8DDBF] p-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar perfume…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-lg border border-[#E8DDBF] bg-[#FBF8F1] py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* List */}
                <ul className="max-h-60 overflow-y-auto">
                  {filteredPerfumes.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-gray-400">
                      Sin resultados
                    </li>
                  ) : (
                    filteredPerfumes.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => handleSelect(p)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[#F8F0E3] ${
                            p.id === selectedId ? "bg-[#FBF8F1]" : ""
                          }`}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#1A2238]">{p.name}</p>
                            <p className="text-xs text-gray-500">
                              {p.brand} · {p.category} · {formatPrice(p.price)}
                            </p>
                          </div>
                          {p.id === selectedId && (
                            <span className="text-xs text-[#D4AF37] font-semibold flex-shrink-0">✓</span>
                          )}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Contenido generado ── */}
        {!selectedPerfume && (
          <div className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-[#E8DDBF] bg-white py-16 text-center">
            <FlaskConical size={40} className="mx-auto mb-4 text-[#D4AF37]" strokeWidth={1.5} />
            <p className="font-serif text-lg font-semibold text-[#1A2238]">
              Elegí un perfume para empezar
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Se generará el contenido automáticamente
            </p>
          </div>
        )}

        {content && selectedPerfume && (
          <div>
            {/* Perfume header card */}
            <div className="mx-auto mb-8 flex max-w-2xl items-center gap-4 rounded-2xl border border-[#E8DDBF] bg-white p-4 shadow-sm">
              <img
                src={selectedPerfume.image}
                alt={selectedPerfume.name}
                className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-serif text-xl font-bold text-[#1A2238] truncate">
                  {selectedPerfume.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedPerfume.brand} · {selectedPerfume.category} · {selectedPerfume.gender}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#9A7A1F]">
                  {formatPrice(selectedPerfume.price)} · {selectedPerfume.size}
                </p>
              </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {SECTIONS.map((section) => {
                const rawValue = content[section];
                const displayValue = Array.isArray(rawValue)
                  ? rawValue
                  : (rawValue as string);

                return (
                  <ContentCard
                    key={section}
                    icon={CONTENT_SECTION_ICONS[section]}
                    label={CONTENT_SECTION_LABELS[section]}
                    content={displayValue}
                    className={
                      section === "reelScript" || section === "imagePrompt"
                        ? "lg:col-span-2"
                        : ""
                    }
                  />
                );
              })}
            </div>

            {/* Tip footer */}
            <p className="mt-8 text-center text-xs text-gray-400">
              Todos los textos son editables · Copiá y pegá donde necesites
            </p>
          </div>
        )}
      </div>

      {/* Overlay para cerrar dropdown al hacer click afuera */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default ContentStudio;
