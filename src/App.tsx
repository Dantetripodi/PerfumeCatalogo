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
    selectedPerfume,
    isCartOpen,
    handleFilterChange,
    handleSearch,
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
        <Header onSearch={handleSearch} toggleCart={toggleCart} />

        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-[#1A2238]">
            Catálogo de <span className="text-[#D4AF37]">Perfumes</span>
          </h2>

          <Notice />

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <Filters filters={filters} onFilterChange={handleFilterChange} perfumes={allPerfumes} />
            </div>

            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  Mostrando {filteredPerfumes.length} de {allPerfumes.length} perfumes
                </div>
                <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors duration-200 ${
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
                    className={`p-2 rounded transition-colors duration-200 ${
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