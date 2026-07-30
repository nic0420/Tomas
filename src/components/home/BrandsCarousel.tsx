import useEmblaCarousel from 'embla-carousel-react';

const brands = [
  { id: 1, name: 'AMOEBA', img: '' },
  { id: 2, name: 'A&K', img: '' },
  { id: 3, name: 'ACTION ARMY', img: '' },
  { id: 4, name: 'G&G', img: '' },
  { id: 5, name: 'KWA', img: '' },
  { id: 6, name: 'TARAN TACTICAL', img: '' },
  { id: 7, name: 'ARES', img: '' },
  { id: 8, name: 'EMG', img: '' },
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
              <div className="bg-white border border-gray-200 p-4 h-24 flex items-center justify-center rounded-sm grayscale hover:grayscale-0 transition-all cursor-pointer hover:border-brand-gold/50 hover:shadow-md">
                <span className="font-bold text-gray-500 hover:text-brand-dark transition-colors text-sm tracking-wider">{brand.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
