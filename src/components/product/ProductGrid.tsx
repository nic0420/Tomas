import { ProductCard } from './ProductCard';
import { useProductStore } from '../../store/useProductStore';
import { PackageOpen, ChevronRight } from 'lucide-react';

interface ProductGridProps {
  selectedCategory: string | null;
}

export function ProductGrid({ selectedCategory }: ProductGridProps) {
  const { products, isLoading, error } = useProductStore();

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

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoria === selectedCategory)
    : products;

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-sm">
        <PackageOpen className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-gray-600 font-bold mb-1">No hay productos</h3>
        <p className="text-gray-400 text-sm">Intenta seleccionar otra categoría.</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-2xl font-black text-brand-dark uppercase">
          {selectedCategory ? selectedCategory : 'Destaques'}
        </h2>
        <a href="#" className="text-sm font-bold text-brand-blue flex items-center hover:underline">
          Ver todos <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
