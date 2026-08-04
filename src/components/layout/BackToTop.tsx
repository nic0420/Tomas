import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className="fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-brand-dark text-brand-gold shadow-lg hover:bg-brand-green hover:text-white transition-colors border border-brand-gold/30"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
