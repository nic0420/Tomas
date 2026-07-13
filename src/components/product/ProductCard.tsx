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
    <div className="bg-white border-2 border-transparent rounded-sm overflow-hidden hover:shadow-xl hover:border-brand-gold transition-all group flex flex-col h-full relative">
      <div className="relative aspect-square overflow-hidden bg-white p-4 flex items-center justify-center border-b border-gray-100">
        <img
          src={product.imagen_url}
          alt={product.nombre_producto}
          className="object-contain max-h-full group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-brand-green text-brand-gold text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-sm shadow-sm">
            {product.categoria}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-gray-800 font-bold line-clamp-2 mb-2 text-sm group-hover:text-brand-green transition-colors">
          {product.nombre_producto}
        </h3>
        
        <div className="mt-auto flex flex-col">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 line-through">
              USD {product.precio_usd.toFixed(2)}
            </span>
            <span className="text-brand-green font-black text-xl leading-none mt-1">
              {formatCurrency(finalPriceArs)}
            </span>
            <span className="text-[10px] text-brand-gold font-bold mt-1 tracking-wide uppercase">
              12x sin interés
            </span>
          </div>
        </div>
      </div>

      {/* Floating Add to Cart Button on Hover */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
        <button
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          className="bg-brand-gold hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg transition-colors border-2 border-white"
          title="Agregar al carrito"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
