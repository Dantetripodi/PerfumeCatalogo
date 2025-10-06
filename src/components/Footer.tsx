import React from "react";
import { Instagram, CreditCard, Wallet, Send } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A2238] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-serif mb-4">
              <span className="text-[#D4AF37]">DT</span>Fragancias
            </h3>
            <p className="text-sm text-gray-300">Tu tienda de perfumes de confianza</p>
          </div>

          <div className="text-center">
            <h4 className="font-medium mb-4">Síguenos en</h4>
            <div className="flex justify-center space-x-4">
              <a href="https://www.instagram.com/dt_fragancias/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                <Instagram size={24} />
              </a>
              <a href="https://wa.me/1145630304" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                <Send size={24} />
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
          <p className="text-sm text-gray-300">© 2025 DTFragancias. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;