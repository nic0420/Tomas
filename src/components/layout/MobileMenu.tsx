import { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronDown, Home, Phone, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAdminStore } from '../../store/useAdminStore';
import { megaMenu } from '../../config/menu';
import { WHATSAPP_NUMBER } from '../../config/constants';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { setSelectedCategory, setSearchQuery } = useProductStore();
  const { isAuthenticated, user } = useAuthStore();
  const hiddenCategories = useAdminStore((state) => state.hiddenCategories);

  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    } else {
      setVisible(false);
      closeTimer.current = window.setTimeout(() => setMounted(false), 250);
    }
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const visibleMenu = megaMenu.filter(m => !hiddenCategories.includes(m.filterName));

  const closeAndScroll = (fn: () => void) => {
    fn();
    onClose();
    setTimeout(() => {
      const el = document.getElementById('product-grid');
      if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    }, 150);
  };

  const handleSelectCategory = (filterName: string) => closeAndScroll(() => setSelectedCategory(filterName));
  const handleViewAll = () => closeAndScroll(() => setSelectedCategory(null));
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeAndScroll(() => {
      setSelectedCategory(null);
      setSearchQuery(search);
    });
  };

  const transitionCls = 'transition-transform duration-250 ease-in-out';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de categorías"
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-white shadow-2xl border-r border-gray-200 z-50 flex flex-col ${transitionCls} ${visible ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col leading-none">
            <span className="text-brand-green text-xl font-black tracking-tighter uppercase" style={{ textShadow: '1px 1px 0px #c29b62' }}>TOMMY</span>
            <span className="text-brand-gold text-sm font-black tracking-widest uppercase">GUNS</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 text-gray-400 hover:text-brand-dark rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="p-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex border-2 border-brand-green rounded-full overflow-hidden bg-white">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-transparent py-2.5 px-4 text-[13px] text-gray-700 focus:outline-none font-medium min-w-0"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="bg-brand-green text-white px-4 flex items-center justify-center hover:bg-brand-dark transition-colors flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={handleViewAll}
            className="w-full flex items-center gap-2 px-5 py-3.5 text-left text-sm font-black text-brand-green uppercase tracking-wider border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Inicio
          </button>

          {visibleMenu.map((menu) => {
            const isOpenCat = expanded === menu.name;
            const hasSubs = menu.subcategories.length > 0;
            return (
              <div key={menu.name} className="border-b border-gray-100">
                <button
                  onClick={() => {
                    if (hasSubs) {
                      setExpanded(isOpenCat ? null : menu.name);
                    } else {
                      handleSelectCategory(menu.filterName);
                    }
                  }}
                  aria-expanded={hasSubs ? isOpenCat : undefined}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-[13px] font-bold text-gray-800 uppercase tracking-wider hover:bg-gray-50 hover:text-brand-green transition-colors"
                >
                  <span>{menu.name}</span>
                  {hasSubs && (
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpenCat ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {hasSubs && (
                  <div
                    aria-hidden={!isOpenCat}
                    inert={isOpenCat ? undefined : true}
                    className={`overflow-hidden transition-all duration-250 ${isOpenCat ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <div className="bg-gray-50/50 py-1">
                      <button
                        onClick={() => handleSelectCategory(menu.filterName)}
                        className="w-full text-left px-6 py-2 text-[13px] font-black text-brand-green hover:bg-gray-100 transition-colors"
                      >
                        Ver todo en {menu.name}
                      </button>
                      {menu.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleSelectCategory(menu.filterName)}
                          className="w-full flex items-center justify-between px-6 py-2 text-left text-[13px] text-gray-600 hover:bg-gray-100 hover:text-brand-green transition-colors"
                        >
                          {sub}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer links */}
        <div className="border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 text-[13px] font-bold text-gray-700 uppercase tracking-wider hover:text-brand-green transition-colors"
          >
            <User className="w-4 h-4" />
            {isAuthenticated ? `Mi Cuenta (${user?.name})` : 'Iniciar Sesión'}
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 text-[13px] font-bold text-gray-700 uppercase tracking-wider hover:text-brand-green transition-colors border-t border-gray-100"
          >
            <Phone className="w-4 h-4" />
            Contacto
          </a>
        </div>
      </div>
    </>
  );
}
