import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import type { Product } from './useCartStore';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { idbStorage } from '../utils/idbStorage';

// Se resuelve cuando el estado persistido terminó de hidratarse (IndexedDB es async).
// Los lectores no reactivos (p. ej. fetchProducts) deben esperar esta promesa.
let notifyHydrated: () => void = () => {};
export const whenAdminHydrated = new Promise<void>((resolve) => {
  notifyHydrated = resolve;
});

export function useAdminHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAdminStore.persist.hasHydrated());
  useEffect(() => useAdminStore.persist.onFinishHydration(() => setHydrated(true)), []);
  return hydrated;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  userId?: string | null;
  totalArs: number;
  totalUsd: number;
  items: { 
    id: string;
    sku?: string;
    name: string;
    priceUsd: number;
    quantity: number;
  }[];
  status: 'pending' | 'Pagado' | 'Enviado' | 'Cancelado';
}

interface AdminState {
  orders: Order[];
  customDolarBlue: number | null;
  localProducts: Product[] | null;
  hiddenCategories: string[];
  isLoadingOrders: boolean;
  arsenalSeenIds: number[];

  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setCustomDolarBlue: (rate: number | null) => void;
  setLocalProducts: (products: Product[]) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleCategoryVisibility: (category: string) => void;
  setCategoryVisibility: (category: string, hidden: boolean) => void;
  showAllCategories: () => void;
  setArsenalSeenIds: (ids: number[]) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      orders: [],
      customDolarBlue: null,
      localProducts: null,
      hiddenCategories: [],
      isLoadingOrders: false,
      arsenalSeenIds: [],

      fetchOrders: async () => {
        set({ isLoadingOrders: true });
        try {
          const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
          const snapshot = await getDocs(q);
          const fetchedOrders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[];
          set({ orders: fetchedOrders });
        } catch (error) {
          console.error("Error fetching admin orders: ", error);
        } finally {
          set({ isLoadingOrders: false });
        }
      },

      updateOrderStatus: async (orderId, status) => {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, { status });
          // Update local state optimistically
          set((state) => ({
            orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
          }));
        } catch (error) {
          console.error("Error updating order status: ", error);
        }
      },

      setCustomDolarBlue: (rate) => set({ customDolarBlue: rate }),

      setLocalProducts: (products) => set({ localProducts: products }),

      updateProduct: (productId, updates) => set((state) => {
        if (!state.localProducts) return state;
        return {
          localProducts: state.localProducts.map(p => p.id === productId ? { ...p, ...updates } : p)
        };
      }),

      addProduct: (product) => set((state) => {
        const list = state.localProducts || [];
        return {
          localProducts: [product, ...list]
        };
      }),

      deleteProduct: (productId) => set((state) => {
        if (!state.localProducts) return state;
        return {
          localProducts: state.localProducts.filter(p => p.id !== productId)
        };
      }),

      toggleCategoryVisibility: (category) => set((state) => ({
        hiddenCategories: state.hiddenCategories.includes(category)
          ? state.hiddenCategories.filter(c => c !== category)
          : [...state.hiddenCategories, category]
      })),

      setCategoryVisibility: (category, hidden) => set((state) => {
        const isHidden = state.hiddenCategories.includes(category);
        if (hidden && !isHidden) {
          return { hiddenCategories: [...state.hiddenCategories, category] };
        }
        if (!hidden && isHidden) {
          return { hiddenCategories: state.hiddenCategories.filter(c => c !== category) };
        }
        return state;
      }),

      showAllCategories: () => set({ hiddenCategories: [] }),

      setArsenalSeenIds: (ids) => set({ arsenalSeenIds: ids }),
    }),
    {
      name: 'tomas-admin-storage',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => () => notifyHydrated(),
      // We don't want to persist orders if they are fetched from firestore, but it's okay, they get overwritten by fetch
    }
  )
);
