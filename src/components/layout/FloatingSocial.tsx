import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../config/constants';

export function FloatingSocial() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-2 bg-white/80 backdrop-blur-sm shadow-[-2px_0_10px_rgba(0,0,0,0.1)] rounded-l-lg border border-r-0 border-gray-200">
      <a 
        href="https://www.instagram.com/tommygunsctes" 
        target="_blank" 
        rel="noreferrer"
        className="w-10 h-10 rounded-full flex items-center justify-center text-[#E4405F] hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white transition-all shadow-sm"
        aria-label="Instagram"
      >
        <Instagram size={20} strokeWidth={2.5} />
      </a>
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}`} 
        target="_blank" 
        rel="noreferrer"
        className="w-10 h-10 rounded-full flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
        aria-label="WhatsApp"
      >
        <MessageCircle size={20} strokeWidth={2.5} />
      </a>
    </div>
  );
}
