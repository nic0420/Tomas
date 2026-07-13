import { useEffect, useState } from 'react';
import { useProductStore } from './store/useProductStore';
import { Header } from './components/layout/Header';
import { CategoryNav } from './components/layout/CategoryNav';
import { ProductGrid } from './components/product/ProductGrid';
import { CartDrawer } from './components/cart/CartDrawer';

function App() {
  const { fetchProducts } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <CategoryNav 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        
        <div className="container mx-auto px-4 py-8 flex-1">
          <ProductGrid selectedCategory={selectedCategory} />
        </div>
      </main>

      <footer className="bg-zinc-900 border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Arsenal Sports. Todos los derechos reservados.</p>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}

export default App;
