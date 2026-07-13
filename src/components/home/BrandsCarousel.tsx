import useEmblaCarousel from 'embla-carousel-react';

const brands = [
  { id: 1, name: 'Brand 1' },
  { id: 2, name: 'Brand 2' },
  { id: 3, name: 'Brand 3' },
  { id: 4, name: 'Brand 4' },
  { id: 5, name: 'Brand 5' },
  { id: 6, name: 'Brand 6' },
];

export function BrandsCarousel() {
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps'
  });

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-2xl font-black text-brand-dark uppercase">
          Marcas Destacadas
        </h2>
      </div>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {brands.map((brand) => (
            <div className="flex-[0_0_150px] min-w-0" key={brand.id}>
              <div className="bg-white border border-gray-200 p-4 h-24 flex items-center justify-center rounded-sm grayscale hover:grayscale-0 transition-all cursor-pointer">
                <span className="font-bold text-gray-400">{brand.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
