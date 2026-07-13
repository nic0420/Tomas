import { useEffect, useState } from 'react';
import { useProductStore } from './store/useProductStore';
import { Header } from './components/layout/Header';
import { CategoryNav } from './components/layout/CategoryNav';
import { ProductGrid } from './components/product/ProductGrid';
import { CartDrawer } from './components/cart/CartDrawer';
import { HeroSlider } from './components/home/HeroSlider';
import { BannersGrid } from './components/home/BannersGrid';
import { BrandsCarousel } from './components/home/BrandsCarousel';
import { FeaturesBar } from './components/home/FeaturesBar';

function App() {
  const { fetchProducts } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <CategoryNav 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <main className="flex-1 flex flex-col">
        {selectedCategory === null && <HeroSlider />}
        {selectedCategory === null && <FeaturesBar />}
        
        <div className="container mx-auto px-4 py-8 flex-1">
          {selectedCategory === null && <BannersGrid />}
          
          <ProductGrid selectedCategory={selectedCategory} />
          
          {selectedCategory === null && <BrandsCarousel />}
        </div>
      </main>

      <footer className="bg-[#111111] pt-16 pb-8 text-gray-400 text-[13px]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
            <div>
              <h3 className="text-white font-black mb-6 uppercase tracking-widest text-lg">Tommy Guns</h3>
              <p className="leading-relaxed">Especialistas em Airsoft, Paintball e Sobrevivência. Entregamos em todo o país com a melhor qualidade e segurança.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Institucional</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-brand-gold transition-colors">Quem Somos</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Termos e Condições</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Trocas e Devoluções</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Minha Conta</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-brand-gold transition-colors">Meus Pedidos</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Meus Endereços</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Minhas Informações</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Atendimento</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white">
                    <span className="font-black text-xs">@</span>
                  </div>
                  <a href="https://www.instagram.com/tommygunsctes" target="_blank" rel="noreferrer" className="hover:text-brand-gold transition-colors font-semibold text-white">
                    @tommygunsctes
                  </a>
                </li>
                <li>Email: vendas@tommyguns.com</li>
                <li>Telefone: +54 9 11 1234-5678</li>
                <li>Horário: Seg a Sex, 9h às 18h</li>
              </ul>
            </div>
          </div>
          <div className="text-center font-medium flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} Tommy Guns. Todos os direitos reservados.</p>
            <div className="text-brand-gold font-bold tracking-widest uppercase">
              TOMMY GUNS
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}

export default App;
