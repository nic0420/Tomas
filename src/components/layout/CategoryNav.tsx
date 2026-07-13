import { Menu, ChevronDown } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const { categories } = useProductStore();
  const mainCategories = categories.slice(0, 7); // Show more categories horizontally

  return (
    <nav className="w-full bg-brand-green relative z-30 hidden md:block border-b-4 border-brand-gold shadow-sm">
      <div className="container mx-auto px-4 flex">
        
        {/* Todas las Categorias Dropdown trigger - Similar to Arsenal */}
        <div className="relative bg-brand-gold text-white flex items-center px-6 py-4 font-black gap-3 cursor-pointer hover:bg-yellow-600 transition-colors w-[280px]">
          <Menu className="w-5 h-5" />
          <span className="tracking-widest uppercase text-sm">TODOS OS DEPARTAMENTOS</span>
        </div>

        {/* Horizontal Links */}
        <ul className="flex items-center flex-1 ml-4 gap-1 text-[13px] font-bold text-white uppercase tracking-wider">
          <li>
            <button
              onClick={() => onSelectCategory(null)}
              className={`px-4 py-4 transition-colors hover:text-brand-gold ${
                selectedCategory === null ? 'text-brand-gold' : ''
              }`}
            >
              INÍCIO
            </button>
          </li>
          {mainCategories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onSelectCategory(category)}
                className={`px-4 py-4 transition-colors hover:text-brand-gold ${
                  selectedCategory === category ? 'text-brand-gold' : ''
                }`}
              >
                {category}
              </button>
            </li>
          ))}
          {categories.length > 7 && (
            <li className="relative group ml-auto">
              <button className="px-4 py-4 transition-colors hover:text-brand-gold flex items-center gap-1">
                MAIS DEPARTAMENTOS <ChevronDown size={14}/>
              </button>
              {/* Dropdown would go here */}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
