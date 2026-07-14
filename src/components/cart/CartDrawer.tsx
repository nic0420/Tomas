import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { useAdminStore } from '../../store/useAdminStore';
import { calculateARSPrice, formatCurrency } from '../../lib/utils';
import { WHATSAPP_NUMBER } from '../../config/constants';

export function CartDrawer() {
  const { isCartOpen, toggleCart, items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const { dolarBlue } = useProductStore();
  const { addOrder } = useAdminStore();

  const totalArs = items.reduce((acc, item) => {
    return acc + (calculateARSPrice(item.product.precio_usd, dolarBlue) * item.quantity);
  }, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Log the order in Admin Store
    const totalUsd = items.reduce((acc, item) => acc + (item.product.precio_usd * item.quantity), 0);
    addOrder({
      customerName: 'Cliente Anónimo', // Since we don't have a form, we mock it
      customerPhone: 'Desconocido',
      totalArs,
      totalUsd,
      items: [...items],
      status: 'Pendiente'
    });

    let message = `*NUEVO PEDIDO - ARSENAL SPORTS*\n\n`;
    
    items.forEach(item => {
      const price = calculateARSPrice(item.product.precio_usd, dolarBlue);
      message += `- ${item.quantity}x ${item.product.nombre_producto} (${formatCurrency(price)})\n`;
    });
    
    message += `\n*TOTAL: ${formatCurrency(totalArs)}*\n\n`;
    message += `Hola! Quisiera realizar este pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-950 shadow-2xl border-l border-zinc-800 z-50 flex flex-col transform transition-transform">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-white">Tu Carrito</h2>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => {
              const itemPriceArs = calculateARSPrice(item.product.precio_usd, dolarBlue);
              return (
                <div key={item.product.id} className="flex gap-4 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                  <div className="w-20 h-20 bg-zinc-950 rounded flex items-center justify-center flex-shrink-0">
                    <img 
                      src={item.product.imagen_url} 
                      alt={item.product.nombre_producto} 
                      className="max-h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm text-zinc-100 font-medium line-clamp-2">
                      {item.product.nombre_producto}
                    </h3>
                    <p className="text-emerald-500 font-bold mt-1">
                      {formatCurrency(itemPriceArs)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center bg-zinc-950 rounded border border-zinc-700">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-red-400 hover:text-red-300 underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-4">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="font-medium">Subtotal</span>
              <span className="text-lg font-bold text-white">{formatCurrency(totalArs)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Finalizar Compra vía WhatsApp</span>
            </button>
            
            <button 
              onClick={clearCart}
              className="w-full text-xs text-zinc-500 hover:text-zinc-300 text-center"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
