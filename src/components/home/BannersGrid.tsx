import { useEffect, useState, useMemo } from 'react';
import { useProductStore } from '../../store/useProductStore';

function CategoryBanner({ title, query, className = '' }: { title: string, query: string, className?: string }) {
  const { products, setSelectedCategory } = useProductStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const categoryImages = useMemo(() => {
    // Buscar productos de la categoría o que incluyan el término en su categoría
    const filtered = products.filter(p => p.categoria.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length === 0) return [];
    
    // Obtener hasta 10 imágenes únicas reales (no placeholders)
    const imgs = Array.from(new Set(filtered.map(p => p.imagen_url)))
      .filter(url => url && !url.includes('placehold.co') && !url.includes('via.placeholder'));
    
    // Shuffle array para que empiece diferente
    return imgs.sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [products, query]);

  useEffect(() => {
    if (categoryImages.length <= 1) return;
    
    // Randomizar un poco el intervalo para que los 3 banners no cambien exactamente al mismo segundo
    const delay = 3500 + Math.random() * 1500;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % categoryImages.length);
    }, delay);
    
    return () => clearInterval(interval);
  }, [categoryImages]);

  return (
    <div 
      className={`group overflow-hidden rounded-sm cursor-pointer relative h-[250px] md:h-[300px] bg-white border border-gray-200 flex items-center justify-center ${className}`}
      onClick={() => setSelectedCategory(title)}
    >
      {categoryImages.length > 0 ? (
        categoryImages.map((img, idx) => (
          <img 
            key={img}
            src={img} 
            alt={title}
            className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-1000 ${
              idx === currentIndex ? 'opacity-100 group-hover:scale-110' : 'opacity-0 scale-95'
            }`}
          />
        ))
      ) : (
        <span className="text-gray-300 font-bold tracking-widest text-xl">{title}</span>
      )}
      
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
      
      {/* Título central */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <h3 className="text-white text-3xl md:text-4xl font-black uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {title}
        </h3>
      </div>
    </div>
  );
}

export function BannersGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
      <CategoryBanner title="Airsoft" query="airsoft" />
      <CategoryBanner title="Paintball" query="paintball" />
      <CategoryBanner title="Accesorios" query="accesorios" className="hidden lg:flex" />
    </div>
  );
}
