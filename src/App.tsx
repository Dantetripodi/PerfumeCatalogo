import { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import Header from "./components/Header";
import Filters from "./components/Filters";
import PerfumeCard from "./components/PerfumeCard";
import PerfumeListItem from "./components/PerfumeListItem";
import PerfumeDetails from "./components/PerfumeDetails";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import Notice from "./components/Notice";
import Toast from "./components/Toast";
import AdminPanel from "./components/AdminPanel";
import ContentStudio from "./content-studio/ContentStudio";
import { CarouselGenerator } from "./content-studio/Carousel";
import PinModal, { isStudioUnlocked } from "./content-studio/PinModal";
import { Grid, List, Sparkles } from "lucide-react";
import { usePerfumeCatalog } from "./hooks/usePerfumeCatalog";
import { Perfume } from "./types";

type ViewMode = "grid" | "list";
type AppView = "catalog" | "content-studio" | "carousel";

/** Destino al que va el flujo de PIN una vez desbloqueado */
type PinTarget = "content-studio" | "carousel";
const VIEW_MODE_STORAGE_KEY = "dtfragancias_view_mode";

// Si el admin ya está autenticado, el Content Studio también está desbloqueado
const ADMIN_SESSION_KEY = "dtfragancias_admin_session";
function canAccessStudio(): boolean {
  return (
    isStudioUnlocked() ||
    sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );
}

function App() {
  const {
    allPerfumes,
    filteredPerfumes,
    filters,
    searchQuery,
    selectedPerfume,
    isCartOpen,
    handleFilterChange,
    handleSearch,
    resetFilters,
    refreshCustomPerfumes,
    toggleCart,
    openDetails,
    closeDetails,
  } = usePerfumeCatalog();

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [appView, setAppView] = useState<AppView>("catalog");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinTarget, setPinTarget] = useState<PinTarget>("content-studio");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return saved === "grid" || saved === "list" ? saved : "grid";
  });

  // Persiste preferencia de vista
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  // Rutas hash: #/admin, #/studio, #/carousel
  useEffect(() => {
    const syncHashRoute = () => {
      if (window.location.hash === "#/admin") {
        setIsAdminOpen(true);
      } else if (window.location.hash === "#/studio") {
        handleTryOpenStudio();
      } else if (window.location.hash === "#/carousel") {
        handleTryOpenCarousel();
      }
    };

    syncHashRoute();
    window.addEventListener("hashchange", syncHashRoute);
    return () => window.removeEventListener("hashchange", syncHashRoute);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atajos de teclado:
  //   Ctrl/Cmd+Shift+S → Content Studio
  //   Ctrl/Cmd+Shift+C → Carrusel
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        handleTryOpenStudio();
      } else if (k === "c") {
        e.preventDefault();
        handleTryOpenCarousel();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intenta abrir el Content Studio — si ya tiene acceso va directo, si no pide PIN
  const handleTryOpenStudio = () => {
    if (canAccessStudio()) {
      setAppView("content-studio");
    } else {
      setPinTarget("content-studio");
      setIsPinModalOpen(true);
    }
  };

  // Mismo flujo para el generador de carruseles (mismo PIN, mismo gate)
  const handleTryOpenCarousel = () => {
    if (canAccessStudio()) {
      setAppView("carousel");
    } else {
      setPinTarget("carousel");
      setIsPinModalOpen(true);
    }
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setAppView(pinTarget);
  };

  const handleAddToCart = (perfume: Perfume) => {
    setToastMessage(`${perfume.name} agregado al carrito`);
    setShowToast(true);
  };

  // ── Content Studio view ──────────────────────────────────────────────────
  if (appView === "content-studio") {
    return (
      <CartProvider>
        <FavoritesProvider>
          <ContentStudio
            perfumes={allPerfumes}
            onBack={() => {
              setAppView("catalog");
              // Limpia el hash si vino de #/studio
              if (window.location.hash === "#/studio") {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }}
          />
        </FavoritesProvider>
      </CartProvider>
    );
  }

  // ── Carousel view (solo con PIN/admin) ──────────────────────────────────
  if (appView === "carousel") {
    return (
      <CartProvider>
        <FavoritesProvider>
          <CarouselGenerator
            perfumes={allPerfumes}
            onBack={() => {
              setAppView("catalog");
              if (window.location.hash === "#/carousel") {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }}
          />
        </FavoritesProvider>
      </CartProvider>
    );
  }

  const quickFilters = [
    { label: "Todos", value: "all" },
    { label: "Destacados", value: "featured" },
    { label: "Arabes", value: "arabe" },
    { label: "Mini perfumes", value: "mini" },
    { label: "Consultar precio", value: "consult" },
  ];

  return (
    <CartProvider>
      <FavoritesProvider>
        <div className="min-h-screen bg-[#F8F0E3]">
          <Header
            searchQuery={searchQuery}
            onSearch={handleSearch}
            toggleCart={toggleCart}
            onOpenAdmin={() => setIsAdminOpen(true)}
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

              <div className="flex flex-col gap-8 lg:flex-row">
                <div className="lg:w-1/4">
                  <Filters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={resetFilters}
                    perfumes={allPerfumes}
                  />
                </div>

                <div className="lg:w-3/4">
                  <div className="mb-4 flex flex-col gap-3 rounded-lg border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando{" "}
                      <strong className="text-[#1A2238]">{filteredPerfumes.length}</strong>{" "}
                      de {allPerfumes.length} perfumes
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
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredPerfumes.map((perfume) => (
                        <PerfumeCard
                          key={perfume.id}
                          perfume={perfume}
                          onShowDetails={openDetails}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {filteredPerfumes.map((perfume) => (
                        <PerfumeListItem
                          key={perfume.id}
                          perfume={perfume}
                          onShowDetails={openDetails}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => {
              setIsAdminOpen(false);
              if (window.location.hash === "#/admin") {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }}
            onSaved={() => {
              refreshCustomPerfumes();
              setToastMessage("Producto agregado al catálogo local");
              setShowToast(true);
            }}
            onOpenContentStudio={handleTryOpenStudio}
            onOpenCarousel={handleTryOpenCarousel}
          />

          <Footer />

          {/* PIN modal — solo aparece cuando se intenta acceder sin sesión activa */}
          <PinModal
            isOpen={isPinModalOpen}
            onClose={() => {
              setIsPinModalOpen(false);
              if (
                window.location.hash === "#/studio" ||
                window.location.hash === "#/carousel"
              ) {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }}
            onSuccess={handlePinSuccess}
          />
        </div>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;
