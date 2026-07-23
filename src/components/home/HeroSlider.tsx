import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useProductStore } from '../../store/useProductStore';
import type { Product } from '../../store/useCartStore';
import { calculateARSPrice, formatCurrency } from '../../lib/utils';

export function HeroSlider() {
  const { products, setSelectedProduct, dolarBlue } = useProductStore();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);

  // Pick 3 random products once when products load
  useEffect(() => {
    if (products.length > 0 && randomProducts.length === 0) {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 3));
    }
  }, [products]);

  useEffect(() => {
    if (emblaApi) {
      const autoplay = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000);
      return () => clearInterval(autoplay);
    }
  }, [emblaApi]);

  // Fallback slides while loading
  const slides = randomProducts.length > 0 ? randomProducts : [];

  if (slides.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-brand-dark animate-pulse flex items-center justify-center">
        <span className="text-brand-gold font-bold uppercase tracking-widest text-sm">Cargando destacados...</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-brand-dark relative border-b-4 border-brand-gold" ref={emblaRef}>
      <div className="flex">
        {slides.map((product) => (
          <div 
            className="flex-[0_0_100%] min-w-0 relative h-[300px] md:h-[400px] lg:h-[500px] cursor-pointer" 
            key={product.id}
            onClick={() => setSelectedProduct(product)}
          >
            
            {/* Background Image (Blurred & Darkened) */}
            <div 
              className="absolute inset-0 bg-center bg-cover bg-no-repeat blur-sm opacity-30"
              style={{ backgroundImage: `url(${product.imagen_url})` }}
            />
            
            {/* Content Container */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent">
              <div className="container mx-auto px-4 h-full flex items-center justify-between">
                
                {/* Text Info */}
                <div className="w-full md:w-1/2 flex flex-col items-start gap-4 z-10 pl-4 md:pl-12">
                  <span className="bg-brand-green px-3 py-1 text-[10px] md:text-xs font-black uppercase tracking-widest text-white border border-brand-green">
                    PRODUCTO DESTACADO
                  </span>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight uppercase" style={{ textShadow: '2px 2px 0px #000' }}>
                    {product.nombre_producto}
                  </h2>
                  <p className="text-brand-gold font-bold text-xl md:text-3xl drop-shadow-md">
                    {formatCurrency(calculateARSPrice(product.precio_usd, dolarBlue))}
                  </p>
                </div>

                {/* Product Image Focus */}
                <div className="hidden md:flex w-1/2 h-full items-center justify-center p-8 z-10">
                  <img 
                    src={product.imagen_url} 
                    alt={product.nombre_producto} 
                    className="max-h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
