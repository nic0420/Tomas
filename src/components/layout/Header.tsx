import { ShoppingCart, Menu, User, Phone, DollarSign } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';

export function Header() {
  const { toggleCart, items } = useCartStore();
  const { dolarBlue } = useProductStore();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="w-full bg-white font-sans">
      {/* Top Bar - Identical to Arsenal Sports top bar */}
      <div className="bg-[#f5f5f5] text-[#666] text-[11px] py-1 border-b border-[#eaeaea] hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
              BIENVENIDO A TOMMY GUNS
            </span>
            <span className="flex items-center gap-1 font-semibold text-brand-green">
              <DollarSign size={12} /> Dólar Blue: ${dolarBlue}
            </span>
          </div>
          <div className="flex items-center gap-4 font-semibold uppercase tracking-wider">
            <a href="#" className="hover:text-brand-gold flex items-center gap-1 transition-colors"><User size={12}/> MI CUENTA</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-brand-gold transition-colors flex items-center gap-1"><Phone size={12}/> CONTACTO</a>
            <span className="text-gray-300">|</span>
            <a href="https://www.instagram.com/tommygunsctes" target="_blank" rel="noreferrer" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
              INSTAGRAM
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-8">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-gray-800 hover:text-brand-gold transition-colors">
            <Menu className="w-7 h-7" />
          </button>
          
          <a href="/" className="flex items-center">
            {/* The user will drop their logo in public/logo.jpg */}
            <img src="/logo.jpg" alt="Tommy Guns" className="h-16 w-auto object-contain hidden md:block" onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const nextSibling = (e.target as HTMLElement).nextElementSibling;
              if (nextSibling) (nextSibling as HTMLElement).classList.remove('hidden');
            }}/>
            <div className="hidden flex-col leading-none">
              <span className="text-brand-green text-4xl font-black tracking-tighter uppercase" style={{ textShadow: '2px 2px 0px #c29b62' }}>TOMMY</span>
              <span className="text-brand-gold text-2xl font-black tracking-widest uppercase">GUNS</span>
            </div>
          </a>
        </div>

        {/* Search Bar - Huge like Arsenal */}
        <div className="hidden lg:flex flex-1 max-w-3xl relative">
          <div className="flex w-full border-2 border-brand-green rounded-full overflow-hidden">
            <input
              type="text"
              placeholder="Escribe lo que buscas..."
              value={useProductStore((state) => state.searchQuery)}
              onChange={(e) => useProductStore.getState().setSearchQuery(e.target.value)}
              className="w-full bg-white py-3 px-5 text-[13px] text-gray-700 focus:outline-none font-medium"
            />
            <button className="bg-brand-green text-white px-8 hover:bg-brand-dark transition-colors flex items-center justify-center font-bold text-sm uppercase tracking-wide">
              Buscar
            </button>
          </div>
        </div>

        {/* Contact & Cart */}
        <div className="flex items-center gap-8">
          
          {/* Contact (Desktop only) */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-brand-gold flex items-center justify-center text-brand-green">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Atención al Cliente</span>
              <span className="text-sm font-black text-brand-dark">+54 9 11 1234-5678</span>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-brand-gold transition-colors">
              <ShoppingCart className="w-5 h-5 text-brand-green group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white shadow-sm border border-white">
                {totalItems}
              </span>
            </div>
            <div className="hidden md:flex flex-col items-start leading-none text-left">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mi Carrito</span>
              <span className="text-sm font-black text-brand-dark">{totalItems > 0 ? `${totalItems} ítems` : 'Vacío'}</span>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}
