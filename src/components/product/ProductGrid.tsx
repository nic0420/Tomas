import { ProductCard } from './ProductCard';
import { useProductStore } from '../../store/useProductStore';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  selectedCategory: string | null;
}

export function ProductGrid({ selectedCategory }: ProductGridProps) {
  const { products, loading, error } = useProductStore();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse bg-zinc-900 aspect-[3/4] rounded-lg border border-zinc-800"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-red-500 mb-2">Error al cargar productos</div>
        <p className="text-zinc-500 text-sm">{error}</p>
      </div>
    );
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoria === selectedCategory)
    : products;

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageOpen className="w-12 h-12 text-zinc-700 mb-4" />
        <h3 className="text-zinc-300 font-medium mb-1">No hay productos</h3>
        <p className="text-zinc-500 text-sm">Intenta seleccionar otra categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
