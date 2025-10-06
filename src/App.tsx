import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Filters from "./components/Filters";
import PerfumeCard from "./components/PerfumeCard";
import PerfumeDetails from "./components/PerfumeDetails";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import Notice from "./components/Notice";
import { usePerfumeCatalog } from "./hooks/usePerfumeCatalog";

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
              {filteredPerfumes.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No se encontraron perfumes</h3>
                  <p className="text-gray-500">Intenta cambiar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPerfumes.map((perfume) => (
                    <PerfumeCard key={perfume.id} perfume={perfume} onShowDetails={openDetails} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <PerfumeDetails perfume={selectedPerfume} onClose={closeDetails} />
        <Cart isOpen={isCartOpen} onClose={() => toggleCart()} />
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;