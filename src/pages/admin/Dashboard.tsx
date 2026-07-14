import { useAdminStore } from '../../store/useAdminStore';
import { formatCurrency } from '../../lib/utils';
import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';

export function Dashboard() {
  const { orders } = useAdminStore();

  const totalSalesArs = orders.reduce((sum, order) => sum + order.totalArs, 0);
  const totalSalesUsd = orders.reduce((sum, order) => sum + order.totalUsd, 0);
  
  const paidOrders = orders.filter(o => o.status === 'Pagado' || o.status === 'Enviado');
  const paidSalesArs = paidOrders.reduce((sum, order) => sum + order.totalArs, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Finanzas y Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Ventas Totales (ARS)</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-gray-900">{formatCurrency(totalSalesArs)}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Ingresos Confirmados</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-gray-900">{formatCurrency(paidSalesArs)}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Ventas (USD)</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-gray-900">U$S {totalSalesUsd.toFixed(2)}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Pedidos</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <ShoppingCart size={20} />
            </div>
          </div>
          <span className="text-3xl font-black text-gray-900">{orders.length}</span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Últimos Pedidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    No hay pedidos registrados todavía.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(order.totalArs)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.status === 'Pagado' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'Enviado' ? 'bg-green-100 text-green-700' : ''}
                        ${order.status === 'Cancelado' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {order.status}
                      </span>
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
