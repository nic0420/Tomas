import { useState, useEffect } from 'react';
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

export function Store() {
  const { fetchProducts, fetchDolarBlue, selectedProduct, setSelectedProduct } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    setSelectedProduct(null);
  };

  useEffect(() => {
    fetchProducts();
    fetchDolarBlue();
  }, [fetchProducts, fetchDolarBlue]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <FloatingSocial />
      <Header />
      <CategoryNav 
        selectedCategory={selectedCategory} 
        onSelectCategory={handleSelectCategory} 
      />
      
      <main className="flex-1 flex flex-col">
        {selectedProduct ? (
          <ProductDetail />
        ) : (
          <>
            {selectedCategory === null && <HeroSlider />}
            {selectedCategory === null && <FeaturesBar />}
            
            <div className="container mx-auto px-4 py-8 flex-1">
              {selectedCategory === null && <BannersGrid />}
              
              <ProductGrid 
                selectedCategory={selectedCategory} 
                onSelectCategory={handleSelectCategory}
              />
              
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
        <div className="container mx-auto px-4 text-center border-t border-[#222] pt-8">
          <p>© 2026 Tomas Store. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
