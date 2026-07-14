import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { type Product, useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { calculateARSPrice, formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();
  const { dolarBlue } = useProductStore();

  const finalPriceArs = calculateARSPrice(product.precio_usd, dolarBlue);

  return (
    <div className="bg-white rounded-md overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full relative border border-gray-100 hover:border-brand-gold/30">
      
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        <span className="bg-brand-gold text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm shadow-sm">
          NUEVO
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
        <button className="w-8 h-8 bg-white text-gray-400 hover:text-brand-green hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-colors">
          <Heart size={16} />
        </button>
        <button className="w-8 h-8 bg-white text-gray-400 hover:text-brand-green hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-colors">
          <Eye size={16} />
        </button>
      </div>

      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center cursor-pointer">
        <img
          src={product.imagen_url}
          alt={product.nombre_producto}
          className="object-contain max-h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Quick Add to Cart button (Arsenal style overlay) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="w-full bg-brand-green hover:bg-brand-dark text-white font-bold uppercase tracking-wider text-xs py-3 rounded-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <ShoppingCart size={16} />
            COMPRAR AHORA
          </button>
        </div>
      </div>
      
      {/* Info container */}
      <div className="p-4 flex flex-col flex-1 text-center bg-gray-50/50">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
          {product.categoria}
        </span>
        <h3 className="text-gray-700 font-semibold line-clamp-2 mb-3 text-sm group-hover:text-brand-green transition-colors leading-snug cursor-pointer">
          {product.nombre_producto}
        </h3>
        
        <div className="mt-auto flex flex-col items-center">
          <div className="flex flex-col items-center">
            <span className="text-brand-green font-black text-xl leading-none">
              {formatCurrency(finalPriceArs)}
            </span>
            <span className="text-[11px] text-gray-500 font-medium mt-1">
              o <span className="text-brand-gold font-bold">12x</span> de <span className="font-bold text-gray-700">{formatCurrency(finalPriceArs / 12)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
