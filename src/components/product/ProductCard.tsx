import { ShoppingCart } from 'lucide-react';
import { Product, useCartStore } from '../../store/useCartStore';
import { calculateARSPrice, formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();

  const finalPriceArs = calculateARSPrice(product.precio_usd);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors group flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-zinc-950 p-4 flex items-center justify-center">
        <img
          src={product.imagen_url}
          alt={product.nombre_producto}
          className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-zinc-800/80 backdrop-blur-sm text-zinc-300 text-xs px-2 py-1 rounded">
            {product.categoria}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-zinc-100 font-medium line-clamp-2 mb-2 text-sm">
          {product.nombre_producto}
        </h3>
        
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-zinc-500 line-through">
              USD {product.precio_usd.toFixed(2)}
            </p>
            <p className="text-emerald-500 font-bold text-lg leading-none">
              {formatCurrency(finalPriceArs)}
            </p>
          </div>
          
          <button
            onClick={() => addToCart(product)}
            className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 p-2 rounded-md transition-colors"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
