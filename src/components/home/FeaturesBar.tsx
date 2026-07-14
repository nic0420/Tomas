import { Truck, ShieldCheck, CreditCard, Clock } from 'lucide-react';

export function FeaturesBar() {
  const features = [
    {
      icon: <Truck className="w-8 h-8 text-brand-gold" />,
      title: "ENTREGA RÁPIDA",
      subtitle: "A todo el país"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-brand-gold" />,
      title: "PAGO EN CUOTAS",
      subtitle: "Hasta 12x sin interés"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-gold" />,
      title: "COMPRA SEGURA",
      subtitle: "100% garantizado"
    },
    {
      icon: <Clock className="w-8 h-8 text-brand-gold" />,
      title: "SOPORTE VIP",
      subtitle: "Atención premium"
    }
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 py-6 mb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <div className="transform group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-brand-dark text-sm tracking-wide">{feature.title}</span>
                <span className="text-xs text-gray-500 font-medium">{feature.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
