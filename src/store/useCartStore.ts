import { create } from "zustand";

export interface Product {
  id: string;
  nombre_producto: string;
  categoria: string;
  imagen_url: string;
  precio_usd: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isCartOpen: false,

  addToCart: (product) => set((state) => {
    const existingItem = state.items.find(item => item.product.id === product.id);
    if (existingItem) {
      return {
        items: state.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        isCartOpen: true, // open cart when adding
      };
    }
    return { 
      items: [...state.items, { product, quantity: 1 }],
      isCartOpen: true
    };
  }),

  removeFromCart: (productId) => set((state) => ({
    items: state.items.filter(item => item.product.id !== productId)
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.product.id !== productId) };
    }
    return {
      items: state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    };
  }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  clearCart: () => set({ items: [] })
}));
