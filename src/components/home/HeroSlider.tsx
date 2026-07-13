import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const slides = [
  { id: 1, img: 'https://placehold.co/1920x600/005699/FFF?text=BANNER+PRINCIPAL+1' },
  { id: 2, img: 'https://placehold.co/1920x600/ff6b00/FFF?text=OFERTAS+ESPECIALES' },
  { id: 3, img: 'https://placehold.co/1920x600/1a1a1a/FFF?text=NUEVOS+INGRESOS' },
];

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      // Auto play
      const autoplay = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000);
      return () => clearInterval(autoplay);
    }
  }, [emblaApi]);

  return (
    <div className="overflow-hidden bg-gray-100" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide) => (
          <div className="flex-[0_0_100%] min-w-0 relative" key={slide.id}>
            <img 
              src={slide.img} 
              alt="Banner" 
              className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
