import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Store } from './pages/store/Store';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsAdmin } from './pages/admin/ProductsAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
