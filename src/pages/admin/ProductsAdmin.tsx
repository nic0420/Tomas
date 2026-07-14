import { useState, useRef } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { useProductStore } from '../../store/useProductStore';
import { Search, Upload, Edit, ChevronLeft, ChevronRight, Save, X, RefreshCw, Plus } from 'lucide-react';
import type { Product } from '../../store/useCartStore';
import Papa from 'papaparse';

export function ProductsAdmin() {
  const { localProducts, setLocalProducts, updateProduct, addProduct } = useAdminStore();
  const { products, fetchProducts } = useProductStore();
  
  // Use localProducts if available, otherwise fallback to the store's products (from Google Sheets)
  const displayProducts = localProducts || products;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isCreating, setIsCreating] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const filteredProducts = displayProducts.filter(p => 
    p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const rawData = results.data as any[];
          const newProducts: Product[] = [];
          
          rawData.forEach(row => {
            if (row.id && row.nombre_producto) {
              newProducts.push({
                id: row.id,
                nombre_producto: row.nombre_producto,
                categoria: row.categoria || "Otros",
                imagen_url: row.imagen_url || "https://via.placeholder.com/150",
                precio_usd: parseFloat(row.precio_usd) || 0,
                descripcion: row.descripcion || "",
                caracteristicas: row.caracteristicas || ""
              });
            }
          });

          if (newProducts.length > 0) {
            setLocalProducts(newProducts);
            fetchProducts(); // refresh global store
            alert(`¡Éxito! Se importaron ${newProducts.length} productos localmente.`);
          }
        },
        error: (error) => {
          alert('Error al leer el CSV: ' + error.message);
        }
      });
    }
  };

  const handleResetCatalog = () => {
    if (confirm('¿Estás seguro? Esto borrará tus cambios locales y volverá a descargar el catálogo original desde Google Sheets.')) {
      setLocalProducts([]); // clears it, though we should probably set to null. But empty array is fine if we handle it in store, wait, in store `localProducts.length > 0` checks it.
      useAdminStore.setState({ localProducts: null });
      fetchProducts();
    }
  };

  const openEditModal = (product: Product) => {
    setIsCreating(false);
    setEditingProduct(product);
    setEditForm({
      nombre_producto: product.nombre_producto,
      precio_usd: product.precio_usd,
      categoria: product.categoria,
    });
  };

  const openCreateModal = () => {
    // If not in local mode, creating a product will initialize local mode with current products
    if (!localProducts) {
      if (!confirm('Crear un producto activará el "Modo Edición Local". Dejarás de leer el catálogo de Google Sheets automáticamente hasta que lo restaures. ¿Continuar?')) {
        return;
      }
      setLocalProducts(products); // Snapshot current products
    }
    
    setIsCreating(true);
    setEditingProduct({
      id: `PROD-${Date.now()}`,
      nombre_producto: '',
      categoria: '',
      imagen_url: 'https://via.placeholder.com/300?text=Nuevo+Producto',
      precio_usd: 0,
    });
    setEditForm({
      nombre_producto: '',
      categoria: '',
      precio_usd: 0,
    });
  };

  const saveEdit = () => {
    if (editingProduct) {
      if (isCreating) {
        addProduct({
          ...editingProduct,
          nombre_producto: editForm.nombre_producto || 'Sin Nombre',
          precio_usd: editForm.precio_usd || 0,
          categoria: editForm.categoria || 'Otros',
        } as Product);
      } else {
        updateProduct(editingProduct.id, editForm);
      }
      setEditingProduct(null);
      setIsCreating(false);
      fetchProducts(); // Refresh public store
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-widest mb-1">Catálogo de Productos</h2>
          <p className="text-gray-500 font-medium">{displayProducts.length} productos registrados</p>
        </div>
        
        <div className="flex gap-3">
          {localProducts && (
            <button 
              onClick={handleResetCatalog}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Restaurar Original
            </button>
          )}
          <button 
            onClick={openCreateModal}
            className="bg-brand-green text-white px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            Crear Producto
          </button>
          <button 
            onClick={handleImportClick}
            className="bg-brand-dark text-brand-gold px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-lg"
          >
            <Upload size={18} />
            Subir CSV
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv" 
            className="hidden" 
          />
        </div>
      </div>

      {localProducts && (
        <div className="bg-brand-green/10 border-l-4 border-brand-green p-4 rounded-r-lg text-brand-dark font-medium text-sm">
          <strong>Modo Edición Local Activo:</strong> Estás viendo y editando una copia local del catálogo. Los cambios que hagas aquí se guardarán en tu navegador y sobreescribirán al catálogo de internet.
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 font-medium text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark text-brand-gold font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio USD</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                    <p className="text-lg font-medium">No se encontraron productos.</p>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img src={product.imagen_url} alt={product.nombre_producto} className="w-full h-full object-contain p-1" />
                        </div>
                        <span className="font-bold text-gray-900 line-clamp-2 max-w-[300px]">
                          {product.nombre_producto}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {product.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-green text-lg">
                      U$S {product.precio_usd.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {localProducts ? (
                        <button 
                          onClick={() => openEditModal(product)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-dark font-bold rounded-lg transition-colors inline-flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                          <Edit size={14} /> Editar
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sube un CSV para editar</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500 font-medium">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length} productos
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-brand-green hover:text-brand-green disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-dark text-white">
              <h3 className="font-black uppercase tracking-widest text-brand-gold">{isCreating ? 'Crear Nuevo Producto' : 'Editar Producto'}</h3>
              <button onClick={() => { setEditingProduct(null); setIsCreating(false); }} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre del Producto</label>
                <input 
                  type="text" 
                  value={editForm.nombre_producto || ''}
                  onChange={(e) => setEditForm({...editForm, nombre_producto: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none font-medium"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Precio (USD)</label>
                  <input 
                    type="number" 
                    value={editForm.precio_usd || 0}
                    onChange={(e) => setEditForm({...editForm, precio_usd: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none font-bold text-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Categoría</label>
                  <input 
                    type="text" 
                    value={editForm.categoria || ''}
                    onChange={(e) => setEditForm({...editForm, categoria: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setEditingProduct(null)}
                className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded transition-colors uppercase tracking-widest text-xs"
              >
                Cancelar
              </button>
              <button 
                onClick={saveEdit}
                className="px-6 py-2 bg-brand-green text-white font-black hover:bg-brand-dark rounded transition-colors flex items-center gap-2 uppercase tracking-widest text-xs shadow-lg"
              >
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
