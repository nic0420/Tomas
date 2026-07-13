import { create } from "zustand";
import Papa from "papaparse";
import { GOOGLE_SHEETS_CSV_URL } from "../config/constants";
import { Product } from "./useCartStore";

interface ProductState {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      Papa.parse(GOOGLE_SHEETS_CSV_URL, {
        download: true,
        header: true,
        complete: (results) => {
          const rawData = results.data as any[];
          const validProducts: Product[] = [];
          const catSet = new Set<string>();

          rawData.forEach(row => {
            if (row.id && row.nombre_producto) {
              const product: Product = {
                id: row.id,
                nombre_producto: row.nombre_producto,
                categoria: row.categoria || "Otros",
                imagen_url: row.imagen_url || "https://via.placeholder.com/150",
                precio_usd: parseFloat(row.precio_usd) || 0
              };
              validProducts.push(product);
              catSet.add(product.categoria);
            }
          });

          set({ 
            products: validProducts, 
            categories: Array.from(catSet),
            loading: false 
          });
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          set({ error: error.message, loading: false });
        }
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
