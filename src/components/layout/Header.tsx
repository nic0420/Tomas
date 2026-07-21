import { useState, useMemo, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, User, Phone, DollarSign, ChevronRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../../config/constants';

export function Header() {
  const { toggleCart, items } = useCartStore();
  const { dolarBlue, products, categories, searchQuery, setSearchQuery, setSelectedProduct, setSelectedCategory } = useProductStore();
  const { isAuthenticated, user } = useAuthStore();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return { products: [], categories: [] };
    
    const query = searchQuery.toLowerCase();
    
    // Find matching categories
    const matchedCategories = categories.filter(c => c.toLowerCase().includes(query)).slice(0, 3);
    
    // Find matching products
    const matchedProducts = products.filter(p => 
      p.nombre_producto.toLowerCase().includes(query) || 
      p.categoria.toLowerCase().includes(query)
    ).slice(0, 5);

    return { products: matchedProducts, categories: matchedCategories };
  }, [searchQuery, products, categories]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

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
            {isAuthenticated ? (
              <Link to="/profile" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
                <User size={12}/> MI CUENTA ({user?.name})
              </Link>
            ) : (
              <Link to="/login" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
                <User size={12}/> INICIAR SESIÓN
              </Link>
            )}
            <span className="text-gray-300">|</span>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="hover:text-brand-gold transition-colors flex items-center gap-1"><Phone size={12}/> CONTACTO</a>
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

        {/* Search Bar - Intelligent */}
        <div className="hidden lg:flex flex-1 max-w-3xl relative" ref={searchRef}>
          <div className={`flex w-full border-2 ${isSearchFocused ? 'border-brand-dark' : 'border-brand-green'} rounded-full overflow-hidden transition-colors bg-white z-50`}>
            <input
              type="text"
              placeholder="Escribe lo que buscas (ej: pistola, airsoft)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-transparent py-3 px-5 text-[13px] text-gray-700 focus:outline-none font-medium"
            />
            <button className="bg-brand-green text-white px-8 hover:bg-brand-dark transition-colors flex items-center justify-center font-bold text-sm uppercase tracking-wide">
              Buscar
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {isSearchFocused && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 overflow-hidden">
              {searchSuggestions.categories.length > 0 && (
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Categorías Sugeridas</h4>
                  {searchSuggestions.categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className="w-full text-left px-2 py-1.5 hover:bg-white hover:text-brand-green rounded text-sm font-semibold flex items-center justify-between group transition-colors"
                    >
                      {cat}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="p-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Productos</h4>
                {searchSuggestions.products.length > 0 ? (
                  <div className="space-y-1">
                    {searchSuggestions.products.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded flex-shrink-0 p-1">
                          <img src={product.imagen_url} alt={product.nombre_producto} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700 truncate">{product.nombre_producto}</p>
                          <p className="text-brand-green font-black text-xs">US$ {product.precio_usd.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 px-2 py-4 text-center">No hay productos que coincidan.</p>
                )}
              </div>
              
              {searchSuggestions.products.length > 0 && (
                <button 
                  onClick={() => setIsSearchFocused(false)}
                  className="w-full p-3 bg-brand-green/10 text-brand-green font-bold text-xs uppercase tracking-widest hover:bg-brand-green hover:text-white transition-colors text-center"
                >
                  Ver todos los resultados para "{searchQuery}"
                </button>
              )}
            </div>
          )}
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
              <span className="text-sm font-black text-brand-dark">+54 9 3757 54-5877</span>
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
