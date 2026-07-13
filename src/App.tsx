import { useEffect, useState } from 'react';
import { useProductStore } from './store/useProductStore';
import { Header } from './components/layout/Header';
import { CategoryNav } from './components/layout/CategoryNav';
import { ProductGrid } from './components/product/ProductGrid';
import { CartDrawer } from './components/cart/CartDrawer';
import { HeroSlider } from './components/home/HeroSlider';
import { BannersGrid } from './components/home/BannersGrid';
import { BrandsCarousel } from './components/home/BrandsCarousel';
import { Instagram } from 'lucide-react';

function App() {
  const { fetchProducts } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans">
      <Header />
      <CategoryNav 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <main className="flex-1 flex flex-col">
        {selectedCategory === null && <HeroSlider />}
        
        <div className="container mx-auto px-4 py-8 flex-1">
          {selectedCategory === null && <BannersGrid />}
          
          <ProductGrid selectedCategory={selectedCategory} />
          
          {selectedCategory === null && <BrandsCarousel />}
        </div>
      </main>

      <footer className="bg-brand-dark pt-12 pb-6 text-gray-400 text-sm border-t-4 border-brand-green">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
            <div>
              <h3 className="text-brand-gold font-black mb-4 uppercase tracking-widest text-lg">Tommy Guns</h3>
              <p className="leading-relaxed">Especialistas en equipamiento táctico, Airsoft, Paintball y Supervivencia. Envíos a todo el país con la mejor calidad.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase">Atención al Cliente</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-brand-gold transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Garantías y Devoluciones</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Preguntas Frecuentes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase">Mi Cuenta</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-brand-gold transition-colors">Iniciar Sesión</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Registrarse</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Mis Pedidos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase">Redes y Contacto</h3>
              <ul className="space-y-4">
                <li>
                  <a href="https://www.instagram.com/tommygunsctes" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-gold transition-colors text-white bg-white/5 p-2 rounded-sm inline-flex">
                    <Instagram size={20} className="text-brand-gold" /> @tommygunsctes
                  </a>
                </li>
                <li>ventas@tommyguns.com</li>
                <li>+54 9 11 1234-5678</li>
              </ul>
            </div>
          </div>
          <div className="text-center font-medium">
            <p>© {new Date().getFullYear()} Tommy Guns. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}

export default App;
