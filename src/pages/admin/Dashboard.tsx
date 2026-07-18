import { useAdminStore } from '../../store/useAdminStore';
import { formatCurrency } from '../../lib/utils';
import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import type { Order } from '../../store/useAdminStore';
import { useEffect } from 'react';

export function Dashboard() {
  const { orders, updateOrderStatus, fetchOrders, isLoadingOrders } = useAdminStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalSalesArs = orders.reduce((sum, order) => sum + order.totalArs, 0);
  const totalSalesUsd = orders.reduce((sum, order) => sum + order.totalUsd, 0);
  
  const paidOrders = orders.filter(o => o.status === 'Pagado' || o.status === 'Enviado');
  const paidSalesArs = paidOrders.reduce((sum, order) => sum + order.totalArs, 0);
  
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-widest mb-1">Finanzas y Dashboard</h2>
        <p className="text-gray-500 font-medium">Control en tiempo real de los ingresos y pedidos.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ingresos Reales (Pagado)</h3>
            <div className="w-10 h-10 rounded bg-brand-green flex items-center justify-center text-brand-gold shadow-md">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-brand-dark relative z-10">{formatCurrency(paidSalesArs)}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ventas Proyectadas (ARS)</h3>
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white shadow-md">
              <TrendingUp size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-gray-900 relative z-10">{formatCurrency(totalSalesArs)}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ventas (USD)</h3>
            <div className="w-10 h-10 rounded bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-gray-900 relative z-10">U$S {totalSalesUsd.toFixed(2)}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pedidos Realizados</h3>
            <div className="w-10 h-10 rounded bg-brand-gold flex items-center justify-center text-brand-dark shadow-md">
              <ShoppingCart size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-gray-900 relative z-10">{orders.length}</span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-brand-dark uppercase tracking-wide">Gestor de Pedidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark text-brand-gold font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente / Artículos</th>
                <th className="px-6 py-4">Monto Final</th>
                <th className="px-6 py-4">Estado (Clic para editar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingOrders ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <p className="text-lg font-medium">Cargando pedidos...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No hay pedidos registrados todavía.</p>
                    <p className="text-sm">Las ventas aparecerán aquí automáticamente.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-black text-gray-900">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {new Date(order.date).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-dark">{order.customerName}</div>
                      <div className="text-xs text-gray-500 mt-1">{order.items.length} artículo(s)</div>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-green">
                      {formatCurrency(order.totalArs)}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={`px-3 py-2 rounded font-bold uppercase tracking-wider text-xs border outline-none cursor-pointer transition-colors
                          ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' : ''}
                          ${order.status === 'Pagado' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : ''}
                          ${order.status === 'Enviado' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : ''}
                          ${order.status === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : ''}
                        `}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
