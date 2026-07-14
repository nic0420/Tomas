import { useState } from 'react';
import { ShoppingCart, ShieldCheck, Truck, ChevronLeft, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { calculateARSPrice, formatCurrency } from '../../lib/utils';
import { ProductCard } from './ProductCard';

export function ProductDetail() {
  const { selectedProduct, setSelectedProduct, dolarBlue } = useProductStore();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs'>('details');

  if (!selectedProduct) return null;

  const finalPriceArs = calculateARSPrice(selectedProduct.precio_usd, dolarBlue);

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
  };

  const relatedProducts = useProductStore.getState().products
    .filter(p => p.categoria === selectedProduct.categoria && p.id !== selectedProduct.id)
    .slice(0, 5);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-6">
        
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="hover:text-brand-green flex items-center gap-1 transition-colors"
          >
            <ChevronLeft size={16} /> Volver al catálogo
          </button>
          <span>/</span>
          <span className="uppercase">{selectedProduct.categoria}</span>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{selectedProduct.nombre_producto}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left: Image Gallery */}
            <div className="w-full lg:w-1/2 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex items-center justify-center min-h-[400px] relative bg-white">
              <span className="absolute top-4 left-4 bg-brand-gold text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-sm shadow-sm">
                NUEVO
              </span>
              <img 
                src={selectedProduct.imagen_url} 
                alt={selectedProduct.nombre_producto}
                className="max-w-full max-h-[500px] object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Right: Buy Box */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">{selectedProduct.categoria}</span>
              </div>
              
              <h1 className="text-2xl lg:text-3xl font-black text-brand-dark leading-tight mb-6">
                {selectedProduct.nombre_producto}
              </h1>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1 font-medium">Precio Exclusivo Online</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-brand-green tracking-tighter">
                    {formatCurrency(finalPriceArs)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white px-3 py-2 rounded border border-gray-200 inline-flex">
                  <CreditCard size={16} className="text-brand-gold" />
                  <span>o <strong className="text-brand-dark">12x</strong> de <strong>{formatCurrency(finalPriceArs / 12)}</strong> sin interés</span>
                </div>
              </div>

              {/* Quantity and Buy Button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border-2 border-gray-200 rounded h-14 w-full sm:w-32 bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-brand-green hover:bg-gray-50 transition-colors"
                  >-</button>
                  <input 
                    type="number" 
                    value={quantity}
                    readOnly
                    className="flex-1 h-full text-center font-bold text-lg text-brand-dark bg-transparent outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-brand-green hover:bg-gray-50 transition-colors"
                  >+</button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-green hover:bg-brand-dark text-white h-14 rounded shadow-lg shadow-brand-green/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1"
                >
                  <ShoppingCart size={20} />
                  <span className="font-black tracking-widest text-sm uppercase">COMPRAR AHORA</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 mt-2">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-brand-gold" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold text-gray-900">COMPRA SEGURA</span>
                    <span className="text-[10px] text-gray-500 uppercase">100% Garantizado</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-brand-gold" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold text-gray-900">ENVÍO A TODO EL PAÍS</span>
                    <span className="text-[10px] text-gray-500 uppercase">Despacho Inmediato</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Details Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-4 text-sm font-black tracking-widest uppercase transition-colors ${
                activeTab === 'details' ? 'text-brand-green border-b-2 border-brand-green bg-brand-green/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              DETALLES DEL PRODUCTO
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`flex-1 py-4 text-sm font-black tracking-widest uppercase transition-colors ${
                activeTab === 'specs' ? 'text-brand-green border-b-2 border-brand-green bg-brand-green/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              CARACTERÍSTICAS
            </button>
          </div>
          
          <div className="p-8 text-gray-600 leading-relaxed text-sm">
            {activeTab === 'details' && (
              <div className="whitespace-pre-line">
                {selectedProduct.descripcion || "La descripción detallada de este producto se está actualizando. Por favor, vuelva pronto para conocer más detalles sobre este excelente artículo de nuestro catálogo de Arsenal Sports."}
              </div>
            )}
            
            {activeTab === 'specs' && (
              <div className="whitespace-pre-line">
                {selectedProduct.caracteristicas || "• Producto original y de alta calidad.\n• Las características técnicas específicas serán agregadas próximamente."}
              </div>
            )}
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl md:text-2xl font-black text-brand-dark uppercase tracking-wide mb-6 border-b border-gray-200 pb-2">
              PRODUCTOS RELACIONADOS
            </h3>
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedProducts.map(product => (
                <div key={product.id} className="w-[200px] md:w-auto flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
