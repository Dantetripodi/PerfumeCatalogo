import React from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { useCart } from '../context/useCart';

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  toggleCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearch, toggleCart }) => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onSearch(query);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8DDBF] bg-white/95 shadow-sm backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="whitespace-nowrap font-serif text-2xl font-bold text-[#1A2238] sm:text-3xl">
              <span className="text-[#D4AF37]">DT</span>Fragancias
            </h1>
            
            <div className="sm:hidden">
              <button 
                onClick={toggleCart}
                className="relative rounded-md p-2 text-[#1A2238] transition-colors duration-200 hover:bg-[#F8F0E3] hover:text-[#9A7A1F]"
                aria-label="Abrir carrito"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full sm:w-auto relative">
            <input
              type="text"
              placeholder="Buscar por perfume, marca o nota..."
              className="w-full rounded-full border border-[#DDD2B7] bg-[#FBF8F1] py-2.5 pl-4 pr-11 text-[#1A2238] placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Buscar perfumes"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <div className="hidden sm:block">
            <button 
              onClick={toggleCart}
              className="relative rounded-md p-2 text-[#1A2238] transition-colors duration-200 hover:bg-[#F8F0E3] hover:text-[#9A7A1F]"
              aria-label="Abrir carrito"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
