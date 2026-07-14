import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Finanzas y Ventas' },
    { path: '/admin/products', icon: Package, label: 'Productos' },
    // Mock links
    { path: '#', icon: ShoppingBag, label: 'Pedidos' },
    { path: '#', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-black text-brand-dark uppercase tracking-widest">Tomas Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path) && item.path !== '#';
            
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-green/10 text-brand-green' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-brand-green' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut size={20} />
            Volver a la Tienda
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shadow-sm">
          <div className="flex items-center gap-4 ml-auto">
            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-semibold text-gray-700">Administrador</span>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
