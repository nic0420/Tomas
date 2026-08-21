import { useState, useRef, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { useProductStore } from '../../store/useProductStore';
import { Search, Upload, Edit, ChevronLeft, ChevronRight, Save, X, RefreshCw, Plus, Trash2, Eye, EyeOff, Radar } from 'lucide-react';
import type { Product } from '../../store/useCartStore';
import Papa from 'papaparse';
import { searchProducts } from '../../utils/search';

interface ArsenalNuevo { id: number; url: string; }
interface ArsenalProduct {
  arsenalId: number;
  url: string;
  nombre: string;
  precioUsd: number;
  imagen: string;
  categoria: string | null;
  descripcion?: string;
}
type ArsenalPhase = 'idle' | 'checking' | 'ready' | 'importing' | 'done';

const ARSENAL_BATCH = 8;

export function ProductsAdmin() {
  const { localProducts, setLocalProducts, updateProduct, addProduct, deleteProduct, hiddenCategories, toggleCategoryVisibility, showAllCategories, arsenalSeenIds, setArsenalSeenIds } = useAdminStore();
  const { products, fetchProducts, allCategories } = useProductStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Use localProducts if available, otherwise fallback to the store's products (from Google Sheets)
  const displayProducts = localProducts || products;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Arsenal Scraper State
  const [arsenalPhase, setArsenalPhase] = useState<ArsenalPhase>('idle');
  const [arsenalResult, setArsenalResult] = useState<{ primeraVez: boolean; totalArsenal: number; totalNuevos?: number; nuevos?: ArsenalNuevo[]; idsBase?: number[] } | null>(null);
  const [arsenalPreview, setArsenalPreview] = useState<ArsenalProduct[]>([]);
  const [arsenalProgress, setArsenalProgress] = useState({ done: 0, total: 0 });
  const [arsenalSummary, setArsenalSummary] = useState('');
  const [arsenalError, setArsenalError] = useState('');

  const ITEMS_PER_PAGE = 10;

  const filteredProducts = searchProducts(displayProducts, searchTerm);

  const visibilityCategories = allCategories.length > 0
    ? allCategories
    : Array.from(new Set(displayProducts.map(p => p.categoria))).sort();


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
      Papa.parse<{
        id?: string;
        sku?: string;
        nombre_producto?: string;
        categoria?: string;
        imagen_url?: string;
        precio_usd?: string;
        descripcion?: string;
        caracteristicas?: string;
      }>(file, {
        header: true,
        complete: (results) => {
          const rawData = results.data;
          const newProducts: Product[] = [];
          
          rawData.forEach(row => {
            if (row.id && row.nombre_producto) {
              newProducts.push({
                id: row.id,
                sku: row.sku || "",
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
      useAdminStore.setState({ localProducts: null });
      fetchProducts();
    }
  };

  const openEditModal = (product: Product) => {
    if (!localProducts) {
      if (!confirm('Editar un producto activará el "Modo Edición Local". Dejarás de leer el catálogo de Google Sheets automáticamente hasta que lo restaures. ¿Continuar?')) {
        return;
      }
      setLocalProducts(products);
    }
    
    setIsCreating(false);
    setEditingProduct(product);
    setEditForm({
      nombre_producto: product.nombre_producto,
      precio_usd: product.precio_usd,
      categoria: product.categoria,
      imagen_url: product.imagen_url,
      descripcion: product.descripcion,
      caracteristicas: product.caracteristicas,
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
      imagen_url: 'https://via.placeholder.com/300?text=Nuevo+Producto',
      descripcion: '',
      caracteristicas: '',
    });
  };

  const handleDelete = (productId: string) => {
    if (!localProducts) {
      if (!confirm('Eliminar un producto activará el "Modo Edición Local". Dejarás de leer el catálogo de Google Sheets automáticamente hasta que lo restaures. ¿Continuar?')) {
        return;
      }
      setLocalProducts(products);
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
      deleteProduct(productId);
      fetchProducts();
    }
  };

  const saveEdit = () => {
    if (editingProduct) {
      if (isCreating) {
        addProduct({
          ...editingProduct,
          nombre_producto: editForm.nombre_producto || 'Sin Nombre',
          precio_usd: editForm.precio_usd || 0,
          categoria: editForm.categoria || 'Otros',
          imagen_url: editForm.imagen_url || 'https://via.placeholder.com/300?text=Nuevo+Producto',
          descripcion: editForm.descripcion || '',
          caracteristicas: editForm.caracteristicas || '',
        } as Product);
      } else {
        updateProduct(editingProduct.id, editForm);
      }
      setEditingProduct(null);
      setIsCreating(false);
      fetchProducts(); // Refresh public store
    }
  };

  // ================= ARSENAL SCRAPER =================

  const closeArsenalModal = () => {
    setArsenalPhase('idle');
    setArsenalResult(null);
    setArsenalPreview([]);
    setArsenalSummary('');
    setArsenalError('');
  };

  const handleArsenalCheck = async () => {
    setArsenalPhase('checking');
    setArsenalError('');
    setArsenalSummary('');
    setArsenalPreview([]);
    try {
      const res = await fetch('/api/arsenal-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knownIds: arsenalSeenIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setArsenalResult(data);

      if (data.primeraVez) {
        // Primera ejecución: registra el catálogo actual como base sin importar nada
        setArsenalSeenIds(data.idsBase || []);
        setArsenalSummary(`Catálogo base registrado: ${data.totalArsenal} productos publicados en Arsenal Sports. Desde ahora, cada revisión detectará automáticamente solo los productos nuevos que suban.`);
        setArsenalPhase('done');
        return;
      }

      if (data.totalNuevos === 0) {
        setArsenalSummary(`Sin novedades. Arsenal tiene ${data.totalArsenal} productos publicados y ya están todos registrados.`);
        setArsenalPhase('done');
        return;
      }

      // Preview con los primeros productos nuevos
      const previewUrls = (data.nuevos as ArsenalNuevo[]).slice(0, ARSENAL_BATCH).map(n => n.url);      const sres = await fetch('/api/arsenal-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: previewUrls }),
      });
      const sdata = await sres.json();
      if (!sres.ok) throw new Error(sdata.error || `HTTP ${sres.status}`);
      setArsenalPreview(sdata.products || []);
      setArsenalPhase('ready');
    } catch (err) {
      setArsenalError(err instanceof Error ? err.message : 'Error desconocido revisando Arsenal.');
      setArsenalPhase('idle');
    }
  };

  const handleArsenalImport = async () => {
    if (!arsenalResult) return;
    const allNuevos = arsenalResult.nuevos;
    setArsenalStatusProgress(allNuevos.length);
    setArsenalPhase('importing');

    const collected: ArsenalProduct[] = [];
    const failedUrls = new Set<string>();
    let omitidos = 0;
    let errores = 0;

    for (let i = 0; i < allNuevos.length; i += ARSENAL_BATCH) {
      const batch = allNuevos.slice(i, i + ARSENAL_BATCH);
      try {
        const res = await fetch('/api/arsenal-scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: batch.map(b => b.url) }),
        });
        const data = await res.json();
        if (res.ok) {
          collected.push(...(data.products || []));
          omitidos += data.omitidos || 0;
          errores += (data.errors || []).length;
          (data.errors || []).forEach((e: { url: string }) => failedUrls.add(e.url));
        } else {
          errores += batch.length;
          batch.forEach(b => failedUrls.add(b.url));
        }
      } catch {
        errores += batch.length;
        batch.forEach(b => failedUrls.add(b.url));
      }
      setArsenalProgress({ done: Math.min(i + ARSENAL_BATCH, allNuevos.length), total: allNuevos.length });
    }

    // Activar modo local si hace falta (snapshot del catálogo actual)
    let base = useAdminStore.getState().localProducts;
    if (!base) {
      base = useProductStore.getState().products;
      useAdminStore.getState().setLocalProducts(base);
    }

    const existingIds = new Set(base.map(p => p.id));
    const toAdd: Product[] = collected
      .filter(p => p.nombre && p.precioUsd > 0)
      .map(p => ({
        id: `ARS-${p.arsenalId}`,
        sku: String(p.arsenalId),
        nombre_producto: p.nombre,
        categoria: p.categoria || 'Otros',
        imagen_url: p.imagen || 'https://via.placeholder.com/300?text=Sin+Imagen',
        precio_usd: p.precioUsd,
        descripcion: p.descripcion || 'Producto importado del catálogo de Arsenal Sports.',
        caracteristicas: p.url,
      }))
      .filter(p => !existingIds.has(p.id));

    if (toAdd.length > 0) {
      useAdminStore.getState().setLocalProducts([...base, ...toAdd]);
    }
    // Los que fallaron por error transitorio NO se marcan: se reintentan la próxima vez
    useAdminStore.getState().setArsenalSeenIds([
      ...useAdminStore.getState().arsenalSeenIds,
      ...allNuevos.filter(n => !failedUrls.has(n.url)).map(n => n.id),
    ]);
    fetchProducts();

    setArsenalSummary(
      `Importado${toAdd.length !== 1 ? 's' : ''} ${toAdd.length} producto${toAdd.length !== 1 ? 's' : ''} nuevo${toAdd.length !== 1 ? 's' : ''} al catálogo.` +
      (omitidos ? ` Omitidos (sin precio publicado o categoría sin equivalente): ${omitidos}.` : '') +
      (errores ? ` ${errores} con errores de lectura se reintentarán en la próxima revisión.` : '')
    );
    setArsenalPhase('done');
  };

  const setArsenalStatusProgress = (total: number) => setArsenalProgress({ done: 0, total });

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
            onClick={handleArsenalCheck}
            disabled={arsenalPhase === 'checking' || arsenalPhase === 'importing'}
            className="bg-brand-gold text-white px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-wait"
          >
            <Radar size={18} className={arsenalPhase === 'checking' ? 'animate-spin' : ''} />
            {arsenalPhase === 'checking' ? 'Revisando...' : 'Revisar Novedades Arsenal'}
          </button>
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

      {/* Category Visibility */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-brand-dark uppercase tracking-wider text-sm flex items-center gap-2">
              {hiddenCategories.length > 0 ? <EyeOff size={16} className="text-red-500" /> : <Eye size={16} className="text-brand-green" />}
              Visibilidad de Categorías
            </h3>
            <p className="text-xs text-gray-500 font-medium">Las categorías ocultas no aparecerán en la tienda ni en el buscador.</p>
          </div>
          <button 
            onClick={() => {
              showAllCategories();
              fetchProducts();
            }}
            className="text-xs font-bold text-brand-dark uppercase tracking-wider hover:text-brand-green transition-colors"
          >
            Mostrar todas
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibilityCategories.map(cat => {
            const hidden = hiddenCategories.includes(cat);
            const count = displayProducts.filter(p => p.categoria === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  toggleCategoryVisibility(cat);
                  fetchProducts();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-xs font-bold transition-colors ${
                  hidden 
                    ? 'border-red-200 bg-red-50 text-red-500 opacity-60' 
                    : 'border-brand-green/30 bg-brand-green/5 text-brand-dark hover:border-brand-green'
                }`}
              >
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{cat}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${hidden ? 'bg-red-100 text-red-500' : 'bg-brand-green/10 text-brand-green'}`}>
                  {count}
                </span>
              </button>
            );
          })}
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
                      <div className="flex items-center gap-2 justify-end">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-dark font-bold rounded-lg transition-colors inline-flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                          <Edit size={14} /> Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

      {/* Arsenal Scraper Modal */}
      {arsenalPhase !== 'idle' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-dark text-white">
              <h3 className="font-black uppercase tracking-widest text-brand-gold flex items-center gap-3">
                <Radar size={20} />
                Novedades de Arsenal Sports
              </h3>
              {(arsenalPhase === 'done' || arsenalPhase === 'ready') && (
                <button onClick={closeArsenalModal} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {arsenalPhase === 'checking' && (
                <div className="py-10 text-center">
                  <Radar size={40} className="mx-auto text-brand-gold animate-pulse mb-4" />
                  <p className="font-bold text-gray-700 uppercase tracking-widest text-sm">Revisando el catálogo de Arsenal...</p>
                  <p className="text-gray-400 text-xs mt-2">Descargando y comparando su listado completo. Puede tardar unos segundos.</p>
                </div>
              )}

              {arsenalPhase === 'ready' && arsenalResult && (
                <>
                  <div className="bg-brand-green/10 border-l-4 border-brand-green p-4 rounded-r-lg">
                    <p className="font-black text-brand-dark">
                      {arsenalResult.totalNuevos} producto{arsenalResult.totalNuevos !== 1 ? 's' : ''} nuevo{arsenalResult.totalNuevos !== 1 ? 's' : ''} en Arsenal
                    </p>
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      Arsenal publica {arsenalResult.totalArsenal} productos en total. Vista previa de los primeros {arsenalPreview.length}:
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                    {arsenalPreview.length === 0 && (
                      <p className="p-4 text-sm text-gray-500 font-medium">
                        Los primeros productos no se pueden importar (sin precio publicado o categoría sin equivalente). Se saltearán automáticamente.
                      </p>
                    )}
                    {arsenalPreview.map(p => (
                      <div key={p.arsenalId} className="flex items-center gap-3 p-3">
                        <img src={p.imagen} alt="" className="w-12 h-12 object-contain bg-white border border-gray-100 rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{p.nombre}</p>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{p.categoria || 'Sin categoría'}</span>
                        </div>
                        <span className="font-black text-brand-green whitespace-nowrap">U$S {p.precioUsd.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleArsenalImport}
                    className="w-full bg-brand-green text-white font-black py-3 rounded-lg hover:bg-brand-dark transition-colors uppercase tracking-widest shadow-lg"
                  >
                    Importar los {arsenalResult.totalNuevos} productos nuevos
                  </button>
                </>
              )}

              {arsenalPhase === 'importing' && (
                <div className="py-10 text-center">
                  <RefreshCw size={40} className="mx-auto text-brand-gold animate-spin mb-4" />
                  <p className="font-bold text-gray-700 uppercase tracking-widest text-sm">
                    Importando {arsenalProgress.done} de {arsenalProgress.total}...
                  </p>
                  <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden mx-auto max-w-sm">
                    <div
                      className="h-full bg-brand-green transition-all duration-300"
                      style={{ width: `${arsenalProgress.total ? (arsenalProgress.done / arsenalProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {arsenalPhase === 'done' && (
                <div className="py-6 text-center">
                  <p className="text-gray-700 font-medium">{arsenalSummary}</p>
                  <button
                    onClick={closeArsenalModal}
                    className="mt-6 px-8 py-2 bg-brand-green text-white font-black rounded-lg hover:bg-brand-dark transition-colors uppercase tracking-widest text-xs"
                  >
                    Entendido
                  </button>
                </div>
              )}

              {arsenalError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-red-700 font-medium text-sm">
                  {arsenalError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">URL de la Imagen</label>
                <input 
                  type="text" 
                  value={editForm.imagen_url || ''}
                  onChange={(e) => setEditForm({...editForm, imagen_url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Descripción</label>
                <textarea 
                  value={editForm.descripcion || ''}
                  onChange={(e) => setEditForm({...editForm, descripcion: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none h-24 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Características</label>
                <textarea 
                  value={editForm.caracteristicas || ''}
                  onChange={(e) => setEditForm({...editForm, caracteristicas: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none h-24 resize-y"
                />
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
