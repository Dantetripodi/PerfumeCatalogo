import React, { useState } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  toggleCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, toggleCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A2238] whitespace-nowrap">
              <span className="text-[#D4AF37]">DT</span>Fragancias
            </h1>
            
            <div className="sm:hidden">
              <button 
                onClick={toggleCart}
                className="relative p-2 text-[#1A2238] hover:text-[#D4AF37] transition-colors duration-200"
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
              placeholder="Buscar perfumes..."
              className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <div className="hidden sm:block">
            <button 
              onClick={toggleCart}
              className="relative p-2 text-[#1A2238] hover:text-[#D4AF37] transition-colors duration-200"
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