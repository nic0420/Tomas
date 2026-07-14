import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from './useCartStore';

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  totalArs: number;
  totalUsd: number;
  items: { product: Product; quantity: number }[];
  status: 'Pendiente' | 'Pagado' | 'Enviado' | 'Cancelado';
}

interface AdminState {
  orders: Order[];
  customDolarBlue: number | null;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setCustomDolarBlue: (rate: number | null) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      orders: [],
      customDolarBlue: null,

      addOrder: (orderData) => set((state) => ({
        orders: [
          {
            ...orderData,
            id: `ORD-${Date.now()}`,
            date: new Date().toISOString(),
          },
          ...state.orders
        ]
      })),

      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
      })),

      setCustomDolarBlue: (rate) => set({ customDolarBlue: rate }),
    }),
    {
      name: 'tomas-admin-storage',
    }
  )
);
