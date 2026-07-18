import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User as UserIcon, Package, MapPin, Phone } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export const Profile: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user?.id) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.id),
            orderBy('date', 'desc')
          );
          const snapshot = await getDocs(q);
          const fetchedOrders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching user orders: ", error);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchOrders();
    }
  }, [user?.id]);

  if (isLoading || !user) {
    return <div className="p-12 text-center text-gray-500">Cargando perfil...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-8 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Teléfono</h3>
              <p className="text-sm text-gray-500">{user.phone || 'No especificado'}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Dirección</h3>
              <p className="text-sm text-gray-500">{user.address || 'No especificada'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center">
          <Package className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Historial de Pedidos</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loadingOrders ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Cargando pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Aún no tienes pedidos registrados.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Pedido #{order.id.slice(0,8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${order.totalArs?.toLocaleString('es-AR')}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                      {order.status === 'pending' ? 'Pendiente / Coordinando' : order.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'artículo' : 'artículos'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
