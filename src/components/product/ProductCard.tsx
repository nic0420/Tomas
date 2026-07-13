import { ShoppingCart } from 'lucide-react';
import { type Product, useCartStore } from '../../store/useCartStore';
import { calculateARSPrice, formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();

  const finalPriceArs = calculateARSPrice(product.precio_usd);

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full relative">
      <div className="relative aspect-square overflow-hidden bg-white p-4 flex items-center justify-center">
        <img
          src={product.imagen_url}
          alt={product.nombre_producto}
          className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase px-2 py-1 rounded-sm border border-gray-200">
            {product.categoria}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1 border-t border-gray-100">
        <h3 className="text-gray-800 font-semibold line-clamp-2 mb-2 text-sm group-hover:text-brand-blue transition-colors">
          {product.nombre_producto}
        </h3>
        
        <div className="mt-auto flex flex-col">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 line-through">
              USD {product.precio_usd.toFixed(2)}
            </span>
            <span className="text-brand-blue font-black text-xl leading-none mt-1">
              {formatCurrency(finalPriceArs)}
            </span>
            <span className="text-[10px] text-gray-500 mt-1">
              En hasta 12x sin interés
            </span>
          </div>
        </div>
      </div>

      {/* Floating Add to Cart Button on Hover */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
        <button
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          className="bg-brand-orange hover:bg-orange-600 text-white p-3 rounded-full shadow-md transition-colors"
          title="Agregar al carrito"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
