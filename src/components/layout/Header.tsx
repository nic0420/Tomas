import { ShoppingCart, Search, Menu, User, Phone } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export function Header() {
  const { toggleCart, items } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-brand-dark text-gray-300 text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white flex items-center gap-1"><Phone size={12}/> Contato</a>
            <a href="#" className="hover:text-white">Marcas</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white flex items-center gap-1"><User size={12}/> Fazer Login</a>
            <span>/</span>
            <a href="#" className="hover:text-white">Cadastre-se</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-4">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-gray-600 hover:text-brand-blue">
            <Menu className="w-6 h-6" />
          </button>
          
          <a href="/" className="text-2xl font-black tracking-tight text-brand-dark uppercase flex flex-col leading-none">
            <span className="text-brand-blue text-3xl">ARSENAL</span>
            <span className="text-brand-orange text-lg text-right">TOMAS</span>
          </a>
        </div>

        {/* Search Bar - Hidden on small screens */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full bg-gray-100 border border-gray-300 rounded-sm py-2.5 pl-4 pr-12 text-sm text-gray-800 focus:outline-none focus:border-brand-blue focus:bg-white transition-colors"
          />
          <button className="absolute right-0 top-0 h-full px-4 bg-brand-blue text-white rounded-r-sm hover:bg-blue-700 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Button */}
        <div className="flex items-center">
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 p-2 text-gray-700 hover:text-brand-blue transition-colors group"
          >
            <div className="relative">
              <ShoppingCart className="w-7 h-7" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none ml-1">
              <span className="text-xs text-gray-500 font-medium">Meu Carrinho</span>
              <span className="text-sm font-bold">{totalItems} Item(s)</span>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}
