import { create } from "zustand";
import Papa from "papaparse";
import { GOOGLE_SHEETS_CSV_URL } from "../config/constants";
import type { Product } from "./useCartStore";
import { useAdminStore, whenAdminHydrated } from "./useAdminStore";
import { classifySubcategory } from "../utils/subcategories";

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "Armas de Pressão": "Armas de Aire Comprimido",
  "Acessórios": "Accesorios",
  "Vestuário": "Indumentaria",
  "Munição e Gás": "Munición y Gas",
  "Ótica": "Óptica",
  "Facas e Canivetes": "Cuchillos y Navajas",
  "Tiro Esportivo": "Tiro Deportivo",
  "Arquearia": "Arquería",
  "Sobrevivência": "Supervivencia",
  "Tático": "Táctico",
  "Diversos": "Varios",
  "Lançamentos": "Lanzamientos",
  "Promoções": "Promociones",
};

const translateCategory = (cat: string) => CATEGORY_TRANSLATIONS[cat] || cat;

interface ProductCSVRow {
  id?: string;
  sku?: string;
  nombre_producto?: string;
  categoria?: string;
  imagen_url?: string;
  precio_usd?: string;
  descripcion?: string;
  caracteristicas?: string;
}

interface ProductState {
  products: Product[];
  categories: string[];
  allCategories: string[];
  isLoading: boolean;
  error: string | null;
  dolarBlue: number;
  selectedProduct: Product | null;
  searchQuery: string;
  sortBy: string;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  fetchProducts: () => Promise<void>;
  fetchDolarBlue: () => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setSelectedCategory: (category: string | null, subcategory?: string | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  allCategories: [],
  isLoading: false,
  error: null,
  dolarBlue: 1100, // Default fallback
  selectedProduct: null,
  searchQuery: '',
  sortBy: 'none',
  selectedCategory: null,
  selectedSubcategory: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedCategory: (category, subcategory = null) =>
    set({ selectedCategory: category, selectedSubcategory: subcategory ?? null, selectedProduct: null, searchQuery: '' }),

  fetchDolarBlue: async () => {
    try {
      await whenAdminHydrated;
      const { customDolarBlue } = useAdminStore.getState();
      if (customDolarBlue) {
        set({ dolarBlue: customDolarBlue });
        return;
      }
      
      const response = await fetch("https://dolarapi.com/v1/dolares/blue");
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al consultar el dólar blue`);
      }
      const data = await response.json();
      if (data && typeof data.venta === 'number') {
        set({ dolarBlue: data.venta });
      }
    } catch (error) {
      console.error("Error fetching Dolar Blue:", error);
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // El estado del admin se hidrata async (IndexedDB): esperar antes de leerlo
      await whenAdminHydrated;
      const { localProducts, hiddenCategories } = useAdminStore.getState();
      const hiddenSet = new Set(hiddenCategories);
      
      const filterHidden = (products: Product[]): { visible: Product[]; categories: string[]; allCategories: string[] } => {
        const visible = products.filter(p => !hiddenSet.has(p.categoria));
        const categories = Array.from(new Set(visible.map(p => p.categoria))).sort();
        const allCategories = Array.from(new Set(products.map(p => p.categoria))).sort();
        return { visible, categories, allCategories };
      };
      
      if (localProducts && localProducts.length > 0) {
        const translatedLocal = localProducts.map(p => {
          const categoria = translateCategory(p.categoria);
          return {
            ...p,
            categoria,
            subcategoria: classifySubcategory(categoria, p.nombre_producto),
          };
        });
        
        const { visible, categories, allCategories } = filterHidden(translatedLocal);
        set({ 
          products: visible, 
          categories,
          allCategories,
          isLoading: false 
        });
        return;
      }

      Papa.parse<ProductCSVRow>(GOOGLE_SHEETS_CSV_URL, {
        download: true,
        header: true,
        complete: (results) => {
          const rawData = results.data;
          const validProducts: Product[] = [];

          rawData.forEach(row => {
            if (row.id && row.nombre_producto) {
              const categoria = translateCategory(row.categoria || "Otros");
              const product: Product = {
                id: row.id,
                sku: row.sku || "",
                nombre_producto: row.nombre_producto,
                categoria,
                subcategoria: classifySubcategory(categoria, row.nombre_producto),
                imagen_url: row.imagen_url || "https://via.placeholder.com/150",
                precio_usd: parseFloat(row.precio_usd) || 0,
                descripcion: row.descripcion || "Descripción no disponible.",
                caracteristicas: row.caracteristicas || "Características no disponibles."
              };
              validProducts.push(product);
            }
          });

          const visible = validProducts.filter(p => !hiddenSet.has(p.categoria));
          const categories = Array.from(new Set(visible.map(p => p.categoria))).sort();
          const allCategories = Array.from(new Set(validProducts.map(p => p.categoria))).sort();

          set({ 
            products: visible, 
            categories,
            allCategories,
            isLoading: false 
          });
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          set({ error: error.message, isLoading: false });
        }
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error desconocido al cargar los productos.', isLoading: false });
    }
  }
}));
