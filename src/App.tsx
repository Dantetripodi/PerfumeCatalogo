import { useState, useEffect, lazy, Suspense } from "react";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import Header from "./components/Header";
import Filters, { FiltersLayout } from "./components/Filters";
import PerfumeCard from "./components/PerfumeCard";
import PerfumeListItem from "./components/PerfumeListItem";
import PerfumeDetails from "./components/PerfumeDetails";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import Notice from "./components/Notice";
import Toast from "./components/Toast";
import { useInternalTools } from "./hooks/useInternalTools";
import { Grid, List, Sparkles } from "lucide-react";
import { usePerfumeCatalog } from "./hooks/usePerfumeCatalog";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { Perfume } from "./types";

// The studio, the carousel generator and the admin panel are internal tools
// behind a PIN. Loading them lazily keeps roughly 1.500 lines of tooling out of
// the bundle every customer downloads to browse the catalog.
const ContentStudio = lazy(() => import("./content-studio/ContentStudio"));
const CarouselGenerator = lazy(() =>
  import("./content-studio/Carousel").then(m => ({ default: m.CarouselGenerator }))
);
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const PinModal = lazy(() => import("./content-studio/PinModal"));

function ToolLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F0E3]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E8DDBF] border-t-[#D4AF37]" />
    </div>
  );
}

type ViewMode = "grid" | "list";
const VIEW_MODE_STORAGE_KEY = "dtfragancias_view_mode";
const FILTERS_LAYOUT_STORAGE_KEY = "dtfragancias_filters_layout";

function App() {
  const { session } = useAdminAuth();
  const {
    allPerfumes,
    filteredPerfumes,
    visiblePerfumes,
    hasMore,
    loadMore,
    filters,
    searchQuery,
    selectedPerfume,
    isCartOpen,
    loading: catalogLoading,
    error: catalogError,
    refetch: refetchCatalog,
    handleFilterChange,
    handleSearch,
    resetFilters,
    toggleCart,
    openDetails,
    closeDetails,
  } = usePerfumeCatalog();

  const {
    appView,
    isAdminOpen,
    isPinModalOpen,
    openAdmin,
    openStudio,
    openCarousel,
    closeTool,
    closeAdmin,
    closePin,
    confirmPin,
  } = useInternalTools(session !== null);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  // Filters across the top by default: the side panel costs a quarter of the
  // width, which on a large screen is a whole column of products.
  const [filtersLayout, setFiltersLayout] = useState<FiltersLayout>(() => {
    const saved = localStorage.getItem(FILTERS_LAYOUT_STORAGE_KEY);
    return saved === "panel" || saved === "bar" ? saved : "bar";
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === "grid" || saved === "list") return saved;
    // Default: compact list on mobile, grid on larger screens
    if (typeof window !== "undefined" && window.innerWidth < 640) return "list";
    return "grid";
  });

  // Persiste preferencias de vista
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(FILTERS_LAYOUT_STORAGE_KEY, filtersLayout);
  }, [filtersLayout]);

  const handleAddToCart = (perfume: Perfume) => {
    setToastMessage(`${perfume.name} agregado al carrito`);
    setShowToast(true);
  };

  // ── Content Studio view ──────────────────────────────────────────────────
  if (appView === "content-studio") {
    return (
      <CartProvider>
        <FavoritesProvider>
          <Suspense fallback={<ToolLoading />}>
            <ContentStudio perfumes={allPerfumes} onBack={closeTool} />
          </Suspense>
        </FavoritesProvider>
      </CartProvider>
    );
  }

  // ── Carousel view (solo con PIN/admin) ──────────────────────────────────
  if (appView === "carousel") {
    return (
      <CartProvider>
        <FavoritesProvider>
          <Suspense fallback={<ToolLoading />}>
            <CarouselGenerator perfumes={allPerfumes} onBack={closeTool} />
          </Suspense>
        </FavoritesProvider>
      </CartProvider>
    );
  }

  // "all", "featured" and "consult" are not collections, so they always show.
  // The rest only appear while that line actually has products in the catalog.
  const presentCollections = new Set(allPerfumes.map(perfume => perfume.collection));
  const quickFilters = [
    { label: "Todos", value: "all" },
    { label: "Destacados", value: "featured" },
    { label: "Yves", value: "regular" },
    { label: "Arabes", value: "arabe" },
    { label: "Arabic", value: "arabic" },
    { label: "Jacques Ryon", value: "jacques" },
    { label: "Mini perfumes", value: "mini" },
    { label: "Probadores", value: "probador" },
    { label: "Home", value: "home" },
    { label: "Consultar precio", value: "consult" },
  ].filter(
    filter =>
      ["all", "featured", "consult"].includes(filter.value) || presentCollections.has(filter.value as never)
  );

  return (
    <CartProvider>
      <FavoritesProvider>
        <div className="min-h-screen bg-[#F8F0E3]">
          <Header
            searchQuery={searchQuery}
            onSearch={handleSearch}
            toggleCart={toggleCart}
            onOpenAdmin={openAdmin}
          />

          <main>
            {/* Hero */}
            <section className="relative overflow-hidden bg-[#101827] text-white">
              <div className="absolute inset-0">
                <img
                  src="/imagenes/perfumes/fotos-varias.jpg"
                  alt=""
                  className="h-full w-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#101827] via-[#101827]/85 to-[#101827]/45" />
              </div>
              <div className="container relative mx-auto px-4 py-12 sm:py-16 lg:py-20">
                <div className="max-w-2xl">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
                    DTFragancias
                  </p>
                  <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
                    Un perfume, una historia.
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
                    Explorá fragancias seleccionadas, compará precios y armá tu pedido
                    directo por WhatsApp.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
                    <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur">
                      {allPerfumes.length} productos
                    </span>
                    <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur">
                      Perfumes árabes
                    </span>
                    <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur">
                      Pedido por WhatsApp
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog */}
            <div className="container mx-auto px-4 py-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#9A7A1F]">
                    Catálogo
                  </p>
                  <h2 className="font-serif text-3xl font-bold text-[#1A2238]">
                    Perfumes disponibles
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-gray-600">
                  Usá filtros para encontrar una fragancia por marca, perfil, género o
                  presupuesto.
                </p>
              </div>

              <Notice />

              {/* Quick filters */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                {quickFilters.map((filter) => {
                  const isActive = filters.collection === filter.value;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => handleFilterChange("collection", filter.value)}
                      className={`flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-[#1A2238] bg-[#1A2238] text-white"
                          : "border-[#E8DDBF] bg-white text-[#1A2238] hover:border-[#D4AF37]"
                      }`}
                    >
                      {filter.value === "featured" && (
                        <Sparkles size={15} className="mr-2" />
                      )}
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {catalogLoading && (
                <div className="flex items-center justify-center py-24">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8DDBF] border-t-[#D4AF37]" />
                  <span className="ml-4 text-sm text-gray-500">Cargando catálogo…</span>
                </div>
              )}

              {!catalogLoading && catalogError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
                  <p className="mb-4 text-sm font-medium text-red-700">{catalogError}</p>
                  <button
                    onClick={() => void refetchCatalog()}
                    className="rounded-md bg-[#1A2238] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#25304F]"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!catalogLoading && !catalogError && (
              <div className={filtersLayout === "bar" ? "flex flex-col gap-4" : "flex flex-col gap-8 lg:flex-row"}>
                <div className={filtersLayout === "bar" ? "" : "lg:w-1/4"}>
                  <Filters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={resetFilters}
                    perfumes={allPerfumes}
                    layout={filtersLayout}
                  />
                </div>

                <div className={filtersLayout === "bar" ? "" : "lg:w-3/4"}>
                  <div className="mb-4 flex flex-col gap-3 rounded-lg border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando{" "}
                      <strong className="text-[#1A2238]">{visiblePerfumes.length}</strong>{" "}
                      de {filteredPerfumes.length} perfumes
                    </div>
                    <div className="flex items-center gap-2">
                    {/* Filtros arriba libera el cuarto de ancho del panel: la
                        grilla pasa de 3 a 4 columnas en pantallas grandes. */}
                    <div className="hidden w-fit gap-1 rounded-lg bg-[#EEF0F4] p-1 lg:flex">
                      <button
                        onClick={() => setFiltersLayout("bar")}
                        className={`rounded px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                          filtersLayout === "bar"
                            ? "bg-[#1A2238] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-pressed={filtersLayout === "bar"}
                        title="Filtros en barra — más ancho para la grilla"
                      >
                        Barra
                      </button>
                      <button
                        onClick={() => setFiltersLayout("panel")}
                        className={`rounded px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                          filtersLayout === "panel"
                            ? "bg-[#1A2238] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-pressed={filtersLayout === "panel"}
                        title="Filtros en panel lateral"
                      >
                        Panel
                      </button>
                    </div>
                    <div className="flex w-fit gap-1 rounded-lg bg-[#EEF0F4] p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`rounded p-2 transition-colors duration-200 ${
                          viewMode === "grid"
                            ? "bg-[#1A2238] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label="Vista de cuadrícula"
                        title="Vista de cuadrícula"
                      >
                        <Grid size={20} />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`rounded p-2 transition-colors duration-200 ${
                          viewMode === "list"
                            ? "bg-[#1A2238] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label="Vista de lista"
                        title="Vista de lista"
                      >
                        <List size={20} />
                      </button>
                    </div>
                    </div>
                  </div>

                  {filteredPerfumes.length === 0 ? (
                    <div className="py-16 text-center">
                      <h3 className="mb-2 text-xl font-medium text-gray-600">
                        No se encontraron perfumes
                      </h3>
                      <p className="text-gray-500">Intenta cambiar los filtros de búsqueda</p>
                      <button
                        onClick={resetFilters}
                        className="mt-5 rounded-md bg-[#1A2238] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#25304F]"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <>
                      {viewMode === "grid" ? (
                        <div
                          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
                            filtersLayout === "bar" ? "xl:grid-cols-4" : ""
                          }`}
                        >
                          {visiblePerfumes.map((perfume, index) => (
                            <PerfumeCard
                              key={perfume.id}
                              perfume={perfume}
                              priority={index < 6}
                              onShowDetails={openDetails}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {visiblePerfumes.map((perfume, index) => (
                            <PerfumeListItem
                              key={perfume.id}
                              perfume={perfume}
                              priority={index < 6}
                              onShowDetails={openDetails}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                        </div>
                      )}

                      {hasMore && (
                        <div className="mt-8 flex flex-col items-center gap-2">
                          <button
                            onClick={loadMore}
                            className="w-full rounded-md bg-[#1A2238] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#25304F] sm:w-auto sm:px-10"
                          >
                            Ver más perfumes
                          </button>
                          <span className="text-xs text-gray-500">
                            Quedan {filteredPerfumes.length - visiblePerfumes.length}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              )}
            </div>
          </main>

          <PerfumeDetails
            perfume={selectedPerfume}
            onClose={closeDetails}
            onAddToCart={handleAddToCart}
          />
          <Cart isOpen={isCartOpen} onClose={() => toggleCart()} />
          <Toast
            message={toastMessage}
            isVisible={showToast}
            onClose={() => setShowToast(false)}
          />
          {/* Mounted only while open so the lazy chunk is fetched on demand;
              both panels already render null when closed, so nothing changes. */}
          {isAdminOpen && (
            <Suspense fallback={null}>
              <AdminPanel
                isOpen={isAdminOpen}
                onClose={closeAdmin}
                onSaved={() => {
                  void refetchCatalog();
                  setToastMessage("Catálogo actualizado");
                  setShowToast(true);
                }}
                onOpenContentStudio={openStudio}
                onOpenCarousel={openCarousel}
              />
            </Suspense>
          )}

          <Footer />

          {/* PIN modal — solo aparece cuando se intenta acceder sin sesión activa */}
          {isPinModalOpen && (
            <Suspense fallback={null}>
              <PinModal isOpen={isPinModalOpen} onClose={closePin} onSuccess={confirmPin} />
            </Suspense>
          )}
        </div>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;
