import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { perfumes } from './data/perfumes';
import { Perfume } from './types';
import Header from './components/Header';
import Filters from './components/Filters';
import PerfumeCard from './components/PerfumeCard';
import PerfumeDetails from './components/PerfumeDetails';
import Cart from './components/Cart';
import { Facebook, Instagram, Apple as WhatsApp, CreditCard, Wallet } from 'lucide-react';

function App() {
  const [filteredPerfumes, setFilteredPerfumes] = useState<Perfume[]>(perfumes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    gender: '',
    category: '',
  });

  useEffect(() => {
    let result = perfumes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (perfume) =>
          perfume.name.toLowerCase().includes(query) ||
          perfume.brand.toLowerCase().includes(query) ||
          perfume.description.toLowerCase().includes(query)
      );
    }

    if (filters.brand) {
      result = result.filter((perfume) => perfume.brand === filters.brand);
    }

    if (filters.gender) {
      result = result.filter((perfume) => perfume.gender === filters.gender);
    }

    if (filters.category) {
      result = result.filter((perfume) => perfume.category === filters.category);
    }

    setFilteredPerfumes(result);
  }, [searchQuery, filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleShowDetails = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
  };

  const handleCloseDetails = () => {
    setSelectedPerfume(null);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F8F0E3]">
        <Header onSearch={handleSearch} toggleCart={toggleCart} />
        
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-[#1A2238]">
            Catálogo de <span className="text-[#D4AF37]">Perfumes</span>
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                perfumes={perfumes}
              />
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
                    <PerfumeCard 
                      key={perfume.id} 
                      perfume={perfume} 
                      onShowDetails={handleShowDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        
        <PerfumeDetails perfume={selectedPerfume} onClose={handleCloseDetails} />
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
        <footer className="bg-[#1A2238] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-serif mb-4">
                  <span className="text-[#D4AF37]">Luxe</span>Scent
                </h3>
                <p className="text-sm text-gray-300">Tu tienda de perfumes de confianza</p>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-4">Síguenos en</h4>
                <div className="flex justify-center space-x-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                    <Facebook size={24} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                    <Instagram size={24} />
                  </a>
                  <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                    <WhatsApp size={24} />
                  </a>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-4">Medios de Pago</h4>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center">
                    <Wallet size={24} className="text-[#D4AF37]" />
                    <span className="ml-2">Efectivo</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard size={24} className="text-[#D4AF37]" />
                    <span className="ml-2">Transferencia</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-300">© 2025 LuxeScent. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}

export default App;