import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from './useCartStore';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';

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
  isLoadingOrders: boolean;
  
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setCustomDolarBlue: (rate: number | null) => void;
  setLocalProducts: (products: Product[]) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      orders: [],
      customDolarBlue: null,
      localProducts: null,
      isLoadingOrders: false,

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
      })
    }),
    {
      name: 'tomas-admin-storage',
      // We don't want to persist orders if they are fetched from firestore, but it's okay, they get overwritten by fetch
    }
  )
);
