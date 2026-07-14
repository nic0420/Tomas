import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Finanzas y Ventas' },
    { path: '/admin/products', icon: Package, label: 'Productos' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f3] flex font-sans">
      {/* Sidebar - Tommy Guns Themed */}
      <aside className="w-64 bg-brand-dark flex flex-col shadow-2xl relative z-10 border-r border-[#222]">
        <div className="p-6 border-b border-[#222] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-3 shadow-lg border border-[#333]">
            <img src="/logo_tommy_guns_color_blanco.png" alt="Tommy Guns Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-lg font-black text-white uppercase tracking-widest text-center">Tommy Guns<br/><span className="text-brand-gold text-xs">Admin Panel</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-brand-green/20 text-brand-gold border-l-4 border-brand-gold' 
                    : 'text-gray-400 hover:bg-[#222] hover:text-white border-l-4 border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-brand-gold' : 'text-gray-500'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#222] bg-[#0a0c09]">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-950/30 hover:text-red-400 rounded-lg transition-colors font-bold uppercase tracking-widest text-xs">
            <LogOut size={16} />
            Salir a Tienda
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shadow-sm justify-between shrink-0">
          <div className="text-gray-400 text-sm font-medium">
            Panel de Control Central
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center text-brand-gold font-bold border border-brand-gold/30">
              A
            </div>
            <span className="font-bold text-gray-800 text-sm uppercase tracking-wider">Administrador</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
