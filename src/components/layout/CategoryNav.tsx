import { Menu } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const { categories } = useProductStore();

  const mainCategories = categories.slice(0, 6);

  return (
    <nav className="w-full bg-brand-green border-b-4 border-brand-gold shadow-md relative z-30 hidden md:block">
      <div className="container mx-auto px-4 flex">
        
        {/* Todas las Categorias Dropdown trigger */}
        <div className="relative bg-brand-gold text-white flex items-center px-6 py-3 font-black gap-2 cursor-pointer hover:brightness-110 transition-all shadow-inner">
          <Menu className="w-5 h-5" />
          <span className="tracking-wide uppercase">Catálogo</span>
        </div>

        {/* Horizontal Links */}
        <ul className="flex items-center flex-1 ml-6 gap-6 whitespace-nowrap text-sm font-bold text-brand-chrome uppercase">
          <li>
            <button
              onClick={() => onSelectCategory(null)}
              className={`h-full py-3 transition-colors hover:text-brand-gold tracking-wide ${
                selectedCategory === null ? 'text-brand-gold border-b-2 border-brand-gold' : ''
              }`}
            >
              INICIO
            </button>
          </li>
          {mainCategories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onSelectCategory(category)}
                className={`h-full py-3 transition-colors hover:text-brand-gold tracking-wide ${
                  selectedCategory === category ? 'text-brand-gold border-b-2 border-brand-gold' : ''
                }`}
              >
                {category}
              </button>
            </li>
          ))}
          {categories.length > 6 && (
            <li>
              <button
                onClick={() => onSelectCategory(categories[6])}
                className="h-full py-3 transition-colors text-brand-gold hover:text-white"
              >
                Ver más...
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
