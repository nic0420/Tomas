import { useProductStore } from '../../store/useProductStore';

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const { categories } = useProductStore();

  return (
    <nav className="w-full bg-zinc-900 border-b border-zinc-800">
      <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
        <ul className="flex items-center h-12 gap-6 whitespace-nowrap text-sm font-medium">
          <li>
            <button
              onClick={() => onSelectCategory(null)}
              className={`h-full transition-colors ${
                selectedCategory === null
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos
            </button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => onSelectCategory(category)}
                className={`h-full py-3 transition-colors ${
                  selectedCategory === category
                    ? 'text-emerald-500 border-b-2 border-emerald-500'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
