import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Store } from './pages/store/Store';
import { Login } from './pages/store/Login';
import { Register } from './pages/store/Register';
import { Profile } from './pages/store/Profile';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsAdmin } from './pages/admin/ProductsAdmin';
import { SettingsAdmin } from './pages/admin/SettingsAdmin';
import { useAuthStore } from './store/useAuthStore';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light text-brand-dark px-4">
      <h1 className="text-6xl font-black tracking-tighter mb-4">404</h1>
      <p className="text-lg font-bold mb-8">Página no encontrada</p>
      <Link
        to="/"
        className="bg-brand-green text-white font-bold uppercase tracking-widest px-6 py-3 rounded hover:bg-brand-dark transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}

function App() {
  const initAuthListener = useAuthStore((state) => state.initAuthListener);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
