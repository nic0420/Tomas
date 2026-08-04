import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, LogOut, AlertTriangle, ShieldOff, Lock } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

const handleAdminLogout = () => {
  sessionStorage.removeItem('adminAuth');
  window.location.reload();
};

export function AdminLayout() {
  const location = useLocation();
  const { customDolarBlue } = useAdminStore();
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    sessionStorage.getItem('adminAuth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Finanzas y Ventas' },
    { path: '/admin/products', icon: Package, label: 'Productos' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_PASSWORD) {
      setError('La contraseña de administrador no está configurada. Definí VITE_ADMIN_PASSWORD en el archivo .env y reconstruí la app.');
      return;
    }
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
          <div className="p-8 text-center bg-[#0a0c09] border-b border-[#222]">
            <div className="w-20 h-20 bg-black rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg border border-[#333]">
              <Lock className="text-brand-gold w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest">
              Acceso Restringido
            </h1>
            <p className="text-gray-400 mt-2 font-medium text-sm">
              Ingresa la contraseña de administrador
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none text-center font-bold tracking-widest"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm font-bold text-center mt-2">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-brand-green text-white font-black py-3 rounded-lg hover:bg-brand-dark transition-colors uppercase tracking-widest shadow-lg"
            >
              Ingresar
            </button>
            
            <div className="text-center mt-6">
              <Link to="/" className="text-gray-500 hover:text-brand-dark text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <LogOut size={16} />
                Volver a la Tienda
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
          <div className="space-y-1">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg transition-colors font-bold uppercase tracking-widest text-xs">
              <LogOut size={16} />
              Salir a Tienda
            </Link>
            <button onClick={handleAdminLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-950/30 hover:text-red-400 rounded-lg transition-colors font-bold uppercase tracking-widest text-xs">
              <ShieldOff size={16} />
              Cerrar Sesión Admin
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shadow-sm justify-between shrink-0">
          <div className="text-gray-400 text-sm font-medium">
            Panel de Control Central
          </div>
          <div className="flex items-center gap-4">
            {customDolarBlue && (
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-200">
                <AlertTriangle size={14} /> Dólar Manual Activo (${customDolarBlue})
              </div>
            )}
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
