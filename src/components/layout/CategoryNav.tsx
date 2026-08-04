import { useState } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useAdminStore } from '../../store/useAdminStore';

export function CategoryNav() {
  const { categories, selectedCategory, setSelectedCategory } = useProductStore();
  const hiddenCategories = useAdminStore((state) => state.hiddenCategories);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const megaMenu = [
    {
      name: 'AIRSOFT',
      filterName: 'Airsoft',
      subcategories: [
        'RÉPLICAS DE AIRSOFT',
        'CARGADORES PARA RÉPLICAS',
        'BATERÍAS Y CARGADORES',
        'BBS / GREEN GAS / CO2 / HPA',
        'GRANADAS DE AIRSOFT',
        'PIEZAS EXTERNAS',
        'PIEZAS INTERNAS',
        'PIEZAS PARA RIFLES A GAS',
        'PIEZAS PARA PISTOLAS',
        'PIEZAS PARA SNIPERS',
        'SPEEDSOFT'
      ]
    },
    {
      name: 'AIRGUN',
      filterName: 'Airgun',
      subcategories: [
        'PISTOLAS Y REVÓLVERES',
        'CARABINAS DE AIRE',
        'CARGADORES',
        'PERDIGONES Y PROYECTILES',
        'PIEZAS Y ACCESORIOS HPA / CO2'
      ]
    },
    { 
      name: 'PAINTBALL', 
      filterName: 'Paintball',
      subcategories: [
        'MARCADORES',
        'CO2 / HPA',
        'MÁSCARAS Y LENTES',
        'LOADERS Y CARGADORES',
        'CINTURONES PARA PODS Y CILINDROS',
        'PROYECTILES PAINTBALL',
        'PIEZAS DE REPOSICIÓN',
        'CUSTOMIZACIÓN Y TUNE-UP'
      ] 
    },
    {
      name: 'ÓPTICA E ILUMINACIÓN',
      filterName: 'Óptica e Iluminación',
      subcategories: [
        'MIRAS TELESCÓPICAS',
        'BINOCULARES',
        'TELÉMETROS (RANGEFINDERS)',
        'MIRAS RED DOT Y VERDE DOT',
        'MIRAS DE VISIÓN NOCTURNA',
        'MIRAS TÉRMICAS',
        'SPOTTING SCOPES',
        'LUCES Y LÁSERES',
        'ACOG',
        'MIRAS DE FIBRA Y TRITIUM',
        'ANILLOS DE MIRA',
        'SOPORTES Y BASES DE MIRA',
        'ACCESORIOS DE MIRA'
      ]
    },
    {
      name: 'FITNESS & RECUPERACIÓN',
      filterName: 'Fitness & Recuperación',
      subcategories: [
        'ACONDICIONAMIENTO FÍSICO',
        'EQUIPOS DE ENTRENAMIENTO / TECNOLOGÍA',
        'FISIOTERAPIA Y RECUPERACIÓN MUSCULAR',
        'ENTRENAMIENTO FUNCIONAL',
        'MOVILIDAD, CORE Y EQUILIBRIO',
        'YOGA Y PILATES'
      ]
    },
    {
      name: 'OUTDOOR & SURVIVAL',
      filterName: 'Outdoor & Survival',
      subcategories: [
        'ENERGÍA PORTÁTIL',
        'BARCOS Y CANOAS',
        'SOPORTES PARA BARCOS Y KAYAKS',
        'KAYAKS',
        'MOTORES NÁUTICOS',
        'STAND UP PADDLE (SUP)',
        'MOCHILAS TÉRMICAS',
        'BOLSAS TÉRMICAS',
        'BOTELLAS TÉRMICAS',
        'RED DE CAMUFLAJE MILITAR',
        'SILLAS Y MESAS DE CAMPING',
        'LINTERNAS DE ACAMPAMENTO',
        'PRIMEROS AUXILIOS',
        'CUCHILLOS',
        'EQUIPOS DE SALVAMENTO',
        'GAZEBOS PORTÁTILES',
        'PULSERAS DE SUPERVIVENCIA',
        'GPS Y RASTREADORES PARA ANIMALES'
      ]
    },
    { name: 'RELOJES', filterName: 'Relojes', subcategories: [] },
    {
      name: 'DEPORTES Y OCIO',
      filterName: 'Deportes y Ocio',
      subcategories: [
        'BEACH TENNIS',
        'PICKLEBALL',
        'PÁDEL',
        'PELOTAS',
        'ACCESORIOS',
        'SUP (STAND UP PADDLE)'
      ]
    },
    {
      name: 'MARCADORES NO LETALES',
      filterName: 'Marcadores No Letales',
      subcategories: [
        'MARCADORES',
        'CARGADORES',
        'ACCESORIOS',
        'PIEZAS Y PARTES INTERNAS'
      ]
    },
    {
      name: 'PRODUCTOS COCA-COLA',
      filterName: 'Productos Coca-Cola',
      subcategories: [
        'AURICULARES Y PARLANTES',
        'VASOS Y BOTELLAS TÉRMICAS'
      ]
    },
    {
      name: 'OFERTAS Y PROMOCIONES',
      filterName: 'Ofertas y Promociones',
      subcategories: ['COMBOS PROMOCIONALES']
    }
  ];

  const visibleMenu = megaMenu.filter(menu => !hiddenCategories.includes(menu.filterName));

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setIsMainDropdownOpen(false);
    setActiveMenu(null);
    setTimeout(() => {
      const el = document.getElementById('product-grid');
      if (el) {
        window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="w-full bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 flex">
        
        {/* Todas las Categorias Dropdown trigger */}
        <div 
          className="relative bg-brand-gold text-white hidden md:flex items-center px-6 py-4 font-black gap-3 cursor-pointer hover:bg-yellow-600 transition-colors w-[260px] flex-shrink-0"
          onMouseEnter={() => setIsMainDropdownOpen(true)}
          onMouseLeave={() => setIsMainDropdownOpen(false)}
          onClick={() => setIsMainDropdownOpen(!isMainDropdownOpen)}
        >
          <Menu className="w-5 h-5" />
          <span className="tracking-widest uppercase text-[13px]">TODOS LOS DEPARTAMENTOS</span>
          
          {/* Main Dropdown Menu (reads from dynamic categories) */}
          {isMainDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white shadow-xl border-x border-b border-gray-200 py-2 z-50">
              <button 
                onClick={(e) => { e.stopPropagation(); handleCategorySelect(''); setSelectedCategory(null); }}
                className="w-full text-left px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-green transition-colors"
              >
                VER TODOS
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={(e) => { e.stopPropagation(); handleCategorySelect(category); }}
                  className="w-full text-left px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-green transition-colors border-t border-gray-100 uppercase"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Horizontal Mega Menu */}
        <div className="flex-1 overflow-x-auto md:ml-4 no-scrollbar">
          <ul className="flex items-center justify-start md:justify-between gap-x-1 min-w-max md:min-w-0 text-[11px] font-bold text-brand-dark uppercase tracking-wider relative h-12 md:h-auto">
            {visibleMenu.map((menu) => (
              <li 
                key={menu.name}
                className="h-full flex items-center"
                onMouseEnter={() => setActiveMenu(menu.name)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  onClick={() => {
                    if (menu.subcategories.length > 0 && activeMenu !== menu.name) {
                      setActiveMenu(menu.name); // for mobile tap to open
                    } else {
                      handleCategorySelect(menu.filterName || menu.name);
                    }
                  }}
                  className={`h-full px-3 md:px-2 lg:px-3 py-3 md:py-0 flex items-center gap-1 transition-colors hover:text-brand-green border-b-2 border-transparent hover:border-brand-green whitespace-nowrap ${
                    selectedCategory === (menu.filterName || menu.name) ? 'text-brand-green border-brand-green' : ''
                  }`}
                >
                  {menu.name} {menu.subcategories.length > 0 && <ChevronDown size={14} className="opacity-50" />}
                </button>

                {/* Subcategories Dropdown Panel */}
                {menu.subcategories.length > 0 && activeMenu === menu.name && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-xl border border-t-0 border-gray-200 z-50 p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-12">
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      {menu.subcategories.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCategorySelect(menu.filterName || menu.name)}
                          className="text-left text-gray-500 hover:text-brand-green font-medium text-[13px] md:text-xs tracking-wide transition-colors py-1 md:py-0"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                    
                    {/* Decorative Banner inside Dropdown */}
                    <div className="hidden md:flex flex-1 bg-gray-50 rounded p-6 items-center justify-center border border-gray-100">
                      <span className="text-gray-400 font-bold tracking-widest text-lg">PROMO {menu.name}</span>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
