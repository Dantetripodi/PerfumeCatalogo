import { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Filters from "./components/Filters";
import PerfumeCard from "./components/PerfumeCard";
import PerfumeListItem from "./components/PerfumeListItem";
import PerfumeDetails from "./components/PerfumeDetails";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import Notice from "./components/Notice";
import Toast from "./components/Toast";
import { Grid, List } from "lucide-react";
import { usePerfumeCatalog } from "./hooks/usePerfumeCatalog";
import { Perfume } from "./types";

type ViewMode = 'grid' | 'list';
const VIEW_MODE_STORAGE_KEY = 'dtfragancias_view_mode';

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
    toggleCart,
    openDetails,
    closeDetails,
  } = usePerfumeCatalog();

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const handleAddToCart = (perfume: Perfume) => {
    setToastMessage(`${perfume.name} agregado al carrito`);
    setShowToast(true);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F8F0E3]">
        <Header searchQuery={searchQuery} onSearch={handleSearch} toggleCart={toggleCart} />

        <main>
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
                  Explorá fragancias seleccionadas, compará precios y armá tu pedido directo por WhatsApp.
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
                Usá filtros para encontrar una fragancia por marca, perfil, género o presupuesto.
              </p>
            </div>

            <Notice />

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
                  Mostrando <strong className="text-[#1A2238]">{filteredPerfumes.length}</strong> de {allPerfumes.length} perfumes
                </div>
                <div className="flex w-fit gap-1 rounded-lg bg-[#EEF0F4] p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded p-2 transition-colors duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-[#1A2238] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Vista de cuadrícula"
                    title="Vista de cuadrícula"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded p-2 transition-colors duration-200 ${
                      viewMode === 'list'
                        ? 'bg-[#1A2238] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Vista de lista"
                    title="Vista de lista"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {filteredPerfumes.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No se encontraron perfumes</h3>
                  <p className="text-gray-500">Intenta cambiar los filtros de búsqueda</p>
                  <button
                    onClick={resetFilters}
                    className="mt-5 rounded-md bg-[#1A2238] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#25304F]"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <PerfumeDetails perfume={selectedPerfume} onClose={closeDetails} onAddToCart={handleAddToCart} />
        <Cart isOpen={isCartOpen} onClose={() => toggleCart()} />
        <Toast 
          message={toastMessage} 
          isVisible={showToast} 
          onClose={() => setShowToast(false)} 
        />
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
