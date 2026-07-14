import { create } from "zustand";
import Papa from "papaparse";
import { GOOGLE_SHEETS_CSV_URL } from "../config/constants";
import type { Product } from "./useCartStore";

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  dolarBlue: number;
  selectedProduct: Product | null;
  fetchProducts: () => Promise<void>;
  fetchDolarBlue: () => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,
  dolarBlue: 1100, // Default fallback
  selectedProduct: null,

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  fetchDolarBlue: async () => {
    try {
      const response = await fetch("https://dolarapi.com/v1/dolares/blue");
      const data = await response.json();
      if (data && data.venta) {
        set({ dolarBlue: data.venta });
      }
    } catch (error) {
      console.error("Error fetching Dolar Blue:", error);
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
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
            isLoading: false 
          });
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          set({ error: error.message, isLoading: false });
        }
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
