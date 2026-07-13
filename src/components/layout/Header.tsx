import { ShoppingCart, Search, Menu } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export function Header() {
  const { toggleCart, items } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-zinc-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-xl font-bold tracking-tighter text-white uppercase flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-zinc-950">
              A
            </span>
            <span>Arsenal</span>
          </div>
        </div>

        {/* Search Bar - Hidden on small screens */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Cart Button */}
        <button
          onClick={toggleCart}
          className="relative p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-zinc-950">
              {totalItems}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}
