import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export function Header() {
  const { toggleCart, items } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-brand-dark text-gray-300 text-xs py-1.5 hidden md:block border-b border-brand-gold/20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/tommygunsctes" target="_blank" rel="noreferrer" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
              @tommygunsctes
            </a>
            <a href="#" className="hover:text-brand-gold transition-colors">Marcas</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-brand-gold flex items-center gap-1 transition-colors"><User size={12}/> Fazer Login</a>
            <span className="text-gray-600">/</span>
            <a href="#" className="hover:text-brand-gold transition-colors">Cadastre-se</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-4">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-brand-green hover:text-brand-gold transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          
          <a href="/" className="flex items-center gap-3">
            {/* The user will drop their logo in public/logo.jpg. This img tag will load it if it exists. */}
            <img src="/logo.jpg" alt="Tommy Guns Logo" className="h-12 w-auto object-contain bg-brand-green p-1 rounded-sm hidden md:block" onError={(e) => {
              // Fallback text if image not found
              (e.target as HTMLElement).style.display = 'none';
              const nextSibling = (e.target as HTMLElement).nextElementSibling;
              if (nextSibling) (nextSibling as HTMLElement).classList.remove('hidden');
            }}/>
            <div className="hidden flex-col leading-none">
              <span className="text-brand-green text-3xl font-black tracking-tighter uppercase" style={{ textShadow: '1px 1px 0px #c29b62' }}>TOMMY</span>
              <span className="text-brand-gold text-xl font-black tracking-widest uppercase">GUNS</span>
            </div>
          </a>
        </div>

        {/* Search Bar - Hidden on small screens */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative group">
          <input
            type="text"
            placeholder="Buscar armas, accesorios..."
            className="w-full bg-gray-50 border border-gray-300 rounded-sm py-2.5 pl-4 pr-12 text-sm text-gray-800 focus:outline-none focus:border-brand-gold focus:bg-white transition-all shadow-sm group-hover:shadow"
          />
          <button className="absolute right-0 top-0 h-full px-5 bg-brand-green text-brand-chrome rounded-r-sm hover:bg-[#1f291c] transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Button */}
        <div className="flex items-center">
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 p-2 text-brand-green hover:text-brand-gold transition-colors group"
          >
            <div className="relative">
              <ShoppingCart className="w-7 h-7" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white shadow-sm border border-white">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none ml-1">
              <span className="text-xs text-gray-500 font-medium group-hover:text-brand-gold transition-colors">Mi Carrito</span>
              <span className="text-sm font-black text-brand-dark">{totalItems} Item(s)</span>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}
