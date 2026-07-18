import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../../store/useProductStore';
import { Header } from '../../components/layout/Header';
import { CategoryNav } from '../../components/layout/CategoryNav';
import { HeroSlider } from '../../components/home/HeroSlider';
import { FeaturesBar } from '../../components/home/FeaturesBar';
import { BannersGrid } from '../../components/home/BannersGrid';
import { BrandsCarousel } from '../../components/home/BrandsCarousel';
import { ProductGrid } from '../../components/product/ProductGrid';
import { FloatingSocial } from '../../components/layout/FloatingSocial';
import { ProductDetail } from '../../components/product/ProductDetail';
import { CartDrawer } from '../../components/cart/CartDrawer';

export function Store() {
  const { fetchProducts, fetchDolarBlue, selectedProduct, selectedCategory } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchDolarBlue();
  }, [fetchProducts, fetchDolarBlue]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f4f5f3] relative">
      {/* Background Logo Watermark */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: 'url(/bg_logo.jpg)',
          backgroundSize: '50%',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat'
        }}
      />
      
      {/* Main Content Container (z-10 to stay above the background) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <FloatingSocial />
        <Header />
        <CategoryNav />
        
        <main className="flex-1 flex flex-col">
        {selectedProduct ? (
          <ProductDetail />
        ) : (
          <>
            {selectedCategory === null && <HeroSlider />}
            {selectedCategory === null && <FeaturesBar />}
            
            <div className="container mx-auto px-4 py-8 flex-1">
              {selectedCategory === null && <BannersGrid />}
              
              <ProductGrid />
              
              {selectedCategory === null && <BrandsCarousel />}
            </div>
          </>
        )}
      </main>

      <footer className="bg-[#111111] pt-16 pb-8 text-gray-400 text-[13px]">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Sobre la Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Quiénes Somos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Ayuda y Soporte</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Envíos y Entregas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cambios y Devoluciones</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Seguridad</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Boletín Informativo</h4>
            <p className="mb-4">Suscríbase para recibir nuestras ofertas.</p>
            <div className="flex">
              <input type="email" placeholder="Su E-mail" className="bg-[#222] border border-[#333] px-4 py-2 w-full text-white focus:outline-none focus:border-brand-green" />
              <button className="bg-brand-green text-white px-4 font-bold hover:bg-brand-dark transition-colors">OK</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 text-center border-t border-[#222] pt-8 flex items-center justify-between">
          <p>© 2026 Tomas Store. Todos los derechos reservados.</p>
          <Link to="/admin" className="text-[#333] hover:text-brand-green transition-colors text-xs uppercase tracking-widest font-bold">Admin Panel</Link>
        </div>
      </footer>
      <CartDrawer />
      </div>
    </div>
  );
}
