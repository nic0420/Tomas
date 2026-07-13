import { Menu } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const { categories } = useProductStore();

  // Arsenal Sports only shows a few main categories in the top nav
  const mainCategories = categories.slice(0, 6);

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm relative z-30 hidden md:block">
      <div className="container mx-auto px-4 flex">
        
        {/* Todas las Categorias Dropdown trigger */}
        <div className="relative bg-brand-blue text-white flex items-center px-4 py-3 font-bold gap-2 cursor-pointer hover:bg-blue-700 transition-colors">
          <Menu className="w-5 h-5" />
          <span>Toda Loja</span>
        </div>

        {/* Horizontal Links */}
        <ul className="flex items-center flex-1 ml-4 gap-6 whitespace-nowrap text-sm font-bold text-gray-700 uppercase">
          <li>
            <button
              onClick={() => onSelectCategory(null)}
              className={`h-full transition-colors hover:text-brand-blue ${
                selectedCategory === null ? 'text-brand-blue' : ''
              }`}
            >
              INICIO
            </button>
          </li>
          {mainCategories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onSelectCategory(category)}
                className={`h-full py-3 transition-colors hover:text-brand-blue ${
                  selectedCategory === category ? 'text-brand-blue' : ''
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
                className="h-full py-3 transition-colors text-brand-blue hover:text-blue-700"
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
