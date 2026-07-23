import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { calculateARSPrice, formatCurrency } from '../../lib/utils';
import { WHATSAPP_NUMBER } from '../../config/constants';
import { useAuthStore } from '../../store/useAuthStore';
export function CartDrawer() {
  const { isCartOpen, toggleCart, items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const { dolarBlue } = useProductStore();
  const { user } = useAuthStore();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(user?.address || '');
  const [errorMsg, setErrorMsg] = useState('');

  const totalArs = items.reduce((acc, item) => {
    return acc + (calculateARSPrice(item.product.precio_usd, dolarBlue) * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor completa tus datos para finalizar.');
      return;
    }
    setErrorMsg('');

    const totalUsd = items.reduce((acc, item) => acc + (item.product.precio_usd * item.quantity), 0);
    const orderData = {
      date: new Date().toISOString(),
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      userId: user ? user.id : null,
      totalArs,
      totalUsd,
      items: items.map(item => ({
        id: item.product.id,
        name: item.product.nombre_producto,
        priceUsd: item.product.precio_usd,
        quantity: item.quantity
      })),
      status: 'pending'
    };

    let message = `*NUEVO PEDIDO - TOMMY GUNS*\n\n`;
    message += `*Cliente:* ${customerName}\n`;
    message += `*Teléfono:* ${customerPhone}\n`;
    if (customerAddress) {
      message += `*Dirección:* ${customerAddress}\n`;
    }
    message += `\n`;
    
    items.forEach(item => {
      const price = calculateARSPrice(item.product.precio_usd, dolarBlue);
      message += `- ${item.quantity}x ${item.product.nombre_producto} (${formatCurrency(price)})\n`;
    });
    
    message += `\n*TOTAL: ${formatCurrency(totalArs)}*\n\n`;
    message += `Hola! Quisiera realizar este pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Abre la ventana ANTES de la operación asíncrona para evitar el bloqueador de popups en móviles
    const newWindow = window.open('about:blank', '_blank');

    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      await addDoc(collection(db, 'orders'), orderData);
    } catch (e) {
      console.error("Error saving order: ", e);
    }
    
    if (newWindow) {
      newWindow.location.href = whatsappUrl;
    } else {
      window.location.href = whatsappUrl;
    }

    // Clear and close cart after checkout
    clearCart();
    toggleCart();
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
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col transform transition-transform">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-green" />
            <h2 className="text-lg font-black text-brand-dark uppercase tracking-widest">Tu Carrito</h2>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-brand-dark rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20 text-brand-green" />
              <p className="font-bold text-gray-500">Tu carrito está vacío</p>
              <button onClick={toggleCart} className="text-sm text-brand-green font-bold hover:underline">¡Volver a la tienda!</button>
            </div>
          ) : (
            items.map((item) => {
              const itemPriceArs = calculateARSPrice(item.product.precio_usd, dolarBlue);
              return (
                <div key={item.product.id} className="flex gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-gray-50 rounded flex items-center justify-center flex-shrink-0 p-2">
                    <img 
                      src={item.product.imagen_url} 
                      alt={item.product.nombre_producto} 
                      className="max-h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xs text-gray-700 font-bold line-clamp-2 uppercase">
                      {item.product.nombre_producto}
                    </h3>
                    <p className="text-brand-green font-black mt-1">
                      {formatCurrency(itemPriceArs)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center bg-gray-50 rounded border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 text-gray-500 hover:text-brand-green hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-brand-dark">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 text-gray-500 hover:text-brand-green hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold underline decoration-red-200 hover:decoration-red-500 transition-colors"
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
          <div className="border-t border-gray-100 bg-white p-6 space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
            
            {/* Checkout Form */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Tus Datos</h4>
              {errorMsg && <p className="text-red-500 text-xs font-bold">{errorMsg}</p>}
              <input 
                type="text" 
                placeholder="Nombre Completo" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-green"
              />
              <input 
                type="text" 
                placeholder="Teléfono" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-green"
              />
              <input 
                type="text" 
                placeholder="Dirección de envío (Opcional)" 
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="flex justify-between items-end">
              <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Total</span>
              <div className="text-right">
                <div className="text-2xl font-black text-brand-green">
                  {formatCurrency(totalArs)}
                </div>
                <div className="text-xs text-gray-400 font-bold">
                  Cotización Dólar: ${dolarBlue}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-brand-green text-white py-4 font-black uppercase tracking-widest hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 rounded shadow-lg"
            >
              Confirmar por WhatsApp
            </button>

            <button 
              onClick={clearCart}
              className="w-full text-xs text-gray-400 hover:text-red-500 font-bold tracking-wide uppercase transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
