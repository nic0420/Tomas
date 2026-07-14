import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { useProductStore } from '../../store/useProductStore';
import { PackageOpen, ChevronRight, ChevronLeft } from 'lucide-react';

interface ProductGridProps {
  selectedCategory: string | null;
  onSelectCategory?: (category: string | null) => void;
}

const ITEMS_PER_PAGE = 20;

export function ProductGrid({ selectedCategory, onSelectCategory }: ProductGridProps) {
  const { products, isLoading, error, categories, searchQuery, sortBy, setSortBy } = useProductStore();
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when category or search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 aspect-[3/4] rounded-sm border border-gray-200"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-red-500 mb-2 font-bold">Error al cargar productos</div>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  // 1. Filter by category
  let displayProducts = products;
  if (selectedCategory) {
    displayProducts = displayProducts.filter(p => p.categoria === selectedCategory);
  }

  // 2. Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayProducts = displayProducts.filter(p => p.nombre_producto.toLowerCase().includes(q));
  }

  // 3. Sort
  if (sortBy === 'price_asc') {
    displayProducts = [...displayProducts].sort((a, b) => a.precio_usd - b.precio_usd);
  } else if (sortBy === 'price_desc') {
    displayProducts = [...displayProducts].sort((a, b) => b.precio_usd - a.precio_usd);
  } else if (sortBy === 'alpha') {
    displayProducts = [...displayProducts].sort((a, b) => a.nombre_producto.localeCompare(b.nombre_producto));
  }

  const isFiltering = selectedCategory !== null || searchQuery.trim() !== '' || sortBy !== 'none';

  // ==== VISTA PRINCIPAL (Sin filtros activos) ====
  if (!isFiltering) {
    return (
      <div className="flex flex-col gap-12 mb-12">
        {categories.map(category => {
          const categoryProducts = products.filter(p => p.categoria === category);
          if (categoryProducts.length === 0) return null;
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl md:text-2xl font-black text-brand-dark uppercase tracking-wide">
                  LO MEJOR EN {category}
                </h2>
                {onSelectCategory && (
                  <button 
                    onClick={() => onSelectCategory(category)}
                    className="text-xs md:text-sm font-bold text-brand-green flex items-center hover:underline uppercase tracking-wider whitespace-nowrap"
                  >
                    Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
              
              {/* Contenedor con scroll horizontal en móviles, grilla en desktop */}
              <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {categoryProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="w-[200px] md:w-auto flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ==== VISTA CON FILTROS (Categoría, Búsqueda o Orden) ====
  const totalPages = Math.ceil(displayProducts.length / ITEMS_PER_PAGE);
  const currentProducts = displayProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (displayProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-sm mb-12">
        <PackageOpen className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-gray-600 font-bold mb-1">No se encontraron productos</h3>
        <p className="text-gray-400 text-sm">Intenta con otra búsqueda o categoría.</p>
        {(searchQuery || selectedCategory) && (
          <button 
            onClick={() => {
              useProductStore.getState().setSearchQuery('');
              if (onSelectCategory) onSelectCategory(null);
            }}
            className="mt-4 text-brand-green font-bold hover:underline"
          >
            Ver todos los productos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-gray-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {selectedCategory && (
              <button 
                onClick={() => onSelectCategory && onSelectCategory(null)}
                className="text-xs text-gray-500 hover:text-brand-green font-bold uppercase tracking-wider flex items-center"
              >
                <ChevronLeft size={14} className="mr-1"/> VER TODAS LAS CATEGORÍAS
              </button>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-brand-dark uppercase tracking-wide">
            {searchQuery ? `Resultados para "${searchQuery}"` : selectedCategory || 'TODOS LOS PRODUCTOS'}
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            Mostrando {currentProducts.length} de {displayProducts.length} productos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ordenar por:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded p-2 text-sm font-medium focus:outline-none focus:border-brand-green bg-white text-gray-700"
          >
            <option value="none">Relevancia</option>
            <option value="price_asc">Menor Precio</option>
            <option value="price_desc">Mayor Precio</option>
            <option value="alpha">A - Z</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            if (
              i === 0 || 
              i === totalPages - 1 || 
              (i >= currentPage - 2 && i <= currentPage)
            ) {
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded font-bold transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-brand-green text-white border-brand-green' 
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green'
                  }`}
                >
                  {i + 1}
                </button>
              );
            }
            if (i === 1 || i === totalPages - 2) {
              if (i === 1 && currentPage > 3) return <span key={i} className="px-2 text-gray-400">...</span>;
              if (i === totalPages - 2 && currentPage < totalPages - 2) return <span key={i} className="px-2 text-gray-400">...</span>;
            }
            return null;
          })}

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
